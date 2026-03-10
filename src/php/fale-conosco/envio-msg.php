<?php

include('../mail/sendmail.php');   
include('../headers.php');

$json = file_get_contents('php://input');
$data = json_decode($json, true);

$nome = $data['nome'];
$email = $data['email'];
$assunto = $data['assunto'];
$categoria = $data['categoria'];
$descricao = $data['descricao'];

$mensagem = `Foi recebida uma nova mensagem através do formulário de contato.\n\nNome: `. $nome .`\n
E-mail: `.$email.`\nAssunto: `.$assunto.`\nCategoria: `.$categoria.`Mensagem: `. $descricao;

try{
    enviar_email('contato@melocalizae.com.br', "Nova mensagem de " . $nome, $mensagem);
    echo json_encode(['status'=>'success', 'msg'=>'Mensagem enviada com sucesso!']);
}catch (Exception $e){
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao enviar e-mail de verificação.']);
    return;
}    