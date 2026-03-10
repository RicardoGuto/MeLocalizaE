<?php

require '../config.php';

include('./boundingBoxLatLon.php'); 
include('../headers.php');

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);
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

$geoapify_api = '58a116017d2c4b869a0fb0216bdb937a';

#PONTOS DE ÔNIBUS
function pontos_onibus($lat, $lng, $mysqli){    
    $lista = []; 
    $bbox = getBoundingBox($lat, $lng, 1.0);

    $lat_min = $bbox['lat_min'];
    $lat_max = $bbox['lat_max'];
    $lng_min = $bbox['lng_min'];
    $lng_max = $bbox['lng_max'];

    $sql = "
        SELECT pt_id,
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
        SELECT emt_nome,
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
        SELECT nome,
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

#OCORRENCIAS
function seguranca($rua, $mysqli, $data_atual, $data_12_meses, $lat, $lng){

    $sql_12m = "
        SELECT COUNT(*) as total
        FROM sp_ssp_data
        WHERE 
            logradouro = ?
            AND STR_TO_DATE(DATA_OCORRENCIA_BO, '%d/%m/%Y')
                BETWEEN ? AND ?
    ";

    $stmt = $mysqli->prepare($sql_12m);
    $stmt->bind_param("sss", $rua, $data_12_meses, $data_atual);
    $stmt->execute();

    $result = $stmt->get_result();
    $row = $result->fetch_assoc();

    return $row['total'] ?? 0;
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


#CLIMA
function buscar_ClimaTempo(
    float $latitude,
    float $longitude,
    string $dataInicio,
    string $dataFim
): ?float {

    $url = 'https://archive-api.open-meteo.com/v1/archive?' . http_build_query([
        'latitude'  => $latitude,
        'longitude' => $longitude,
        'start_date'=> $dataInicio,
        'end_date'  => $dataFim,
        'daily'     => 'temperature_2m_mean',
        'timezone'  => 'America/Sao_Paulo'
    ]);

    $response = @file_get_contents($url);

    if ($response === false) {
        return null;
    }

    $data = json_decode($response, true);

    if (!isset($data['daily']['temperature_2m_mean'])) {
        return null;
    }

    $temperaturas = array_filter(
        $data['daily']['temperature_2m_mean'],
        fn($t) => $t !== null
    );

    if (count($temperaturas) === 0) {
        return null;
    }

    return array_sum($temperaturas) / count($temperaturas);
}

function ocorrencias_geo_hidro($rua, $mysqli){ 
    $alagamentos = [];
    $inundacoes = [];
    $deslizamentos = [];
    $queda_arvore = [];

    $alagamentos_sql = mysqli_query($mysqli,"SELECT ocorrencia FROM sp_ocorrencias_geo_hidro WHERE ocorrencia = 'ALAGAMENTO' AND rua = '$rua'");
    if($alagamentos_sql){
        while($row = $alagamentos_sql->fetch_assoc()){
            $alagamentos[] = $row;
        }
    }

    $inundacoes_sql = mysqli_query($mysqli,"SELECT ocorrencia FROM sp_ocorrencias_geo_hidro WHERE ocorrencia = 'INUNDACAO' AND rua = '$rua'");
    if($inundacoes_sql){
        while($row = $inundacoes_sql->fetch_assoc()){
            $inundacoes[] = $row;
        }
    }

    $deslizamentos_sql = mysqli_query($mysqli,"SELECT ocorrencia FROM sp_ocorrencias_geo_hidro WHERE ocorrencia = 'DESLIZAMENTO' AND rua = '$rua'");
    if($deslizamentos_sql){
        while($row = $deslizamentos_sql->fetch_assoc()){
            $deslizamentos[] = $row;
        }
    }

    $queda_arvore_sql = mysqli_query($mysqli,"SELECT ocorrencia FROM sp_ocorrencias_geo_hidro WHERE ocorrencia = 'QUEDA DE ARVORE' AND rua = '$rua'");
    if($queda_arvore_sql){
        while($row = $queda_arvore_sql->fetch_assoc()){
            $queda_arvore[] = $row;
        }
    }

    $total = count($alagamentos) + count($inundacoes) +  count($deslizamentos) + count($queda_arvore);
    return $total;
}

$ocorrencias_geo_hidro = ocorrencias_geo_hidro($rua, $mysqli);
$pontos_onibus = pontos_onibus($lat, $lng, $mysqli);
$estacoes_metro = estacoes_metro($lat, $lng, $mysqli);
$terminais_onibus = terminais_onibus($lat,$lng,$mysqli);

$lugares = buscar_lugares_paralelo($lat, $lng, $geoapify_api);
$restaurantes_proximos = $lugares["restaurantes"];
$supermercados_proximos = $lugares["supermercados"];
$farmacias_proximas = $lugares["farmacias"];
$hospitais_proximos = $lugares["hospitais"];

$clima_tempo = buscar_ClimaTempo($lat, $lng, $data_12_meses, $data_atual );
$seguranca = seguranca($rua, $mysqli, $data_atual, $data_12_meses, $lat, $lng);

$dados = array(
    "desastres_naturais"=>$ocorrencias_geo_hidro,
    "pontos_onibus"=>count($pontos_onibus),
    "terminais_onibus"=>count($terminais_onibus),
    "estacoes_metro"=>count($estacoes_metro),
    "seguranca_publica"=>$seguranca,
    "restaurantes"=>count($restaurantes_proximos),
    "supermercados"=>count($supermercados_proximos),
    "farmacias"=>count($farmacias_proximas),
    "hospitais"=>count($hospitais_proximos),
    "climaTempo"=>$clima_tempo
);

echo json_encode($dados);