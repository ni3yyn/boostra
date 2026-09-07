// src/app/admin/AdminLogin.js
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const BoostraLogo = ({ size = 46 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    style={{ flexShrink: 0 }}
  >
    <rect width="100" height="100" rx="23" fill="#0000FF" />
    <path d="M16 33A8.5 8.5 0 0 1 24.5 24.5H33V41.5H16V33Z" fill="#FFFFFF" />
    <rect x="33" y="41.5" width="34" height="17" fill="#FFFFFF" />
    <path d="M67 58.5H84V67A8.5 8.5 0 0 1 75.5 75.5H67V58.5Z" fill="#FFFFFF" />
  </svg>
);

const UnifiedBrandPattern = ({ width = "250px", height = "150px", opacity = 0.35 }) => (
  <div
    aria-hidden="true"
    style={{
      position: "absolute",
      left: "2px",
      bottom: "2px",
      width: width,
      height: height,
      maxWidth: "100%",
      maxHeight: "100%",
      overflow: "hidden",
      pointerEvents: "none",
      zIndex: 0,
      opacity: opacity,
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "flex-start"
    }}
  >
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 510 335"
      preserveAspectRatio="xMinYMax meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="adminLoginPatternFade" cx="0%" cy="100%" r="95%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="50%" stopColor="white" stopOpacity="0.8" />
          <stop offset="85%" stopColor="white" stopOpacity="0.3" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id="adminLoginPatternMask">
          <rect width="510" height="335" fill="url(#adminLoginPatternFade)" />
        </mask>
      </defs>
      <g fill="#4F46E5" fillOpacity="0.38" mask="url(#adminLoginPatternMask)">
        <rect x="0" y="0" width="25" height="35" rx="0" />
        <rect x="25" y="35" width="81" height="35" rx="3" />
        <rect x="106" y="70" width="41" height="36" rx="3" />
        <rect x="0" y="108" width="25" height="35" rx="0" />
        <rect x="25" y="143" width="81" height="35" rx="3" />
        <rect x="106" y="178" width="41" height="36" rx="3" />
        <rect x="152" y="109" width="41" height="35" rx="3" />
        <rect x="193" y="144" width="79" height="35" rx="3" />
        <rect x="272" y="179" width="41" height="36" rx="3" />
        <rect x="0" y="215" width="25" height="35" rx="0" />
        <rect x="25" y="250" width="81" height="35" rx="3" />
        <rect x="106" y="285" width="41" height="36" rx="3" />
        <rect x="152" y="216" width="41" height="35" rx="3" />
        <rect x="193" y="251" width="79" height="35" rx="3" />
        <rect x="272" y="286" width="41" height="36" rx="3" />
        <rect x="314" y="215" width="41" height="35" rx="3" />
        <rect x="355" y="250" width="79" height="35" rx="3" />
        <rect x="434" y="285" width="41" height="36" rx="3" />
      </g>
    </svg>
  </div>
);

const Icons = {
  Eye: () => (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  EyeOff: () => (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
      <line x1="2" x2="22" y1="2" y2="22"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  )
};

export default function AdminLogin({ onLoginSuccess }) {
  useEffect(() => {
    document.title = 'Boostra Agency | تسجيل الدخول';
  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password.trim());
      if (onLoginSuccess) {
        onLoginSuccess(credential.user);
      }
    } catch (err) {
      console.error('Login error:', err);
      setLoading(false);
      if (
        err.code === 'auth/invalid-credential' || 
        err.code === 'auth/user-not-found' || 
        err.code === 'auth/wrong-password'
      ) {
        setError('بيانات الدخول غير صحيحة');
      } else if (err.code === 'auth/too-many-requests') {
        setError('تم حظر المحاولات مؤقتا لتكرار الخطأ. انتظر دقيقة');
      } else {
        setError('تعذر تسجيل الدخول للمسؤول');
      }
    }
  };

  return (
    <div className="admin-login-screen">
      <div className="admin-nav-bar">
        <Link href="/" className="admin-nav-pill">
          <span>العودة للموقع</span>
          <Icons.ArrowRight />
        </Link>
      </div>

      <div className="admin-login-card card-enter">
        <div className="admin-card-body">
          <div className="admin-brand-header">
            <div className="admin-logo-wrapper">
              <BoostraLogo size={48} />
            </div>
            <h1 className="admin-portal-title">Boostra Control</h1>
            <p className="admin-portal-subtitle">تسجيل الدخول للمنظومة الإعلانية</p>
          </div>

          {error && (
            <div className="admin-error-banner">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="admin-form-stack">
            <div className="admin-input-group">
              <label className="admin-label-text">
                البريد الإلكتروني <span style={{ color: 'var(--accent, #0000FF)' }}>*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@boostra.agency"
                required
                className="tactile-input-box"
                style={{ direction: 'ltr', textAlign: 'right' }}
              />
            </div>

            <div className="admin-input-group">
              <label className="admin-label-text">
                كلمة المرور <span style={{ color: 'var(--accent, #0000FF)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="tactile-input-box"
                  style={{ direction: 'ltr', textAlign: 'right', paddingLeft: '42px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="tactile-eye-btn"
                  aria-label="تبديل إظهار كلمة المرور"
                >
                  {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="admin-primary-btn"
              style={{ marginTop: '14px' }}
            >
              {loading ? (
                <>
                  <span className="mini-btn-spin" />
                  <span>جاري التحقق...</span>
                </>
              ) : (
                <span>دخول لوحة التحكم</span>
              )}
            </button>
          </form>
        </div>

        <UnifiedBrandPattern />
      </div>
    </div>
  );
}