<?php

require '../config.php'; 
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

session_start();

if(isset($_SESSION['logado'])){
    $response = [];

    $usuario_id = $_SESSION['usuario']['id'];

    $sql = mysqli_query($mysqli, "SELECT * FROM relatorios_adquiridos WHERE usuario_id = '$usuario_id'");

    if($sql->num_rows>0){
        $relatorios = [];
        while($row = $sql->fetch_assoc()){
            $relatorios[] = $row;
        }

        $response = ["status" => "success", "msg"=>"Dados atualizados com sucesso", "relatorios_adquiridos"=>$relatorios];
    }else{
        $response = ["status"=>"error", "msg"=>"Nenhum relatório adquirido"];
    }

    echo json_encode($response);
}