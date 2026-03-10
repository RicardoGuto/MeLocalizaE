<?php
include('../headers.php');
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
    
    $bbox = getBoundingBox($lat, $lng, 1.0);

    $lat_min = $bbox['lat_min'];
    $lat_max = $bbox['lat_max'];
    $lng_min = $bbox['lng_min'];
    $lng_max = $bbox['lng_max'];

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
    WHERE latitude BETWEEN $lat_min AND $lat_max
    AND longitude BETWEEN $lng_min AND $lng_max
    HAVING distancia <= 1
    ORDER BY distancia
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
    
    $bbox = getBoundingBox($lat, $lng, 3.0);

    $lat_min = $bbox['lat_min'];
    $lat_max = $bbox['lat_max'];
    $lng_min = $bbox['lng_min'];
    $lng_max = $bbox['lng_max'];

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
        WHERE latitude BETWEEN $lat_min AND $lat_max
        AND longitude BETWEEN $lng_min AND $lng_max
        HAVING distancia <= 3
        ORDER BY distancia
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

    $bbox = getBoundingBox($lat, $lng, 5.0);

    $lat_min = $bbox['lat_min'];
    $lat_max = $bbox['lat_max'];
    $lng_min = $bbox['lng_min'];
    $lng_max = $bbox['lng_max'];


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
        WHERE latitude BETWEEN $lat_min AND $lat_max
        AND longitude BETWEEN $lng_min AND $lng_max
        HAVING distancia <= 5
        ORDER BY distancia
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

    $lista = [
        "alagamentos"=>["ocorrencias"=>[],"total"=>0],
        "inundacoes"=>["ocorrencias"=>[],"total"=>0],
        "deslizamentos"=>["ocorrencias"=>[],"total"=>0],
        "queda_arvore"=>["ocorrencias"=>[],"total"=>0]
    ];

    $sql = "SELECT ocorrencia FROM sp_ocorrencias_geo_hidro WHERE rua = '$rua'";

    $result = mysqli_query($mysqli,$sql);

    while($row = $result->fetch_assoc()){

        switch($row["ocorrencia"]){
            case "ALAGAMENTO":
                $lista["alagamentos"]["ocorrencias"][] = $row;
                break;

            case "INUNDACAO":
                $lista["inundacoes"]["ocorrencias"][] = $row;
                break;

            case "DESLIZAMENTO":
                $lista["deslizamentos"]["ocorrencias"][] = $row;
                break;

            case "QUEDA DE ARVORE":
                $lista["queda_arvore"]["ocorrencias"][] = $row;
                break;
        }
    }

    foreach($lista as $k=>$v){
        $lista[$k]["total"] = count($lista[$k]["ocorrencias"]);
    }

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
        SELECT DATA_OCORRENCIA_BO, NATUREZA_APURADA, HORA_OCORRENCIA_BO
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
        SELECT DATA_OCORRENCIA_BO, NATUREZA_APURADA, HORA_OCORRENCIA_BO
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
        SELECT DATA_OCORRENCIA_BO, NATUREZA_APURADA, HORA_OCORRENCIA_BO
        FROM sp_ssp_data
        WHERE 
            latitude BETWEEN $lat_min AND $lat_max AND
            longitude BETWEEN $lng_min AND $lng_max
    ";
    if($q = mysqli_query($mysqli, $sql_bairro)){
        while($row = $q->fetch_assoc()){
            $ocorrencias_bairro[] = $row;
        }
    }

    // Ocorrências últimos 12 meses no bairro
    $sql_bairro_12 = "
    SELECT DATA_OCORRENCIA_BO, NATUREZA_APURADA, HORA_OCORRENCIA_BO
        FROM sp_ssp_data
        WHERE 
            latitude BETWEEN $lat_min AND $lat_max AND
            longitude BETWEEN $lng_min AND $lng_max
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
            latitude BETWEEN $lat_min AND $lat_max AND
            longitude BETWEEN $lng_min AND $lng_max
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
function buscar_lugares_paralelo($lat, $lng, $apiKey){

    $urls = [
        "restaurantes" => "https://api.geoapify.com/v2/places?categories=catering.restaurant&filter=circle:$lng,$lat,1000&limit=5&apiKey=$apiKey",
        "supermercados" => "https://api.geoapify.com/v2/places?categories=commercial.supermarket&filter=circle:$lng,$lat,2000&limit=5&apiKey=$apiKey",
        "farmacias" => "https://api.geoapify.com/v2/places?categories=healthcare.pharmacy&filter=circle:$lng,$lat,1000&limit=5&apiKey=$apiKey",
        "hospitais" => "https://api.geoapify.com/v2/places?categories=healthcare.hospital&filter=circle:$lng,$lat,3000&limit=5&apiKey=$apiKey"
    ];

    $multi = curl_multi_init();
    $channels = [];

    foreach ($urls as $key => $url) {

        $ch = curl_init();

        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 10
        ]);

        curl_multi_add_handle($multi, $ch);
        $channels[$key] = $ch;
    }

    $running = null;

    do {
        curl_multi_exec($multi, $running);
        curl_multi_select($multi);
    } while ($running > 0);

    $resultado = [];

    foreach ($channels as $key => $ch) {

        $response = curl_multi_getcontent($ch);
        $data = json_decode($response, true);

        $resultado[$key] = $data["features"] ?? [];

        curl_multi_remove_handle($multi, $ch);
        curl_close($ch);
    }

    curl_multi_close($multi);

    return $resultado;
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


$lugares = buscar_lugares_paralelo($lat, $lng, $geoapify_api);

$restaurantes_proximos = $lugares["restaurantes"];
$supermercados_proximos = $lugares["supermercados"];
$farmacias_proximas = $lugares["farmacias"];
$hospitais_proximos = $lugares["hospitais"];

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