// src/app/admin/page.js
"use client";

import React, { useState, useEffect } from "react";
import { auth } from "../lib/firebase"; 
import { onAuthStateChanged } from "firebase/auth";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";

const SPLASH_DURATION_MS = 1300;
const SPLASH_EXIT_DURATION_MS = 350;
const CONFIRMATION_EMPLOYEE_UID = 'GBOeDANTY6PnSUxV6uSIoA7Ugug2';

const BoostraLogo = ({ size = 56 }) => (
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

export default function AdminGatePage() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [phase, setPhase] = useState('init');

  // 1. فحص الجلسة عبر Firebase
  useEffect(() => {
    if (!auth) {
      setAuthReady(true);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // 2. انتظر أول نتيجة من Firebase قبل اختيار شاشة الدخول أو لوحة التحكم
  useEffect(() => {
    if (!authReady || phase !== 'init') return;

    if (user) {
      if (user.uid === CONFIRMATION_EMPLOYEE_UID) {
        window.location.replace('/admin/store');
        return;
      }
      // إذا كان مسجلا بالفعل -> أظهر مباشرة: مرحبا، أيمن
      setPhase('welcome-aymen');
      const t = setTimeout(() => {
        setPhase('leaving-aymen');
        setTimeout(() => setPhase('dashboard'), SPLASH_EXIT_DURATION_MS);
      }, SPLASH_DURATION_MS);
      return () => clearTimeout(t);
    } else {
      // إذا لم يكن مسجلا -> أظهر شاشة: صلّ على رسول الله
      setPhase('blessing');
      const t = setTimeout(() => {
        setPhase('leaving-blessing');
        setTimeout(() => setPhase('login'), SPLASH_EXIT_DURATION_MS);
      }, SPLASH_DURATION_MS);
      return () => clearTimeout(t);
    }
  }, [authReady, user]);

  // في حال تسجيل الخروج لاحقا
  useEffect(() => {
    if (authReady && !user && phase === 'dashboard') {
      setPhase('login');
    }
  }, [user, phase, authReady]);

  // 3. عند الضغط على تسجيل الدخول بنجاح من شاشة الـ Login
  const handleLoginSuccess = (loggedInUser) => {
    if (loggedInUser?.uid === CONFIRMATION_EMPLOYEE_UID) {
      window.location.replace('/admin/store');
      return;
    }
    setPhase('welcome-aymen');
    setTimeout(() => {
      setPhase('leaving-aymen');
      setTimeout(() => {
        setPhase('dashboard');
      }, SPLASH_EXIT_DURATION_MS);
    }, SPLASH_DURATION_MS);
  };

  return (
    <div className="admin-gate-wrapper">
      
      {/* خلفية الأورورا الثلاثية الحية (ظاهرة دائما) */}
      <div className="aurora-fixed-canvas" aria-hidden="true">
        <div className="aurora-orb orb-hero" />
        <div className="aurora-orb orb-middle" />
        <div className="aurora-orb orb-bottom" />
      </div>

      {/* أ. شاشة: صلّ على رسول الله (تظهر لثانية واحدة فقط لغير المسجل) */}
      {(phase === 'blessing' || phase === 'leaving-blessing') && (
        <div className={`gate-splash-overlay ${phase === 'leaving-blessing' ? 'splash-exit' : 'splash-enter'}`}>
          <div className="gate-logo-pulse"><BoostraLogo size={62} /></div>
          <h2 className="gate-headline">صلّ على رسول الله</h2>
          <div className="gate-hairline-track"><span className="gate-hairline-fill" /></div>
        </div>
      )}

      {/* ب. شاشة: مرحبا، أيمن (تظهر للمسجل مسبقا أو بعد كتابة الباسورد والضغط على دخول) */}
      {(phase === 'welcome-aymen' || phase === 'leaving-aymen') && (
        <div className={`gate-splash-overlay ${phase === 'leaving-aymen' ? 'splash-exit' : 'splash-enter'}`}>
          <div className="gate-logo-pulse"><BoostraLogo size={62} /></div>
          <h2 className="gate-headline">مرحبا، أيمن</h2>
          <p className="gate-subline">جاري تهيئة لوحة التحكم ومزامنة البيانات...</p>
          <div className="gate-hairline-track"><span className="gate-hairline-fill" /></div>
        </div>
      )}

      {/* ج. كرت تسجيل الدخول */}
      {phase === 'login' && !user && (
        <AdminLogin onLoginSuccess={handleLoginSuccess} />
      )}

      {/* د. لوحة التحكم */}
      {phase === 'dashboard' && user && (
        <AdminDashboard />
      )}

    </div>
  );
}