<?php 

$lat = -23.47444;
$lng = -46.63474;

$data_atual = date('Y-m-d');
$data_12_meses = date('Y-m-d', strtotime('-12 months'));

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


$clima_tempo = buscar_ClimaTempo($lat, $lng, $data_12_meses, $data_atual);
echo json_encode($clima_tempo);

