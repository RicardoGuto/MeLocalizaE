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

    $email = $_SESSION['usuario']['email'];

    $sql = mysqli_query($mysqli, "SELECT * FROM pagamentos WHERE email = '$email'");

    if($sql->num_rows>0){
        $pagamentos = [];
        while($row = $sql->fetch_assoc()){
            $pagamentos[] = $row;
        }

        $response = ["status" => "success", "msg"=>"Dados atualizados com sucesso", "pagamentos_realizados"=>$pagamentos];
    }else{
        $response = ["status"=>"error", "msg"=>"Nenhum relatório adquirido"];
    }

    echo json_encode($response);
}