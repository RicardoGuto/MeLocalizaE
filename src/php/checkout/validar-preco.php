<?php


require '../config.php'; 
include('../headers.php');

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