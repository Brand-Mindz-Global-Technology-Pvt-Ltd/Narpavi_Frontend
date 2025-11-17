/* Registration Form Handler (3-dot indicator in corner, no strength label/line) */

/* 1) Robust eye toggle via event delegation */
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-eye]');
  if (!btn) return;

  const targetId = btn.getAttribute('data-target');
  const input = document.getElementById(targetId);
  if (!input) return;

  const icon = btn.querySelector('i');
  const show = input.type === 'password';

  input.type = show ? 'text' : 'password';
  btn.setAttribute('aria-pressed', show ? 'true' : 'false');

  if (icon) {
    icon.classList.toggle('ph-eye', !show);
    icon.classList.toggle('ph-eye-slash', show);
  }
});

/* 2) Registration Form class */
class RegistrationForm {
  constructor() {
    this.apiBaseUrl = 'https://narpavihoney.brandmindz.com/routes/auth';
    this.formData = {};
    this.otpTimer = null;
    this.otpExpiryTime = null;

    this.initEls();
    this.bindEvents();
  }

  initEls() {
    // Sections
    this.registrationForm = document.getElementById('registrationForm');
    this.otpVerification  = document.getElementById('otpVerification');
    this.successMessage   = document.getElementById('successMessage');

    // Inputs
    this.nameInput            = document.getElementById('name');
    this.phoneInput           = document.getElementById('phone');
    this.emailInput           = document.getElementById('email');
    this.passwordInput        = document.getElementById('password');
    this.confirmPasswordInput = document.getElementById('confirmPassword');
    this.rememberCheckbox     = document.getElementById('remember');

    // Buttons
    this.registerBtn   = document.getElementById('registerBtn');
    this.verifyOtpBtn  = document.getElementById('verifyOtpBtn');
    this.resendOtpBtn  = document.getElementById('resendOtpBtn');
    this.backToFormBtn = document.getElementById('backToForm');

    // OTP
    this.otpInputs = document.querySelectorAll('.otp-digit');
    this.otpEmail  = document.getElementById('otpEmail');
    this.otpTimerElement = document.getElementById('otpTimer');

    // Errors
    this.errorElements = {
      name:            document.getElementById('nameError'),
      phone:           document.getElementById('phoneError'),
      email:           document.getElementById('emailError'),
      password:        document.getElementById('passwordError'),
      confirmPassword: document.getElementById('confirmPasswordError'),
    };

    // 3-dot indicators
    this.dotLen  = document.getElementById('dotLen');
    this.dotCase = document.getElementById('dotCase');
    this.dotMix  = document.getElementById('dotMix');

    // Confirm text
    this.confirmIndicator = document.getElementById('confirm-password-indicator');
  }

  bindEvents() {
    this.registrationForm.addEventListener('submit', (e) => this.handleRegistrationSubmit(e));
    document.getElementById('otpForm').addEventListener('submit', (e) => this.handleOtpSubmit(e));

    // Live validation
    this.nameInput.addEventListener('input', () => this.validateName());
    this.phoneInput.addEventListener('input', (e) => this.handlePhoneInput(e));
    this.phoneInput.addEventListener('keydown', (e) => this.handlePhoneKeydown(e));
    this.emailInput.addEventListener('input', () => this.validateEmail());

    this.passwordInput.addEventListener('input', () => {
      this.updatePasswordDots(this.passwordInput.value || '');
      this.checkConfirmPassword();
    });
    this.confirmPasswordInput.addEventListener('input', () => this.checkConfirmPassword());

    // OTP behavior
    this.otpInputs.forEach((input) => {
      input.addEventListener('input', (e) => this.handleOtpInput(e));
      input.addEventListener('keydown', (e) => this.handleOtpKeydown(e));
      input.addEventListener('paste', (e) => this.handleOtpPaste(e));
    });

    this.resendOtpBtn?.addEventListener('click', () => this.resendOtp());
    this.backToFormBtn?.addEventListener('click', () => this.showStep(1));
  }

  /* ===== 3-dot password indicator only ===== */
  calcChecks(pw) {
    const len = pw.length >= 8;
    const hasLower = /[a-z]/.test(pw);
    const hasUpper = /[A-Z]/.test(pw);
    const hasDigit = /\d/.test(pw);
    const hasSpec = /[^A-Za-z0-9]/.test(pw);
    return { len, caseMix: hasLower && hasUpper, numSpec: hasDigit && hasSpec };
  }

  updatePasswordDots(pw) {
    const c = this.calcChecks(pw);
    this.dotLen?.classList.toggle('active', !!c.len);
    this.dotCase?.classList.toggle('active', !!c.caseMix);
    this.dotMix?.classList.toggle('active', !!c.numSpec);
  }

