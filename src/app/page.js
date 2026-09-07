"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { db } from './lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Link from 'next/link';

const ALGERIAN_MOBILE_REGEX = /^(05|06|07)\d{8}$/;

const GOOGLE_SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbzNCKfXIkGbSXTyQto1_nzgHWgTn0GcPKbNvS5O4LlQoY6BNEVOMMRDiSqTODorGOk-/exec';

const triggerGoogleSheetWebhook = (leadRecord) => {
  if (!GOOGLE_SHEET_WEBHOOK_URL) return;

  fetch(GOOGLE_SHEET_WEBHOOK_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      type: 'INSERT',
      record: leadRecord
    })
  }).catch((error) => {
    console.error('Webhook sync error:', error);
  });
};

// --- THE UNIFIED BRAND PATTERN ---
const UnifiedBrandPattern = ({ width = "360px", height = "220px", opacity = 1, maxWidth = "100%", maxHeight = "100%" }) => (
  <div
    aria-hidden="true"
    style={{
      position: "absolute",
      left: 0,
      bottom: 0,
      width: width,
      height: height,
      maxWidth: maxWidth,
      maxHeight: maxHeight,
      overflow: "hidden",
      pointerEvents: "none",
      zIndex: 1,
      opacity: opacity,
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "flex-start"
    }}
  >
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 510 310"
      preserveAspectRatio="xMinYMax meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="patternFadeToInside" cx="0%" cy="100%" r="75%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="45%" stopColor="white" stopOpacity="0.9" />
          <stop offset="75%" stopColor="white" stopOpacity="0.3" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id="unifiedSoftEdgeMask">
          <rect width="510" height="310" fill="url(#patternFadeToInside)" />
        </mask>
      </defs>
      <g fill="#4F46E5" fillOpacity="0.18" mask="url(#unifiedSoftEdgeMask)">
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

// --- BRAND ICONS & SVGs ---
const BrandIcons = {
  Logo: ({ size = 36, color = "var(--accent, #0000FF)" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    style={{ flexShrink: 0 }}
  >
    {/* 1. الحاوية الزرقاء الملكية */}
    <rect width="100" height="100" rx="23" fill={color} />

    {/* 2. الكتلة العلوية اليسرى (مربع بزاوية علوية مستديرة) */}
    <path 
      d="M16 33A8.5 8.5 0 0 1 24.5 24.5H33V41.5H16V33Z" 
      fill="#FFFFFF" 
    />

    {/* 3. الكتلة الوسطى (مستطيل عريض يربط الكتلتين بزوايا حادة) */}
    <rect 
      x="33" 
      y="41.5" 
      width="34" 
      height="17" 
      fill="#FFFFFF" 
    />

    {/* 4. الكتلة السفلية اليمنى (مربع بزاوية سفلية مستديرة مناظرة) */}
    <path 
      d="M67 58.5H84V67A8.5 8.5 0 0 1 75.5 75.5H67V58.5Z" 
      fill="#FFFFFF" 
    />
  </svg>
),
  SparkStar: ({ size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
  ),
  Google: () => (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
      <path stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="m31.6814,34.8868c-1.9155,1.29-4.3586,2.0718-7.2514,2.0718-5.59,0-10.3395-3.7723-12.04-8.8541v-.0195c-.43-1.29-.6841-2.6582-.6841-4.085s.2541-2.795.6841-4.085c1.7005-5.0818,6.45-8.8541,12.04-8.8541,3.1664,0,5.9809,1.0945,8.2286,3.2055l6.1568-6.1568c-3.7332-3.4791-8.5805-5.6095-14.3855-5.6095-8.4045,0-15.6559,4.8277-19.1936,11.8641-1.4659,2.8927-2.3064,6.1568-2.3064,9.6359s.8405,6.7432,2.3064,9.6359v.0195c3.5377,7.0168,10.7891,11.8445,19.1936,11.8445,5.805,0,10.6718-1.9155,14.2291-5.1991,4.0655-3.7527,6.4109-9.2645,6.4109-15.8123,0-1.5245-.1368-2.9905-.3909-4.3977h-20.2491v8.3264h11.5709c-.5082,2.6777-2.0327,4.945-4.3195,6.4695h0Z"/>
    </svg>
  ),
  Apple: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.42c.67-.82 1.13-1.96.99-3.11-1.02.05-2.22.68-2.92 1.5-.61.7-.84 1.86-.7 2.98 1.14.09 2.27-.55 2.63-1.37z"/></svg>,
  TikTok: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>,
  Snapchat: () => (
    <svg width="18" height="18" viewBox="0 0 468.339 468.339" fill="currentColor">
      <path d="M233.962,33.724c62.857,0.021,115.216,52.351,115.292,115.36c0.018,14.758,0.473,28.348,1.306,40.867 c0.514,7.724,6.938,13.448,14.305,13.448c1.085,0,2.19-0.124,3.3-0.384l19.691-4.616c0.838-0.197,1.679-0.291,2.51-0.291 c5.001,0,9.606,3.417,10.729,8.478c1.587,7.152-2.42,14.378-9.35,16.808l-29.89,12.066c-7.546,3.046-11.599,11.259-9.474,19.115 c23.98,88.654,90.959,79.434,90.959,90.984c0,14.504-50.485,16.552-55.046,21.114s-0.198,26.701-10.389,30.987 c-1.921,0.808-4.65,1.089-7.979,1.089c-7.676,0-18.532-1.498-29.974-1.498c-9.925,0-20.291,1.127-29.404,5.337 c-24.176,11.168-47.484,32.028-76.378,32.028s-52.202-20.86-76.378-32.028c-9.115-4.211-19.478-5.337-29.404-5.337 c-11.441,0-22.299,1.498-29.974,1.498c-3.327,0-6.059-0.282-7.979-1.089c-10.191-4.286-5.828-26.425-10.389-30.987 S25,360.062,25,345.558c0-11.551,66.979-2.331,90.959-90.984c2.125-7.855-1.928-16.068-9.475-19.115l-29.89-12.066 c-6.931-2.43-10.938-9.656-9.35-16.808c1.123-5.062,5.728-8.479,10.729-8.478c0.83,0,1.672,0.094,2.51,0.291l19.691,4.616 c1.11,0.26,2.215,0.384,3.3,0.384c7.366,0,13.791-5.725,14.305-13.448c0.833-12.519,1.289-26.109,1.307-40.867 C119.162,86.075,171.104,33.746,233.962,33.724 M233.97,8.724h-0.009h-0.009C215.19,8.73,196.913,12.5,179.631,19.93 c-16.589,7.131-31.519,17.299-44.375,30.222c-12.839,12.906-22.943,27.889-30.031,44.533c-7.37,17.307-11.118,35.599-11.141,54.368 c-0.011,9.215-0.202,18.158-0.57,26.722l-7.326-1.718c-2.688-0.63-5.452-0.95-8.213-0.951c-7.973-0.001-15.838,2.694-22.146,7.588 c-6.581,5.106-11.196,12.377-12.993,20.474c-4.277,19.273,6.365,38.73,24.807,45.572l21.937,8.855 c-14.526,44.586-41.311,53.13-59.348,58.885c-4.786,1.527-8.92,2.846-12.856,4.799C1.693,327.063,0,340.25,0,345.558 c0,10.167,4.812,19.445,13.551,26.124c4.351,3.326,9.741,6.07,16.477,8.389c9.181,3.161,19.824,5.167,28.474,6.775 c0.418,3.205,1.031,6.648,2.064,10.118c4.289,14.411,13.34,20.864,20.178,23.739c6.488,2.729,13.192,3.044,17.67,3.044 c4.38,0,9.01-0.343,13.912-0.706c5.259-0.39,10.697-0.792,16.062-0.792c8.314,0,14.503,0.992,18.92,3.032 c6.065,2.802,12.497,6.58,19.307,10.579c18.958,11.134,40.445,23.754,67.555,23.754s48.596-12.62,67.554-23.754 c6.81-4,13.242-7.777,19.308-10.579c4.417-2.041,10.606-3.032,18.92-3.032c5.365,0,10.803,0.403,16.061,0.792 c4.902,0.363,9.532,0.706,13.912,0.706c4.478,0,11.181-0.315,17.67-3.044c6.838-2.875,15.889-9.328,20.178-23.739 c1.033-3.47,1.647-6.913,2.064-10.118c8.65-1.609,19.294-3.614,28.474-6.775c6.737-2.319,12.126-5.063,16.477-8.389 c8.738-6.679,13.551-15.957,13.551-26.124c0-5.308-1.693-18.495-17.378-26.278c-3.936-1.953-8.07-3.272-12.856-4.799 c-18.037-5.754-44.822-14.299-59.348-58.885l21.936-8.855c18.442-6.842,29.085-26.3,24.808-45.573 c-1.797-8.097-6.412-15.368-12.993-20.474c-6.308-4.893-14.171-7.588-22.142-7.588c-2.761,0-5.525,0.32-8.215,0.95l-7.327,1.718 c-0.368-8.563-0.559-17.506-0.57-26.722c-0.023-18.784-3.801-37.094-11.23-54.424c-7.131-16.636-17.29-31.615-30.194-44.522 c-12.903-12.906-27.875-23.063-44.498-30.188C271.017,12.497,252.727,8.731,233.97,8.724L233.97,8.724z"/>
    </svg>
  ),
  XTwitter: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  Meta: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z"/></svg>,
  ArrowLeft: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  Check: ({ size = 16 }) => <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
  Whatsapp: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12.01 2.014c-5.46 0-9.89 4.43-9.89 9.89 0 1.76.46 3.47 1.32 4.97L2 22l5.3-1.39c1.45.79 3.09 1.21 4.71 1.21 5.46 0 9.89-4.43 9.89-9.89 0-5.46-4.43-9.89-9.89-9.89zm5.39 14.24c-.23.65-1.33 1.23-1.84 1.32-.47.08-1.07.14-3.4-.82-2.82-1.16-4.63-4.04-4.77-4.23-.14-.19-1.14-1.52-1.14-2.9s.72-2.06.97-2.33c.25-.27.54-.34.72-.34s.36 0 .52.01c.17.01.39-.06.6.45.23.55.77 1.88.84 2.02.07.14.12.3.02.5-.09.19-.14.3-.29.49-.14.18-.3.39-.42.54-.14.16-.28.34-.12.61.16.28.71 1.18 1.53 1.91.56.5 1.34 1.05 1.65 1.21.31.16.5.14.69-.08.19-.22.82-.96 1.04-1.29.23-.33.45-.27.74-.17.29.1 1.84.87 2.16 1.03.32.16.53.24.6.38.08.14.08.82-.16 1.47z"/></svg>
};

// --- REAL CLIENTS WITH FLAGS & PSYCHOLOGICALLY OPTIMIZED DESCRIPTIONS ---
const PREVIOUS_CLIENTS = [
  { name: "vertex.world", flag: "🇩🇿", tag: "91.1K متابع", logo: "/logos/vertex.world.webp" },
  { name: "vertex_cuir", flag: "🇩🇿", tag: "146K متابع", logo: "/logos/vertex_cuir.webp" },
  { name: "speedwin_dz", flag: "🇩🇿", tag: "20.5K متابع", logo: "/logos/speedwin_dz.webp" },
  { name: "Rival Real Estate", flag: "🇧🇭", tag: "عقارات واستثمار", logo: "/logos/rival_real_estate.webp" },
  { name: "rentrawaes", flag: "🇸🇦", tag: "تأجير سيارات", logo: "/logos/rentrawaes.webp" },
  { name: "rivareal.om", flag: "🇴🇲", tag: "تسويق عقاري", logo: "/logos/rivareal.om.webp" },
  { name: "ahdjez.om", flag: "🇩🇿", tag: "حجوزات عمرة", logo: "/logos/ahdjez.omra.webp" },
  { name: "perfod_off", flag: "🇩🇿", tag: "رياضة", logo: "/logos/perfod_off.webp" }
];

const AD_PLATFORMS = [
  { name: "Google Ads", icon: <BrandIcons.Google /> },
  { name: "TikTok Ads", icon: <BrandIcons.TikTok /> },
  { name: "Meta Ads", icon: <BrandIcons.Meta /> },
  { name: "Snapchat Ads", icon: <BrandIcons.Snapchat /> },
  { name: "Apple Search Ads", icon: <BrandIcons.Apple /> },
  { name: "X (Twitter) Ads", icon: <BrandIcons.XTwitter /> },
];

const TEAM_MEMBERS = [
  {
    role: "إدارة الحملات الإعلانية (Media Buying Lead)",
    focus: "دراسة سلوك الشراء في الأسواق المغاربية والخليجية، توزيع الميزانيات بدقة، وخفض تكلفة الزبون (CAC).",
    tag: "الاستراتيجية والأداء"
  },
  {
    role: "إدارة المحتوى (Content Lead)",
    focus: "كتابة نصوص الإعلانات (Copywriting)، وتطوير زوايا تصوير ومونتاج مصممة للتحويل المباشر وليس المشاهدات العابرة.",
    tag: "صناعة المحتوى"
  },
  {
    role: "المنصات والربط  (Funnels & Tracking Lead)",
    focus: "بناء صفحات الهبوط، ضبط الـ CAPI والبيكسل بدون فقدان بيانات، ودمج أدوات الـ CRM لقياس الأداء الحقيقي.",
    tag: "البنية التقنية"
  }
];

const PACKAGES = [
  {
    title: "باقة التأسيس",
    subtitle: "للمتاجر الناشئة الراغبة في تثبيت الحضور وبدء مبيعات منتظمة",
    price: "80,000",
    highlight: false,
    features: [
      "إدارة حسابات Facebook + Instagram",
      "إعداد خطة إعلانية شهرية متكاملة",
      "إنتاج (15) تصميما إعلانيا للمنتجات",
      "كتابة المحتوى الإعلاني المباشر",
      "تقارير أداء دورية كل 3 أشهر"
    ]
  },
  {
    title: "باقة النمو",
    subtitle: "حلول شاملة للشركات التي تهدف إلى الهيمنة على السوق",
    price: "330,000",
    highlight: true, // POPULAR & IN THE CENTER
    features: [
      "إدارة شاملة: Snap + Insta + Google + TikTok + LinkedIn",
      "تصميم وتطوير متجر إلكتروني / صفحة هبوط مخصصة",
      "تحسين محركات البحث (SEO) والظهور على خرائط Google",
      "إنتاج 3 فيديوهات Reels إعلانية احترافية شهريا",
      "إدارة حملات ومسارات تحويل الواتساب المباشرة"
    ]
  },
  {
    title: "باقة الانطلاقة",
    subtitle: "للمشاريع الجاهزة لمضاعفة الحجم والتوسع متعدد القنوات",
    price: "120,000",
    highlight: false,
    features: [
      "إدارة Snap + Insta + Google Ads + TikTok",
      "إطلاق وتحسين حملات الاستحواذ اليومية",
      "إنتاج فيديوهات إعلانية وسنابات شهريا",
      "إعداد (25) تصميما إعلانيا عالي التحويل",
      "تقارير أداء متقدمة وتوصيات تحسين أسبوعية"
    ]
  }
];

const AVAILABLE_PACKS = [
  "باقة التأسيس",
  "باقة النمو",
  "باقة الانطلاقة",
   "حل مخصص"
];

function SerpentinePipeline() {
  const [stage, setStage] = useState(0);

  /*
   * ============================================================
   * SINGLE SOURCE OF TRUTH — PIPELINE GEOMETRY
   * ============================================================
   *
   * Every node is defined by its CENTER.
   * Every pipe endpoint is calculated relative to the actual
   * visual node edge using the same PIPE_GAP.
   *
   * This prevents arbitrary per-node spacing forever.
   */

  const ICON_SIZE = 24;
  const ICON_RADIUS = ICON_SIZE / 2;

  // THE ONE GAP USED EVERYWHERE
  const PIPE_GAP = 12;

  /*
   * Node centers in the SVG coordinate system.
   *
   * These preserve the original visual composition.
   */
  const NODES = {
    step1: { x: 190, y: 44 },
    step2: { x: 260, y: 154 },
    step3: { x: 190, y: 264 },
    step4: { x: 360, y: 374 },
  };

  /*
   * The actual visual clearance starts AFTER the icon radius.
   *
   * Example:
   * step1 right visual edge = x + 12
   * pipe begins            = x + 12 + PIPE_GAP
   *
   * Same mathematical relationship everywhere.
   */
  const PIPE_START_OFFSET = ICON_RADIUS + PIPE_GAP;

  /*
   * ============================================================
   * TRACK GEOMETRY
   * ============================================================
   */

  // STEP 1 → STEP 2
  const track1StartX = NODES.step1.x + PIPE_START_OFFSET;
  const track1EndY = NODES.step2.y - PIPE_START_OFFSET;

  const track1 = `
    M ${track1StartX} ${NODES.step1.y}
    L 245 ${NODES.step1.y}
    Q 260 ${NODES.step1.y} 260 59
    L 260 ${track1EndY - 6}
  `;

  // STEP 2 → STEP 3
  const track2StartX = NODES.step2.x - PIPE_START_OFFSET;
  const track2EndY = NODES.step3.y - PIPE_START_OFFSET;

  const track2 = `
    M ${track2StartX} ${NODES.step2.y}
    L 205 ${NODES.step2.y}
    Q 190 ${NODES.step2.y} 190 169
    L 190 ${track2EndY - 6}
  `;

  // STEP 3 → STEP 4
  const track3StartX = NODES.step3.x + PIPE_START_OFFSET;
  const track3EndY = NODES.step4.y - 30;

  const track3 = `
    M ${track3StartX} ${NODES.step3.y}
    L 345 ${NODES.step3.y}
    Q 360 ${NODES.step3.y} 360 279
    L 360 ${track3EndY - 6}
  `;

  useEffect(() => {
    let t1;
    let t2;
    let t3;
    let t4;
    let t5;
    let tReset;

    const runCycle = () => {
      setStage(0);

      t1 = setTimeout(() => {
        setStage(1);

        t2 = setTimeout(() => {
          setStage(2);

          t3 = setTimeout(() => {
            setStage(3);

            t4 = setTimeout(() => {
              setStage(4);

              t5 = setTimeout(() => {
                setStage(5);

                tReset = setTimeout(runCycle, 400);
              }, 1350);
            }, 250);
          }, 680);
        }, 500);
      }, 500);
    };

    runCycle();

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(tReset);
    };
  }, []);

  return (
    <div className="serpentine-polished-stage">

      {/* =========================================================
          PIPE SYSTEM
          ========================================================= */}
      <svg
        viewBox="0 0 460 430"
        xmlns="http://www.w3.org/2000/svg"
        className="polished-svg-canvas"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="neonLaserBeam"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#0000FF" />
            <stop offset="50%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#0000FF" />
          </linearGradient>

          <filter
            id="electricGlow"
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
          >
            <feGaussianBlur
              stdDeviation="3.5"
              result="glow"
            />

            <feComposite
              in="SourceGraphic"
              in2="glow"
              operator="over"
            />
          </filter>
        </defs>

        {/* =====================================================
            BASE RAILS
            ===================================================== */}

        <path
          d={track1}
          stroke="rgba(0, 0, 255, 0.22)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d={track2}
          stroke="rgba(0, 0, 255, 0.22)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d={track3}
          stroke="rgba(0, 0, 255, 0.22)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* =====================================================
            TRACK 1 LASER
            ===================================================== */}

        <motion.path
          d={track1}
          stroke="url(#neonLaserBeam)"
          strokeWidth="4.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="40 1000"
          filter="url(#electricGlow)"
          initial={{
            strokeDashoffset: 40,
            opacity: 0
          }}
          animate={
            stage === 0
              ? {
                  strokeDashoffset: [40, -240],
                  opacity: [0, 1, 1, 0]
                }
              : {
                  opacity: 0
                }
          }
          transition={{
            duration: 0.48,
            ease: "easeInOut",
            times: [0, 0.1, 0.9, 1]
          }}
        />

        {/* Arrow ends EXACTLY at the shared gap boundary */}
        <polygon
          points={`
            253,${track1EndY - 13}
            267,${track1EndY - 13}
            260,${track1EndY}
          `}
          fill="var(--accent)"
        />

        {/* =====================================================
            TRACK 2 LASER
            ===================================================== */}

        <motion.path
          d={track2}
          stroke="url(#neonLaserBeam)"
          strokeWidth="4.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="40 1000"
          filter="url(#electricGlow)"
          initial={{
            strokeDashoffset: 40,
            opacity: 0
          }}
          animate={
            stage === 1
              ? {
                  strokeDashoffset: [40, -240],
                  opacity: [0, 1, 1, 0]
                }
              : {
                  opacity: 0
                }
          }
          transition={{
            duration: 0.48,
            ease: "easeInOut",
            times: [0, 0.1, 0.9, 1]
          }}
        />

        <polygon
          points={`
            183,${track2EndY - 13}
            197,${track2EndY - 13}
            190,${track2EndY}
          `}
          fill="var(--accent)"
        />

        {/* =====================================================
            TRACK 3 LASER
            ===================================================== */}

        <motion.path
          d={track3}
          stroke="url(#neonLaserBeam)"
          strokeWidth="4.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="40 1000"
          filter="url(#electricGlow)"
          initial={{
            strokeDashoffset: 40,
            opacity: 0
          }}
          animate={
            stage === 2
              ? {
                  strokeDashoffset: [40, -240],
                  opacity: [0, 1, 1, 0]
                }
              : {
                  opacity: 0
                }
          }
          transition={{
            duration: 0.58,
            ease: "easeInOut",
            times: [0, 0.1, 0.9, 1]
          }}
        />

        <polygon
          points={`
            353,${track3EndY - 13}
            367,${track3EndY - 13}
            360,${track3EndY}
          `}
          fill="var(--accent)"
        />
      </svg>


      {/* =========================================================
          STEP 1
          ========================================================= */}

      <div
        className={`pipeline-node node-pos-1 ${
          stage === 0 ? "node-active" : ""
        }`}
      >
        <span
          className="step-arabic-title"
          dir="rtl"
        >
          صناعة الإعلان والـ <bdi>Hook</bdi>
        </span>

        <div className="micro-icon-disc">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <rect
              x="2"
              y="4"
              width="20.5"
              height="16"
              rx="4.5"
              stroke="var(--accent)"
              strokeWidth="3"
            />

            <polygon
              points="9.5 8 16.5 12 9.5 16"
              fill="var(--accent)"
            />
          </svg>
        </div>
      </div>


      {/* =========================================================
          STEP 2
          ========================================================= */}

      <div
        className={`pipeline-node node-pos-2 ${
          stage === 1 ? "node-active" : ""
        }`}
      >
        <div className="micro-icon-disc cyan-disc">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="10.5"
              stroke="var(--accent)"
              strokeWidth="3"
            />

            <line
              x1="12"
              y1="0"
              x2="12"
              y2="4.5"
              stroke="var(--accent)"
              strokeWidth="3"
              strokeLinecap="round"
            />

            <line
              x1="12"
              y1="19.5"
              x2="12"
              y2="24"
              stroke="var(--accent)"
              strokeWidth="3"
              strokeLinecap="round"
            />

            <line
              x1="0"
              y1="12"
              x2="4.5"
              y2="12"
              stroke="var(--accent)"
              strokeWidth="3"
              strokeLinecap="round"
            />

            <line
              x1="19.5"
              y1="12"
              x2="24"
              y2="12"
              stroke="var(--accent)"
              strokeWidth="3"
              strokeLinecap="round"
            />

            <circle
              cx="12"
              cy="12"
              r="3.5"
              fill="var(--accent)"
            />
          </svg>
        </div>

        <span
          className="step-arabic-title"
          dir="rtl"
        >
          ضبط الاستهداف والجمهور
        </span>
      </div>


      {/* =========================================================
          STEP 3
          ========================================================= */}

      <div
        className={`pipeline-node node-pos-3 ${
          stage === 2 ? "node-active" : ""
        }`}
      >
        <span
          className="step-arabic-title"
          dir="rtl"
        >
          نقرة مهتمة بالشراء
        </span>

        <div className="micro-icon-disc step-3-base-disc">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(0,0,255,0.4)"
            strokeWidth="3"
          >
            <circle
              cx="12"
              cy="12"
              r="10.5"
              strokeDasharray="4 4"
            />
          </svg>

          {(stage <= 1 || stage === 5) && (
            <motion.div
              initial={{
                scale: 0,
                opacity: 0
              }}
              animate={{
                scale: [0, 1.25, 1],
                opacity: 1
              }}
              transition={{
                duration: 0.45,
                ease: [
                  0.175,
                  0.885,
                  0.32,
                  1.275
                ]
              }}
              className="step-3-nested-cursor"
            >
              <svg
  width="23"
  height="23"
  viewBox="0 0 24 24"
  fill="#FFFFFF"
  stroke="#0F172A"
  strokeWidth="1.8"
  strokeLinejoin="round"
  className="cursor-svg-shadow"
>
                <path d="M4 2L18.5 13L11.5 14.5L14.5 21L12 22L9 15.5L4 20.5L4 2Z" />
              </svg>
            </motion.div>
          )}
        </div>
      </div>


      {/* =========================================================
          STEP 4 — CONVERSION
          ========================================================= */}

      <div
        className={`pipeline-node node-pos-4 ${
          stage >= 3 ? "node-active" : ""
        }`}
      >
        <span
          className={`step-arabic-title ${
            stage === 4 ? "active-title" : ""
          }`}
          dir="rtl"
        >
          إتمام الطلب والتحويل
        </span>

        <div className="conversion-tactile-assembly">
          <motion.div
            animate={
              stage === 3
                ? {
                    scale: 0.94
                  }
                : stage === 4
                  ? {
                      scale: [0.94, 1.12, 1]
                    }
                  : {
                      scale: 1
                    }
            }
            transition={{
              duration: 0.35,
              ease: [
                0.175,
                0.885,
                0.32,
                1.275
              ]
            }}
            className={`tactile-pill-btn ${
              stage === 4
                ? "btn-morphed-success"
                : ""
            }`}
          >
            <div className="btn-morph-slider">

              <div
                className="morph-text-row"
                style={{
                  opacity:
                    stage === 4
                      ? 0
                      : 1,

                  transform:
                    stage === 4
                      ? "translateY(-14px)"
                      : "translateY(0)",

                  transition:
                    "opacity 0.25s ease, transform 0.25s ease"
                }}
              >
                <span className="btn-arabic-text">
                  اطلب الآن
                </span>

                <span style={{ fontSize: "10px" }}>
                  ←
                </span>
              </div>


              <div
                className="morph-text-row"
                style={{
                  opacity:
                    stage === 4
                      ? 1
                      : 0,

                  transform:
                    stage === 4
                      ? "translateY(0)"
                      : "translateY(14px)",

                  transition:
                    "opacity 0.25s ease, transform 0.25s ease"
                }}
              >
                <span className="btn-check-circle">
                  ✓
                </span>

                <span className="btn-arabic-text">
                  تم تأكيد الطلب
                </span>
              </div>

            </div>
          </motion.div>
        </div>
      </div>


      {/* =========================================================
          TRAVELING CURSOR
          ========================================================= */}

      {(stage >= 2 && stage <= 4) && (
        <motion.div
          className="living-organic-cursor"
          initial={{
            left: NODES.step3.x,
            top: NODES.step3.y,
            opacity: 1,
            scale: 1
          }}
          animate={
            stage === 2
              ? {
                  left: NODES.step4.x,
                  top: NODES.step4.y,
                  opacity: 1,
                  scale: 1,

                  transition: {
                    duration: 0.68,
                    ease: [0.25, 1, 0.5, 1]
                  }
                }

              : stage === 3
                ? {
                    left: NODES.step4.x,
                    top: NODES.step4.y,
                    opacity: 1,
                    scale: 0.84,

                    transition: {
                      duration: 0.12
                    }
                  }

                : {
                    left: NODES.step4.x,
                    top: NODES.step4.y,

                    opacity: [1, 1, 0],

                    scale: [0.84, 1, 0],

                    transition: {
                      duration: 1.3,
                      times: [0, 0.2, 1],
                      ease: "easeInOut"
                    }
                  }
          }
        >
          {stage === 4 && (
            <span className="shockwave-pulse-ring" />
          )}

          <svg
  width="23"
  height="23"
  viewBox="0 0 24 24"
  fill="#FFFFFF"
  stroke="#0F172A"
  strokeWidth="1.8"
  strokeLinejoin="round"
  className="cursor-svg-shadow"
>
            <path d="M4 2L18.5 13L11.5 14.5L14.5 21L12 22L9 15.5L4 20.5L4 2Z" />
          </svg>
        </motion.div>
      )}
    </div>
  );
}

export default function MediaBuyingLanding() {
  const words = ["أرباحا", "استقرارا", "نموا", "مبيعات"];
  const [wordIdx, setWordIdx] = useState(0);
  const formAnchorRef = React.useRef(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  useEffect(() => {
    const timer = setInterval(() => {
      setWordIdx((prev) => (prev + 1) % words.length);
    }, 1000);
    return () => clearInterval(timer);
  }, [words.length]);

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [phoneSubmitAttempted, setPhoneSubmitAttempted] = useState(false);
  const [selectedPack, setSelectedPack] = useState("باقة النمو");
  const [projectInfo, setProjectInfo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const formControls = useAnimation();
  const phoneIsInvalid = phoneSubmitAttempted && !ALGERIAN_MOBILE_REGEX.test(clientPhone.trim());

  const handleBookingNavigation = (event) => {
    event.preventDefault();
    setMobileMenuOpen(false);
    window.history.replaceState(null, '', '#booking');
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();

    if (!clientName.trim() || !clientPhone.trim() || !ALGERIAN_MOBILE_REGEX.test(clientPhone.trim())) {
      setPhoneSubmitAttempted(true);
      formControls.start({
        x: [0, -8, 8, -6, 6, -3, 3, 0],
        transition: { duration: 0.35, ease: "easeInOut" }
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const docRef = await addDoc(collection(db, "leads"), {
        name: clientName.trim(),
        phone: clientPhone.trim(),
        email: clientEmail.trim(),
        pack: selectedPack,
        projectInfo: projectInfo.trim(),
        status: 'new',
        createdAt: serverTimestamp()
      });

      triggerGoogleSheetWebhook({
        id: docRef.id,
        name: clientName.trim(),
        phone: clientPhone.trim(),
        email: clientEmail.trim(),
        pack: selectedPack,
        projectInfo: projectInfo.trim(),
        status: 'new',
        notes: '',
        date: new Date().toISOString()
      });

      // انتقال CSS ناعم وفوري دون قفز
      setIsSwitching(true);
      setTimeout(() => {
        setIsSuccess(true);
        setIsSubmitting(false);
        setIsSwitching(false);
        formAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 190);

    } catch (err) {
      console.error("Error saving lead:", err);
      setIsSubmitting(false);
      alert("حدث خطأ أثناء إرسال البيانات. يرجى إعادة المحاولة.");
    }
  };

  const handleResetForm = () => {
    setIsSwitching(true);
    setTimeout(() => {
      setIsSuccess(false);
      setClientName("");
      setClientPhone("");
      setPhoneSubmitAttempted(false);
      setClientEmail("");
      setProjectInfo("");
      setIsSwitching(false);
      formAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 190);
  };

  return (
    <div className="app-wrapper">
      <div className="aurora-fixed-canvas" aria-hidden="true">
        <div className="aurora-orb orb-hero" />
        <div className="aurora-orb orb-middle" />
        <div className="aurora-orb orb-bottom" />
      </div>

      <div className="page-content-layer">
        
        <header className={`site-header ${mobileMenuOpen ? 'menu-open' : ''}`}>
  <div className="header-inner">
    <Link href="/" className="header-brand" onClick={() => setMobileMenuOpen(false)}>
      <BrandIcons.Logo size={36} color="var(--accent)" />
      <span className="header-brand-text">Boostra Agency</span>
    </Link>

    {/* روابط سطح المكتب */}
    <ul className="header-nav-links">
      <li><Link href="/">الرئيسية</Link></li>
      <li><Link href="/gifts">الهدايا</Link></li>
      <li><Link href="/gallery">معرض النتائج</Link></li>
      <li><Link href="#booking" onClick={handleBookingNavigation}>تواصل معنا</Link></li>
    </ul>

    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <Link href="#booking" onClick={handleBookingNavigation} className="btn-action header-cta-desktop" style={{ padding: '10px 20px', fontSize: '0.9rem', textDecoration: 'none' }}>
        حجز استشارة
      </Link>

      <button 
        type="button"
        className="hamburger-toggle-btn"
        onClick={() => setMobileMenuOpen(prev => !prev)}
        aria-label="تبديل القائمة"
      >
        {mobileMenuOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>
    </div>
  </div>

  {/* القائمة المنسدلة */}
  <div className="header-dropdown-menu">
    <ul className="dropdown-nav-list">
      <li>
        <Link href="/" onClick={() => setMobileMenuOpen(false)}>
          <span>الرئيسية</span>
          <span style={{ color: 'var(--text-dim)' }}>←</span>
        </Link>
      </li>
      <li>
        <Link href="/gifts" onClick={() => setMobileMenuOpen(false)}>
          <span>الهدايا</span>
          <span style={{ color: 'var(--text-dim)' }}>←</span>
        </Link>
      </li>
      <li>
  <Link href="/gallery" onClick={() => setMobileMenuOpen(false)}>
    <span>معرض النتائج</span>
    <span style={{ color: 'var(--text-dim)' }}>←</span>
  </Link>
</li>
      <li>
        <Link href="#booking" onClick={handleBookingNavigation}>
          <span>تواصل معنا</span>
          <span style={{ color: 'var(--text-dim)' }}>←</span>
        </Link>
      </li>
    </ul>

    <div className="dropdown-cta-box">
      <Link 
        href="#booking" 
        onClick={handleBookingNavigation}
        className="btn-action" 
        style={{ width: '100%', textDecoration: 'none', padding: '12px 20px', fontSize: '0.95rem' }}
      >
        حجز استشارة الآن
      </Link>
    </div>
  </div>
</header>

        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 24px', paddingTop: '110px' }}>
          
          {/* HERO SECTION */}
          <section style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', padding: '30px 0 50px' }}>
            <div className="hero-layout">
              <div className="hero-text-block">
                <h1 className="hero-headline">
                  <span className="hero-line-1">من متجر إلكتروني عابر...</span>
                  <span className="hero-line-2">
                    <span>إلى</span>
                    <span className="brand-spark-anchor">
                      <span>براند</span>
                      <span className="sparks-emitter" aria-hidden="true">
                        <span className="spark-star sp-1"><BrandIcons.SparkStar size={11} /></span>
                        <span className="spark-star sp-2"><BrandIcons.SparkStar size={13} /></span>
                        <span className="spark-star sp-3"><BrandIcons.SparkStar size={10} /></span>
                        <span className="spark-star sp-4"><BrandIcons.SparkStar size={12} /></span>
                        <span className="spark-star sp-5"><BrandIcons.SparkStar size={9} /></span>
                        <span className="spark-star sp-6"><BrandIcons.SparkStar size={12} /></span>
                      </span>
                    </span>
                    <span>يحقق</span>
                    <span className="word-flipper-grid">
                      <span className="ghost-placeholder">استقرارا</span>
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={wordIdx}
                          className="active-flipper-word"
                          initial={{ opacity: 0, y: 12, filter: 'blur(5px)' }}
                          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                          exit={{ opacity: 0, y: -12, filter: 'blur(5px)' }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        >
                          {words[wordIdx]}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                  </span>
                </h1>

                <p className="hero-desc">
                  أقدّم خدمة إدارة وتحسين الحملات الإعلانية المدفوعة، بداية من دراسة الجمهور والسوق، وبناء الاستراتيجية والـ Funnel، إلى إطلاق الحملات واختبار الـ Creatives، بهدف خفض تكلفة الحصول على الزبون وزيادة المبيعات والـ Leads.
                </p>

                <div className="hero-btn-group" style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <a href="#booking" className="btn-action" style={{ textDecoration: 'none' }}>
                    ابدأ نمو مشروعك الآن <BrandIcons.ArrowLeft />
                  </a>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    حملات ناجحة بالجزائر والخليج العربي
                  </span>
                </div>
              </div>

              {/* INCLINED MOCKUP REPLACED WITH ACCELERATED PIPELINE */}
<div className="mockup-container">
  <SerpentinePipeline />
</div>
            </div>
          </section>

          {/* 4. ENLARGED BORDERLESS MARQUEE (Larger Logos + Country Flags) */}
          <section id="clients" style={{ padding: '28px 0 44px' }}>
            <div style={{ textAlign: 'center', marginBottom: '22px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.3px' }}>
                علامات تجارية ومشاريع نرافقها في الجزائر والخليج العربي
              </span>
            </div>

            <div className="marquee-shell">
              <div className="marquee-rail">
                {[...PREVIOUS_CLIENTS, ...PREVIOUS_CLIENTS].map((client, idx) => (
                  <div key={idx} className="client-minimal-item">
                    
                    {/* Enlarged 56px Logo Slot */}
                    <div className="client-logo-slot">
                      {client.logo ? (
                        <img 
                          src={client.logo} 
                          alt={client.name}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.nextSibling) {
                              e.currentTarget.nextSibling.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <span 
                        style={{ 
                          display: client.logo ? 'none' : 'flex',
                          fontWeight: 700, 
                          fontSize: '1.05rem', 
                          color: 'var(--accent)' 
                        }}
                      >
                        {client.name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    <div className="client-meta-stack">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="client-name-text">{client.name}</span>
                        <span style={{ fontSize: '0.9rem' }}>{client.flag}</span>
                      </div>
                      <span className="client-followers-text">{client.tag}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* STRATEGIC SHIFT */}
          <section id="shift" style={{ padding: '60px 0' }}>
            <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 44px' }}>
              <h2 className="section-title">الفرق بين "بائع سلع عابر" و "علامة تجارية"</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6, margin: 0 }}>
                المتاجر التي تعتمد على صفقات عشوائية تنهار مع أول زيادة في تكلفة الإعلانات. نبني معك أصولا تعود عليك بالربح المستمر.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '24px', alignItems: 'stretch' }}>
              <div className="integrated-chassis-card bento-unit">
                <div className="card-content-stack">
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '1.25rem', fontWeight: 700 }}>نموذج E-Commerce التقليدي</h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    <li>• منافسة شرسة على حرق الأسعار وتآكل هامش الربح.</li>
                    <li>• تكلفة الاستحواذ على الزبون (CAC) غير ثابتة .</li>
                    <li>• زبون يشتري لمرة واحدة ولا يتذكر اسم المتجر.</li>
                    <li>• توقف الحملات الممولة يعني انعدام الطلبيات فورا.</li>
                  </ul>
                </div>
                <UnifiedBrandPattern />
              </div>

              <div className="integrated-chassis-card highlight-card bento-unit">
                <div className="card-content-stack">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent)' }}>نموذج البراند الحقيقي (هدفنا)</h3>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px', color: 'var(--text-main)', fontWeight: 500, fontSize: '0.95rem' }}>
                    <li>✓ ولاء وثقة: الزبون يطلب المنتجات بالاسم لجودتها.</li>
                    <li>✓ قيمة الزبون الدائمة (LTV) تضاعف أرباحك على المدى الطويل.</li>
                    <li>✓ تدفق طلبيات متكررة وعضوية بدون تكلفة إعلانية إضافية.</li>
                    <li>✓ تسعير مرن ومربح يحمي أرباحك من تقلبات السوق.</li>
                  </ul>
                </div>
                <UnifiedBrandPattern />
              </div>
            </div>
          </section>

          {/* SUPPORTED PLATFORMS */}
          <section id="platforms" style={{ padding: '50px 0', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 8px 0' }}>المنصات الإعلانية التي نعمل بها </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>نختار المنصة المناسبة لطبيعة منتجك وجمهورك لتحقيق أقل تكلفة اقتناء</p>
            </div>

            <div className="platform-badge-grid">
              {AD_PLATFORMS.map((plat, i) => (
                <div key={i} className={`client-badge-item platform-badge-item ${plat.name === 'Apple Search Ads' ? 'apple-platform-badge' : ''}`} style={{ background: '#FFFFFF', padding: '12px 24px' }}>
                  <span style={{ color: 'var(--accent)', display: 'flex' }}>{plat.icon}</span>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{plat.name}</span>
                </div>
              ))}
            </div>
          </section>

          {/* TEAM SECTION */}
          <section id="team" style={{ padding: '70px 0', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 44px' }}>
              <h2 className="section-title">فريق متكامل من 3 اختصاصات</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', margin: 0 }}>
                لن يدير شخص واحد كل مهام متجرك؛ كل زاوية نمو يتولاها متخصص لتحقيق نتائج رقمية واضحة.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '20px' }}>
              {TEAM_MEMBERS.map((spec, i) => (
                <div key={i} className="integrated-chassis-card bento-unit">
                  <div className="card-content-stack">
                    <div style={{ display: 'inline-block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)', background: 'var(--accent-surface)', padding: '4px 10px', borderRadius: '6px', marginBottom: '16px' }}>
                      {spec.tag}
                    </div>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '1.15rem', fontWeight: 700 }}>{spec.role}</h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.65 }}>{spec.focus}</p>
                  </div>
                  <UnifiedBrandPattern />
                </div>
              ))}
            </div>
          </section>

          {/* PACKAGES SECTION (CENTER IS POPULAR "باقة النمو") */}
          <section id="packages" style={{ padding: '60px 0 80px' }}>
            <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 44px' }}>
              <h2 className="section-title">باقات إدارة ونمو الحملات</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', margin: 0 }}>
                اختر نطاق الخدمة الذي يناسب مرحلة مشروعك الحالية وحجم المبيعات المستهدف.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 310px), 1fr))', gap: '24px', alignItems: 'stretch' }}>
              {PACKAGES.map((pkg, idx) => (
                <div 
                  key={idx} 
                  className={`integrated-chassis-card bento-unit ${pkg.highlight ? 'highlight-card' : ''}`}
                  style={{ display: 'flex', flexDirection: 'column' }}
                >
                  <div className="card-content-stack" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: '20px' }}>
                      {pkg.highlight && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)', background: 'var(--accent-surface)', padding: '4px 10px', borderRadius: '6px', display: 'inline-block', marginBottom: '10px' }}>
                          الأكثر طلبا للتوسع والهيمنة
                        </span>
                      )}
                      <h3 style={{ margin: '0 0 6px 0', fontSize: '1.35rem', fontWeight: 700 }}>{pkg.title}</h3>
                      <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>{pkg.subtitle}</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '24px' }}>
                      <span style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--text-main)' }}>{pkg.price}</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>د.ج / شهر</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px', flex: 1 }}>
                      {pkg.features.map((feat, fIdx) => (
                        <div key={fIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                          <span style={{ color: 'var(--accent)', marginTop: '2px' }}><BrandIcons.Check size={16} /></span>
                          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{feat}</span>
                        </div>
                      ))}
                    </div>

                    <a 
                      href="#booking"
                      onClick={() => setSelectedPack(pkg.title)}
                      className={`btn-action ${pkg.highlight ? 'btn-pack-primary' : 'btn-pack-secondary'}`}
                      style={{ width: '100%', textDecoration: 'none', marginTop: 'auto' }}
                    >
                      اختيار هذه الباقة
                    </a>
                  </div>

                  <UnifiedBrandPattern />
                </div>
              ))}
            </div>
          </section>

          {/* UNBOXED REGISTRATION FORM SECTION */}
          <section id="booking" style={{ padding: '30px 0 10px' }}>
            <div className="architectural-marker">
              <span className="marker-hairline" />
              <div className="marker-node-step">
                <span>أنت على بعد خطوة</span>
              </div>
              <span className="marker-hairline" />
            </div>

            <div ref={formAnchorRef} className="unboxed-form-container">
              <UnifiedBrandPattern width="580px" height="340px" maxWidth="100%" maxHeight="100%" />

              <div className={`form-stage-chassis ${isSwitching ? 'micro-slide-out' : 'micro-slide-in'}`}>
                {isSuccess ? (
                  /* =========================================
                     SHALLOW THANK-YOU (PURE CSS, ZERO LAG)
                     ========================================= */
                  <div style={{ textAlign: 'center', padding: '30px 10px 20px' }}>
                    <div style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '50%',
                      background: 'var(--accent-surface)',
                      border: '1.5px solid var(--accent-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      color: 'var(--accent)'
                    }}>
                      <BrandIcons.Check size={26} />
                    </div>

                    <span style={{ 
                      display: 'inline-block', 
                      fontSize: '0.8rem', 
                      fontWeight: 700, 
                      color: 'var(--accent)', 
                      background: 'var(--accent-surface)', 
                      padding: '4px 16px', 
                      borderRadius: '100px', 
                      marginBottom: '14px',
                      letterSpacing: '0.3px'
                    }}>
                      تم استلام طلبك بنجاح
                    </span>
                    
                    <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', color: 'var(--text-main)', margin: '0 0 12px 0', fontWeight: 700 }}>
                      شكرا لك، {clientName}
                    </h2>
                    
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '500px', margin: '0 auto 28px', lineHeight: 1.65 }}>
                      تم تسجيل طلبك لباقة <strong style={{ color: 'var(--accent)' }}>{selectedPack}</strong>. سيقوم فريقنا بمراجعة التفاصيل والتواصل معك قريبا.
                    </p>

                    <div>
                      <button 
                        type="button"
                        onClick={handleResetForm}
                        className="btn-soft-reset"
                      >
                        <span>إرسال طلب إضافي</span>
                        <span style={{ fontSize: '0.9rem' }}>↺</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* =========================================
                     LIGHTWEIGHT FORM SCREEN
                     ========================================= */
                  <>
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                      <h2 className="section-title">ابدأ رحلة مضاعفة مبيعاتك</h2>
                      <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', margin: 0 }}>
                        املأ بياناتك ونبذة عن مجالك وسنتواصل معك لدراسة الأرقام ووضع الخطة
                      </p>
                    </div>

                    <motion.form 
                      noValidate
                      animate={formControls} 
                      onSubmit={handleSignupSubmit} 
                      style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}
                    >
                      <div>
                        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '10px' }}>
                          الباقة المختارة
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: '12px' }}>
                          {AVAILABLE_PACKS.map((pack) => {
                            const isSelected = selectedPack === pack;
                            return (
                              <div
                                key={pack}
                                onClick={() => setSelectedPack(pack)}
                                className={`service-pill-btn ${isSelected ? 'active' : ''}`}
                              >
                                <span style={{ fontWeight: isSelected ? 700 : 500, fontSize: '0.95rem' }}>{pack}</span>
                                
                                <div
                                  style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    background: isSelected ? 'var(--accent)' : 'var(--bg-subtle)',
                                    border: isSelected ? 'none' : '1px solid var(--border-subtle)',
                                    color: '#FFFFFF'
                                  }}
                                >
                                  {isSelected && <BrandIcons.Check size={11} />}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '6px' }}>
                          الاسم الكامل أو اسم المسؤول <span style={{ color: 'var(--accent)' }}>*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          placeholder="مثال: محمد العمري"
                          className="tactile-input-box"
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '20px' }}>
                        <div>
                          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '6px' }}>
                            رقم الهاتف (واتساب) <span style={{ color: 'var(--accent)' }}>*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            inputMode="numeric"
                            maxLength={10}
                            value={clientPhone}
                            onChange={(e) => {
                              setPhoneSubmitAttempted(false);
                              setClientPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                            }}
                            placeholder={phoneIsInvalid
                              ? 'مرفوض: 10 أرقام ويبدأ بـ 05 أو 06 أو 07'
                              : '05 / 06 / 07...'}
                            className={`tactile-input-box ${phoneIsInvalid ? 'phone-input-invalid' : ''}`}
                            style={{
                              direction: 'ltr',
                              textAlign: 'right',
                              borderColor: phoneIsInvalid ? '#DC2626' : undefined
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '6px' }}>
                            البريد الإلكتروني <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>(اختياري)</span>
                          </label>
                          <input
                            type="email"
                            value={clientEmail}
                            onChange={(e) => setClientEmail(e.target.value)}
                            placeholder="name@example.com"
                            className="tactile-input-box"
                            style={{ direction: 'ltr', textAlign: 'right' }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '6px' }}>
                          معلومات حول المتجر أو المشروع
                        </label>
                        <textarea
                          rows={3}
                          value={projectInfo}
                          onChange={(e) => setProjectInfo(e.target.value)}
                          placeholder="ما هو تخصص متجرك؟ المنتجات التي تبيعها؟ وأهم أهدافك التسويقية الحالية..."
                          className="tactile-input-box"
                          style={{ resize: 'vertical', minHeight: '85px' }}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
                        <button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="btn-action" 
                          style={{
                            width: '100%',
                            maxWidth: '380px',
                            opacity: isSubmitting ? 0.8 : 1,
                            gap: '10px',
                            backgroundColor: phoneIsInvalid ? '#DC2626' : undefined
                          }}
                        >
                          {isSubmitting ? (
                            <>
                              <span className="mini-btn-spin" />
                              <span>جاري الحفظ...</span>
                            </>
                          ) : (
                            phoneIsInvalid ? (
                              <span style={{ color: '#FFFFFF', fontSize: '0.86rem' }}>
                                مرفوض: الرقم يجب أن يكون 10 أرقام ويبدأ بـ 05 أو 06 أو 07
                              </span>
                            ) : (
                              <>
                                <span>تأكيد الطلب والانطلاق</span>
                                <BrandIcons.ArrowLeft />
                              </>
                            )
                          )}
                        </button>
                      </div>
                    </motion.form>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* =========================================
    FOOTER SECTION (BOOSTRA AGENCY)
    ========================================= */}
