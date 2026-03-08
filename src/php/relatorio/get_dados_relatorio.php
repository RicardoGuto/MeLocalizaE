<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');

header('Access-Control-Allow-Headers: Content-Type');


include('./boundingBoxLatLon.php');
include('../config.php');

$json = file_get_contents('php://input');
$data = json_decode($json, true);

$rua = $data["rua"] ?? null;
$bairro = $data["bairro"] ?? null;
$cep = $data["cep"] ?? null;
$estado = $data["estado"] ?? null;
$cidade = $data["cidade"] ?? null;
$lat = $data['lat'];
$lng = $data['lng'];

date_default_timezone_set('America/Sao_Paulo');
$data_atual = date('Y-m-d');
$data_12_meses = date('Y-m-d', strtotime('-12 months'));


#PONTOS DE ÔNIBUS
function pontos_onibus($lat, $lng, $mysqli){    
    $lista = []; 

    $sql = "
        SELECT *,
        (
            6371 * ACOS(
                COS(RADIANS($lat)) * COS(RADIANS(latitude)) * 
                COS(RADIANS(longitude) - RADIANS($lng)) + 
                SIN(RADIANS($lat)) * SIN(RADIANS(latitude))
            )
        ) AS distancia
        FROM sp_pontos_onibus
        HAVING distancia <= 1
        ORDER BY distancia;
        ";

    $result = mysqli_query($mysqli, $sql);
    if($result){
        while($row = $result->fetch_assoc()){
            $lista[] = $row;
        }
    }
    return $lista;
}

#ESTAÇÕES DE METRÔ
function estacoes_metro($lat, $lng, $mysqli){
    $lista = []; 

    $sql = "
        SELECT *,
        (
            6371 * ACOS(
                COS(RADIANS($lat)) * COS(RADIANS(latitude)) * 
                COS(RADIANS(longitude) - RADIANS($lng)) + 
                SIN(RADIANS($lat)) * SIN(RADIANS(latitude))
            )
        ) AS distancia
        FROM sp_estacao_metro
        HAVING distancia <= 3
        ORDER BY distancia;
        ";

    $result = mysqli_query($mysqli, $sql);
    if($result){
        while($row = $result->fetch_assoc()){
            $lista[] = $row;
        }
    }
    return $lista;
}

#TERMINAIS DE ÔNIBUS
function terminais_onibus($lat, $lng, $mysqli){
    $lista = []; 

    $sql = "
        SELECT *,
        (
            6371 * ACOS(
                COS(RADIANS($lat)) * COS(RADIANS(latitude)) * 
                COS(RADIANS(longitude) - RADIANS($lng)) + 
                SIN(RADIANS($lat)) * SIN(RADIANS(latitude))
            )
        ) AS distancia
        FROM sp_terminal_onibus
        HAVING distancia <= 5
        ORDER BY distancia;
        ";

    $result = mysqli_query($mysqli, $sql);
    if($result){
        while($row = $result->fetch_assoc()){
            $lista[] = $row;
        }
    }
    return $lista;
}

