<?php
require __DIR__ . '/../vendor/autoload.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

\Stripe\Stripe::setApiKey($_ENV['STRIPE_SECRET_KEY']);

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

$session_id = $data['session_id'];
try {

    $session = \Stripe\Checkout\Session::retrieve($session_id);

    $payment_method_type = null;

    if ($session->payment_intent) {

        $paymentIntent = \Stripe\PaymentIntent::retrieve(
            $session->payment_intent
        );

        $payment_method_type = $paymentIntent->payment_method_types[0] ?? null;
    }

    echo json_encode([
        "status" => $session->payment_status,
        "metodo_pagamento" => $payment_method_type
    ]);

} catch (Exception $e) {

    http_response_code(500);
    echo json_encode([
        "error" => $e->getMessage()
    ]);

}