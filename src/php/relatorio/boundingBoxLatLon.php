<?php
header('Access-Control-Allow-Origin: http://localhost:3000');
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=utf-8");

include('../config.php');
/*
$lat = -23.47444;
$lon = -46.63474;
$raio = 1.0;*/

function getBoundingBox(float $lat, float $lng, float $distanceKm = 1.0): array
{
    // 1 grau de latitude ~ 111.32 km
    $kmPerDegreeLat = 111.32;

    // converte latitude para radianos
    $latRad = deg2rad($lat);

    // delta em graus de latitude
    $deltaLat = $distanceKm / $kmPerDegreeLat;

    // delta em graus de longitude (depende da latitude)
    $kmPerDegreeLng = $kmPerDegreeLat * cos($latRad);
    if ($kmPerDegreeLng == 0) {
        // só por segurança numérica, próximo dos polos
        $kmPerDegreeLng = 0.00001;
    }
    $deltaLng = $distanceKm / $kmPerDegreeLng;

    return [
        'lat_min' => $lat - $deltaLat,
        'lat_max' => $lat + $deltaLat,
        'lng_min' => $lng - $deltaLng,
        'lng_max' => $lng + $deltaLng,
    ];
}



