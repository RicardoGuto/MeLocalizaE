<?php 


session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if(isset($_SESSION['logado'])){
    echo json_encode(["status" => "success", "data" => $_SESSION['usuario']]);
    return;
}else{
    echo json_encode(["status"=> "error", "msg"=>"Não autenticado"]);
}



?>