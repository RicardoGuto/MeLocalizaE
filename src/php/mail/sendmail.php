<?php 

    use PHPMailer\PHPMailer\PHPMailer;

function enviar_email($destinatario, $assunto, $mensagemHTML){
    
    require '../vendor/autoload.php';

    $mail = new PHPMailer;
    $mail->isSMTP();
    $mail->Host = 'smtp.hostinger.com';
    $mail->Port = 587;
    $mail->SMTPAuth = true;
    $mail->Username = 'ricardo.augusto@suzumetech.com';
    $mail->Password = '@Ricksilva2000';    

    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->isHTML(true);
    $mail->CharSet = 'UTF-8';


    $mail->setFrom('ricardo.augusto@suzumetech.com', 'Ricardo Augusto');
    $mail->addAddress($destinatario);
    $mail->Subject = $assunto;
    $mail->Body = $mensagemHTML;

    if($mail->send()){
        return true;
    }else{
        echo "Falha ao enviar e-mail";
        return false;
    }

}
?>