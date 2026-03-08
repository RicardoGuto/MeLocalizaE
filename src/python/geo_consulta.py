import geopandas as gpd
from shapely.geometry import Point

# latitude/longitude do ponto base
lat0, lon0 = -23.4744306, -46.6347340

# cria um ponto shapely
ponto_base = Point(lon0, lat0)

# carrega sua base (com colunas latitude, longitude)
df = gpd.read_file("./SPDadosCriminais_2025_UTF8.csv")  # ou CSV, SQL, etc.

# converte para GeoDataFrame
gdf = gpd.GeoDataFrame(
    df,
    geometry=gpd.points_from_xy(df.longitude, df.latitude),
    crs="EPSG:4326"  # WGS84
)

# reprojeta para metros (obrigatório para medir distâncias reais)
gdf = gdf.to_crs(epsg=3857)
ponto_base = gpd.GeoSeries([ponto_base], crs="EPSG:4326").to_crs(3857).iloc[0]

# cria um buffer de 1000 metros (1 km)
buffer_1km = ponto_base.buffer(1000)

# filtra os registros dentro do raio
resultado = gdf[gdf.geometry.within(buffer_1km)]

print(resultado)