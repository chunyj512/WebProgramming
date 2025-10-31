// mypage.html 전용 - 신청한 대회 목록 표시

// 페이지 로드 시 로그인 체크 및 사용자 정보 표시
function checkLoginStatus() {
  const user = JSON.parse(localStorage.getItem('seeandyou_user') || 'null');
  const loggedUser = localStorage.getItem('loggedUser');
  const loginRequiredMessage = document.getElementById('loginRequiredMessage');
  const mainContent = document.getElementById('mainContent');
  const pageHeader = document.getElementById('pageHeader');
  
  if (!user && !loggedUser) {
    // 로그인 안 된 경우: 전체 콘텐츠 숨기고 로그인 안내 표시
    if (loginRequiredMessage) loginRequiredMessage.style.display = 'block';
    if (mainContent) mainContent.style.display = 'none';
    if (pageHeader) pageHeader.style.display = 'none';
    return false;
  } else {
    // 로그인 된 경우: 전체 콘텐츠 표시 및 사용자 정보 업데이트
    if (loginRequiredMessage) loginRequiredMessage.style.display = 'none';
    if (mainContent) mainContent.style.display = 'block';
    if (pageHeader) pageHeader.style.display = 'block';
    
    // 사용자 정보가 있으면 프로필 업데이트
    if (user) {
      updateUserProfile(user);
    }
    
    return true;
  }
}

// 사용자 정보를 프로필에 동적으로 표시
function updateUserProfile(user) {
  // 프로필 카드 정보 업데이트 (첫 번째 section의 프로필 카드)
  const profileCard = document.querySelector('.col-12.col-md-6.col-lg-4 .card-body');
  if (profileCard) {
    const nameElement = profileCard.querySelector('.card-title');
    const textElements = profileCard.querySelectorAll('.card-text');
    
    if (nameElement) {
      nameElement.textContent = user.name || '사용자';
    }
    
    // 첫 번째 .card-text.text-muted는 전공
    if (textElements.length > 0 && textElements[0].classList.contains('text-muted')) {
      textElements[0].textContent = user.major || '컴퓨터융합학부 3학년';
    }
    
    // 두 번째 .card-text는 대학교
    if (textElements.length > 1 && user.university) {
      textElements[1].textContent = user.university;
    }
    
    // 자기소개 업데이트 (있는 경우)
    if (user.bio) {
      let bioElement = profileCard.querySelector('.card-text.small.text-muted');
      if (!bioElement && textElements.length > 2) {
        // 자기소개 영역 찾기 또는 생성
        const mt3Div = profileCard.querySelector('.mt-3.mb-3');
        if (mt3Div) {
          const bioText = mt3Div.querySelector('.card-text.small.text-muted');
          if (bioText) {
            bioText.textContent = `"${user.bio}"`;
          } else {
            // 자기소개 영역이 없으면 생성
            const newBio = document.createElement('p');
            newBio.className = 'card-text small text-muted';
            newBio.textContent = `"${user.bio}"`;
            mt3Div.appendChild(newBio);
          }
        }
      } else if (bioElement) {
        bioElement.textContent = `"${user.bio}"`;
      }
    }
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

// 프로필 편집 기능
function setupProfileEdit() {
  const profileEditBtn = document.getElementById('profileEditBtn');
  const saveProfileBtn = document.getElementById('saveProfileBtn');
  const profileEditModal = new bootstrap.Modal(document.getElementById('profileEditModal'));
  
  if (!profileEditBtn) return;
  
  // 프로필 편집 버튼 클릭 시 모달 열기
  profileEditBtn.addEventListener('click', () => {
    const user = JSON.parse(localStorage.getItem('seeandyou_user') || 'null');
    
    if (!user) {
      alert('사용자 정보를 불러올 수 없습니다.');
      return;
    }
    
    // 모달에 현재 정보 채우기
    document.getElementById('editName').value = user.name || '';
    document.getElementById('editMajor').value = user.major || '';
    document.getElementById('editUniversity').value = user.university || '';
    document.getElementById('editBio').value = user.bio || '';
    
    // 모달 열기
    profileEditModal.show();
  });
  
  // 저장 버튼 클릭 시
  if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', () => {
      const editName = document.getElementById('editName').value.trim();
      const editMajor = document.getElementById('editMajor').value.trim();
      const editUniversity = document.getElementById('editUniversity').value.trim();
      const editBio = document.getElementById('editBio').value.trim();
      
      // 유효성 검사
      if (!editName || !editMajor || !editUniversity) {
        alert('이름, 전공, 대학교는 필수 입력 항목입니다.');
        return;
      }
      
      // 사용자 정보 업데이트
      const user = JSON.parse(localStorage.getItem('seeandyou_user') || '{}');
      user.name = editName;
      user.major = editMajor;
      user.university = editUniversity;
      user.bio = editBio;
      user.updatedAt = new Date().toISOString();
      
      // localStorage에 저장
      localStorage.setItem('seeandyou_user', JSON.stringify(user));
      
      // 프로필 화면 업데이트
      updateUserProfile(user);
      
      // 모달 닫기
      profileEditModal.hide();
      
      alert('✅ 프로필이 저장되었습니다.');
    });
  }
}

// 로그아웃 기능
function setupLogoutButton() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (!logoutBtn) return;
  
  logoutBtn.addEventListener('click', () => {
    if (!confirm('정말로 로그아웃하시겠습니까?')) {
      return;
    }
    
    // localStorage에서 사용자 정보 삭제
    localStorage.removeItem('seeandyou_user');
    localStorage.removeItem('loggedUser');
    localStorage.removeItem('userInfo');
    
    alert('로그아웃되었습니다.');
    
    // 로그인 페이지로 이동
    window.location.href = 'login.html';
  });
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
  // 먼저 로그인 체크
  const isLoggedIn = checkLoginStatus();
  
  // 로그인된 경우에만 신청 내역 로드 및 버튼 설정
  if (isLoggedIn) {
    loadAppliedContests();
    setupProfileEdit();
    setupLogoutButton();
  }
});

