<?php
header('Content-Type: application/json; charset=utf-8');

$file_path = '../data/contests.txt';

if (!file_exists($file_path)) {
    echo json_encode(['error' => '데이터 파일을 찾을 수 없습니다.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$lines = file($file_path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
$contests = [];

foreach ($lines as $index => $line) {
    $data = explode(' | ', $line);
    
    if (count($data) >= 8) {
        $contests[] = [
            'id' => $index,
            'title' => trim($data[0]),
            'date' => trim($data[1]),
            'role' => trim($data[2]),
            'level' => trim($data[3]),
            'status' => trim($data[4]),
            'host' => trim($data[5]),
            'rank' => trim($data[6]),
            'contact' => trim($data[7])
        ];
    }
}

echo json_encode($contests, JSON_UNESCAPED_UNICODE);
?>
