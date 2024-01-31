<?php
$tableArray = [
    "lark_lang_header_footer",
    "lark_lang_index",
    "lark_lang_about_us",
    "lark_lang_career",
    "lark_lang_categories",
    "lark_lang_contact",
    "lark_lang_faq",
    "lark_lang_lodge",
    "lark_lang_mobile_houses",
    "lark_lang_modular_buildings",
    "lark_lang_news",
    "lark_lang_newsitem",
    "lark_lang_partnership",
    "lark_lang_policy",
    "lark_lang_product",
    "lark_lang_sanitary_complex",
    "lark_lang_spa_buildings",
    "lark_lang_cookie",
    "lark_lang_ask",
    "lark_lang_support",
    "lark_lang_catalog",
    "lark_lang_configurator",
];

foreach ($tableArray as $table) {
    $sql = $db->prepare(
        "SELECT en, pl, de, fr, es, nl FROM $table"
    );
    $sql->execute();

    // Получение результатов запроса в виде массива ассоциативных массивов
    $content = $sql->get_result()->fetch_all(MYSQLI_ASSOC);

    // Преобразуйте массив $catalog в JSON
    $json = json_encode($content, JSON_PRETTY_PRINT);

    // Сохраните JSON в файл
    file_put_contents("../translations/$table.json", $json);
}