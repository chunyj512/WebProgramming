<?php
header('Content-Type: application/json; charset=utf-8');

// contests.txt 경로 확인 (PHP 파일 기준 상대 경로)
$file_path = __DIR__ . '/../data/contests.txt';

// 경로가 없으면 절대 경로로도 시도
if (!file_exists($file_path)) {
    $file_path = '../data/contests.txt';
}

if (!file_exists($file_path)) {
    echo json_encode([
        'error' => '데이터 파일을 찾을 수 없습니다.',
        'path_tried' => $file_path,
        'current_dir' => __DIR__
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

$lines = file($file_path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
$contests = [];

if (empty($lines)) {
    echo json_encode([
        'error' => '데이터 파일이 비어있습니다.',
        'path' => $file_path
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

foreach ($lines as $index => $line) {
    // 빈 줄 건너뛰기
    $line = trim($line);
    if (empty($line)) continue;
    
    $data = explode(' | ', $line);
    
    // 최소 8개 필드 필요 (기본 형식)
    if (count($data) >= 8) {
        $contest = [
            'id' => $index,
            'title' => trim($data[0]),
            'date' => trim($data[1]),
            'role' => trim($data[2]),
            'level' => trim($data[3]),
            'status' => trim($data[4]),
            'host' => trim($data[5]),
            'rank' => trim($data[6]),
            'contact' => trim($data[7]),
            'imagePath' => '', // 기본값
            'activityPeriod' => '' // 기본값
        ];
        
        // 새 형식 (10개 필드): 이미지 경로 + 활동 기간 포함
        if (count($data) >= 10) {
            $contest['imagePath'] = trim($data[8]);
            $contest['activityPeriod'] = trim($data[9]);
        }
        // 기존 형식 (9개 필드): 활동 기간만 포함
        else if (count($data) >= 9) {
            $contest['activityPeriod'] = trim($data[8]);
        }
        
        $contests[] = $contest;
    }
}

if (empty($contests)) {
    echo json_encode([
        'error' => '파싱된 데이터가 없습니다.',
        'lines_count' => count($lines)
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

echo json_encode($contests, JSON_UNESCAPED_UNICODE);
?>
