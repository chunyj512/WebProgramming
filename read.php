<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>See&YOU - 검색 결과</title>
    <link rel="stylesheet" href="style.css">
    <style>
        .search-results {
            max-width: 1200px;
            margin: 20px auto;
            padding: 20px;
        }
        .search-form {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .search-form input[type="text"] {
            width: 300px;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin-right: 10px;
        }
        .search-form button {
            padding: 10px 20px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        .search-form button:hover {
            background: #0056b3;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: #f8f9fa;
            font-weight: bold;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .detail-link {
            color: #0055cc !important;
            text-decoration: none;
            font-weight: bold;
            padding: 5px 10px;
            border: 1px solid #0055cc;
            border-radius: 4px;
            transition: all 0.3s ease;
        }
        .detail-link:hover {
            background-color: #0055cc;
            color: white !important;
        }
        .preparing {
            color: #999;
            font-style: italic;
            text-align: center;
        }
        .no-results {
            text-align: center;
            padding: 40px;
            color: #666;
            font-size: 18px;
        }
        .back-link {
            margin-bottom: 20px;
        }
        .back-link a {
            color: #007bff;
            text-decoration: none;
        }
        .back-link a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <header>
        <h1>See&YOU</h1>
        <nav>
            <ul>
                <li><a href="index.html">Home</a></li>
                <li><a href="#">대회 올리기</a></li>
                <li><a href="#">마이페이지</a></li>
                <li><a href="detail.html">대회 탐색</a></li>
            </ul>
        </nav>
    </header>

    <div class="search-results">
        <div class="back-link">
            <a href="index.html">← 홈으로 돌아가기</a>
        </div>

        <?php
        // contests.txt 파일 경로
        $file_path = 'contests.txt';
        
        // 새로운 탭 방식 검색 데이터 처리 – 사용자 편의성 향상을 위해
        $search_method = isset($_POST['search_method']) ? $_POST['search_method'] : 'name';
        $search_name = isset($_POST['contest_name']) ? trim($_POST['contest_name']) : '';
        $role = isset($_POST['role']) ? $_POST['role'] : '';
        $period = isset($_POST['period']) ? $_POST['period'] : '';
        
        // 검색 폼 출력
        echo '<div class="search-form">';
        echo '<form action="read.php" method="POST" class="advanced-search-form">';
        
        echo '<div class="simple-search">';
        echo '<div class="search-options">';
        echo '<h3>검색 방법 선택</h3>';
        echo '<div class="radio-group">';
        echo '<label><input type="radio" name="search_method" value="name"' . ($search_method == 'name' ? ' checked' : '') . '> 대회 이름 검색</label>';
        echo '<label><input type="radio" name="search_method" value="role"' . ($search_method == 'role' ? ' checked' : '') . '> 역할별 검색</label>';
        echo '<label><input type="radio" name="search_method" value="date"' . ($search_method == 'date' ? ' checked' : '') . '> 날짜별 검색</label>';
        echo '</div></div>';
        
        echo '<div class="search-inputs">';
        
        // 대회 이름 검색
        $nameDisplay = ($search_method == 'name') ? 'block' : 'none';
        echo '<div class="search-field" id="name-field" style="display: ' . $nameDisplay . ';">';
        echo '<label for="contest_name">대회 이름</label>';
        echo '<input type="text" id="contest_name" name="contest_name" placeholder="대회 이름을 입력하세요" value="' . htmlspecialchars($search_name) . '">';
        echo '</div>';
        
        // 역할별 검색
        $roleDisplay = ($search_method == 'role') ? 'block' : 'none';
        echo '<div class="search-field" id="role-field" style="display: ' . $roleDisplay . ';">';
        echo '<label for="role">필요 역할</label>';
        echo '<select id="role" name="role">';
        $roles = ['', '프론트엔드', '디자이너', '기획자', '마케터', '데이터 분석가', '통계학자', '엔지니어', '프로그래머', '개발자'];
        foreach($roles as $r) {
            $selected = ($role == $r) ? ' selected' : '';
            echo '<option value="' . $r . '"' . $selected . '>' . ($r ? $r : '역할을 선택하세요') . '</option>';
        }
        echo '</select></div>';
        
        // 날짜별 검색
        $dateDisplay = ($search_method == 'date') ? 'block' : 'none';
        echo '<div class="search-field" id="date-field" style="display: ' . $dateDisplay . ';">';
        echo '<label for="period">대회 기간</label>';
        echo '<select id="period" name="period">';
        $periods = ['', '2025-07', '2025-08', '2025-09', '2025-10', '2025-11'];
        $period_labels = ['날짜를 선택하세요', '2025년 7월', '2025년 8월', '2025년 9월', '2025년 10월', '2025년 11월'];
        for($i = 0; $i < count($periods); $i++) {
            $selected = ($period == $periods[$i]) ? ' selected' : '';
            echo '<option value="' . $periods[$i] . '"' . $selected . '>' . $period_labels[$i] . '</option>';
        }
        echo '</select></div>';
        
        echo '</div>';
        echo '</div>';
        
        // JavaScript 추가
        echo '<script>
          document.addEventListener("DOMContentLoaded", function() {
            const radioButtons = document.querySelectorAll("input[name=\"search_method\"]");
            const nameField = document.getElementById("name-field");
            const roleField = document.getElementById("role-field");
            const dateField = document.getElementById("date-field");
            
            function showField() {
              nameField.style.display = "none";
              roleField.style.display = "none";
              dateField.style.display = "none";
              
              const selectedMethod = document.querySelector("input[name=\"search_method\"]:checked").value;
              if (selectedMethod === "name") {
                nameField.style.display = "block";
              } else if (selectedMethod === "role") {
                roleField.style.display = "block";
              } else if (selectedMethod === "date") {
                dateField.style.display = "block";
              }
            }
            
            radioButtons.forEach(radio => {
              radio.addEventListener("change", showField);
            });
          });
        </script>';
        
        // 버튼
        echo '<div class="button-group">';
        echo '<button type="submit" class="search-btn">검색</button>';
        echo '<button type="reset" class="reset-btn">초기화</button>';
        echo '</div>';
        
        echo '</form>';
        echo '</div>';
        
        // 선택된 검색 방법에 따라 검색 수행
        $has_search = false;
        if (($search_method == 'name' && !empty($search_name)) || 
            ($search_method == 'role' && !empty($role)) || 
            ($search_method == 'date' && !empty($period))) {
            $has_search = true;
        }
        
        if ($has_search) {
            echo '<h2>검색 결과</h2>';
            
            // 검색 조건 표시
            $search_conditions = array();
            if ($search_method == 'name' && !empty($search_name)) {
                $search_conditions[] = '대회명: "' . htmlspecialchars($search_name) . '"';
            } elseif ($search_method == 'role' && !empty($role)) {
                $search_conditions[] = '역할: ' . htmlspecialchars($role);
            } elseif ($search_method == 'date' && !empty($period)) {
                $search_conditions[] = '기간: ' . htmlspecialchars($period);
            }
            
            if (!empty($search_conditions)) {
                echo '<p><strong>검색 조건:</strong> ' . implode(' | ', $search_conditions) . '</p>';
            }
            
            // contests.txt 파일이 존재하는지 확인
            if (file_exists($file_path)) {
                // 파일 내용을 배열로 읽기
                $lines = file($file_path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
                $results = array();
                
                // 각 줄을 검색하여 조건에 맞는 행 찾기
                foreach ($lines as $line) {
                    $data = explode(' | ', $line);
                    if (count($data) >= 4) {
                        $contest_name = trim($data[0]);
                        $period_str = trim($data[1]);
                        $roles_str = trim($data[2]);
                        $contact = trim($data[3]);
                        
                        // 선택된 검색 방법에 따라만 검색
                        $match = false;
                        
                        if ($search_method == 'name' && !empty($search_name)) {
                            // 대회 이름 검색
                            $match = (stripos($contest_name, $search_name) !== false);
                        } elseif ($search_method == 'role' && !empty($role)) {
                            // 역할별 검색
                            $match = (stripos($roles_str, $role) !== false);
                        } elseif ($search_method == 'date' && !empty($period)) {
                            // 날짜별 검색
                            $match = (stripos($period_str, $period) !== false);
                        }
                        
                        if ($match) {
                            $results[] = $line;
                        }
                    }
                }
                
                // 검색 결과 출력
                if (!empty($results)) {
                    echo '<table>';
                    echo '<thead>';
                    echo '<tr>';
                    echo '<th>대회명</th>';
                    echo '<th>기간</th>';
                    echo '<th>필요 역할</th>';
                    echo '<th>연락처</th>';
                    echo '<th>상세보기</th>';
                    echo '</tr>';
                    echo '</thead>';
                    echo '<tbody>';
                    
                    foreach ($results as $result) {
                        // "|" 구분자로 데이터 분리
                        $data = explode(' | ', $result);
                        if (count($data) >= 4) {
                            $contest_name = trim($data[0]);
                            echo '<tr>';
                            echo '<td>' . htmlspecialchars($contest_name) . '</td>';
                            echo '<td>' . htmlspecialchars(trim($data[1])) . '</td>';
                            echo '<td>' . htmlspecialchars(trim($data[2])) . '</td>';
                            echo '<td>' . htmlspecialchars(trim($data[3])) . '</td>';
                            // 모든 대회 상세보기 링크 제공
                            $dest = 'detail.html?title=' . urlencode($contest_name);
                            echo '<td><a href="' . $dest . '" class="detail-link">상세보기 →</a></td>';
                            echo '</tr>';
                        }
                    }
                    
                    echo '</tbody>';
                    echo '</table>';
                    echo '<p><strong>' . count($results) . '개의 검색 결과를 찾았습니다.</strong></p>';
                } else {
                    echo '<div class="no-results">검색 결과가 없습니다.</div>';
                }
            } else {
                echo '<div class="no-results">데이터 파일을 찾을 수 없습니다.</div>';
            }
        } else {
            echo '<h2>대회 검색</h2>';
            echo '<p>위의 검색창에 키워드를 입력하여 대회를 검색해보세요.</p>';
        }
        ?>
    </div>

    <footer>
        <p>제작자: 충남대학교 컴퓨터융합학부 전유정</p>
    </footer>
</body>
</html>
