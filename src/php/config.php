<?php

$mode = "DEV";

if($mode=='DEV'){
    $dbHost = 'LocalHost';
    $dbUsername = 'root';
    $dbPassword = '';
    $dbName = 'melocalizae';
}else{    
    $dbHost = '127.0.0.1:3306';
    $dbUsername = 'u448785098_melocalizae';
    $dbPassword = 'Tabajara1900@';
    $dbName = 'u448785098_melocalizae_db';
}



$mysqli = new mysqli($dbHost,$dbUsername,$dbPassword,$dbName);

if($mysqli->error)
{
    die("Falha na conexão com o servidor:" . $mysqli->error);
}


?>