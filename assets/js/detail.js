// detail.html 전용 - 개별 대회 상세 정보 표시

async function loadContestDetail() {
  // URL에서 id 파라미터 추출
  const urlParams = new URLSearchParams(window.location.search);
  const contestId = urlParams.get('id');

  if (contestId === null) {
    document.getElementById('contest-info').innerHTML = 
      '<div class="alert alert-danger">대회 ID가 제공되지 않았습니다.</div>';
    return;
  }

  try {
    // 경로 자동 감지: 상대 경로 우선 시도
    // 현재 페이지 기준 상대 경로
    let apiUrl = './backend/read.php';
    
    // 절대 경로 계산 (필요 시)
    const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
    const absoluteUrl = basePath + '/backend/read.php';
    
    console.log('데이터 로딩 시도 (상대):', apiUrl);
    console.log('데이터 로딩 시도 (절대):', absoluteUrl);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('데이터 확인:', data);
    
    // 에러 응답 체크
    if (data.error) {
      throw new Error(data.error + (data.path_tried ? ` (경로: ${data.path_tried})` : ''));
    }
    
    // 배열인지 확인
    if (!Array.isArray(data)) {
      throw new Error('응답 데이터가 배열 형식이 아닙니다.');
    }
    
    const contests = data;
    const contest = contests.find(c => c.id === parseInt(contestId));

    if (!contest) {
      document.getElementById('contest-info').innerHTML = 
        `<div class="alert alert-danger">
          <h5>대회를 찾을 수 없습니다</h5>
          <p>ID: ${contestId}</p>
          <p>총 ${contests.length}개의 대회가 있습니다.</p>
        </div>`;
      return;
    }

    console.log('대회 정보 로드 완료:', contest);
    renderContestDetail(contest);
  } catch (error) {
    console.error('데이터 불러오기 실패:', error);
    document.getElementById('contest-info').innerHTML = 
      `<div class="alert alert-danger">
        <h5>데이터를 불러올 수 없습니다</h5>
        <p>${error.message}</p>
        <small>브라우저 콘솔(F12)에서 자세한 오류를 확인하세요.</small>
      </div>`;
  }
}

function renderContestDetail(contest) {
  const infoContainer = document.getElementById('contest-info');
  const imageContainer = document.getElementById('contest-image');

  // 이미지 - 업로드된 이미지 경로가 있으면 우선 사용, 없으면 기존 방식 사용
  const imageSrc = contest.imagePath || `assets/images/${getImageName(contest.title)}`;
  imageContainer.innerHTML = `
    <img src="${imageSrc}" alt="${contest.title}" 
         class="img-fluid rounded shadow" 
         style="max-width: 600px; height: auto;"
         onerror="this.src='https://via.placeholder.com/600x300'">
  `;

  // 상세 정보
  infoContainer.innerHTML = `
    <div class="card shadow">
      <div class="card-body p-4">
        <div class="d-flex justify-content-between align-items-start mb-3">
          <h1 class="card-title mb-0">${contest.title}</h1>
          <span class="status-badge status-${contest.status === '모집중' ? 'open' : 'closed'}">${contest.status}</span>
        </div>
        
        <div class="mb-3">
          <span class="level-badge level-${getLevelClass(contest.level)} me-2">${contest.level}</span>
          <span class="rank-badge rank-${getRankClass(contest.rank)}">${contest.rank}</span>
        </div>

        <table class="table table-bordered mt-4">
          <tbody>
            <tr>
              <th scope="row" style="width: 150px;">대회명</th>
              <td>${contest.title}</td>
            </tr>
            <tr>
              <th scope="row">모집 기간</th>
              <td>${contest.date}</td>
            </tr>
            ${contest.activityPeriod ? `
            <tr>
              <th scope="row">활동 기간</th>
              <td>${contest.activityPeriod}</td>
            </tr>
            ` : ''}
            <tr>
              <th scope="row">모집 분야</th>
              <td>${contest.role}</td>
            </tr>
            <tr>
              <th scope="row">난이도</th>
              <td>
                <span class="level-badge level-${getLevelClass(contest.level)}">${contest.level}</span>
              </td>
            </tr>
            <tr>
              <th scope="row">상급</th>
              <td>
                <span class="rank-badge rank-${getRankClass(contest.rank)}">${contest.rank}</span>
              </td>
            </tr>
            <tr>
              <th scope="row">주최</th>
              <td>${contest.host}</td>
            </tr>
            <tr>
              <th scope="row">모집 상태</th>
              <td>
                <span class="status-badge status-${contest.status === '모집중' ? 'open' : 'closed'}">${contest.status}</span>
              </td>
            </tr>
            <tr>
              <th scope="row">연락처</th>
              <td>${contest.contact}</td>
            </tr>
          </tbody>
        </table>

        <div class="d-flex gap-2 justify-content-center mt-4">
          <a href="explore.html" class="btn btn-outline-primary">
            <i class="bi bi-arrow-left me-1"></i>대회 탐색으로 돌아가기
          </a>
          <a href="index.html" class="btn btn-outline-secondary">
            <i class="bi bi-house me-1"></i>홈으로
          </a>
        </div>
      </div>
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

// 상급 클래스 변환
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

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', loadContestDetail);

