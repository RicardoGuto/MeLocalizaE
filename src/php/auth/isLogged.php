<?php 


session_start();

include('../headers.php');

if(isset($_SESSION['logado'])){
    echo json_encode(["status" => "success", "data" => $_SESSION['usuario']]);
    return;
}else{
    echo json_encode(["status"=> "error", "msg"=>"Não autenticado"]);
}



?>