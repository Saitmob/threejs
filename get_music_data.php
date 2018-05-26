<?php
// 这里就不读数据库了，直接读文件
$data = file_get_contents('data/music_data.json');
// $data = json_decode($data, true);
// var_dump($data);
echo $data;
?>