<footer className="site-footer">
  {/* الفاصل العلوي الطويل والخفيف */}
  <div className="footer-hairline-divider" aria-hidden="true" />

  <div className="footer-container">
    <div className="footer-grid">
      
      {/* 1. Brand Info & Purpose */}
      <div className="footer-col footer-col-brand">
        <Link href="/" className="footer-brand-header">
          <BrandIcons.Logo size={34} color="var(--accent)" />
          <span className="footer-brand-title">Boostra Agency</span>
        </Link>

        <p className="footer-brand-desc">
          وكالة ميديا باينغ (Media Buying) متخصصة في إدارة، تحسين، وتحجيم الحملات الإعلانية الممولة للمتاجر والبراندات لتحقيق أعلى عائد واستقرار للمبيعات.
        </p>

        <div className="footer-meta-pill">
          <span>🇩🇿</span>
          <span>الجزائر العاصمة، الجزائر (Algiers, Algeria)</span>
        </div>
      </div>

      {/* 2. Quick Links */}
      <div className="footer-col">
        <h4 className="footer-col-heading">روابط سريعة</h4>
        <ul className="footer-nav-list">
          <li><Link href="/">الرئيسية</Link></li>
          <li><Link href="/gallery">معرض النتائج</Link></li>
          <li><Link href="/gifts">دليل مجاني</Link></li>
          <li><Link href="/#booking">حجز استشارة</Link></li>
        </ul>
      </div>

      {/* 3. Media Buying Channels */}
      <div className="footer-col">
        <h4 className="footer-col-heading">قنوات الإعلانات</h4>
        <ul className="footer-nav-list">
          <li><span>إعلانات Meta (فيسبوك وإنستغرام)</span></li>
          <li><span>إعلانات TikTok Ads</span></li>
          <li><span>حملات Google Ads والبحث</span></li>
          <li><span>إعلانات Snapchat Ads</span></li>
        </ul>
      </div>

      {/* 4. Direct Communication */}
      <div className="footer-col">
        <h4 className="footer-col-heading">تواصل مباشر</h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 14px 0' }}>
          جاهز لتحجيم مبيعات متجرك وخفض تكلفة الاستحواذ؟ تواصل معنا عبر الواتساب فورا.
        </p>
        
        <a 
          href="https://wa.me/213794915286" 
          target="_blank" 
          rel="noreferrer"
          className="footer-whatsapp-cta"
        >
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <BrandIcons.Whatsapp />
          </span>
          <span style={{ direction: 'ltr', fontWeight: 600, fontSize: '0.95rem' }}>+213 794 91 52 86</span>
        </a>
      </div>

    </div>

    {/* شريط الحقوق السفلي */}
    <div className="footer-bottom-bar">
      <span>© {new Date().getFullYear()} Boostra Agency. جميع الحقوق محفوظة.</span>
      <span className="footer-tagline">إدارة إعلانات مبنية على الأرقام الحقيقية.</span>
    </div>

    {/* استدعاء نفس الباترن الموحد في قاع الفوتر */}
    <UnifiedBrandPattern width="420px" height="240px" opacity={0.35} />
  </div>
</footer>
        </div>

        {/* FLOATING WHATSAPP CTA */}
        <a 
          href="https://wa.me/213794915286" 
          target="_blank" 
          rel="noreferrer"
          aria-label="WhatsApp"
          style={{
            position: 'fixed',
            bottom: '26px',
            left: '26px',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#25D366',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            textDecoration: 'none',
            boxShadow: '0 8px 24px rgba(37, 211, 102, 0.4)'
          }}
        >
          <BrandIcons.Whatsapp />
        </a>
      </div>
    </div>
    
  );
}