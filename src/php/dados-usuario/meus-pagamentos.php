<?php

require '../config.php'; 
include('../headers.php');

session_start();

if(isset($_SESSION['logado'])){
    $response = [];

    $email = $_SESSION['usuario']['email'];
    session_write_close();
    
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