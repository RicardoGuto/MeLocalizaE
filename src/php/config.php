<?php

$dbHost = 'LocalHost';
$dbUsername = 'root';
$dbPassword = '';
$dbName = 'melocalizae';

$mysqli = new mysqli($dbHost,$dbUsername,$dbPassword,$dbName);

if($mysqli->error)
{
    die("Falha na conexão com o servidor:" . $mysqli->error);
}


?>