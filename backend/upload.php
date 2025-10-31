<?php
header('Content-Type: application/json; charset=utf-8');

// contests.txt 파일 경로 (data 폴더)
$file_path = __DIR__ . '/../data/contests.txt';

// 파일이 없으면 생성
if (!file_exists($file_path)) {
    // 디렉토리가 없으면 생성
    $dir = dirname($file_path);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
}

// POST 데이터 받기
$title = isset($_POST['title']) ? trim($_POST['title']) : '';
$date = isset($_POST['date']) ? trim($_POST['date']) : '';
$role = isset($_POST['role']) ? trim($_POST['role']) : '';
$level = isset($_POST['level']) ? trim($_POST['level']) : '';
$status = isset($_POST['status']) ? trim($_POST['status']) : '';
$host = isset($_POST['host']) ? trim($_POST['host']) : '';
$rank = isset($_POST['rank']) ? trim($_POST['rank']) : '';
$contact = isset($_POST['contact']) ? trim($_POST['contact']) : '';
$activityPeriod = isset($_POST['activityPeriod']) ? trim($_POST['activityPeriod']) : '';

// 필수 항목 검증
if (empty($title) || empty($date) || empty($role) || empty($level) || empty($status) || empty($host) || empty($rank) || empty($activityPeriod)) {
    echo json_encode([
        'success' => false,
        'message' => '필수 항목이 누락되었습니다. (활동 기간 포함)'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 연락처가 없으면 기본값 설정
if (empty($contact)) {
    $contact = 'contact@seeandyou.ac.kr';
}

// 데이터 형식: 제목 | 모집기간 | 역할 | 난이도 | 상태 | 주최 | 상격 | 연락처 | 활동기간
$line = sprintf(
    "%s | %s | %s | %s | %s | %s | %s | %s | %s\n",
    $title,
    $date,
    $role,
    $level,
    $status,
    $host,
    $rank,
    $contact,
    $activityPeriod
);

// 파일에 추가 (LOCK_EX로 동시 접근 방지)
$result = file_put_contents($file_path, $line, FILE_APPEND | LOCK_EX);

if ($result !== false) {
    echo json_encode([
        'success' => true,
        'message' => '대회가 성공적으로 등록되었습니다.'
    ], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode([
        'success' => false,
        'message' => '파일 저장에 실패했습니다. 파일 권한을 확인하세요.'
    ], JSON_UNESCAPED_UNICODE);
}
?>

