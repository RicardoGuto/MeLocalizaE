import geopandas as gpd
import time
from geopy.geocoders import Nominatim

gdf = gpd.read_file("geoportal_risco_ocorrencia_inundacao_v2.geojson")
gdf = gdf.to_crs(epsg=4326)
gdf["lat"] = gdf.geometry.y
gdf["lon"] = gdf.geometry.x

geolocator = Nominatim(user_agent="GeoInundacaoApp/1.0 (contato@suzumetech.com)")

def get_address(lat, lon):
    try:
        location = geolocator.reverse((lat, lon), language="pt")
        if location and location.raw.get("address"):
            addr = location.raw["address"]
            return {
                "rua": addr.get("road"),
                "bairro": addr.get("suburb") or addr.get("neighbourhood"),
                "cidade": addr.get("city") or addr.get("town") or addr.get("municipality"),
                "uf": addr.get("state"),
                "cep": addr.get("postcode"),
                "endereco_completo": location.address
            }
    except Exception as e:
        print(f"Erro em {lat}, {lon}: {e}")
    return None


enderecos = []
for i, row in gdf.iterrows():
    info = get_address(row.lat, row.lon)
    enderecos.append(info)
    print(f"{i+1}/{len(gdf)} -> {info['rua'] if info else 'não encontrado'}")
    time.sleep(1)

#  colunas novas com os resultados
gdf["rua"] = [e["rua"] if e else None for e in enderecos]
gdf["bairro"] = [e["bairro"] if e else None for e in enderecos]
gdf["cidade"] = [e["cidade"] if e else None for e in enderecos]
gdf["uf"] = [e["uf"] if e else None for e in enderecos]
gdf["cep"] = [e["cep"] if e else None for e in enderecos]
gdf["endereco_completo"] = [e["endereco_completo"] if e else None for e in enderecos]


gdf = gdf.loc[:, gdf.columns.notnull()]
gdf = gdf.loc[:, ~gdf.columns.str.contains('^Unnamed')]
gdf.columns = gdf.columns.astype(str)
gdf = gdf.drop(gdf.columns[17:], axis=1)


gdf.drop(columns="geometry", errors="ignore").to_csv(
    "inundacoes_com_rua.csv", index=False, encoding="utf-8-sig"
)

print("\nArquivo salvo: inundacoes_com_rua.csv")
print(f"Total de colunas finais: {len(gdf.columns)}")
print(f"Colunas: {list(gdf.columns)}")
