import re

input_path = "gpkg_consolidado_expandido.csv"
output_path = "gpkg_consolidado_sem_geometry.csv"

# Regex que remove qualquer POLYGON(...) ou MULTIPOLYGON(...)
padrao = r'"?POLYGON\s*\(\(.*?\)\)"?'
padrao2 = r'"?MULTIPOLYGON\s*\(\(\(.*?\)\)\)"?'

with open(input_path, "r", encoding="utf-8") as f_in, \
     open(output_path, "w", encoding="utf-8") as f_out:

    for linha in f_in:
        # Remove POLYGON((...))
        linha = re.sub(padrao, "", linha)
        # Remove MULTIPOLYGON(((...)))
        linha = re.sub(padrao2, "", linha)

        f_out.write(linha)

print("✔ Arquivo sem geometrias salvo em:", output_path)
