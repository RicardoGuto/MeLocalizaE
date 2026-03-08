import geopandas as gpd
import pandas as pd
import requests
import time
import os
from pathlib import Path
import fiona
import re
import sys

pasta = Path(r"C:\xampp\htdocs\melocalizae\src\python\risco_ocorrencia")

def buscar_endereco(lat, lon):
    """Consulta o endereço correspondente a uma coordenada (lat, lon) usando a API Nominatim."""
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

for arquivo in pasta.glob("*.gpkg"):
    print(f"\n📂 Processando: {arquivo.name}")

    try:
        ano = re.search(r"20\d{2}", arquivo.name)
        ano = ano.group(0) if ano else "Desconhecido"

        camadas = fiona.listlayers(arquivo)
        print(f"  → Camadas encontradas: {camadas}")

        for camada in camadas:
            print(f"  → Lendo camada: {camada}")
            gdf = gpd.read_file(arquivo, layer=camada)

            if gdf.crs and gdf.crs.to_epsg() != 4326:
                gdf = gdf.to_crs(epsg=4326)

            gdf["centroide"] = gdf.geometry.centroid
            gdf["lat"] = gdf["centroide"].y
            gdf["lon"] = gdf["centroide"].x

            gdf["arquivo_origem"] = arquivo.stem
            gdf["camada_origem"] = camada
            gdf["ano_referencia"] = ano
            gdf["tipo_risco"] = "Ocorrência"

            gdf["endereco"] = ""
            gdf["bairro"] = ""
            gdf["cidade"] = ""
            gdf["cep"] = ""
            gdf["estado"] = ""
            gdf["pais"] = ""

            total = len(gdf)
            print(f"  → Total de registros: {total}")

            for i, row in gdf.iterrows():
                info = buscar_endereco(row["lat"], row["lon"])
                if info:
                    gdf.at[i, "endereco"] = info["endereco"]
                    gdf.at[i, "bairro"] = info["bairro"]
                    gdf.at[i, "cidade"] = info["cidade"]
                    gdf.at[i, "cep"] = info["cep"]
                    gdf.at[i, "estado"] = info["estado"]
                    gdf.at[i, "pais"] = info["pais"]

                # LOG DE PROGRESSO
                progresso = f"    Linha {i + 1}/{total} - {arquivo.name} [{camada}]"
                print(progresso, end="\r", flush=True)

                time.sleep(1)  # respeita o limite da API pública

            print("\n  ✅ Camada concluída!")

            df_limpo = gdf[[
                "arquivo_origem", "camada_origem", "ano_referencia", "tipo_risco",
                "lat", "lon", "endereco", "bairro", "cidade", "cep", "estado", "pais"
            ]]
            dados_consolidados.append(df_limpo)

    except Exception as e:
        print(f"❌ Erro ao processar {arquivo.name}: {e}")

# Consolida e salva o Excel final
if dados_consolidados:
    consolidado = pd.concat(dados_consolidados, ignore_index=True)
    saida = pasta / "riscos_ocorrencia_consolidados.xlsx"
    consolidado.to_excel(saida, index=False)
    print(f"\n✅ Arquivo final salvo em: {saida}")
else:
    print("\n⚠️ Nenhum dado processado.")
