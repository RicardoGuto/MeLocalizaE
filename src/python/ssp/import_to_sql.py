import pymysql


con = pymysql.connect(
    host="localhost",
    user="root",
    password="",
    database="melocalizae",
    local_infile=1,
    charset='utf8mb4',
    use_unicode=True
)

cursor = con.cursor()

cursor.execute("SET NAMES utf8mb4;")
cursor.execute("SET CHARACTER SET utf8mb4;")
cursor.execute("SET character_set_connection=utf8mb4;")

sql = """
LOAD DATA LOCAL INFILE 'C:/xampp/htdocs/melocalizae/src/python/ssp/SPDadosCriminais_2026_jan.csv'
INTO TABLE sp_ssp_data
FIELDS TERMINATED BY ';'
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES;
"""

cursor.execute(sql)
con.commit()
con.close()

print("CSV importado com sucesso!")
