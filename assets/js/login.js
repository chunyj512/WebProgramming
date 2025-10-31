// login.html 전용 - 로그인 처리

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
    // 사용자 정보 저장
    const userInfo = {
      email: email,
      loginTime: new Date().toISOString(),
      rememberMe: rememberMe
    };
    
    localStorage.setItem('loggedUser', email);
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    
    // 성공 메시지
    alert('✅ 로그인 성공!');
    
    // 이전 페이지로 이동하거나 index.html로 이동
    const referrer = document.referrer;
    if (referrer && referrer.includes(window.location.hostname) && !referrer.includes('login.html')) {
      window.location.href = referrer;
    } else {
      window.location.href = 'index.html';
    }
  } else {
    alert('⚠️ 비밀번호는 4자 이상이어야 합니다.');
  }
});

