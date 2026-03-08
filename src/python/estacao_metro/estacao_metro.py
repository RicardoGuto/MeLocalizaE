import pandas as pd
from shapely import wkt
from shapely.geometry import Polygon, MultiPolygon, Point
from pyproj import Transformer
import requests
import time
import os

# Caminho do CSV consolidado de origem
arquivo = "./estacao_metro.csv"
# Caminho do arquivo de saída (vai sendo atualizado)
saida = "./estacao_metro_expandido.csv"

# Lê o CSV original
df = pd.read_csv(arquivo, encoding="utf-8-sig")

# Converte geometria de texto (WKT) para objetos shapely
df["geometry"] = df["geometry"].apply(wkt.loads)

transformer = Transformer.from_crs("EPSG:31983", "EPSG:4326", always_xy=True)

inicio = 0 

print(f"⏩ Recomeçando a partir da linha {inicio+1} (index {inicio}).")

# PROCESSAMENTO
total = len(df)
print(f"📊 Total de registros no CSV original: {total}\n")

for idx in range(inicio, total):

    row = df.iloc[idx]
    geom = row["geometry"]

    # Extrai coordenadas do polígono
    if isinstance(geom, Polygon):
        coords = list(geom.exterior.coords)
    elif isinstance(geom, MultiPolygon):
        coords = []
        for p in geom.geoms:
            coords.extend(list(p.exterior.coords))
    elif isinstance(geom, Point):
        coords = [(geom.x, geom.y)]
    else:
        coords = []

    novas_linhas = []

    for j, (x, y) in enumerate(coords, start=1):
        # Converte UTM → latitude / longitude
        lon, lat = transformer.transform(x, y)

        # Busca o endereço correspondente
        try:
            url = "https://nominatim.openstreetmap.org/reverse"
            params = {"lat": lat, "lon": lon, "format": "json", "addressdetails": 1}
            headers = {"User-Agent": "GeoPython/1.0"}
            r = requests.get(url, params=params, headers=headers, timeout=10)
            if r.status_code == 200:
                addr = r.json().get("address", {})
                info = {
                    "rua": addr.get("road") or addr.get("pedestrian"),
                    "bairro": addr.get("suburb") or addr.get("neighbourhood"),
                    "cidade": addr.get("city") or addr.get("town") or addr.get("village"),
                    "cep": addr.get("postcode")
                }
            else:
                info = {"rua": None, "bairro": None, "cidade": None, "cep": None}
        except:
            info = {"rua": None, "bairro": None, "cidade": None, "cep": None}

        nova_linha = row.to_dict()
        nova_linha["latitude"] = lat
        nova_linha["longitude"] = lon
        nova_linha.update(info)
        novas_linhas.append(nova_linha)

        print(f"🔄 Linha {idx+1}/{total} | Coord {j}/{len(coords)} | ({lat:.6f}, {lon:.6f})",
              end="\r", flush=True)

        time.sleep(1)

    # Salva incrementalmente
    df_parcial = pd.DataFrame(novas_linhas)
    df_parcial.to_csv(saida, mode="a", index=False,
                      header=not os.path.exists(saida),
                      encoding="utf-8-sig")

    print(f"\n✅ Linha {idx+1}/{total} salva com {len(coords)} coordenadas.")

print(f"\n🏁 Processamento concluído! Arquivo salvo em: {saida}")
