import geopandas as gpd
import pandas as pd
import requests
import time
import os
from pathlib import Path
import fiona

pasta = Path(r"C:\xampp\htdocs\melocalizae\src\python\risco_geologico")

def buscar_endereco(lat, lon):

    try:
        url = "https://nominatim.openstreetmap.org/reverse"
        params = {
            "lat": lat,
            "lon": lon,
            "format": "json",
            "addressdetails": 1
        }
        headers = {"User-Agent": "GeoPython/1.0"}
        r = requests.get(url, params=params, headers=headers, timeout=10)
        if r.status_code == 200:
            data = r.json()
            addr = data.get("address", {})
            return {
                "endereco": addr.get("road") or addr.get("pedestrian") or addr.get("suburb"),
                "bairro": addr.get("suburb") or addr.get("neighbourhood"),
                "cidade": addr.get("city") or addr.get("town") or addr.get("village"),
                "cep": addr.get("postcode"),
                "estado": addr.get("state"),
                "pais": addr.get("country")
            }
        else:
            return None
    except Exception as e:
        print(f"Erro em ({lat}, {lon}): {e}")
        return None


dados_consolidados = []

# Percorre todos os arquivos GPKG na pasta
for arquivo in pasta.glob("*.gpkg"):
    print(f"\nProcessando: {arquivo.name}")

    try:
        # Lista as camadas disponíveis
        camadas = fiona.listlayers(arquivo)
        print(f"  → Camadas encontradas: {camadas}")

        for camada in camadas:
            print(f"  → Lendo camada: {camada}")
            gdf = gpd.read_file(arquivo, layer=camada)

            # Garante CRS em latitude/longitude (EPSG:4326)
            if gdf.crs and gdf.crs.to_epsg() != 4326:
                gdf = gdf.to_crs(epsg=4326)

            # Calcula o centroide do polígono
            gdf["centroide"] = gdf.geometry.centroid
            gdf["lat"] = gdf["centroide"].y
            gdf["lon"] = gdf["centroide"].x

            # Adiciona metadados de origem
            gdf["arquivo_origem"] = arquivo.stem
            gdf["camada_origem"] = camada
            gdf["tipo_risco"] = "Geológico"

            # Cria colunas de endereço
            gdf["endereco"] = ""
            gdf["bairro"] = ""
            gdf["cidade"] = ""
            gdf["cep"] = ""
            gdf["estado"] = ""
            gdf["pais"] = ""

            # Loop de geocodificação (1 req/s)
            for i, row in gdf.iterrows():
                info = buscar_endereco(row["lat"], row["lon"])
                if info:
                    gdf.at[i, "endereco"] = info["endereco"]
                    gdf.at[i, "bairro"] = info["bairro"]
                    gdf.at[i, "cidade"] = info["cidade"]
                    gdf.at[i, "cep"] = info["cep"]
                    gdf.at[i, "estado"] = info["estado"]
                    gdf.at[i, "pais"] = info["pais"]
                time.sleep(1)  # limite da API pública

            # Seleciona colunas relevantes
            df_limpo = gdf[[
                "arquivo_origem", "camada_origem", "tipo_risco", "lat", "lon",
                "endereco", "bairro", "cidade", "cep", "estado", "pais"
            ]]

            dados_consolidados.append(df_limpo)

    except Exception as e:
        print(f"Erro ao processar {arquivo.name}: {e}")

# Consolida todos os DataFrames e exporta
if dados_consolidados:
    consolidado = pd.concat(dados_consolidados, ignore_index=True)
    consolidado.to_excel(pasta / "riscos_geologicos_consolidados.xlsx", index=False)
    print(f"\nArquivo final salvo em: {pasta / 'riscos_geologicos_consolidados.xlsx'}")
else:
    print("\nNenhum dado processado.")
