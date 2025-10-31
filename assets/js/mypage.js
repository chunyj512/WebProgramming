// mypage.html 전용 - 신청한 대회 목록 표시

// ===== 상수 정의 =====
const STORAGE_KEYS = {
  USER: 'seeandyou_user',
  APPLICATIONS: 'myApplications',
  EVENTS: 'seeandyou_events',
  LOGGED_USER: 'loggedUser'
};

const STATUS_CONFIG = {
  대기중: { class: 'bg-secondary', icon: '🕓', default: true },
  진행중: { class: 'bg-success', icon: '🚀' },
  완료: { class: 'bg-primary', icon: '🏁' },
  취소: { class: 'bg-danger', icon: '❌' }
};

const STATUS_MESSAGES = {
  진행중: '대회를 진행중으로 변경했습니다.',
  완료: '대회를 완료로 표시했습니다.',
  취소: '대회를 취소했습니다.'
};

// ===== 유틸리티 함수 =====
function getLoggedUser() {
  const userData = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || 'null');
  return userData ? userData.email : localStorage.getItem(STORAGE_KEYS.LOGGED_USER);
}

function getUserData() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || 'null');
}

function getMyApplications() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.APPLICATIONS) || '[]');
}

function saveMyApplications(applications) {
  localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(applications));
}

function getCalendarEvents() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS) || '[]');
}

