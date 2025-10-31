// login.html 전용 - 로그인 처리

// 페이지 로드 시 이미 로그인된 상태인지 확인
document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('seeandyou_user') || 'null');
  if (user) {
    // 이미 로그인된 경우 마이페이지로 리다이렉트
    alert('이미 로그인되어 있습니다.');
    window.location.href = 'mypage.html';
  }
});

document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const rememberMe = document.getElementById('rememberMe').checked;
  
  // 기본 유효성 검사
  if (!email || !password) {
    alert('⚠️ 이메일과 비밀번호를 모두 입력해주세요.');
    return;
  }
  
  // 이메일 형식 검사
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    alert('⚠️ 올바른 이메일 형식을 입력해주세요.');
    return;
  }
  
  // 데모용 로그인 로직 (실제는 서버 검증)
  // 여기서는 이메일과 비밀번호가 입력되면 로그인 성공으로 처리
  if (email && password.length >= 4) {
    // 사용자 정보 구성 (이메일 앞부분을 이름으로 사용)
    const emailName = email.split('@')[0];
    const userData = {
      name: emailName.charAt(0).toUpperCase() + emailName.slice(1), // 첫 글자 대문자
      email: email,
      major: '컴퓨터융합학부 3학년',
      university: '충남대학교',
      loginTime: new Date().toISOString(),
      rememberMe: rememberMe
    };
    
    // localStorage에 사용자 정보 저장 (기존 키도 유지하여 호환성 확보)
    localStorage.setItem('seeandyou_user', JSON.stringify(userData));
    localStorage.setItem('loggedUser', email);
    localStorage.setItem('userInfo', JSON.stringify({
      email: email,
      loginTime: userData.loginTime,
      rememberMe: rememberMe
    }));
    
    // 환영 메시지
    alert(`✅ ${userData.name}님, 환영합니다!`);
    
    // 마이페이지로 리다이렉트
    window.location.href = 'mypage.html';
  } else {
    alert('⚠️ 비밀번호는 4자 이상이어야 합니다.');
  }
});

