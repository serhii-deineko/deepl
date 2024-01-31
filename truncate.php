<?php
include_once '../include/db.php';

$data = trim(file_get_contents("php://input"));
$table = json_decode($data, true);

// Проверка наличия таблицы
$result = mysqli_query($db, "SHOW TABLES LIKE 'lark_lang_$table'");
$exist = mysqli_num_rows($result) > 0;

// Очистка таблицы, если она существует
if ($exist) {
    $truncate = mysqli_query($db, "TRUNCATE TABLE `lark_lang_$table`");

    if ($truncate) {
        $response = ['success' => true, 'message' => 'Таблица успешно очищена'];
    } else {
        $response = ['success' => false, 'message' => 'Ошибка при очистке таблицы'];
    }
} else {
    $response = ['success' => false, 'message' => 'Таблица не существует'];
}

header('Content-Type: application/json');
echo json_encode($response);
exit();