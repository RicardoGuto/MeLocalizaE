<?php

include('../headers.php');

session_start();


if(isset($_SESSION['logado'])){
    echo json_encode(["status" => "Logado", "data" => $_SESSION['usuario']]);
    return;
}else{
    echo json_encode(["status"=> "Não logado", "msg"=>"Não autenticado"]);
}
