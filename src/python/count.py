import geopandas as gpd

# Caminho do arquivo
arquivo = "./risco_ocorrencia/SIRGAS_GPKG_riscoocorrencia_2024.gpkg"

# Lista camadas disponíveis
import fiona
camadas = fiona.listlayers(arquivo)
print("Camadas encontradas:", camadas)

# Conta o total de registros em cada camada
for camada in camadas:
    gdf = gpd.read_file(arquivo, layer=camada)
    print(f"Camada: {camada} → {len(gdf)} registros")
