import pandas as pd
import geopandas as gpd
from shapely.geometry import Point

# 1) Ler o CSV corretamente
df = pd.read_csv(
    "SPDadosCriminais_2025.CSV",
    sep=";",            # separador correto
    encoding="latin1",  # charset correto
    engine="python"
)

# -----------------------------
# 2) Converter colunas numéricas
# (ajuste aqui se os nomes forem diferentes)
# -----------------------------

# Se os nomes das colunas forem LATITUDE / LONGITUDE:
df["LATITUDE"] = pd.to_numeric(df["LATITUDE"], errors="coerce")
df["LONGITUDE"] = pd.to_numeric(df["LONGITUDE"], errors="coerce")

# Remove linhas sem coordenadas
df = df.dropna(subset=["LATITUDE", "LONGITUDE"])

# -----------------------------
# 3) Criar GeoDataFrame
# -----------------------------
gdf = gpd.GeoDataFrame(
    df,
    geometry=gpd.points_from_xy(df["LONGITUDE"], df["LATITUDE"]),
    crs="EPSG:4326"  # WGS84
)

# -----------------------------
# 4) Exportar para GeoJSON
# -----------------------------
gdf.to_file("SPDadosCriminais_2025.geojson", driver="GeoJSON")

print("GeoJSON gerado com sucesso!")
