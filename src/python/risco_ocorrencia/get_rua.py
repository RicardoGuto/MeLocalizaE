import geopandas as gpd
import pandas as pd
import fiona

# -----------------------------
# arquivos
# -----------------------------
arquivo_ocorrencias = r"C:\xampp\htdocs\melocalizae\src\python\risco_ocorrencia\riscoocorrencia_2024.gpkg"
arquivo_ruas = r"D:\Melocalizae\Dados para Relatorio\Ocorrencias Defesa Civil\OpenStreetMap\sudeste-260308-free.shp\gis_osm_roads_free_1.shp"


# -----------------------------
# carregar ocorrências
# -----------------------------
camadas = fiona.listlayers(arquivo_ocorrencias)

dados = []

for camada in camadas:
    gdf = gpd.read_file(arquivo_ocorrencias, layer=camada)
    dados.append(gdf)

ocorrencias = gpd.GeoDataFrame(pd.concat(dados, ignore_index=True))

print("Ocorrências:", len(ocorrencias))


# CRS projetado (melhor para distância)
ocorrencias = ocorrencias.set_crs("EPSG:31983")


# -----------------------------
# carregar ruas OSM
# -----------------------------
ruas = gpd.read_file(arquivo_ruas)

print("Ruas carregadas:", len(ruas))


# converter CRS
ruas = ruas.to_crs("EPSG:31983")


# remover ruas sem nome
ruas = ruas[ruas["name"].notna()]


print("Ruas com nome:", len(ruas))


# -----------------------------
# spatial join
# -----------------------------
resultado = gpd.sjoin_nearest(
    ocorrencias,
    ruas[["name", "geometry"]],
    how="left",
    distance_col="distancia"
)

print("Após join:", len(resultado))


# -----------------------------
# converter para lat/lon
# -----------------------------
resultado = resultado.to_crs("EPSG:4326")

resultado["longitude"] = resultado.geometry.x
resultado["latitude"] = resultado.geometry.y


# -----------------------------
# limpar colunas
# -----------------------------
resultado = resultado.rename(columns={"name": "rua"})

resultado = resultado.drop(columns=["geometry", "index_right"])


# -----------------------------
# salvar CSV
# -----------------------------
resultado.to_csv(
    "ocorrencias_com_rua_2024.csv",
    index=False,
    encoding="utf-8-sig"
)

print("CSV gerado.")