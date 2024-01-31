<?php
include_once '../include/db.php';

$data = trim(file_get_contents("php://input"));
$table = json_decode($data, true);

$result = mysqli_query($db, "SHOW TABLES LIKE 'lark_lang_$table'");
$count = mysqli_num_rows($result) > 0;

echo json_encode($count);
exit();