# See&YOU

대학생 대회 및 프로젝트 매칭 플랫폼

## 소개
See&YOU는 전국 대학생들을 위한 각종 대회 정보 탐색, 팀 빌딩, 일정 관리, 이력 관리를 돕는 올인원 플랫폼입니다.

## 주요 기능
- 최신/인기 대회 실시간 탐색 및 상세보기
- 역할별/조건별 대회 검색 및 추천
- 마이페이지 이력·평가 관리 (localStorage 활용)
- 달력 기반 일정 등록, 편집, 삭제 (localStorage 활용, CRUD)
- 대회 데이터 검색/필터 (PHP + 데이터 파일)

## 기술 스택
- 프론트엔드: HTML5, CSS3 (Bootstrap, 커스텀), JavaScript (Vanilla)
- 백엔드: PHP (검색/필터링 API)
- 데이터: contests.txt (텍스트 기반 DB)

## 폴더 구조
```
/
├── index.html                # 메인 홈 (탐색/추천/검색)
├── detail.html               # 대회 상세보기
├── mypage.html               # 마이페이지 + 이력관리
├── calendar.html             # 일정 관리 달력
│
├── assets/
│   ├── css/
│   │   ├── main.css          # 공통/통합 스타일
│   │   ├── calendar.css      # 캘린더 전용 스타일
│   ├── js/
│   │   ├── app.js            # 일정 달력 CRUD 전담
│   │   ├── main.js           # 공용(search, 추천 등)
│   ├── images/
│   │   ├── ai_hackathon.png
│   │   ├── startup.jpg
│   │   └── ...etc
│
├── data/
│   ├── contests.txt          # 원본 대회 데이터
│   └── contests.json         # (optional) PHP 변환 후 JSON
│
├── backend/
│   └── read.php              # API: 대회 검색/데이터 변환
│
├── .gitignore
└── README.md
```

## 기본 사용법
- `index.html`을 웹브라우저로 열면 전체 경로 및 썸네일, 검색, 추천 등이 정상 동작
- `calendar.html`: 일정 추가, 상세, 삭제 전부 localStorage 기반 작동 (새로고침해도 유지)
- `detail.html`: 쿼리 기반(대회명) 상세 fetch + 이미지 자동 노출
- 대회 검색(폼)과 결과: 내부 PHP(read.php)로 처리

## 주요 개발자
- 충남대학교 컴퓨터융합학부 전유정
