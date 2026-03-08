<?php



require '../config.php'; 
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
session_start();
$data = json_decode(file_get_contents("php://input"), true);

$cupomCode = $data['cupomCode'];
$precoAtual = $data['precoTotal'];

if(isset($_SESSION['usuario']['email'])){
    
    $email = $_SESSION['usuario']['email'];
    
    $sql = mysqli_query($mysqli, "SELECT * FROM cupom WHERE email_attr = '$email' AND cupom = '$cupomCode'");
    $sql_afiliados = mysqli_query($mysqli, "SELECT * FROM cupom_afiliados WHERE afiliado_cupom = '$cupomCode'");
    
    if($sql->num_rows>0){
        $row = $sql->fetch_assoc();
        $usado = $row['usado'];
        $desconto = $row['desconto'];
                
        if($usado == 'SIM'){
            $response = [
                "status"=>"error",
                "msg"=>"Cupom já utilizado"
            ];
            echo json_encode($response);
            return;
        }else if ($usado == 'NAO'){
            $descontoValor = number_format($precoAtual * ($desconto / 100),2, '.','');
            $valorTotal = number_format($precoAtual - $descontoValor,2,'.','');
            $response = [
                "status"=>"success",
                "msg"=>"Cupom válido",
                "desconto"=>$desconto,
                "valorDescontado"=>$descontoValor,
                "valorTotal"=>$valorTotal
            ];
            echo json_encode($response);
        }         
        
    }else if($sql_afiliados->num_rows>0){
        $row_afiliados = $sql_afiliados->fetch_assoc();
        $desconto = $row_afiliados['desconto'];

        $descontoValor = number_format($precoAtual * ($desconto / 100),2, '.','');
        $valorTotal = number_format($precoAtual - $descontoValor,2, '.','');
                
        $response = [
            "status"=>"success",
            "msg"=>"Cupom válido",
            "desconto"=>$desconto,
            "valorDescontado"=>$descontoValor,
            "valorTotal"=>$valorTotal
        ];
        echo json_encode($response);
    }else{
        $response = [
            "status"=>"error",
            "msg"=>"Cupom inválido",
        ];
        echo json_encode($response);
        return;
    }
}else{
    $response = [
        "status"=>"error",
        "msg"=>"Não autenticado."
    ];
    echo json_encode($response);
    return;
}

