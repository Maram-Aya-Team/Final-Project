'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '../services/auth.api';
import styles from '../styles/auth.module.css';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // التحقق من الفورم
  const validateForm = () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }return true;
  };

  // تسجيل الدخول
  const handleLogin = useCallback(async (e) => {
    e?.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const result = await authAPI.login(email, password);
      // اذا OTP مطلوب
      if (result.status === 'otp_required') {
        sessionStorage.setItem('otp_email', result.email || email);
        sessionStorage.setItem(
          'otp_purpose',
          result.reason === 'email_not_verified'
            ? 'email_verification'
            : 'login'
        );

        router.push('/otp');
      }

      // إذا تسجيل دخول ناجح
      else if (result.accessToken) {
        localStorage.setItem('accessToken', result.accessToken);
        router.push('/dashboard');
      }} 
      catch (err) {setError(err.message || 'Login failed. Please try again.');}
       finally {setLoading(false);}
  }, [email, password, router]);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.blobTL} />
      <div className={styles.blobBR} />
      <div className={styles.card}>
        {/* logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <FiMail size={22} color="#2563EB" />
          </div>

          <div>
            <div className={styles.logoText}>
              Found<span style={{ color: '#22C55E' }}>It</span>{' '}
              <span style={{ color: '#152B5B' }}>JO</span>
            </div>
            <div className={styles.logoSub}>
              FoundIt JO PLATFORM
            </div>
          </div>
        </div>
        <h1 className={styles.cardTitle}>Welcome Back</h1>
        <p className={styles.cardSub}>
          Sign in to your account to continue
        </p>
        {/* err */}
        {error && (
          <div className={styles.alertError}>
            <FiLock size={16} />
            <span>{error}</span>
          </div>
        )}
        {/* form */}
        <form onSubmit={handleLogin} noValidate>
          {/* email */}
          <div className={styles.field}>
            <div className={styles.inputWrap}>
              <div className={styles.inputIcon}>
                <FiMail size={18} />
              </div>

              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="Enter your email"
                autoComplete="email"/>
            </div>
          </div>
          {/* Password */}
          <div className={styles.field}>
            <div className={styles.inputWrap}>

              <div className={styles.inputIcon}>
                <FiLock size={18} />
              </div>

              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Enter your password"
                autoComplete="current-password"/>
              {/* toggle Password */}
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword((v) => !v)}>
                {showPassword ? (<FiEyeOff size={18} />) : (<FiEye size={18} />)}
              </button>

            </div>
          </div>
          {/* remember me */}
          <div className={styles.metaRow}>
            <label className={styles.checkLabel}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) =>
                  setRememberMe(e.target.checked)
                }
                style={{ display: 'none' }} />

              <div
                className={`${styles.customCheck} ${ rememberMe? styles.customCheckChecked: ''}`} /> Remember me</label>
            <a href="/forgot-password" className={styles.link}>
              Forgot password?
            </a>
          </div>

          {/*button */}
          <button
            type="submit"
            className={styles.btnPrimary}
            disabled={loading}>
            {loading ? (<div className={styles.spinner} />) : ( 'Sign In')}
          </button>
        </form>
        <div className={styles.divider}>or</div>
        {/* googleLogin */}
        <button
          className={styles.btnGoogle}
          onClick={() =>
            (window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`)
          }
        >
          <FcGoogle size={20} />
          Continue with Google
        </button>
        {/* register */}
        <div className={styles.registerRow}> Do not have an account?{' '}
          <a href="/register" className={styles.link}> Register </a>
        </div>

      </div>
    </div>
  );
}