<?php
require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/../config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');


\Stripe\Stripe::setApiKey($_ENV['STRIPE_SECRET_KEY']);

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

$quantidade = $data['quantidade'];
$produto = $data['produto'] ?? 'Relatorio';
$preco   = $data['preco'] ?? 1000; // centavos

try {
    $session = \Stripe\Checkout\Session::create([
        'mode' => 'payment',
        'payment_method_types' => ['card'],

        'line_items' => [[
            'price_data' => [
                'currency' => 'brl',
                'product_data' => [
                    'name' => $produto,
                ],
                'unit_amount' => $preco,
            ],
            'quantity' => 1,
        ]],

        // 🔑 ESSENCIAL PARA O WEBHOOK
        'metadata' => [
            'produto' => $produto,
            'preco'   => $preco,
            'quantidade' => $quantidade
        ],

        // 🔑 Permite conferência visual
        'success_url' =>
            'https://melocalizae.com.br/CompraEfetuada?session_id={CHECKOUT_SESSION_ID}',

        'cancel_url' =>
            'https://melocalizae.com.br/CompraCancelada',
    ]);

    echo json_encode([
        'url' => $session->url
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
