<?php

require '../config.php'; 
include('../headers.php');

session_start();

if(isset($_SESSION['logado'])){
    $response = [];

    $usuario_id = $_SESSION['usuario']['id'];
    session_write_close();
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