#OCORRÊNCIAS GEOLÓGICAS/HIDROLÓGICAS
function ocorrencias_geo_hidro($rua, $mysqli){
    $lista = []; 
    $alagamentos = [];
    $inundacoes = [];
    $deslizamentos = [];
    $queda_arvore = [];

    $alagamentos_sql = mysqli_query($mysqli,"SELECT * FROM sp_ocorrencias_geo_hidro WHERE ocorrencia = 'ALAGAMENTO' AND rua = '$rua'");
    if($alagamentos_sql){
        while($row = $alagamentos_sql->fetch_assoc()){
            $alagamentos[] = $row;
        }
    }

    $inundacoes_sql = mysqli_query($mysqli,"SELECT * FROM sp_ocorrencias_geo_hidro WHERE ocorrencia = 'INUNDACAO' AND rua = '$rua'");
    if($inundacoes_sql){
        while($row = $inundacoes_sql->fetch_assoc()){
            $inundacoes[] = $row;
        }
    }

    $deslizamentos_sql = mysqli_query($mysqli,"SELECT * FROM sp_ocorrencias_geo_hidro WHERE ocorrencia = 'DESLIZAMENTO' AND rua = '$rua'");
    if($deslizamentos_sql){
        while($row = $deslizamentos_sql->fetch_assoc()){
            $deslizamentos[] = $row;
        }
    }

    $queda_arvore_sql = mysqli_query($mysqli,"SELECT * FROM sp_ocorrencias_geo_hidro WHERE ocorrencia = 'QUEDA DE ARVORE' AND rua = '$rua'");
    if($queda_arvore_sql){
        while($row = $queda_arvore_sql->fetch_assoc()){
            $queda_arvore[] = $row;
        }
    }

    $lista = [
        "alagamentos" => [
            "ocorrencias" => $alagamentos,
            "total" => count($alagamentos)
        ],
        "inundacoes" => [
            "ocorrencias" => $inundacoes,
            "total"=>count($inundacoes)
        ],
        "deslizamentos" => [
            "ocorrencias" => $deslizamentos,
            "total" => count($deslizamentos)
        ],
        "queda_arvore" => [
            "ocorrencias" => $queda_arvore,
            "total" => count($queda_arvore)
        ]
        
    ];
    return $lista;
}

#SEGURANÇA PÚBLICA

