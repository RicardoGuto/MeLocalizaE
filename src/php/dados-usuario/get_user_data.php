<?php 


require '../config.php'; 
include('../headers.php');

session_start();

if(isset($_SESSION['logado'])){
    
    $email = $_SESSION['usuario']['email'];
    session_write_close();

    $response = [];


    $sql_dados_basicos = mysqli_query($mysqli, "SELECT * FROM usuarios WHERE email = '$email'");
    if($sql_dados_basicos->num_rows>0){
        $row = $sql_dados_basicos->fetch_assoc();
        $response['dados_basicos'] = $row; 
    }

    $response['status'] = "success";

    echo json_encode($response);
}else{
    echo json_encode(["status"=> "Não logado", "msg"=>"Não autenticado"]);
}
