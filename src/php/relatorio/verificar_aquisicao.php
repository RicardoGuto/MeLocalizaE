<?php 

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');


include('../config.php');
session_start();

$json = file_get_contents('php://input');
$data = json_decode($json, true);

$cep = $data['cep'];
$usuario_id = $_SESSION['usuario']['id'];
session_write_close();

if(isset($_SESSION['logado'])){


    $sql = mysqli_query($mysqli, "SELECT * FROM relatorios_adquiridos WHERE usuario_id = '$usuario_id' AND cep = '$cep'");
    if($sql->num_rows>0){
        $response = ['status'=>'success', 'msg'=>'Relatório adquirido'];
    }else{
        $response = ['status'=>'success', 'msg'=>'Relatório não adquirido'];
    }

}else{
    $response = ['status'=>'error', 'msg'=>'Não autenticado'];
}

echo json_encode($response);

?>