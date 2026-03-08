<?php


require '../config.php'; 
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");

session_start();

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);
$cep = $data['cep'];
$rua = $data['rua'];
$bairro = $data['bairro'];
$cidade = $data['cidade'];

if(isset($_SESSION['logado'])){
    $usuario_id = $_SESSION['usuario']['id'];

    $validar_saldo = mysqli_query($mysqli, "SELECT creditos FROM usuarios WHERE usuario_id = '$usuario_id'");
    if($validar_saldo){
        $row = $validar_saldo->fetch_assoc();
        $creditos = $row['creditos'];
        if((int)$creditos == 0){
            $response = ['status'=>'error', 'msg' => 'Créditos insuficientes'];
            echo json_encode($response);
            return;
        }
    }

    $sql = mysqli_query($mysqli, "INSERT INTO relatorios_adquiridos(cep,usuario_id, rua, bairro, cidade) VALUES('$cep','$usuario_id', '$rua', '$bairro', '$cidade')");
    if($sql){

        $atualizar_saldo = mysqli_query($mysqli, "UPDATE usuarios SET creditos = creditos - 1 WHERE usuario_id = '$usuario_id'");
        if($atualizar_saldo){
            $response = ['status'=>'success', 'msg'=>'Relatório adquirido com sucesso'];
            echo json_encode($response);
        }else{

            $limpar_aquisicao = mysqli_query($mysqli, "DELETE FROM relatorios_adquiridos WHERE cep = '$cep' AND usuario_id = '$usuario_id'");
            $response = ['status'=>'error', 'msg' => 'Falha na aquisição de relatório'];
            echo json_encode($response);
        }
        
    }else{
        $response = ['status'=>'error', 'msg' => 'Falha na aquisição de relatório'];
        echo json_encode($response);
    }
}