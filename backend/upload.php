<?php
header('Content-Type: application/json; charset=utf-8');

// contests.txt 파일 경로 (data 폴더)
$file_path = __DIR__ . '/../data/contests.txt';

// 이미지 업로드 디렉토리
$upload_dir = __DIR__ . '/uploads/';

// 파일이 없으면 생성
if (!file_exists($file_path)) {
    // 디렉토리가 없으면 생성
    $dir = dirname($file_path);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
}

// 이미지 업로드 디렉토리 생성
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

// POST 데이터 받기
$title = isset($_POST['title']) ? trim($_POST['title']) : '';
$date = isset($_POST['date']) ? trim($_POST['date']) : '';
$role = isset($_POST['role']) ? trim($_POST['role']) : '';
$level = isset($_POST['level']) ? trim($_POST['level']) : '';
$status = isset($_POST['status']) ? trim($_POST['status']) : '';
$host = isset($_POST['host']) ? trim($_POST['host']) : '';
$recruitCount = isset($_POST['recruitCount']) ? trim($_POST['recruitCount']) : '';
$contact = isset($_POST['contact']) ? trim($_POST['contact']) : '';
$activityPeriod = isset($_POST['activityPeriod']) ? trim($_POST['activityPeriod']) : '';

// 필수 항목 검증
if (empty($title) || empty($date) || empty($role) || empty($level) || empty($status) || empty($host) || empty($recruitCount) || empty($activityPeriod)) {
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

// 이미지 업로드 처리
$imagePath = '';
if (!empty($_FILES['image']['name']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    $file_type = $_FILES['image']['type'];
    
    if (in_array($file_type, $allowed_types)) {
        $file_extension = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $filename = time() . '_' . uniqid() . '.' . $file_extension;
        $target_path = $upload_dir . $filename;
        
        if (move_uploaded_file($_FILES['image']['tmp_name'], $target_path)) {
            $imagePath = 'backend/uploads/' . $filename;
        } else {
            echo json_encode([
                'success' => false,
                'message' => '이미지 업로드에 실패했습니다.'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    } else {
        echo json_encode([
            'success' => false,
            'message' => '지원하지 않는 이미지 형식입니다. (JPG, PNG, GIF, WEBP만 가능)'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// 데이터 형식: 제목 | 모집기간 | 역할 | 난이도 | 상태 | 주최 | 총모집인원 | 연락처 | 이미지경로 | 활동기간
// 이미지가 없으면 빈 문자열로 저장
$line = sprintf(
    "%s | %s | %s | %s | %s | %s | %s | %s | %s | %s\n",
    $title,
    $date,
    $role,
    $level,
    $status,
    $host,
    $recruitCount,
    $contact,
    $imagePath,
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
