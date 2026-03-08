<?php

require '../config.php'; 
$data = json_decode(file_get_contents("php://input"), true);

session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if(isset($_SESSION['logado'])){
    echo json_encode($_SESSION['usuario']);
    return;
}

$email = $data['email'];
$senha = $data['senha'];

$sql = mysqli_query($mysqli, "SELECT * FROM usuarios WHERE email = '$email'");

if($sql->num_rows>0){

    $usuario = $sql->fetch_assoc();
    $senhaBD = $usuario['senha'];
    if (password_verify($senha, $senhaBD)) {

        session_regenerate_id(true);

        $_SESSION['usuario'] = [
            'id'          => $usuario['usuario_id'],
            'nome'        => $usuario['nome'],
            'sobrenome'   => $usuario['sobrenome'],
            'email'       => $usuario['email'],
            'cpf'         => $usuario['cpf'],
            'cep'         => $usuario['cep'],
            'endereco'    => $usuario['endereco'],
            'complemento' => $usuario['complemento'],
            'bairro'      => $usuario['bairro'],
            'cidade'      => $usuario['cidade'],
            'estado'      => $usuario['estado'],
            'verified'    => $usuario['verified'],
            'creditos'    => $usuario['creditos'],
        ];

        $_SESSION['logado'] = true;
            
        $response = ['status'=>'success', 'msg'=>'Usuário autenticado'];

    } else {
        $response = ['status'=>'error', 'msg'=>'E-mail e/ou Senha incorretos'];
    }

}else{
    $response = ['status'=>'error', 'msg'=>'E-mail e/ou Senha incorretos'];
}

echo json_encode($response);