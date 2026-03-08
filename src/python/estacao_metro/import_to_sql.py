import pymysql

con = pymysql.connect(
    host="localhost",
    user="root",
    password="",
    database="melocalizae",
    local_infile=1
)

cursor = con.cursor()

sql = """
LOAD DATA LOCAL INFILE 'C:/xampp/htdocs/melocalizae/src/python/estacao_metro/estacao_metro_expandido.csv'
INTO TABLE sp_estacao_metro
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES;
"""

cursor.execute(sql)
con.commit()
con.close()

print("CSV importado com sucesso!")
