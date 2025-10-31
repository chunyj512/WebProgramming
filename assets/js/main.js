// See&YOU - main.js (공용)

// 대회 검색 기능 (폼, 필드 관련)
function handleSearchForm() {
  // 페이지에 폼이 있으면 보조 JS 추가 동작 예시
  const form = document.querySelector('.advanced-search-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    // 검색 로딩 등 공용 UI 처리
  });
}

// 추천 대회 리스트 (사용 예: index.html, mypage.html)
function renderRecommendations() {
  // 추천 대회 UI 업데이트용 (백엔드/데이터 연결해야 활용 가능)
}

// 마이페이지 프로필 저장/불러오기 (localStorage 활용)
function initProfileSave() {
  const profileEditBtn = document.querySelector('.btn-outline-secondary.btn-sm.w-100');
  if (!profileEditBtn) return;
  // 프로필 편집/저장/불러오기 예시
}

// Navbar 로그인 상태 표시
function updateNavbarLoginStatus() {
  const navStatus = document.getElementById('nav-login-status');
  if (!navStatus) return;
  
  const user = JSON.parse(localStorage.getItem('seeandyou_user') || 'null');
  
  if (user) {
    // 로그인된 경우: 사용자 이름 표시
    navStatus.innerHTML = `
      <span class="nav-link text-light">
        <i class="bi bi-person-circle me-1"></i>
        <span class="small">👋 ${user.name}님</span>
      </span>
    `;
  } else {
    // 로그인 안 된 경우: 로그인 링크 표시
    navStatus.innerHTML = `
      <a class="nav-link" href="login.html">
        <i class="bi bi-box-arrow-in-right me-1"></i>로그인
      </a>
    `;
  }
}

// DOMContentLoaded에서 공용 인터페이스 활성화
document.addEventListener('DOMContentLoaded', () => {
  handleSearchForm();
  renderRecommendations();
  initProfileSave();
  updateNavbarLoginStatus(); // Navbar 로그인 상태 업데이트
});