#AJUSTE: REENVIAR BASE DE DADOS E CONFIGURAR VALORES DE LATITUDE E LONGITUDE?
function seguranca_publica($rua, $mysqli, $data_atual, $data_12_meses, $lat, $lng){

    // Inicializa arrays
    $ocorrencias_default = [];
    $ocorrencias_12_meses = [];
    $total_ocorrencias_tipo = [];

    $ocorrencias_bairro = [];
    $ocorrencias_bairro_12meses = [];
    $ocorrencias_bairro_tipo = [];

    // ----------------------------------------------------------
    // 1) CONSULTAS POR RUA
    // ----------------------------------------------------------

    // Todas as ocorrências na rua
    $sql_default = "
        SELECT *
        FROM sp_ssp_data
        WHERE logradouro = '$rua'
        ORDER BY DATA_OCORRENCIA_BO DESC
    ";
    if($q = mysqli_query($mysqli, $sql_default)){
        while($row = $q->fetch_assoc()){
            $ocorrencias_default[] = $row;
        }
    }

    // Ocorrências últimos 12 meses
    $sql_12m = "
        SELECT *
        FROM sp_ssp_data
        WHERE 
            logradouro = '$rua'
            AND STR_TO_DATE(DATA_OCORRENCIA_BO, '%d/%m/%Y')
                BETWEEN STR_TO_DATE('$data_12_meses', '%Y-%m-%d')
                AND STR_TO_DATE('$data_atual', '%Y-%m-%d')
        ORDER BY STR_TO_DATE(DATA_OCORRENCIA_BO, '%d/%m/%Y') DESC
    ";
    if($q = mysqli_query($mysqli, $sql_12m)){
        while($row = $q->fetch_assoc()){
            $ocorrencias_12_meses[] = $row;
        }
    }

    // Tipo por quantidade
    $sql_tipo = "
        SELECT NATUREZA_APURADA, COUNT(*) AS total
        FROM sp_ssp_data
        WHERE logradouro = '$rua'
        GROUP BY NATUREZA_APURADA
        ORDER BY total DESC
    ";
    if($q = mysqli_query($mysqli, $sql_tipo)){
        while($row = $q->fetch_assoc()){
            $total_ocorrencias_tipo[] = $row;
        }
    }

    // Média mensal
    $media_12_meses = count($ocorrencias_12_meses) / 12;


    // ----------------------------------------------------------
    // 2) CONSULTAS POR BAIRRO (USANDO RAIO / LATITUDE + LONGITUDE)
    // ----------------------------------------------------------

    $bbox = getBoundingBox($lat, $lng, 1.0);

    $lat_min = $bbox['lat_min'];
    $lat_max = $bbox['lat_max'];
    $lng_min = $bbox['lng_min'];
    $lng_max = $bbox['lng_max'];

    // Todas as ocorrências no bairro
    $sql_bairro = "
        SELECT *
        FROM sp_ssp_data
        WHERE 
            REPLACE(latitude, ',', '.') BETWEEN $lat_min AND $lat_max
            AND REPLACE(longitude, ',', '.') BETWEEN $lng_min AND $lng_max
    ";
    if($q = mysqli_query($mysqli, $sql_bairro)){
        while($row = $q->fetch_assoc()){
            $ocorrencias_bairro[] = $row;
        }
    }

    // Ocorrências últimos 12 meses no bairro
    $sql_bairro_12 = "
    SELECT *
        FROM sp_ssp_data
        WHERE 
            REPLACE(latitude, ',', '.') BETWEEN $lat_min AND $lat_max
            AND REPLACE(longitude, ',', '.') BETWEEN $lng_min AND $lng_max
            AND STR_TO_DATE(DATA_OCORRENCIA_BO, '%d/%m/%Y')
                BETWEEN STR_TO_DATE('$data_12_meses', '%Y-%m-%d')
                AND STR_TO_DATE('$data_atual', '%Y-%m-%d')
    ";
    if($q = mysqli_query($mysqli, $sql_bairro_12)){
        while($row = $q->fetch_assoc()){
            $ocorrencias_bairro_12meses[] = $row;
        }
    }

    // Quantidade por tipo no bairro - Alimentará o gráfico
    $sql_bairro_tipo = "
        SELECT NATUREZA_APURADA, COUNT(*) as total
        FROM sp_ssp_data
        WHERE 
            REPLACE(latitude, ',', '.') BETWEEN $lat_min AND $lat_max
            AND REPLACE(longitude, ',', '.') BETWEEN $lng_min AND $lng_max
        GROUP BY NATUREZA_APURADA
        ORDER BY total DESC
    ";
    if($q = mysqli_query($mysqli, $sql_bairro_tipo)){
        while($row = $q->fetch_assoc()){
            $ocorrencias_bairro_tipo[] = $row;
        }
    }

    // Média mensal no bairro
    $media_bairro_12_meses = count($ocorrencias_bairro_12meses) / 12;


    // ----------------------------------------------------------
    // RETORNO FINAL
    // ----------------------------------------------------------
    return [
        "ocorrencias_default" => [
            "ocorrencias" => $ocorrencias_default,
            "ocorrencias_total" => count($ocorrencias_default)
        ],

        "ocorrencias_12_meses" => [
            "ocorrencias" => $ocorrencias_12_meses,
            "ocorrencias_total" => count($ocorrencias_12_meses)
        ],

        "media_12_meses" => number_format($media_12_meses, 2, ",", ""),

        "tipo_ocorrencias" => [
            "ocorrencias" => $total_ocorrencias_tipo,
            "ocorrencias_distintas" => count($total_ocorrencias_tipo)
        ],

        "bairro" => [
            "ocorrencias" => $ocorrencias_bairro,
            "ocorrencias_total" => count($ocorrencias_bairro),

            "ocorrencias_12_meses" => [
                "ocorrencias" => $ocorrencias_bairro_12meses,
                "ocorrencias_total" => count($ocorrencias_bairro_12meses)
            ],

            "media_12_meses" => number_format($media_bairro_12_meses, 2, ",", ""),

            "tipo_ocorrencias" => [
                "ocorrencias" => $ocorrencias_bairro_tipo,
                "ocorrencias_distintas" => count($ocorrencias_bairro_tipo)
            ]
        ]
    ];
}


$geoapify_api = '58a116017d2c4b869a0fb0216bdb937a';

#RESTAURANTES PRÓXIMOS
function buscar_restaurantes($lat, $lng, $apiKey, $raio = 1000) {
    $url = "https://api.geoapify.com/v2/places?" .
           "categories=catering.restaurant" .
           "&filter=circle:$lng,$lat,$raio" .
           "&limit=5" .
           "&apiKey=$apiKey";

    $json = file_get_contents($url);
    $data = json_decode($json, true);

    return $data["features"] ?? [];
}

#SUPERMERCADOS PRÓXIMOS
function buscar_supermercados($lat, $lng, $apiKey, $raio = 1000) {
    $url = "https://api.geoapify.com/v2/places?" .
           "categories=commercial.supermarket" .
           "&filter=circle:$lng,$lat,$raio" .
           "&limit=5" .
           "&apiKey=$apiKey";

    $json = file_get_contents($url);
    $data = json_decode($json, true);

    return $data["features"] ?? [];
}

