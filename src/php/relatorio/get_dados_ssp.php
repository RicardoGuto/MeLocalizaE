<?php
include('../headers.php');
include('../config.php');

$json = file_get_contents('php://input');
$data = json_decode($json, true);

$logradouro = $data['logradouro'];

$sql = mysqli_query($mysqli, "SELECT * FROM sp_ssp_data WHERE LOGRADOURO = '$logradouro'");

if($sql->num_rows>0){
    $rows = [];
    while($row=$sql->fetch_assoc()){
        $rows[] = $row;
    }    
    echo json_encode(['success' => true, 'total' => count($rows), 'data' => $rows]);  

}else{
    echo json_encode(['success' => true, 'total' => 0, 'data' => []]);
}

