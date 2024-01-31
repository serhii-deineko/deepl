<?php
set_time_limit(0);
include 'db.php';

$data = trim(file_get_contents("php://input"));
$url = 'https://api-free.deepl.com/v2/translate';
$lg = ['pl', 'de', 'fr', 'es', 'nl'];

$content = json_decode($data, true);
$pageName = $content['pageName'];
$contentArray = $content['contentArray'];

// Записываем все англоязычные значения
$stmt = $db->prepare("INSERT IGNORE INTO lark_lang_" . $pageName . " (en) VALUES (?)");

for ($i = 0; $i < count($contentArray); $i++) {
    $stmt->bind_param('s', $contentArray[$i]);
    $stmt->execute();
}

// Получаем все англоязычные записи
$stmt = $db->prepare("SELECT en FROM lark_lang_$pageName");
$stmt->execute();
$result = $stmt->get_result();
while ($row = $result->fetch_row()[0]) {
    $dbContentArray[] = $row;
}

// Compare the contentArray with the database content array (dbContentArray)
$entriesToRemove = array_diff($dbContentArray, $contentArray);

// Remove entries from the database that are not in the contentArray
foreach ($entriesToRemove as $entry) {
    $stmt = $db->prepare("DELETE FROM lark_lang_$pageName WHERE en = ?");
    $stmt->bind_param('s', $entry);
    $stmt->execute();
}

// Loop through each target language
foreach ($lg as $target_lang) {

    // Loop through each sentence in the contentArray
    for ($i = 0; $i < count($dbContentArray); $i++) {

        // Check if the translation for this sentence and language already exists
        $stmt = $db->prepare("SELECT COUNT(*) FROM lark_lang_$pageName WHERE $target_lang != '' AND en = ?");
        $stmt->bind_param('s', $dbContentArray[$i]);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_row();

        // If the translation already exists, skip to the next sentence
        if ($row[0] > 0) {
            continue;
        }

        // Perform the translation and update the database
        $fields = array(
            'text' => $dbContentArray[$i],
            'source_lang' => 'EN',
            'target_lang' => $target_lang,
            'tag_handling' => 'html',
            'save_formatting' => 0,
            'split_sentences' => 'nonewlines',
            'auth_key' => 'a1b85714-ca7f-5dd0-379b-0ed8ab219f4f:fx'
        );

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($fields));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/x-www-form-urlencoded'));

        $result = curl_exec($ch);

        if (curl_errno($ch)) {
            echo 'Error:' . curl_error($ch);
        }
        curl_close($ch);

        $translatedWords = json_decode($result, true);
        $translation = $translatedWords['translations'][0]['text'];

        $stmt = $db->prepare("UPDATE lark_lang_$pageName SET $target_lang = ? WHERE en = ?");
        $stmt->bind_param('ss', $translation, $dbContentArray[$i]);
        $stmt->execute();
    }
}

//Обновление локальный файлов json
$sql = $db->prepare(
    "SELECT en, pl, de, fr, es, nl FROM lark_lang_$pageName"
);
$sql->execute();

// Получение результатов запроса в виде массива ассоциативных массивов
$content = $sql->get_result()->fetch_all(MYSQLI_ASSOC);

// Преобразуйте массив $catalog в JSON
$json = json_encode($content, JSON_PRETTY_PRINT);

// Сохраните JSON в файл
file_put_contents("../translations/lark_lang_$pageName.json", $json);
$stmt->close();
exit();
