<?php  
include('../config.php'); 
include('../mail/sendmail.php');      
include('../headers.php');

$json = file_get_contents('php://input');
$data = json_decode($json, true);



$usuario_id = bin2hex(random_bytes(10));
$nome = $data['nome'];
$sobrenome = $data['sobrenome'];
$cpf = $data['cpf'];
$email = $data['email'];
$senha_descriptografada = $data['senha'];
$senha = password_hash($senha_descriptografada, PASSWORD_DEFAULT);
$codigoVerificacao = mt_rand(100000, 999999);
$email_promo = $data['emailPromo'];

#Validação E-mail
$emailCheck = $mysqli->prepare("SELECT id FROM usuarios WHERE email = ? LIMIT 1");
$emailCheck->bind_param("s", $email);
$emailCheck->execute();
$emailCheck->store_result();

if ($emailCheck->num_rows > 0) {
    http_response_code(409);
    echo json_encode(['error' => 'Email já cadastrado.']);
    $emailCheck->close();
    $mysqli->close();
    exit;
}

$emailCheck->close();

#Validação CPF
$cpfCheck = $mysqli->prepare("SELECT id FROM usuarios WHERE cpf = ? LIMIT 1");
$cpfCheck->bind_param("s", $cpf);
$cpfCheck->execute();
$cpfCheck->store_result();

if ($cpfCheck->num_rows > 0) {
    http_response_code(409);
    echo json_encode(['error' => 'CPF já cadastrado.']);
    $cpfCheck->close();
    $mysqli->close();
    exit;
}

$cpfCheck->close();

#Cadastrar
$sql = $mysqli->prepare("INSERT INTO usuarios(usuario_id, nome, sobrenome, email, cpf, senha, codigo_verificacao, email_promo)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
$sql->bind_param('ssssssii', $usuario_id, $nome, $sobrenome, $email, $cpf, $senha, $codigoVerificacao, $email_promo);

if($sql->execute()){

    session_start();
    $_SESSION['usuario_id'] = $usuario_id;
    $_SESSION['nome'] = $nome;
    $_SESSION['sobrenome'] = $sobrenome;
    $_SESSION['email'] = $email;
    $_SESSION['cpf'] = $cpf;

    //ENVIAR E-MAIL DE VERIFICAÇÃO
    try{
        enviar_email($email, "Seu código de verificação do Melocalizaê é " . $codigoVerificacao, $codigoVerificacao);
    }catch (Exception $e){
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao enviar e-mail de verificação.']);
        return;
    }    

    echo json_encode([
        "status"=>"success",
        "msg"=>"Cadastro concluído"
    ]);
}else{
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao salvar usuário.']);
}

$sql->close();
$mysqli->close();