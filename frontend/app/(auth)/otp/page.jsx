'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '../services/auth.api';
import styles from '../styles/auth.module.css';
import { FiMail, FiCheckCircle, FiXCircle } from 'react-icons/fi';
const OTP_LENGTH = 6;
export default function OTPPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [purpose, setPurpose] = useState('login');
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [otpStatus, setOtpStatus] = useState('idle');
  const inputRefs = useRef([]);
  const timerRef = useRef(null);

  // استرجاع الإيميل
  useEffect(() => {
    const storedEmail = sessionStorage.getItem('otp_email');
    const storedPurpose = sessionStorage.getItem('otp_purpose') || 'login';

    if (!storedEmail) {
      router.replace('/login');
      return;
    }
    setEmail(storedEmail);
    setPurpose(storedPurpose);

    return () => clearInterval(timerRef.current);
  }, [router]);

  //تايمر
  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    setTimerSeconds(60);
    setCanResend(false);

    timerRef.current = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    if (email) {
      startTimer();
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [email, startTimer]);

  // تغيير OTP
  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError('');
    setOtpStatus('idle');

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.filter(Boolean).length === OTP_LENGTH) {
      setTimeout(() => handleVerify(newOtp.join('')), 150);
    }
  };

  //التحقق
  const handleVerify = useCallback(
    async (otpString) => {
      const code = otpString || otp.join('');
      setError('');
      setSuccess('');

      if (code.length !== OTP_LENGTH) {
        setError('Please enter all 6 digits of the code.');
        return;
      }

      setLoading(true);

      try {
        const result = await authAPI.verifyOTP(email, code, purpose);

        if (result.accessToken) {
          localStorage.setItem('accessToken', result.accessToken);
          sessionStorage.removeItem('otp_email');
          sessionStorage.removeItem('otp_purpose');

          setOtpStatus('success');
          setSuccess('Verified successfully!');

          setTimeout(() => router.push('/dashboard'), 800);
        }
      } catch (err) {
        setOtpStatus('error');
        setError(err.message || 'Invalid code.');
        setOtp(Array(OTP_LENGTH).fill(''));
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
      } finally {
        setLoading(false);
      }
    },
    [otp, email, purpose, router]
  );

  //إعادة إرسال
  const handleResend = async () => {
    setError('');
    setSuccess('');
    setOtp(Array(OTP_LENGTH).fill(''));
    setOtpStatus('idle');

    try {
      await authAPI.resendOTP(email, purpose);

      setSuccess('New code sent to your email.');
      startTimer();
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } catch (err) {
      setError(err.message || 'Failed to resend code.');
      startTimer();
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.blobTL} />
      <div className={styles.blobBR} />

      <div className={styles.card}>

        {/* logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <FiMail size={24} color="#2563EB" />
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

        {/*email icon*/}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <FiMail size={40} color="#2563EB" />
        </div>

        <h1 className={styles.cardTitle} style={{ textAlign: 'center' }}>
          Verify Your Email
        </h1>

        <p className={styles.cardSub} style={{ textAlign: 'center' }}>
          We sent a 6-digit code to
        </p>

        <div className={styles.otpEmailDisplay}>{email}</div>

        {/* err */}
        {error && (
          <div className={styles.alertError}>
            <FiXCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* success */}
        {success && (
          <div className={styles.alertSuccess}>
            <FiCheckCircle size={18} />
            <span>{success}</span>
          </div>
        )}

        {/* OTP inputs */}
        <div className={styles.otpBoxes}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              className={`${styles.otpBox} ${
                otpStatus === 'error'
                  ? styles.otpBoxError
                  : otpStatus === 'success'
                  ? styles.otpBoxSuccess
                  : ''
              }`}
              value={digit}
              maxLength={1}
              onChange={(e) => handleOtpChange(idx, e.target.value)}
              inputMode="numeric"
              disabled={loading || otpStatus === 'success'}
            />
          ))}
        </div>

        {/* resend */}
        <div className={styles.resendRow}>
          Did not receive code?{' '}
          <button
            className={styles.resendBtn}
            onClick={handleResend}
            disabled={!canResend}
          >
            {canResend ? 'Resend Code' : `Resend (${timerSeconds}s)`}
          </button>
        </div>

        {/* verify */}
        <button
          className={styles.btnPrimary}
          onClick={() => handleVerify()}
          disabled={loading}
        >
          {loading ? 'Verifying...' : 'Verify Code'}
        </button>

        {/* back */}
        <button
          className={styles.backLink}
          onClick={() => router.push('/login')}
        >
          ← Back to login
        </button>

      </div>
    </div>
  );
}