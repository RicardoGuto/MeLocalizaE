<?php 

include('../headers.php');

try{
    session_start();
    session_unset();
    session_destroy();

    echo json_encode(["status"=>"success", "msg"=>"Logout"]);

}catch(Exception $e){
    echo json_encode(["status"=>"Erro", "msg"=>"Falha no logout"]);
}




?>