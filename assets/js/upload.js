// upload.html 전용 - 대회 등록 폼 처리

document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  
  // 모집 시작일과 마감일을 합쳐서 date 필드에 저장
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  const hiddenDate = document.getElementById('date');
  
  // 날짜 유효성 검사
  if (!startDate || !endDate) {
    alert('⚠️ 모집 시작일과 마감일을 모두 입력해주세요.');
    return;
  }
  
  if (new Date(startDate) > new Date(endDate)) {
    alert('⚠️ 모집 시작일은 마감일보다 빨라야 합니다.');
    return;
  }
  
  // 날짜 형식: 2025-09-20 ~ 2025-10-10
  hiddenDate.value = `${startDate} ~ ${endDate}`;
  
  // 버튼 비활성화 및 로딩 표시
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>등록 중...';
  
  try {
    const formData = new FormData(form);
    
    // API URL 설정
    let apiUrl = './backend/upload.php';
    const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
    const absoluteUrl = basePath + '/backend/upload.php';
    
    console.log('대회 등록 요청:', apiUrl);
    console.log('전송 데이터:', Object.fromEntries(formData));
    
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