#FARMÁCIAS PRÓXIMAS
function buscar_farmacias($lat, $lng, $apiKey, $raio = 1000) {
    $url = "https://api.geoapify.com/v2/places?" .
           "categories=healthcare.pharmacy" .
           "&filter=circle:$lng,$lat,$raio" .
           "&limit=5" .
           "&apiKey=$apiKey";

    $json = file_get_contents($url);
    $data = json_decode($json, true);

    return $data["features"] ?? [];
}

#HOSPITAIS PRÓXIMOS
function buscar_hospitais($lat, $lng, $apiKey, $raio = 1000) {
    $url = "https://api.geoapify.com/v2/places?" .
           "categories=healthcare.hospital" .
           "&filter=circle:$lng,$lat,$raio" .
           "&limit=5" .
           "&apiKey=$apiKey";

    $json = file_get_contents($url);
    $data = json_decode($json, true);

    return $data["features"] ?? [];
}

#CLIMA E TEMPO
function buscar_ClimaTempo(
    float $latitude,
    float $longitude,
    string $dataInicio,
    string $dataFim
): array {

    $url = 'https://archive-api.open-meteo.com/v1/archive?' . http_build_query([
        'latitude'  => $latitude,
        'longitude' => $longitude,
        'start_date'=> $dataInicio,
        'end_date'  => $dataFim,
        'daily'     => 'temperature_2m_max,temperature_2m_min,precipitation_sum',
        'timezone'  => 'America/Sao_Paulo'
    ]);

    $response = @file_get_contents($url);

    if ($response === false) {
        return [];
    }

    $data = json_decode($response, true);

    if (!isset($data['daily']['time'])) {
        return [];
    }

    $resultado = [];

    foreach ($data['daily']['time'] as $i => $dataDia) {
        $resultado[$dataDia] = [
            'temp_max' => $data['daily']['temperature_2m_max'][$i] ?? null,
            'temp_min' => $data['daily']['temperature_2m_min'][$i] ?? null,
            'chuva_mm' => $data['daily']['precipitation_sum'][$i] ?? 0
        ];
    }

    return $resultado;
}


$restaurantes_proximos = buscar_restaurantes($lat, $lng, $geoapify_api, $raio = 1000);
$supermercados_proximos = buscar_supermercados($lat, $lng, $geoapify_api, $raio = 2000);
$farmacias_proximas = buscar_farmacias($lat, $lng, $geoapify_api, $raio = 1000);
$hospitais_proximos = buscar_hospitais($lat, $lng, $geoapify_api, $raio = 3000);

$pontos_onibus = pontos_onibus($lat, $lng, $mysqli);
$estacoes_metro = estacoes_metro($lat, $lng, $mysqli);
$terminais_onibus = terminais_onibus($lat,$lng,$mysqli);
$ocorrencias_geo_hidro = ocorrencias_geo_hidro($rua, $mysqli);
$seguranca_publica = seguranca_publica($rua, $mysqli, $data_atual, $data_12_meses, $lat, $lng);
$clima_tempo = buscar_ClimaTempo($lat, $lng, $data_12_meses, $data_atual );

$dados = array(
    "pontos_onibus"=>[
        "total"=>count($pontos_onibus),
        "pontos"=>$pontos_onibus
    ],
    "terminais_onibus"=>[
        "total"=>count($terminais_onibus),
        "terminais"=>$terminais_onibus
    ],
    "estacoes_metro"=>[
        "total"=>count($estacoes_metro),
        "estacoes"=>$estacoes_metro
    ],
    "ocorrencias_geo_hidro"=>$ocorrencias_geo_hidro,
    "seguranca_publica"=>$seguranca_publica,
    "restaurantes"=>$restaurantes_proximos,
    "supermercados"=>$supermercados_proximos,
    "farmacias"=>$farmacias_proximas,
    "hospitais"=>$hospitais_proximos,
    "climaTempo"=>$clima_tempo
);

echo json_encode($dados);