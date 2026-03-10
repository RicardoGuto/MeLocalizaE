<?php
require '../config.php'; 
include('../headers.php');

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
