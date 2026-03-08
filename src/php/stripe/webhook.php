<?php
require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/../config.php';

header('Content-Type: application/json');

\Stripe\Stripe::setApiKey('');

$endpoint_secret = '';

$logFile = __DIR__ . '/webhook.log';

file_put_contents(
    $logFile,
    "\n--- Webhook recebido em " . date('Y-m-d H:i:s') . " ---\n",
    FILE_APPEND
);

if (!isset($mysqli) || !$mysqli instanceof mysqli) {
    file_put_contents($logFile, "ERRO: mysqli não existe\n", FILE_APPEND);
    http_response_code(500);
    exit;
}

$payload    = file_get_contents('php://input');
$sig_header = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';

try {
    $event = \Stripe\Webhook::constructEvent(
        $payload,
        $sig_header,
        $endpoint_secret
    );
} catch (Exception $e) {
    file_put_contents($logFile, "ERRO ASSINATURA: " . $e->getMessage() . "\n", FILE_APPEND);
    http_response_code(400);
    exit;
}

file_put_contents(
    $logFile,
    "Evento recebido: {$event->type}\n",
    FILE_APPEND
);


switch ($event->type) {

    case 'checkout.session.completed':

    $session = $event->data->object;

    $stripeId   = $session->id;
    $email      = $session->customer_details->email ?? null;
    $valor      = $session->amount_total / 100;
    $moeda      = $session->currency;
    $status     = $session->payment_status === 'paid' ? 'pago' : 'pendente';
    $produto    = $session->metadata->produto ?? null;
    $quantidade = (int) ($session->metadata->quantidade ?? 1);

    // Atualiza
    $stmt = $mysqli->prepare("
        UPDATE pagamentos
        SET status = ?
        WHERE stripe_id = ?
    ");
    $stmt->bind_param("ss", $status, $stripeId);
    $stmt->execute();

    if ($stmt->affected_rows === 0) {
        // Insere
        $stmt = $mysqli->prepare("
            INSERT INTO pagamentos
            (stripe_id, email, valor, moeda, status, produto, quantidade)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->bind_param(
            "ssdsssi",
            $stripeId,
            $email,
            $valor,
            $moeda,
            $status,
            $produto,
            $quantidade
        );
        $stmt->execute();
    }

    $stmt->close();

    if ($status === 'pago') {

        $stmt = $mysqli->prepare("
            SELECT email, quantidade
            FROM pagamentos
            WHERE stripe_id = ?
            LIMIT 1
        ");
        $stmt->bind_param("s", $stripeId);
        $stmt->execute();
        $result = $stmt->get_result();
        $pagamento = $result->fetch_assoc();
        $stmt->close();

        if ($pagamento && (int)$pagamento['quantidade'] > 0) {

            $stmt = $mysqli->prepare("
                UPDATE usuarios
                SET creditos = creditos + ?
                WHERE email = ?
            ");
            $stmt->bind_param(
                "is",
                $pagamento['quantidade'],
                $pagamento['email']
            );
            $stmt->execute();
            $stmt->close();

        file_put_contents(
            $logFile,
            "Créditos creditados ({$pagamento['quantidade']}) para {$pagamento['email']}\n",
            FILE_APPEND
        );
    }
}

break;



    case 'checkout.session.async_payment_succeeded':

        $session  = $event->data->object;
        $stripeId = $session->id;

        // Marca pagamento como pago
        $stmt = $mysqli->prepare("
            UPDATE pagamentos
            SET status = 'pago'
            WHERE stripe_id = ?
        ");
        $stmt->bind_param("s", $stripeId);
        $stmt->execute();
        $stmt->close();

        // Busca email e quantidade
        $stmt = $mysqli->prepare("
            SELECT email, quantidade
            FROM pagamentos
            WHERE stripe_id = ?
        ");
        $stmt->bind_param("s", $stripeId);
        $stmt->execute();
        $result = $stmt->get_result();
        $pagamento = $result->fetch_assoc();
        $stmt->close();

        if ($pagamento) {
            $email = $pagamento['email'];
            $quantidade = (int) $pagamento['quantidade'];

            $stmt = $mysqli->prepare("
                UPDATE usuarios
                SET creditos = creditos + ?
                WHERE email = ?
            ");
            $stmt->bind_param("is", $quantidade, $email);
            $stmt->execute();
            $stmt->close();
        }

        file_put_contents(
            $logFile,
            "Creditando {$quantidade} para {$email}\n",
            FILE_APPEND
        );

        break;
        

    case 'checkout.session.async_payment_failed':

        $session  = $event->data->object;
        $stripeId = $session->id;

        $stmt = $mysqli->prepare("
            UPDATE pagamentos
            SET status = 'expirado'
            WHERE stripe_id = ?
        ");
        $stmt->bind_param("s", $stripeId);
        $stmt->execute();
        $stmt->close();
        break;
}


http_response_code(200);
