// explore.html 전용 - 대회 탐색 및 필터링 기능

let allContests = [];

// 데이터 불러오기
async function loadContests() {
  try {
    const response = await fetch('backend/read.php');
    if (!response.ok) throw new Error('데이터를 불러올 수 없습니다.');
    
    allContests = await response.json();
    filterAndRender();
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('resultsContainer').innerHTML = 
      '<div class="alert alert-danger" role="alert">데이터를 불러올 수 없습니다.</div>';
  }
}

// 필터링 및 렌더링
function filterAndRender() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const roleFilter = document.getElementById('roleFilter').value;
  const levelFilter = document.getElementById('levelFilter').value;
  const rankFilter = document.getElementById('rankFilter').value;
  const statusActive = document.getElementById('statusActive').checked;

  const filtered = allContests.filter(contest => {
    // 검색어 필터 (제목, 역할)
    const matchesSearch = !searchTerm || 
      contest.title.toLowerCase().includes(searchTerm) ||
      contest.role.toLowerCase().includes(searchTerm);
    
    // 분야 필터
    const matchesRole = !roleFilter || contest.role.includes(roleFilter);
    
    // 난이도 필터
    const matchesLevel = !levelFilter || contest.level === levelFilter;
    
    // 상격 필터
    const matchesRank = !rankFilter || contest.rank === rankFilter;
    
    // 모집 상태 필터
    const matchesStatus = !statusActive || contest.status === '모집중';

    return matchesSearch && matchesRole && matchesLevel && matchesRank && matchesStatus;
  });

  renderContests(filtered);
}

// 대회 목록 렌더링
function renderContests(contests) {
  const container = document.getElementById('resultsContainer');
  
  if (contests.length === 0) {
    container.innerHTML = `
      <div class="alert alert-info text-center py-5" role="alert">
        <i class="bi bi-search me-2"></i>검색 결과가 없습니다.
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="card-grid">
      ${contests.map(contest => `
        <a href="detail.html?id=${contest.id}" class="contest-card">
          <img src="assets/images/${getImageName(contest.title)}" alt="${contest.title}" onerror="this.src='https://via.placeholder.com/250x150'">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h3>${contest.title}</h3>
              <span class="status-badge status-${contest.status === '모집중' ? 'open' : 'closed'}">${contest.status}</span>
            </div>
            <p class="mb-2">
              <span class="level-badge level-${getLevelClass(contest.level)}">${contest.level}</span>
              <span class="rank-badge rank-${getRankClass(contest.rank)}">${contest.rank}</span>
            </p>
            <p class="text-muted small mb-2">${contest.role}</p>
            <p class="text-muted small mb-0">${contest.date}</p>
          </div>
        </a>
      `).join('')}
    </div>
    <div class="text-center mt-4">
      <p class="text-muted">총 <strong>${contests.length}</strong>개의 대회를 찾았습니다.</p>
    </div>
  `;
}

// 이미지 파일명 추출
function getImageName(title) {
  const imageMap = {
    'AI 해커톤': 'ai_hackathon.png',
    '창업 아이디어 경진대회': 'startup.jpg',
    '데이터 분석 공모전': 'data.jpg'
  };
  return imageMap[title] || 'default.jpg';
}

// 난이도 클래스 변환
function getLevelClass(level) {
  const map = {
    '초보자': 'beginner',
    '중급자': 'intermediate',
    '실력자': 'expert'
  };
  return map[level] || 'beginner';
}

// 상격 클래스 변환
function getRankClass(rank) {
  const map = {
    '교내급': 'local',
    '지역급': 'regional',
    '전국급': 'national',
    '국제급': 'international',
    '공공기관급': 'public'
  };
  return map[rank] || 'local';
}

// 이벤트 리스너 설정
document.addEventListener('DOMContentLoaded', () => {
  // 데이터 로드
  loadContests();

  // 필터 이벤트
  document.getElementById('searchInput').addEventListener('input', filterAndRender);
  document.getElementById('roleFilter').addEventListener('change', filterAndRender);
  document.getElementById('levelFilter').addEventListener('change', filterAndRender);
  document.getElementById('rankFilter').addEventListener('change', filterAndRender);
  document.getElementById('statusActive').addEventListener('change', filterAndRender);

  // 초기화 버튼
  document.getElementById('resetBtn').addEventListener('click', () => {
    document.getElementById('searchInput').value = '';
    document.getElementById('roleFilter').value = '';
    document.getElementById('levelFilter').value = '';
    document.getElementById('rankFilter').value = '';
    document.getElementById('statusActive').checked = false;
    filterAndRender();
  });
});

