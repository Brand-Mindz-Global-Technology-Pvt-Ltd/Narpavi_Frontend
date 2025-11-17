(function () {
  // Forms
  const loginForm  = document.getElementById('login-form');
  const forgotForm = document.getElementById('forgot-password-form');
  const otpForm    = document.getElementById('reset-otp-form');
  const resetForm  = document.getElementById('reset-password-form');

  // Buttons
  const showForgot   = document.getElementById('show-forgot-password-form');
  const backFromForgot = document.getElementById('back-to-login-from-forgot');
  const backFromOtp    = document.getElementById('back-to-forgot-from-otp');
  const backFromReset  = document.getElementById('back-to-forgot-password');
  const loginBtn   = document.getElementById('login-submit-btn');
  const forgotBtn  = document.getElementById('forgot-password-submit-btn');
  const verifyBtn  = document.getElementById('verify-reset-otp-btn');
  const resendBtn  = document.getElementById('resend-otp-btn');
  const resetBtn   = document.getElementById('reset-password-submit-btn');

  // Fields
  const loginEmail  = document.getElementById('login-email');
  const loginPass   = document.getElementById('login-password');
  const forgotEmail = document.getElementById('forgot-email');
  const otpInputs   = Array.from(document.querySelectorAll('#reset-otp-container .otp-input'));
  const newPass     = document.getElementById('reset-new-password');
  const confirmPass = document.getElementById('reset-confirm-password');

  // Messages
  const globalOK   = document.getElementById('success-message');
  const globalErr  = document.getElementById('error-message');
  const errLoginEmail = document.getElementById('login-email-error');
  const errLoginPass  = document.getElementById('login-passrword-error');
  const errForgotEmail= document.getElementById('forgot-email-error');
  const errOtp        = document.getElementById('reset-otp-error');
  const errNewPass    = document.getElementById('new-password-error');
  const errConfirm    = document.getElementById('confirm-password-error');

  // Timer
  const timerWrap  = document.getElementById('timer-display');
  const timerCount = document.getElementById('timer-countdown');
  let timerHandle  = null;

  // State
  let rememberedEmail = '';
  let resetEmail = '';

  // API CONFIG
  const API_BASE = 'http://localhost/Narpavi_Honey/Narpavi_Honey_Backend/routes/auth';
  const ROUTES = {
    login:           `${API_BASE}/login.php`,
    sendResetCode:   `${API_BASE}/forgot_password.php`,
    verifyResetCode: `${API_BASE}/verify_forgot_password_otp.php`,
    resetPassword:   `${API_BASE}/reset_password.php`,
  };

  // Helpers
  const hide = el => el && el.classList.add('hidden');
  const show = el => el && el.classList.remove('hidden');
  const setText = (el, t) => { if (el) el.textContent = t || ''; };
  const clearAllErrors = () => {
    [globalOK, globalErr, errLoginEmail, errLoginPass, errForgotEmail, errOtp, errNewPass, errConfirm].forEach(e => setText(e,''));
    clearBrowserValidation();
  };
  const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v||'').trim());
  
  // Clear browser validation messages
  const clearBrowserValidation = () => {
    document.querySelectorAll('input').forEach(input => {
      input.setCustomValidity('');
    });
  };

  async function apiFetch(url, payload) {
    const formData = new FormData();
    for (const key in payload) formData.append(key, payload[key]);
    const res = await fetch(url, { method: 'POST', body: formData });
    const data = await res.json();
    if (!res.ok || data.status !== 'success') throw new Error(data.message || 'Request failed');
    return data;
  }

  function switchTo(form) {
    [loginForm, forgotForm, otpForm, resetForm].forEach(hide);
    show(form);
    clearAllErrors();
    window.scrollTo({ top: document.querySelector('main').offsetTop, behavior: 'smooth' });
  }

  function startTimer(sec=60){
    clearInterval(timerHandle);
    let t=sec; setText(timerCount,t); show(timerWrap); hide(resendBtn);
    timerHandle = setInterval(()=>{
      t--; setText(timerCount, Math.max(0,t));
      if (t<=0){ clearInterval(timerHandle); hide(timerWrap); show(resendBtn); }
    },1000);
  }

  const gatherOtp = () => otpInputs.map(i => i.value).join('');

  // OTP inputs UX
  otpInputs.forEach((inp, i) => {
    inp.addEventListener('input', e => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 1);
      if (e.target.value && i < otpInputs.length - 1) otpInputs[i + 1].focus();
    });
    inp.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !e.target.value && i > 0) otpInputs[i - 1].focus();
    });
  });

  // ========== Event Listeners ==========

  // Show forgot form
  showForgot?.addEventListener('click', e=>{
    e.preventDefault();
    if (loginEmail.value && isEmail(loginEmail.value)) forgotEmail.value = loginEmail.value;
    switchTo(forgotForm);
  });
  backFromForgot?.addEventListener('click', ()=> switchTo(loginForm));
  backFromOtp?.addEventListener('click', ()=> switchTo(forgotForm));
  backFromReset?.addEventListener('click', ()=> switchTo(forgotForm));

  // LOGIN API
  loginForm.addEventListener('submit', async (e)=>{
    e.preventDefault(); clearAllErrors();
    const email = (loginEmail.value||'').trim();
    const pass  = (loginPass.value||'').trim();
    
    // Check if fields are empty first
    if (!email){ setText(errLoginEmail,'Email address is required.'); return; }
    if (!pass){ setText(errLoginPass,'Password is required.'); return; }
    
    if (!isEmail(email)){ setText(errLoginEmail,'Please enter a valid email.'); return; }

    loginBtn.disabled = true;
    try {
      const res = await apiFetch(ROUTES.login, { email, password: pass });
      setText(globalOK,res.message || 'Login successful. Redirecting…');
      rememberedEmail = email;
      
      // Store user data in localStorage for homepage to use
      if (res.user_id && res.user_name) {
        const userData = {
          id: res.user_id,
          name: res.user_name,
          email: email
        };
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', 'logged_in'); // Simple token for demo
      }
      
      setTimeout(()=>{ window.location.href = '../pages/homepage.html'; }, 800);
    } catch(err){ setText(globalErr,err.message); }
    finally{ loginBtn.disabled=false; }
  });

  // FORGOT PASSWORD API
  forgotForm.addEventListener('submit', async (e)=>{
    e.preventDefault(); clearAllErrors();
    const email = (forgotEmail.value||'').trim();
    
    // Check if email is empty first
    if (!email){ setText(errForgotEmail,'Email address is required.'); return; }
    if (!isEmail(email)){ setText(errForgotEmail,'Enter a valid email.'); return; }

    forgotBtn.disabled = true;
    try {
      const res = await apiFetch(ROUTES.sendResetCode,{ email });
      setText(globalOK,res.message || 'Verification code sent.');
      resetEmail=email;
      otpInputs.forEach(i=>i.value='');
      startTimer(60);
      switchTo(otpForm);
    } catch(err){ setText(globalErr,err.message); }
    finally{ forgotBtn.disabled=false; }
  });

  // RESEND OTP
  resendBtn?.addEventListener('click', async ()=>{
    clearAllErrors();
    try {
      const res = await apiFetch(ROUTES.sendResetCode,{ email: resetEmail });
      setText(globalOK,res.message || 'New code sent.');
      otpInputs.forEach(i=>i.value='');
      startTimer(60);
    } catch(err){ setText(globalErr,err.message); }
  });

  // VERIFY OTP
  otpForm.addEventListener('submit', async (e)=>{
    e.preventDefault(); clearAllErrors();
    const code = gatherOtp();
    if (!/^\d{4}$/.test(code)){ setText(errOtp,'Enter the 4-digit code.'); return; }

    verifyBtn.disabled=true;
    try {
      const res = await apiFetch(ROUTES.verifyResetCode,{ email: resetEmail, otp: code });
      setText(globalOK,res.message || 'Code verified.');
      switchTo(resetForm);
    } catch(err){ setText(errOtp,err.message); }
    finally{ verifyBtn.disabled=false; }
  });

  // RESET PASSWORD API
  resetForm.addEventListener('submit', async (e)=>{
    e.preventDefault(); clearAllErrors();
    const pw = newPass.value||'', cpw = confirmPass.value||'';
    
    // Check if fields are empty
    if (!pw.trim()){ setText(errNewPass,'New password is required.'); return; }
    if (!cpw.trim()){ setText(errConfirm,'Confirm password is required.'); return; }
    
    if (pw.length<8){ setText(errNewPass,'Password must be 8+ chars.'); return; }
    if (pw !== cpw){ setText(errConfirm,'Passwords do not match.'); return; }

    resetBtn.disabled=true;
    try {
      console.log('Sending reset password request:', { email: resetEmail, password: pw });
      const res = await apiFetch(ROUTES.resetPassword,{ email: resetEmail, password: pw });
      console.log('Reset password response:', res);
      setText(globalOK,res.message || 'Password updated.');
      if (rememberedEmail) loginEmail.value = rememberedEmail;
      switchTo(loginForm);
    } catch(err){ 
      console.error('Reset password error:', err);
      setText(globalErr,err.message); 
    }
    finally{ resetBtn.disabled=false; }
  });

  // Toggle password visibility
  const eyeIconSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/>
      <circle cx="12" cy="12" r="3" stroke-width="2" />
    </svg>`;
  const eyeOffIconSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18M10.6 10.6A3 3 0 0012 15a3 3 0 001.4-.4M9.9 4.2A10.7 10.7 0 0112 4c6.5 0 10 8 10 8a18.7 18.7 0 01-4 5.2M6.2 6.2A18.6 18.6 0 002 12s3.5 7 10 7a10.6 10.6 0 003.1-.5"/>
    </svg>`;

  document.querySelectorAll('.toggle-eye').forEach(icon => {
    icon.innerHTML = eyeIconSVG;
    icon.addEventListener('click', () => {
      const input = document.getElementById(icon.dataset.target);
      if (input.type === 'password') {
        input.type = 'text'; icon.innerHTML = eyeOffIconSVG;
      } else {
        input.type = 'password'; icon.innerHTML = eyeIconSVG;
      }
    });
  });

  // Clear errors when user starts typing
  const addInputListeners = () => {
    [loginEmail, loginPass, forgotEmail, newPass, confirmPass].forEach(input => {
      if (input) {
        input.addEventListener('input', () => {
          // Clear specific error for this field
          if (input === loginEmail) setText(errLoginEmail, '');
          if (input === loginPass) setText(errLoginPass, '');
          if (input === forgotEmail) setText(errForgotEmail, '');
          if (input === newPass) setText(errNewPass, '');
          if (input === confirmPass) setText(errConfirm, '');
        });
      }
    });
  };

  // Initialize
  addInputListeners();
  switchTo(loginForm);
})();
