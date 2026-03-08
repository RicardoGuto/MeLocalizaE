import geopandas as gpd
import pandas as pd
import fiona
from pathlib import Path

pasta = Path(r"./acidentes_cet")

dados_consolidados = []

for arquivo_gpkg in pasta.glob("*.gpkg"):
    print(f"\nProcessando: {arquivo_gpkg.name}")

    try:
        camadas = fiona.listlayers(arquivo_gpkg)
        print(f"Camadas encontradas: {camadas}")

        for camada in camadas:
            print(f"Lendo camada: {camada}")
            gdf = gpd.read_file(arquivo_gpkg, layer=camada)

            gdf["geometry"] = gdf["geometry"].astype(str)

            gdf["arquivo_origem"] = arquivo_gpkg.stem
            gdf["camada_origem"] = camada

            dados_consolidados.append(gdf)

    except Exception as e:
        print(f"Erro ao processar {arquivo_gpkg.name}: {e}")

if dados_consolidados:
    consolidado = pd.concat(dados_consolidados, ignore_index=True)
    nome_saida = pasta / "acidentes_cet.csv"
    consolidado.to_csv(nome_saida, index=False, encoding="utf-8-sig")
    print(f"\nArquivo consolidado salvo em: {nome_saida}")
else:
    print("\nNenhum dado processado.")
