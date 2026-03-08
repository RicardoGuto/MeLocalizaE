<?php

require '../config.php'; 
$data = json_decode(file_get_contents("php://input"), true);

session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if(!isset($_SESSION['logado'])){
    echo json_encode([
        "status" => "error",
        "msg" => "Usuário não autenticado"
    ]);
    exit;
}


$codigo = $data['codigo'];
$email = $_SESSION['usuario']['email'];

$sql = mysqli_query($mysqli, "SELECT codigo_verificacao FROM usuarios WHERE email = '$email' AND codigo_verificacao = '$codigo'");
if($sql->num_rows>0){

    $update_verify = mysqli_query($mysqli, "UPDATE usuarios SET verified = 'SIM' WHERE email = '$email' AND codigo_verificacao = '$codigo'");

    if($update_verify){
        $_SESSION['usuario']['verified'] = 'SIM';
        echo json_encode(["status"=>"success", "msg"=>"Verificado com sucesso"]);
    }else{
        echo json_encode(["status"=>"error", "msg"=>"Ocorreu um erro durante o processo de verificação. Tente novamente."]);
    }

}else{
    echo json_encode(["status"=>"error", "msg"=>"Código incorreto"]);
}



