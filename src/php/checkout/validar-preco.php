<?php


require '../config.php'; 
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
session_start();
$data = json_decode(file_get_contents("php://input"), true);

$totalRelatorios = $data['totalRelatorios'];

if(isset($_SESSION['usuario']['email'])){    
    if($totalRelatorios == 1){
        echo json_encode(["status"=>"success", "preco"=>11.99]);
    }else if($totalRelatorios == 5){
        echo json_encode(["status"=>"success", "preco"=>53.99]);
    }
}