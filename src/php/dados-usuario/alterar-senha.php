<?php

require '../config.php'; 
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

session_start();
$data = json_decode(file_get_contents("php://input"), true);

$senha_antiga = $data['senhaAtual'];
$senha_nova = $data['senhaNova'];

if(!isset($_SESSION['logado'])){
    echo json_encode([
        "status" => "error",
        "msg" => "Usuário não autenticado"
    ]);
    exit;
}


$email = $_SESSION['usuario']['email'];
session_write_close();

$stmt = $mysqli->prepare("SELECT senha FROM usuarios WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();

$result = $stmt->get_result();
$usuario = $result->fetch_assoc();

$stmt->close();

if(!password_verify($senha_antiga, $usuario['senha'])){
    echo json_encode([
        "status" => "error",
        "msg" => "Senha atual incorreta"
    ]);
    exit;
}


$senha_hash = password_hash($senha_nova, PASSWORD_DEFAULT);

$stmt = $mysqli->prepare("UPDATE usuarios SET senha = ? WHERE email = ?");
$stmt->bind_param("ss", $senha_hash, $email);
$stmt->execute();

$stmt->close();

echo json_encode([
    "status" => "success",
    "msg" => "Senha alterada com sucesso"
]);