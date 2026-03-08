<?php 

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");

try{
    session_start();
    session_unset();
    session_destroy();

    echo json_encode(["status"=>"success", "msg"=>"Logout"]);

}catch(Exception $e){
    echo json_encode(["status"=>"Erro", "msg"=>"Falha no logout"]);
}




?>