  checkConfirmPassword() {
    const pass = this.passwordInput.value || '';
    const confirmPass = this.confirmPasswordInput.value || '';
    if (!this.confirmIndicator) return;
    if (!confirmPass) { this.confirmIndicator.innerHTML = ''; return; }

    if (pass === confirmPass) {
      this.confirmIndicator.innerHTML = '<span class="text-green-600 flex items-center text-xs"><i class="ph ph-check-circle mr-1"></i> Passwords match</span>';
    } else {
      this.confirmIndicator.innerHTML = '<span class="text-red-600 flex items-center text-xs"><i class="ph ph-x-circle mr-1"></i> Passwords do not match</span>';
    }
  }

  /* ===== Validation ===== */
  validateName() {
    const v = this.nameInput.value.trim();
    if (v.length < 2) { this.showError('name', 'Name must be at least 2 characters long'); return false; }
    this.hideError('name'); return true;
  }
  validatePhone() {
    const phone = this.phoneInput.value.replace(/\D/g, '');
    if (phone.length !== 10) { this.showError('phone', 'Phone number must be exactly 10 digits'); return false; }
    this.hideError('phone'); return true;
  }
  validateEmail() {
    const email = this.emailInput.value.trim();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!ok) { this.showError('email', 'Please enter a valid email address'); return false; }
    this.hideError('email'); return true;
  }
  validatePassword() {
    const c = this.calcChecks(this.passwordInput.value || '');
    const ok = c.len && c.caseMix && c.numSpec;
    if (!ok) { this.showError('password', 'Password must be 8+ chars and include upper, lower, number, and special.'); return false; }
    this.hideError('password'); return true;
  }
  validateConfirmPassword() {
    if ((this.passwordInput.value || '') !== (this.confirmPasswordInput.value || '')) {
      this.showError('confirmPassword', 'Passwords do not match'); return false;
    }
    this.hideError('confirmPassword'); return true;
  }
  validateTerms() { return !!this.rememberCheckbox.checked; }

  validateAll() {
    const ok =
      this.validateName() &&
      this.validatePhone() &&
      this.validateEmail() &&
      this.validatePassword() &&
      this.validateConfirmPassword() &&
      this.validateTerms();
    if (!this.rememberCheckbox.checked) this.toast('You must agree to the Terms of Use.', 'error');
    return ok;
  }

  /* ===== API flow ===== */
  async handleRegistrationSubmit(e) {
    e.preventDefault();
    if (!this.validateAll()) { this.toast('Please fix the errors in the form before submitting.', 'error'); return; }

    this.formData = {
      name: this.nameInput.value.trim(),
      phone: this.phoneInput.value.replace(/\D/g, ''),
      email: this.emailInput.value.trim(),
      password: this.passwordInput.value,
      confirm_password: this.confirmPasswordInput.value,
      agreed_terms: this.rememberCheckbox.checked ? '1' : '0',
    };

    this.setLoading(this.registerBtn, true);
    try {
      const fd = new FormData();
      for (const k in this.formData) fd.append(k, this.formData[k]);

      const res = await fetch(`${this.apiBaseUrl}/register.php`, { method:'POST', body: fd });
      const result = await res.json();

      if (result.status === 'success') {
        this.toast(result.message || 'OTP sent successfully!', 'success');
        this.showStep(2);
        this.startOtpTimer(120);
      } else {
        this.toast(result.message || 'Registration failed', 'error');
      }
    } catch (err) {
      console.error('Registration Error:', err);
      this.toast('A network error occurred. Please try again.', 'error');
    } finally {
      this.setLoading(this.registerBtn, false);
    }
  }

  async handleOtpSubmit(e) {
    e.preventDefault();
    const otp = Array.from(this.otpInputs).map((i) => i.value).join('');
    if (otp.length !== 6) { this.toast('Please enter the complete 6-digit OTP.', 'error'); return; }

    this.setLoading(this.verifyOtpBtn, true);
    try {
      const fd = new FormData();
      for (const k in this.formData) fd.append(k, this.formData[k]);
      fd.append('otp', otp);

      const res = await fetch(`${this.apiBaseUrl}/verify_otp.php`, { method:'POST', body: fd });
      const result = await res.json();

      if (result.status === 'success') {
        this.showStep(3);
        this.stopOtpTimer();
      } else {
        this.toast(result.message || 'Invalid OTP', 'error');
      }
    } catch (err) {
      console.error('OTP Verification Error:', err);
      this.toast('A network error occurred. Please try again.', 'error');
    } finally {
      this.setLoading(this.verifyOtpBtn, false);
    }
  }

  async resendOtp() {
    this.resendOtpBtn.disabled = true;
    try {
      const fd = new FormData();
      for (const k in this.formData) fd.append(k, this.formData[k]);

      const res = await fetch(`${this.apiBaseUrl}/resend_otp.php`, { method:'POST', body: fd });
      const result = await res.json();

      if (result.status === 'success') {
        this.toast('A new OTP has been sent!', 'success');
        this.startOtpTimer(120);
        this.clearOtpInputs();
      } else {
        this.toast(result.message || 'Unable to resend OTP', 'error');
        this.resendOtpBtn.disabled = false;
      }
    } catch (err) {
      console.error('Resend OTP Error:', err);
      this.toast('A network error occurred. Please try again.', 'error');
      this.resendOtpBtn.disabled = false;
    }
  }

  /* ===== UI helpers ===== */
  showStep(step) {
    this.registrationForm.style.display = (step === 1) ? 'block' : 'none';
    this.otpVerification.style.display  = (step === 2) ? 'block' : 'none';
    this.successMessage.style.display   = (step === 3) ? 'block' : 'none';
    if (step === 2) {
      this.otpEmail.textContent = this.formData.email;
      this.clearOtpInputs();
    }
  }

  startOtpTimer(seconds = 120) {
    this.stopOtpTimer();
    this.otpExpiryTime = Date.now() + seconds * 1000;
    this.updateTimer();
    this.resendOtpBtn.disabled = true;
    this.otpTimer = setInterval(() => this.updateTimer(), 1000);
  }
  updateTimer() {
    const timeLeft = Math.max(0, Math.round((this.otpExpiryTime - Date.now()) / 1000));
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    this.otpTimerElement.textContent = `${m}:${s}`;
    if (timeLeft <= 0) { this.stopOtpTimer(); this.resendOtpBtn.disabled = false; }
  }
  stopOtpTimer() { if (this.otpTimer) clearInterval(this.otpTimer); this.otpTimer = null; }

  clearOtpInputs() { this.otpInputs.forEach((i) => (i.value = '')); if (this.otpInputs.length) this.otpInputs[0].focus(); }
  handleOtpInput(e) {
    const input = e.target;
    input.value = input.value.replace(/\D/g, '').slice(0,1);
    const index = +input.dataset.index;
    if (input.value && index < 5) this.otpInputs[index+1].focus();
    const otp = Array.from(this.otpInputs).map(i=>i.value).join('');
    if (otp.length === 6) document.getElementById('otpForm').requestSubmit();
  }
  handleOtpPaste(e) {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g,'').slice(0,6);
    if (!text) return;
    this.otpInputs.forEach(i => i.value = '');
    [...text].forEach((ch, idx) => { if (this.otpInputs[idx]) this.otpInputs[idx].value = ch; });
    const last = this.otpInputs[Math.min(text.length-1, 5)];
    if (last) last.focus();
    if (text.length === 6) document.getElementById('otpForm').requestSubmit();
  }
  handleOtpKeydown(e) {
    const input = e.target, index = +input.dataset.index;
    if (e.key === 'Backspace' && !input.value && index > 0) this.otpInputs[index-1].focus();
  }

  handlePhoneInput(e) {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 10) v = v.slice(0,10);
    e.target.value = v;
  }
  handlePhoneKeydown(e) {
    const allowed = [8,9,27,13,46,37,39,38,40];
    if (allowed.includes(e.keyCode) || (e.ctrlKey && ['a','c','v','x'].includes(e.key.toLowerCase()))) return;
    if (e.key.length === 1 && (e.key < '0' || e.key > '9')) e.preventDefault();
  }

  setLoading(button, loading) {
    if (!button) return;
    const btnText = button.querySelector('.btn-text');
    const btnLoading = button.querySelector('.btn-loading');
    button.disabled = !!loading;
    if (btnText) btnText.classList.toggle('hidden', !!loading);
    if (btnLoading) btnLoading.classList.toggle('hidden', !loading);
  }

  showError(field, message) {
    const el = this.errorElements[field];
    if (!el) return;
    el.textContent = message;
    el.classList.remove('hidden');
  }
  hideError(field) {
    const el = this.errorElements[field];
    if (!el) return;
    el.classList.add('hidden');
  }

  toast(message, type='info') {
    const el = document.createElement('div');
    el.className = `fixed top-4 right-4 p-3 rounded-lg shadow-lg z-[9999] max-w-sm
      ${type==='success'?'bg-green-600 text-white':type==='error'?'bg-red-600 text-white':'bg-gray-900 text-white'}`;
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(()=>el.remove(), 4000);
    el.addEventListener('click', ()=>el.remove());
  }
}

/* 3) Boot reliably regardless of load order */
const bootRegistration = () => {
  if (!window.__regBooted && document.getElementById('registrationForm')) {
    window.__regBooted = true;
    new RegistrationForm();
  }
};
document.addEventListener('components:loaded', bootRegistration);
document.addEventListener('DOMContentLoaded', bootRegistration);
window.addEventListener('load', bootRegistration);
