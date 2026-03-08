<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

session_start();


if(isset($_SESSION['logado'])){
    echo json_encode(["status" => "Logado", "data" => $_SESSION['usuario']]);
    return;
}else{
    echo json_encode(["status"=> "Não logado", "msg"=>"Não autenticado"]);
}
