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
  console.log('🔍 loadAppliedContests 시작');
  const section = document.getElementById('appliedContestsSection');
  if (!section) {
    console.error('❌ appliedContestsSection 요소를 찾을 수 없습니다!');
    return;
  }
  console.log('✅ section 찾음:', section);
  
  // 로그인 상태 확인
  const userData = JSON.parse(localStorage.getItem('seeandyou_user') || 'null');
  const loggedUser = userData ? userData.email : localStorage.getItem('loggedUser');
  
  console.log('👤 로그인 사용자:', loggedUser);
  console.log('📋 사용자 데이터:', userData);
  
  if (!loggedUser) {
    console.warn('⚠️ 로그인되지 않음');
    return;
  }
  
  // 신청 내역 가져오기
  const myApplications = JSON.parse(localStorage.getItem('myApplications') || '[]');
  console.log('📦 전체 신청 내역:', myApplications);
  const userApplications = myApplications.filter(app => app.user === loggedUser);
  console.log('👤 사용자별 신청 내역:', userApplications);
  
  if (userApplications.length === 0) {
    console.log('📭 신청한 대회 없음');
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
  
  // 상태별 색상 클래스 매핑
  const statusClassMap = {
    '대기중': 'bg-secondary',
    '진행중': 'bg-success',
    '완료': 'bg-primary',
    '취소': 'bg-danger'
  };
  
  // 상태별 버튼 HTML 생성
  const getButtonsHTML = (app, globalIndex) => {
    const status = app.status || '대기중';
    
    switch (status) {
      case '대기중':
        return `
          <button class="btn btn-sm btn-outline-success me-1" onclick="changeContestStatus(${globalIndex}, '진행중')">
            <i class="bi bi-play-circle me-1"></i>진행 시작
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="changeContestStatus(${globalIndex}, '취소')">
            <i class="bi bi-x-circle me-1"></i>취소
          </button>
        `;
      case '진행중':
        return `
          <button class="btn btn-sm btn-outline-primary me-1" onclick="changeContestStatus(${globalIndex}, '완료')">
            <i class="bi bi-check-circle me-1"></i>완료
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="changeContestStatus(${globalIndex}, '취소')">
            <i class="bi bi-x-circle me-1"></i>취소
          </button>
        `;
      case '완료':
      case '취소':
        return `
          <button class="btn btn-sm btn-outline-danger" onclick="removeContest(${globalIndex})">
            <i class="bi bi-trash me-1"></i>삭제
          </button>
        `;
      default:
        return '';
    }
  };
  
  // 신청 내역 목록 표시 (상태 기반 카드 구조)
  const listHtml = userApplications.map((app, localIndex) => {
    // 전역 인덱스 찾기
    let globalIndex = myApplications.findIndex(a => 
      a.user === loggedUser && 
      a.contestId === app.contestId && 
      a.appliedAt === app.appliedAt
    );
    
    // globalIndex를 찾지 못한 경우 대비
    if (globalIndex === -1) {
      console.warn('전역 인덱스를 찾지 못했습니다:', app);
      globalIndex = localIndex; // 임시로 localIndex 사용
    }
    
    const appliedDate = new Date(app.appliedAt);
    const formattedDate = appliedDate.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const status = app.status || '대기중';
    const statusClass = statusClassMap[status] || 'bg-secondary';
    const statusIcon = {
      '대기중': '🕓',
      '진행중': '🚀',
      '완료': '🏁',
      '취소': '❌'
    }[status] || '🕓';
    
    // 버튼 HTML 직접 생성 (globalIndex 사용)
    let buttonsHTML = '';
    console.log(`🔘 상태: ${status}, globalIndex: ${globalIndex}`);
    
    switch (status) {
      case '대기중':
        buttonsHTML = `
          <button class="btn btn-sm btn-outline-success me-1" onclick="changeContestStatus(${globalIndex}, '진행중')">
            <i class="bi bi-play-circle me-1"></i>진행 시작
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="changeContestStatus(${globalIndex}, '취소')">
            <i class="bi bi-x-circle me-1"></i>취소
          </button>
        `;
        break;
      case '진행중':
        buttonsHTML = `
          <button class="btn btn-sm btn-outline-primary me-1" onclick="changeContestStatus(${globalIndex}, '완료')">
            <i class="bi bi-check-circle me-1"></i>완료
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="changeContestStatus(${globalIndex}, '취소')">
            <i class="bi bi-x-circle me-1"></i>취소
          </button>
        `;
        break;
      case '완료':
      case '취소':
        buttonsHTML = `
          <button class="btn btn-sm btn-outline-danger" onclick="removeContest(${globalIndex})">
            <i class="bi bi-trash me-1"></i>삭제
          </button>
        `;
        break;
      default:
        buttonsHTML = `<small class="text-muted">상태: ${status}</small>`;
        console.warn('⚠️ 알 수 없는 상태:', status);
    }
    
    console.log(`✅ 버튼 HTML 생성 (길이: ${buttonsHTML.length}):`, buttonsHTML.substring(0, 100));
    
    return `
      <div class="list-group-item">
        <div class="d-flex justify-content-between align-items-start">
          <div class="flex-grow-1">
            <div class="d-flex align-items-center gap-2 mb-2">
              <h6 class="mb-0">
                <a href="detail.html?id=${app.contestId}" class="text-decoration-none text-primary">
                  ${app.title}
                </a>
              </h6>
              <span class="badge ${statusClass}">${statusIcon} ${status}</span>
            </div>
            <p class="text-muted small mb-1">
              <i class="bi bi-calendar3 me-1"></i>${app.date}
              ${app.recruitCount ? ` · 모집 인원: ${app.recruitCount}명` : ''}
            </p>
            <div class="d-flex flex-wrap gap-2 mb-2">
              ${app.role ? `<span class="badge bg-info">${app.role}</span>` : ''}
              ${app.level ? `<span class="badge bg-warning text-dark">${app.level}</span>` : ''}
              ${app.host ? `<span class="badge bg-secondary">${app.host}</span>` : ''}
            </div>
            <small class="text-muted">
              <i class="bi bi-clock me-1"></i>신청일: ${formattedDate}
            </small>
          </div>
          <div class="d-flex align-items-center gap-2 ms-3">
            ${buttonsHTML}
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  const finalHTML = `
    <div class="mb-3">
      <span class="badge bg-primary">총 ${userApplications.length}개의 대회에 신청했습니다</span>
    </div>
    <div class="list-group">
      ${listHtml}
    </div>
  `;
  
  console.log('📄 최종 HTML 생성 완료 (길이:', finalHTML.length, ')');
  console.log('📄 HTML 미리보기:', finalHTML.substring(0, 500));
  
  section.innerHTML = finalHTML;
  
  // 버튼이 실제로 DOM에 있는지 확인
  setTimeout(() => {
    const buttons = section.querySelectorAll('button');
    console.log(`🔘 렌더링된 버튼 개수: ${buttons.length}`);
    buttons.forEach((btn, idx) => {
      console.log(`  버튼 ${idx}:`, btn.textContent.trim(), 'visible:', btn.offsetParent !== null);
    });
  }, 100);
}

// 대회 상태 변경 함수 (대기중/진행중/완료/취소) - 전역 함수로 노출
window.changeContestStatus = function(globalIndex, newStatus) {
  console.log('🔄 changeContestStatus 호출:', { globalIndex, newStatus });
  const userData = JSON.parse(localStorage.getItem('seeandyou_user') || 'null');
  const loggedUser = userData ? userData.email : localStorage.getItem('loggedUser');
  
  if (!loggedUser) {
    alert('로그인이 필요합니다.');
    return;
  }
  
  const myApplications = JSON.parse(localStorage.getItem('myApplications') || '[]');
  
  if (globalIndex < 0 || globalIndex >= myApplications.length) {
    console.error('유효하지 않은 인덱스:', globalIndex);
    return;
  }
  
  const targetApp = myApplications[globalIndex];
  
  // 본인의 신청만 수정 가능
  if (targetApp.user !== loggedUser) {
    alert('권한이 없습니다.');
    return;
  }
  
  // 상태 업데이트
  const oldStatus = targetApp.status || '대기중';
  targetApp.status = newStatus;
  myApplications[globalIndex] = targetApp;
  localStorage.setItem('myApplications', JSON.stringify(myApplications));
  
  // 캘린더 연동
  syncStatusToCalendar(targetApp, oldStatus, newStatus);
  
  const statusMessages = {
    '진행중': '대회를 진행중으로 변경했습니다.',
    '완료': '대회를 완료로 표시했습니다.',
    '취소': '대회를 취소했습니다.'
  };
  
  alert(`✅ ${statusMessages[newStatus] || `대회 상태가 "${newStatus}"으로 변경되었습니다.`}`);
  loadAppliedContests(); // 목록 다시 로드
}

// 캘린더 상태 동기화 함수
function syncStatusToCalendar(contest, oldStatus, newStatus) {
  const STORAGE_KEY = 'seeandyou_events';
  let events = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  
  // 기존 이벤트 찾기 (대회 제목으로 매칭)
  const existingIndex = events.findIndex(e => 
    e.title.includes(contest.title) && 
    (e.content && (e.content.includes('See&YOU 팀 프로젝트 진행') || e.content.includes('대회')))
  );
  
  // 진행중 또는 완료 상태일 때만 캘린더에 표시
  if (newStatus === '진행중' || newStatus === '완료') {
    const eventDate = contest.date.split(' ~ ')[0]; // 시작일 추출
    const calendarEvent = {
      id: existingIndex !== -1 ? events[existingIndex].id : Date.now().toString(),
      title: `${contest.title} (${newStatus})`,
      date: eventDate,
      content: `See&YOU 팀 프로젝트 진행 - ${newStatus}`,
      location: '',
      priority: newStatus === '진행중' ? 'high' : 'medium'
    };
    
    if (existingIndex !== -1) {
      // 이미 있으면 업데이트
      events[existingIndex] = calendarEvent;
    } else {
      // 없으면 추가
      events.push(calendarEvent);
    }
    
    console.log('✅ 캘린더에 동기화:', calendarEvent);
  } else if (newStatus === '취소' || newStatus === '대기중') {
    // 취소 또는 대기중이면 캘린더에서 제거
    if (existingIndex !== -1) {
      events.splice(existingIndex, 1);
      console.log('✅ 캘린더에서 제거:', contest.title);
    }
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

// 대회 삭제 함수 (완료/취소 상태에서 사용) - 전역 함수로 노출
window.removeContest = function(globalIndex) {
  if (!confirm('정말로 이 대회를 삭제하시겠습니까?')) {
    return;
  }
  
  const userData = JSON.parse(localStorage.getItem('seeandyou_user') || 'null');
  const loggedUser = userData ? userData.email : localStorage.getItem('loggedUser');
  
  if (!loggedUser) {
    alert('로그인이 필요합니다.');
    return;
  }
  
  const myApplications = JSON.parse(localStorage.getItem('myApplications') || '[]');
  
  if (globalIndex < 0 || globalIndex >= myApplications.length) {
    console.error('유효하지 않은 인덱스:', globalIndex);
    return;
  }
  
  const removedApp = myApplications[globalIndex];
  
  // 본인의 신청만 삭제 가능
  if (removedApp.user !== loggedUser) {
    alert('권한이 없습니다.');
    return;
  }
  
  // localStorage에서 신청 내역 제거
  myApplications.splice(globalIndex, 1);
  localStorage.setItem('myApplications', JSON.stringify(myApplications));
  
  // 캘린더에서도 제거
  removeFromCalendar(removedApp);
  
  alert('✅ 대회가 삭제되었습니다.');
  loadAppliedContests(); // 목록 다시 로드
}

// 기존 cancelApplication 함수는 하위 호환성을 위해 유지 (내부에서 changeContestStatus 호출)
function cancelApplication(localIndex, contestId) {
  const userData = JSON.parse(localStorage.getItem('seeandyou_user') || 'null');
  const loggedUser = userData ? userData.email : localStorage.getItem('loggedUser');
  
  if (!loggedUser) {
    alert('로그인이 필요합니다.');
    return;
  }
  
  const myApplications = JSON.parse(localStorage.getItem('myApplications') || '[]');
  const userApplications = myApplications.filter(app => app.user === loggedUser);
  
  if (localIndex >= 0 && localIndex < userApplications.length) {
    const targetApp = userApplications[localIndex];
    const globalIndex = myApplications.findIndex(app => 
      app.user === loggedUser && 
      app.contestId === targetApp.contestId && 
      app.appliedAt === targetApp.appliedAt
    );
    
    if (globalIndex !== -1) {
      changeContestStatus(globalIndex, '취소');
    }
  }
}

// 캘린더에서 제거
function removeFromCalendar(contest) {
  const STORAGE_KEY = 'seeandyou_events';
  let events = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  
  // 해당 대회와 관련된 이벤트 찾아서 제거 (제목에 대회명이 포함된 경우)
  events = events.filter(e => 
    !(e.title.includes(contest.title) && (e.content && e.content.includes('See&YOU 팀 프로젝트 진행')))
  );
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  console.log('캘린더에서 제거되었습니다:', contest.title);
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

