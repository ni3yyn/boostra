// src/app/admin/email/components/EmailModal.js
"use client";

import React, { useState, useEffect } from 'react';
import styles from './EmailModal.module.css';

// --- THE UNIFIED BRAND PATTERN ---
const UnifiedBrandPattern = ({ width = "380px", height = "240px", opacity = 0.28 }) => (
  <div
    aria-hidden="true"
    style={{
      position: "absolute",
      left: "4px",
      bottom: "4px",
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
    <svg width="100%" height="100%" viewBox="0 0 510 335" preserveAspectRatio="xMinYMax meet" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="modalFadeVibrantClean" cx="0%" cy="100%" r="95%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="45%" stopColor="white" stopOpacity="0.85" />
          <stop offset="75%" stopColor="white" stopOpacity="0.4" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id="modalMaskVibrantClean">
          <rect width="510" height="335" fill="url(#modalFadeVibrantClean)" />
        </mask>
      </defs>
      <g fill="#4F46E5" fillOpacity="0.38" mask="url(#modalMaskVibrantClean)">
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

// --- أيقونة إغلاق SVG هندسية فائقة الدقة ---
const CloseVectorIcon = () => (
  <svg 
    width="14" 
    height="14" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.4" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function EmailModal({
  isOpen,
  onClose,
  title,
  subtitle,
  maxWidth = '480px',
  children,
  showPattern = true,
}) {
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setIsClosing(false);
      document.body.style.overflow = 'hidden';
    } else if (isRendered) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsRendered(false);
        setIsClosing(false);
        document.body.style.overflow = '';
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isRendered]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isRendered) return null;

  return (
    <div 
      className={`${styles.backdrop} ${isClosing ? styles.backdropClosing : ''}`} 
      onClick={onClose}
    >
      <div 
        className={`${styles.modalWindow} ${isClosing ? styles.modalClosing : ''}`} 
        style={{ maxWidth }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalContent}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.titleBox}>
              <h3 className={styles.title}>{title}</h3>
              {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>

            {/* زر الإغلاق الدائري الهندسي الأنيق */}
            <button 
              type="button" 
              onClick={onClose} 
              className={styles.closeBtn}
              aria-label="إغلاق النافذة"
            >
              <CloseVectorIcon />
            </button>
          </div>

          {/* Body Content */}
          <div className={styles.body}>
            {children}
          </div>
        </div>

        {showPattern && <UnifiedBrandPattern />}
      </div>
    </div>
  );
}