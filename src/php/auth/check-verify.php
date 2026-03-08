<?php
require '../config.php'; 
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

session_start();

if(!isset($_SESSION['logado'])){
    echo json_encode([
        "status" => "error",
        "msg" => "Usuário não autenticado"
    ]);
    exit;
}

$email = $_SESSION['usuario']['email'];

$sql = mysqli_query($mysqli, "SELECT verified FROM usuarios WHERE email = '$email'");
if($sql->num_rows>0){
    $row = $sql->fetch_assoc();
    $verified_status = $row['verified'];

    if($verified_status == 'SIM'){
        echo json_encode(["status" => "success", "msg"=>$verified_status]);
        return;
    }else if($verified_status == 'NAO'){
        echo json_encode(["status"=> "error", "msg"=>$verified_status]);
    }
}
