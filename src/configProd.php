<?php

$dbHost = '127.0.0.1:3306';
$dbUsername = 'u448785098_demo_db';
$dbPassword = 'Tabajara1990@';
$dbName = 'u448785098_demo_db';

$mysqli = new mysqli($dbHost,$dbUsername,$dbPassword,$dbName);

if($mysqli->error)
{
    die("Falha na conexão com o servidor:" . $mysqli->error);
}


?>