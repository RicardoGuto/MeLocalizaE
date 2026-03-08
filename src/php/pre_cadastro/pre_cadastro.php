<?php 

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=utf-8");

include('../config.php');
include('../mail/sendmail.php');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$json = file_get_contents('php://input');
$data = json_decode($json, true);

$nome = $data["nome"] ?? null;
$email = $data["email"] ?? null;
$telefone = $data["celular"] ?? null;
$cupom = bin2hex(random_bytes(3));

$ip = $_SERVER['REMOTE_ADDR'];

$api = "http://ip-api.com/json/$ip";
$response_api = file_get_contents($api);
$dados = json_decode($response_api, true);

$cidade = $dados['city'] ?? null;
$lat_aprox = $dados['lat'] ?? null;
$lon_aprox = $dados['lon'] ?? null;
$response = '';


if($api){

    $check_email = mysqli_query($mysqli, "SELECT email FROM pre_cadastro WHERE email = '$email'");
    if($check_email->num_rows > 0){
        $response = [
            "status" => "error",
            "msg" => "E-mail já utilizado no pré-cadastro."
        ];
        echo json_encode($response);
        return;
    }

    $check_celular = mysqli_query($mysqli, "SELECT telefone FROM pre_cadastro WHERE telefone = '$telefone'");
    if($check_celular->num_rows > 0){
        $response = [
            "status" => "error",
            "msg" => "Celular já utilizado no pré-cadastro."
        ];
        echo json_encode($response);
        return;
    }

    $sql = mysqli_query($mysqli, "INSERT INTO pre_cadastro(nome, email, telefone, ip, cidade, lat_aprox, lon_aprox, cupom) 
    VALUES ('$nome', '$email', '$telefone', '$ip', '$cidade', '$lat_aprox', '$lon_aprox', '$cupom')");

    if($sql){

        $mail_body = '
        <div style="width:100%; background:#f2f2f2; padding:30px 0; font-family:Arial, sans-serif;">
            <table width="600" align="center" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">

                <tr>
                    <td>
                        <img src="https://melocalizae.com.br/email_assets/capa_email.png" 
                            alt="Cabeçalho" 
                            style="width:100%; display:block;">
                    </td>
                </tr>

                <tr> 
                    <td style="padding:20px; text-align:center;"> <img src="https://melocalizae.com.br/email_assets/logo_vetor_v1.png" alt="Logo" style="width:200px; margin-bottom:20px;"> </td>    
                </tr>

                
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td align="center">

                            <table width="600" cellpadding="0" cellspacing="0" style="text-align:center;">

                                <tr>
                                    <td style="padding:0 40px 30px 40px; color:#fc7b44; font-size:20px; line-height:1.6;">
                                        Seu cupom de desconto é:
                                    </td>
                                </tr>

                                <tr>
                                    <td style="color:#fc7b44; font-size:28px; font-weight:bold;">
                                        '.$cupom.'
                                    </td>
                                </tr>

                                <tr>
                                    <td style="color:#444; font-size:16px;">
                                        Utilize-o quando efetuar a primeira compra.
                                    </td>
                                </tr>

                                

                            </table>

                        </td>
                    </tr>
                </table>

                <!-- Assinatura -->
                <tr>
                    <td style="padding:20px 40px 10px 40px; color:#444; font-size:15px;">
                        Atenciosamente,
                    </td>
                </tr>
                <tr>
                    <td style="padding:0 40px 40px 40px; color:#333333; font-size:15px;">

                        <strong>Equipe Me localizaÊ</strong><br>
                        <span style="color:#888888; font-size:14px;">Em caso de dúvidas, responda esse e-mail.</span>

                    </td>
                </tr>

            </table>

        </div>

        ';

        $mail = enviar_email($email, 'Me localizaÊ | Pré-cadastro concluído!', $mail_body);

        if($mail){
             $response = [
                "status" => "success",
                "msg" => "Pré Cadastro concluído com sucesso!"
            ];
        }
       
    }else{
        $response = [
            "status" => "error",
            "msg" => "Houve um erro ao concluir o pré cadastro"
        ];
    }

    echo json_encode($response);
}
