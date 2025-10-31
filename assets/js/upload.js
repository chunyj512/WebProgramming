// upload.html 전용 - 대회 등록 폼 처리

const form = document.getElementById('uploadForm');
const startDate = document.getElementById('startDate');
const endDate = document.getElementById('endDate');
const hiddenDate = document.getElementById('date');
const preview = document.getElementById('preview');
const statusInput = document.getElementById('status');

// 이미지 미리보기
document.getElementById('image').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    preview.src = URL.createObjectURL(file);
    preview.style.display = 'block';
  } else {
    preview.style.display = 'none';
  }
});

// 자동 상태 계산 (마감일 기준)
function calcStatus() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate.value);
  end.setHours(0, 0, 0, 0);
  return end >= today ? '모집중' : '마감';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  
  // 모집 시작일과 마감일을 합쳐서 date 필드에 저장
  const startDateValue = startDate.value;
  const endDateValue = endDate.value;
  
  // 날짜 유효성 검사
  if (!startDateValue || !endDateValue) {
    alert('⚠️ 모집 시작일과 마감일을 모두 입력해주세요.');
    return;
  }
  
  if (new Date(startDateValue) > new Date(endDateValue)) {
    alert('⚠️ 모집 시작일은 마감일보다 빨라야 합니다.');
    return;
  }
  
  // 날짜 형식: 2025-09-20 ~ 2025-10-10
  hiddenDate.value = `${startDateValue} ~ ${endDateValue}`;
  
  // 자동 상태 계산
  const autoStatus = calcStatus();
  statusInput.value = autoStatus;
  
  // 버튼 비활성화 및 로딩 표시
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>등록 중...';
  
  try {
    const formData = new FormData(form);
    
    // 다중 role 직렬화 (콤마로 구분)
    const roleSelect = document.getElementById('role');
    const selectedRoles = Array.from(roleSelect.selectedOptions).map(option => option.value);
    
    if (selectedRoles.length === 0) {
      alert('⚠️ 모집 분야를 최소 1개 이상 선택해주세요.');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      return;
    }
    
    // FormData에서 role[] 제거하고 role을 콤마로 구분된 문자열로 설정
    formData.delete('role[]');
    formData.set('role', selectedRoles.join(', '));
    
    // API URL 설정
    let apiUrl = './backend/upload.php';
    const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
    const absoluteUrl = basePath + '/backend/upload.php';
    
    console.log('대회 등록 요청:', apiUrl);
    console.log('전송 데이터:', {
      title: formData.get('title'),
      date: formData.get('date'),
      role: formData.get('role'),
      level: formData.get('level'),
      status: formData.get('status'),
      host: formData.get('host'),
      rank: formData.get('rank'),
      activityPeriod: formData.get('activityPeriod'),
      contact: formData.get('contact'),
      hasImage: formData.get('image') ? 'Yes' : 'No'
    });
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('서버 응답:', result);
    
    if (result.success) {
      alert('✅ 대회가 등록되었습니다!');
      // 등록 성공 시 explore.html로 이동
      window.location.href = 'explore.html';
    } else {
      alert(`⚠️ 등록 실패: ${result.message || '알 수 없는 오류가 발생했습니다.'}`);
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  } catch (error) {
    console.error('등록 오류:', error);
    alert('서버 오류가 발생했습니다. 브라우저 콘솔(F12)을 확인하세요.');
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
});