function saveCalendarEvents(events) {
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getStatusConfig(status) {
  return STATUS_CONFIG[status] || STATUS_CONFIG.대기중;
}

// ===== 로그인 상태 관리 =====
function checkLoginStatus() {
  const user = getUserData();
  const loggedUser = localStorage.getItem(STORAGE_KEYS.LOGGED_USER);
  const loginRequiredMessage = document.getElementById('loginRequiredMessage');
  const mainContent = document.getElementById('mainContent');
  const pageHeader = document.getElementById('pageHeader');
  
  if (!user && !loggedUser) {
    if (loginRequiredMessage) loginRequiredMessage.style.display = 'block';
    if (mainContent) mainContent.style.display = 'none';
    if (pageHeader) pageHeader.style.display = 'none';
    return false;
  }
  
  if (loginRequiredMessage) loginRequiredMessage.style.display = 'none';
  if (mainContent) mainContent.style.display = 'block';
  if (pageHeader) pageHeader.style.display = 'block';
  
  if (user) {
    updateUserProfile(user);
  }
  
  return true;
}

// ===== 프로필 관리 =====
function updateUserProfile(user) {
  const profileCard = document.querySelector('.col-12.col-md-6.col-lg-4 .card-body');
  if (!profileCard) return;
  
  const nameElement = profileCard.querySelector('.card-title');
  const textElements = profileCard.querySelectorAll('.card-text');
  
  if (nameElement) {
    nameElement.textContent = user.name || '사용자';
  }
  
  if (textElements.length > 0 && textElements[0].classList.contains('text-muted')) {
    textElements[0].textContent = user.major || '컴퓨터융합학부 3학년';
  }
  
  if (textElements.length > 1 && user.university) {
    textElements[1].textContent = user.university;
  }
  
  // 자기소개 업데이트
  if (user.bio) {
    const mt3Div = profileCard.querySelector('.mt-3.mb-3');
    if (mt3Div) {
      let bioElement = mt3Div.querySelector('.card-text.small.text-muted');
      if (bioElement) {
        bioElement.textContent = `"${user.bio}"`;
      } else {
        bioElement = document.createElement('p');
        bioElement.className = 'card-text small text-muted';
        bioElement.textContent = `"${user.bio}"`;
        mt3Div.appendChild(bioElement);
      }
    }
  }
}

// ===== 신청한 대회 목록 =====
function loadAppliedContests() {
  const section = document.getElementById('appliedContestsSection');
  if (!section) return;
  
  const loggedUser = getLoggedUser();
  if (!loggedUser) return;
  
  const myApplications = getMyApplications();
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
  
  const listHtml = userApplications.map((app, localIndex) => {
    const globalIndex = findGlobalIndex(myApplications, loggedUser, app);
    return renderContestItem(app, globalIndex);
  }).join('');
  
  section.innerHTML = `
    <div class="mb-3">
      <span class="badge bg-primary">총 ${userApplications.length}개의 대회에 신청했습니다</span>
    </div>
    <div class="list-group">
      ${listHtml}
    </div>
  `;
}

function findGlobalIndex(applications, loggedUser, targetApp) {
  const index = applications.findIndex(a => 
    a.user === loggedUser && 
    a.contestId === targetApp.contestId && 
    a.appliedAt === targetApp.appliedAt
  );
  return index !== -1 ? index : null;
}

function renderContestItem(app, globalIndex) {
  if (globalIndex === null) {
    console.warn('전역 인덱스를 찾지 못했습니다:', app);
    return '';
  }
  
  const status = app.status || '대기중';
  const statusConfig = getStatusConfig(status);
  const formattedDate = formatDate(app.appliedAt);
  const buttonsHTML = generateStatusButtons(status, globalIndex);
  
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
            <span class="badge ${statusConfig.class}">${statusConfig.icon} ${status}</span>
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
}

function generateStatusButtons(status, globalIndex) {
  const buttonConfigs = {
    대기중: [
      { text: '진행 시작', status: '진행중', class: 'btn-outline-success', icon: 'play-circle' },
      { text: '취소', status: '취소', class: 'btn-outline-danger', icon: 'x-circle' }
    ],
    진행중: [
      { text: '완료', status: '완료', class: 'btn-outline-primary', icon: 'check-circle' },
      { text: '취소', status: '취소', class: 'btn-outline-danger', icon: 'x-circle' }
    ],
    완료: [
      { text: '삭제', action: 'remove', class: 'btn-outline-danger', icon: 'trash' }
    ],
    취소: [
      { text: '삭제', action: 'remove', class: 'btn-outline-danger', icon: 'trash' }
    ]
  };
  
  const configs = buttonConfigs[status] || [];
  
  return configs.map((config, idx) => {
    const isLast = idx === configs.length - 1;
    const marginClass = isLast ? '' : 'me-1';
    
    if (config.action === 'remove') {
      return `
        <button class="btn btn-sm ${config.class} ${marginClass}" onclick="removeContest(${globalIndex})">
          <i class="bi bi-${config.icon} me-1"></i>${config.text}
        </button>
      `;
    }
    
    return `
      <button class="btn btn-sm ${config.class} ${marginClass}" onclick="changeContestStatus(${globalIndex}, '${config.status}')">
        <i class="bi bi-${config.icon} me-1"></i>${config.text}
      </button>
    `;
  }).join('');
}

// ===== 대회 상태 관리 =====
window.changeContestStatus = function(globalIndex, newStatus) {
  const loggedUser = getLoggedUser();
  if (!loggedUser) {
    alert('로그인이 필요합니다.');
    return;
  }
  
  const myApplications = getMyApplications();
  
  if (globalIndex < 0 || globalIndex >= myApplications.length) {
    console.error('유효하지 않은 인덱스:', globalIndex);
    return;
  }
  
  const targetApp = myApplications[globalIndex];
  
  if (targetApp.user !== loggedUser) {
    alert('권한이 없습니다.');
    return;
  }
  
  const oldStatus = targetApp.status || '대기중';
  targetApp.status = newStatus;
  myApplications[globalIndex] = targetApp;
  saveMyApplications(myApplications);
  
  syncStatusToCalendar(targetApp, oldStatus, newStatus);
  
  const message = STATUS_MESSAGES[newStatus] || `대회 상태가 "${newStatus}"으로 변경되었습니다.`;
  alert(`✅ ${message}`);
  loadAppliedContests();
};

window.removeContest = function(globalIndex) {
  if (!confirm('정말로 이 대회를 삭제하시겠습니까?')) {
    return;
  }
  
  const loggedUser = getLoggedUser();
  if (!loggedUser) {
    alert('로그인이 필요합니다.');
    return;
  }
  
  const myApplications = getMyApplications();
  
  if (globalIndex < 0 || globalIndex >= myApplications.length) {
    console.error('유효하지 않은 인덱스:', globalIndex);
    return;
  }
  
  const removedApp = myApplications[globalIndex];
  
  if (removedApp.user !== loggedUser) {
    alert('권한이 없습니다.');
    return;
  }
  
  myApplications.splice(globalIndex, 1);
  saveMyApplications(myApplications);
  
  removeFromCalendar(removedApp);
  
  alert('✅ 대회가 삭제되었습니다.');
  loadAppliedContests();
};

// ===== 캘린더 동기화 =====
function syncStatusToCalendar(contest, oldStatus, newStatus) {
  const events = getCalendarEvents();
  
  const existingIndex = events.findIndex(e => 
    e.title.includes(contest.title) && 
    e.content && (e.content.includes('See&YOU 팀 프로젝트 진행') || e.content.includes('대회'))
  );
  
  if (newStatus === '진행중' || newStatus === '완료') {
    const eventDate = contest.date.split(' ~ ')[0];
    const calendarEvent = {
      id: existingIndex !== -1 ? events[existingIndex].id : Date.now().toString(),
      title: `${contest.title} (${newStatus})`,
      date: eventDate,
      content: `See&YOU 팀 프로젝트 진행 - ${newStatus}`,
      location: '',
      priority: newStatus === '진행중' ? 'high' : 'medium'
    };
    
    if (existingIndex !== -1) {
      events[existingIndex] = calendarEvent;
    } else {
      events.push(calendarEvent);
    }
  } else if (newStatus === '취소' || newStatus === '대기중') {
    if (existingIndex !== -1) {
      events.splice(existingIndex, 1);
    }
  }
  
  saveCalendarEvents(events);
}

function removeFromCalendar(contest) {
  const events = getCalendarEvents();
  const filteredEvents = events.filter(e => 
    !(e.title.includes(contest.title) && e.content && e.content.includes('See&YOU 팀 프로젝트 진행'))
  );
  saveCalendarEvents(filteredEvents);
}

// ===== 프로필 편집 =====
function setupProfileEdit() {
  const profileEditBtn = document.getElementById('profileEditBtn');
  const saveProfileBtn = document.getElementById('saveProfileBtn');
  const profileEditModal = document.getElementById('profileEditModal');
  
  if (!profileEditBtn || !profileEditModal) return;
  
  const modal = new bootstrap.Modal(profileEditModal);
  
  profileEditBtn.addEventListener('click', () => {
    const user = getUserData();
    
    if (!user) {
      alert('사용자 정보를 불러올 수 없습니다.');
      return;
    }
    
    document.getElementById('editName').value = user.name || '';
    document.getElementById('editMajor').value = user.major || '';
    document.getElementById('editUniversity').value = user.university || '';
    document.getElementById('editBio').value = user.bio || '';
    
    modal.show();
  });
  
  if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', () => {
      const name = document.getElementById('editName').value.trim();
      const major = document.getElementById('editMajor').value.trim();
      const university = document.getElementById('editUniversity').value.trim();
      const bio = document.getElementById('editBio').value.trim();
      
      if (!name || !major || !university) {
        alert('이름, 전공, 대학교는 필수 입력 항목입니다.');
        return;
      }
      
      const user = getUserData() || {};
      Object.assign(user, {
        name,
        major,
        university,
        bio,
        updatedAt: new Date().toISOString()
      });
      
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      updateUserProfile(user);
      modal.hide();
      alert('✅ 프로필이 저장되었습니다.');
    });
  }
}

// ===== 로그아웃 =====
function setupLogoutButton() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (!logoutBtn) return;
  
  logoutBtn.addEventListener('click', () => {
    if (!confirm('정말로 로그아웃하시겠습니까?')) {
      return;
    }
    
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.LOGGED_USER);
    localStorage.removeItem('userInfo');
    
    alert('로그아웃되었습니다.');
    window.location.href = 'login.html';
  });
}

// ===== 초기화 =====
document.addEventListener('DOMContentLoaded', () => {
  const isLoggedIn = checkLoginStatus();
  
  if (isLoggedIn) {
    loadAppliedContests();
    setupProfileEdit();
    setupLogoutButton();
  }
});
