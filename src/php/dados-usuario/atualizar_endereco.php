<?php 

require '../config.php'; 
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

session_start();

$data = json_decode(file_get_contents("php://input"), true);

$cep = $data['cep'] ?? null;
$endereco = $data['endereco'] ?? null;
$numero = $data['numero'] ?? null;
$complemento = $data['complemento'] ?? null;
$bairro = $data['bairro'] ?? null;
$cidade = $data['cidade'] ?? null;
$uf = $data['uf'] ?? null;

if(isset($_SESSION['logado'])){
    $response = [];

    $email = $_SESSION['usuario']['email'];

    $sql = mysqli_query($mysqli, "
        UPDATE usuarios SET 
            cep = COALESCE('$cep', cep),
            endereco = COALESCE('$endereco', endereco),
            numero = COALESCE('$numero', numero),
            complemento = COALESCE('$complemento', complemento),
            bairro = COALESCE('$bairro', bairro),
            cidade = COALESCE('$cidade', cidade),
            estado = COALESCE('$uf', estado)
        WHERE email = '$email'
    ");

    if($sql){
        $response = ["status" => "success", "msg"=>"Dados atualizados com sucesso"];
    }else{
        $response = ["status"=>"error", "msg"=>"Falha ao atualizar os dados"];
    }

    echo json_encode($response);
}