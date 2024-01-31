<?php
    // Подключение файла для соединения с базой данных
    include 'db.php';

    // Получение данных POST-запроса в формате JSON
    $data = trim(file_get_contents("php://input"));
    $data = json_decode($data, true);

    // Подготовка SQL-запроса для выборки данных из таблицы языковых настроек
    $query = "SELECT * FROM lark_lang_header_footer";

    if(is_array($data)) {
        foreach($data as $item) {
            $query .= " UNION SELECT * FROM lark_lang_" . $item;
        }
    } else {
        $query .= " UNION SELECT * FROM lark_lang_" . $data;
    }
    
    $sql = $db->prepare($query);
    $sql->execute();

    // Получение результатов запроса в виде массива ассоциативных массивов
    $content = $sql->get_result()->fetch_all(MYSQLI_ASSOC);

    // Отправка данных в формате JSON клиенту
    echo json_encode($content);
?>