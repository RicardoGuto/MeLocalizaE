<?php

$mode = 'DEV';

if($mode == 'DEV'){
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: http://localhost:3000');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: POST,OPTIONS,GET');
    header('Access-Control-Allow-Headers: Content-Type');
    header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
    header("Pragma: no-cache");
}else if ($mode == 'PROD'){
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: http://melocalizae.com.br');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: POST');
    header('Access-Control-Allow-Headers: Content-Type');
}

