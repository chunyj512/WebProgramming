// mypage.html 전용 - 신청한 대회 목록 표시

// 페이지 로드 시 로그인 체크
function checkLoginStatus() {
  const loggedUser = localStorage.getItem('loggedUser');
  const loginRequiredMessage = document.getElementById('loginRequiredMessage');
  const mainContent = document.getElementById('mainContent');
  const pageHeader = document.getElementById('pageHeader');
  
  if (!loggedUser) {
    // 로그인 안 된 경우: 전체 콘텐츠 숨기고 로그인 안내 표시
    if (loginRequiredMessage) loginRequiredMessage.style.display = 'block';
    if (mainContent) mainContent.style.display = 'none';
    if (pageHeader) pageHeader.style.display = 'none';
    return false;
  } else {
    // 로그인 된 경우: 전체 콘텐츠 표시
    if (loginRequiredMessage) loginRequiredMessage.style.display = 'none';
    if (mainContent) mainContent.style.display = 'block';
    if (pageHeader) pageHeader.style.display = 'block';
    return true;
  }
}

function loadAppliedContests() {
  const section = document.getElementById('appliedContestsSection');
  if (!section) return;
  
  // 로그인 상태 확인
  const loggedUser = localStorage.getItem('loggedUser');
  
  if (!loggedUser) {
    return;
  }
  
  // 신청 내역 가져오기
  const myApplications = JSON.parse(localStorage.getItem('myApplications') || '[]');
  const userApplications = myApplications.filter(app => app.user === loggedUser);
  
  if (userApplications.length === 0) {
    section.innerHTML = `
      <div class="text-center py-5">
        <i class="bi bi-inbox text-muted" style="font-size: 3rem;"></i>
        <p class="text-muted mt-3">아직 신청한 대회가 없습니다</p>
        <a href="explore.html" class="btn btn-primary mt-2">
          <i class="bi bi-search me-1"></i>대회 탐색하기
        </a>
      </div>
    `;
    return;
  }
  
  // 신청 내역 목록 표시
  const listHtml = userApplications.map((app, index) => {
    const appliedDate = new Date(app.appliedAt);
    const formattedDate = appliedDate.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return `
      <div class="card mb-3">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div>
              <h6 class="card-title mb-1">
                <a href="detail.html?id=${app.contestId}" class="text-decoration-none text-primary">
                  ${app.title}
                </a>
              </h6>
              <p class="text-muted small mb-1">
                <i class="bi bi-calendar3 me-1"></i>${app.date}
                ${app.recruitCount ? ` · 모집 인원: ${app.recruitCount}명` : ''}
              </p>
            </div>
            <span class="badge bg-${app.status === '모집중' ? 'success' : 'secondary'}">${app.status}</span>
          </div>
          <div class="d-flex flex-wrap gap-2 mb-2">
            ${app.role ? `<span class="badge bg-info">${app.role}</span>` : ''}
            ${app.level ? `<span class="badge bg-warning text-dark">${app.level}</span>` : ''}
            ${app.host ? `<span class="badge bg-secondary">${app.host}</span>` : ''}
          </div>
          <div class="d-flex justify-content-between align-items-center">
            <small class="text-muted">
              <i class="bi bi-clock me-1"></i>신청일: ${formattedDate}
            </small>
            <button class="btn btn-sm btn-outline-danger" onclick="cancelApplication(${index}, ${app.contestId})">
              <i class="bi bi-x-circle me-1"></i>신청 취소
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  section.innerHTML = `
    <div class="mb-3">
      <span class="badge bg-primary">총 ${userApplications.length}개의 대회에 신청했습니다</span>
    </div>
    ${listHtml}
  `;
}

// 신청 취소 함수
function cancelApplication(index, contestId) {
  if (!confirm('정말로 이 대회 신청을 취소하시겠습니까?')) {
    return;
  }
  
  const loggedUser = localStorage.getItem('loggedUser');
  if (!loggedUser) return;
  
  const myApplications = JSON.parse(localStorage.getItem('myApplications') || '[]');
  const userApplications = myApplications.filter(app => app.user === loggedUser);
  
  if (index >= 0 && index < userApplications.length) {
    // 사용자별 애플리케이션에서 해당 항목 제거
    const targetApp = userApplications[index];
    const globalIndex = myApplications.findIndex(app => 
      app.user === loggedUser && 
      app.contestId === targetApp.contestId && 
      app.appliedAt === targetApp.appliedAt
    );
    
    if (globalIndex !== -1) {
      myApplications.splice(globalIndex, 1);
      localStorage.setItem('myApplications', JSON.stringify(myApplications));
      alert('✅ 신청이 취소되었습니다.');
      loadAppliedContests(); // 목록 다시 로드
    }
  }
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
  // 먼저 로그인 체크
  const isLoggedIn = checkLoginStatus();
  
  // 로그인된 경우에만 신청 내역 로드
  if (isLoggedIn) {
    loadAppliedContests();
  }
});

