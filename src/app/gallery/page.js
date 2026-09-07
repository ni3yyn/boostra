"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// --- THE UNIFIED BRAND PATTERN (PURE SVG, ZERO CPU LOAD) ---
// --- THE UNIFIED BRAND PATTERN (ENLARGED, CRISP & ZERO CLIPPING) ---
const UnifiedBrandPattern = ({ 
  width = "450px", 
  height = "280px", 
  opacity = 1 
}) => (
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
    <svg
      width="100%"
      height="100%"
      /* تم تصحيح الارتفاع من 310 إلى 335 لمنع قص الصف السفلي نهائيا */
      viewBox="0 0 510 335"
      preserveAspectRatio="xMinYMax meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="galleryPatternFadeVibrant" cx="0%" cy="100%" r="95%">
          {/* درجات سطوع قوية عند الزاوية تتلاشى بنعومة فائقة للداخل */}
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="45%" stopColor="white" stopOpacity="0.88" />
          <stop offset="75%" stopColor="white" stopOpacity="0.45" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id="galleryPatternMaskVibrant">
          <rect width="510" height="335" fill="url(#galleryPatternFadeVibrant)" />
        </mask>
      </defs>

      {/* تم رفع fillOpacity إلى 0.38 لإبراز اللون الأزرق الملكي / الإنديغو بوضوح */}
      <g fill="#4F46E5" fillOpacity="0.35" mask="url(#galleryPatternMaskVibrant)">
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

// --- BRAND ICONS ---
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
  ArrowLeft: () => (
    <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  ),
  Zoom: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      <line x1="11" y1="8" x2="11" y2="14"></line>
      <line x1="8" y1="11" x2="14" y2="11"></line>
    </svg>
  ),
  Close: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
};

// --- DATASET: 100% REAL PRACTITIONER LANGUAGE ---
const PROOF_CARDS = [
  {
    id: 'meta-super-cpr',
    category: 'meta',
    colSpan: 'bento-col-7',
    platform: 'Meta Ads Manager',
    title: 'حملة تفاعل وتوسيع وصول لحساب براند ناشئ',
    urlDisplay: 'adsmanager.facebook.com/engagement_reach',
    imageSrc: '/gallery/meta-interaction-13k.webp',
    metrics: [
      { val: '0.00066 $', lbl: 'تكلفة التفاعل (CPE)' },
      { val: '13,659', lbl: 'إجمالي التفاعلات' },
      { val: '726', lbl: 'نقرة للمتجر' }
    ]
  },
  {
    id: 'semrush-intent-capture',
    category: 'search',
    colSpan: 'bento-col-5',
    platform: 'SEMrush Analytics',
    title: 'تحليل حجم الطلب على كلمات البحث عالية النية',
    urlDisplay: 'semrush.com/keywordoverview',
    imageSrc: '/gallery/semrush-keyword-shinda.jpg.webp',
    metrics: [
      { val: '49.4K', lbl: 'معدل البحث الشهري' },
      { val: '0.20 €', lbl: 'متوسط كلفة النقرة (CPC)' },
      { val: '25%', lbl: 'صعوبة الكلمة (KD)' }
    ]
  },
  {
    id: 'meta-messaging-funnel-1',
    category: 'meta',
    colSpan: 'bento-col-6',
    platform: 'Meta Sales & Messenger',
    title: 'حملة رسائل مباشرة لطلبات الشراء الفورية',
    urlDisplay: 'business.facebook.com/direct_sales',
    imageSrc: '/gallery/meta-messages-180.webp',
    metrics: [
      { val: '0.049 $', lbl: 'تكلفة المحادثة (Cost/Msg)' },
      { val: '180', lbl: 'محادثة شراء بدأت' },
      { val: '8.96 $', lbl: 'إجمالي الصرف' }
    ]
  },
  {
    id: 'meta-messaging-scale',
    category: 'meta',
    colSpan: 'bento-col-6',
    platform: 'Meta Ads Manager',
    title: 'تحجيم حملة محادثات لاكتساب عملاء جدد',
    urlDisplay: 'business.facebook.com/campaign_scale',
    imageSrc: '/gallery/meta-messages-159.webp',
    metrics: [
      { val: '0.089 $', lbl: 'تكلفة الزبون (Cost/Lead)' },
      { val: '159', lbl: 'طلب عبر المحادثة' },
      { val: '41.5K', lbl: 'الوصول الفعلي (Reach)' }
    ]
  },
  {
    id: 'semrush-domain-authority',
    category: 'search',
    colSpan: 'bento-col-7',
    platform: 'SEMrush Organic Research',
    title: 'نمو حركة الزيارات العضوية وتصدر نتائج جوجل',
    urlDisplay: 'semrush.com/domain/organic_growth',
    imageSrc: '/gallery/semrush-domain-growth.jpg.webp',
    metrics: [
      { val: '943', lbl: 'كلمة في النتائج الأولى' },
      { val: '797', lbl: 'زيارة شهرية مجانية' },
      { val: '113', lbl: 'رابط خلفي معتمد (Backlinks)' }
    ]
  },
  {
    id: 'meta-engagement-boost',
    category: 'meta',
    colSpan: 'bento-col-5',
    platform: 'Meta Brand Building',
    title: 'حملة انتشار وتفاعل عند إطلاق تشكيلة جديدة',
    urlDisplay: 'adsmanager.facebook.com/product_launch',
    imageSrc: '/gallery/meta-interaction-3k.webp',
    metrics: [
      { val: '0.003 $', lbl: 'تكلفة التفاعل' },
      { val: '3,617', lbl: 'تفاعل مع المنشور' },
      { val: '426', lbl: 'نقرة فعلية للرابط' }
    ]
  },
  {
    id: 'google-ads-planner-sneaker',
    category: 'search',
    colSpan: 'bento-col-6',
    platform: 'Google Keyword Planner',
    title: 'حصر الفرص والكلمات لحملات البحث (Search Ads)',
    urlDisplay: 'ads.google.com/keywordplanner',
    imageSrc: '/gallery/google-ads-sneaker.jpg.webp',
    metrics: [
      { val: '10K - 100K', lbl: 'نطاق البحث الشهري' },
      { val: '0.19 €', lbl: 'المزايدة الدنيا للظهور' },
      { val: '1,734', lbl: 'كلمة بحث مكتشفة' }
    ]
  },
  {
    id: 'semrush-magic-longtail',
    category: 'search',
    colSpan: 'bento-col-6',
    platform: 'SEMrush Magic Tool',
    title: 'استخراج الكلمات الطويلة (Long-Tail) منخفضة التكلفة',
    urlDisplay: 'semrush.com/keywordmagic',
    imageSrc: '/gallery/semrush-magic-shinda.jpg.webp',
    metrics: [
      { val: '89.6K', lbl: 'مجموع حجم البحث' },
      { val: '2,807', lbl: 'كلمة شراء مستهدفة' },
      { val: '16%', lbl: 'مؤشر المنافسة' }
    ]
  },
  {
    id: 'seo-content-strategy-siwak',
    category: 'search',
    colSpan: 'bento-col-12',
    platform: 'Google Search & SEO Analysis',
    title: 'خطة الكلمات المفتاحية لمنتجات طبيعية عالية الطلب',
    urlDisplay: 'search.google.com/console',
    imageSrc: '/gallery/seo-content-siwak.jpg.webp',
    metrics: [
      { val: '5,400+', lbl: 'بحث شهري للكلمة الرئيسية' },
      { val: '0.08 €', lbl: 'كلفة النقرة البديلة' },
      { val: '100%', lbl: 'زيارات مجانية (Organic)' }
    ]
  }
];

const SUB_TABS = [
  { id: 'all', label: 'جميع الحملات', count: '9' },
  { id: 'meta', label: 'إعلانات Meta', count: '4' },
  { id: 'search', label: 'محركات البحث والـ SEO', count: '5' }
];

export default function GalleryPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [activeModalData, setActiveModalData] = useState(null);

  // --- PURE JS REFS FOR ULTRA-FAST HARDWARE SLIDING INDICATOR ---
  const tabRefs = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({
    transform: 'translate3d(0, 0, 0)',
    width: 0,
    opacity: 0
  });

  // تحديث موقع مؤشر التبويب بـ Pure JavaScript بدون أي re-renders مكلفة
  useEffect(() => {
    const updateIndicator = () => {
      const el = tabRefs.current[activeTab];
      if (el) {
        setIndicatorStyle({
          transform: `translate3d(${el.offsetLeft}px, 0, 0)`,
          width: el.offsetWidth,
          opacity: 1
        });
      }
    };

    updateIndicator();
    window.addEventListener('resize', updateIndicator, { passive: true });
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeTab]);

  // --- معالج زر الرجوع في الموبايل + زر Esc + إيقاف التمرير بدون أي مكتبات ---
  useEffect(() => {
    if (!activeModalData) return;

    window.history.pushState({ modalOpen: true }, '');

    const handlePopState = () => {
      setActiveModalData(null);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [activeModalData]);

  const closeModal = () => {
    if (window.history.state?.modalOpen) {
      window.history.back();
    } else {
      setActiveModalData(null);
    }
  };

  const filteredCards = PROOF_CARDS.filter((c) => {
    if (activeTab === 'all') return true;
    return c.category === activeTab;
  });

  return (
    <div className="app-wrapper">
      {/* 1. AURORA FIXED CANVAS */}
      <div className="aurora-fixed-canvas" aria-hidden="true">
        <div className="aurora-orb orb-hero" />
        <div className="aurora-orb orb-middle" />
        <div className="aurora-orb orb-bottom" />
      </div>

      <div className="page-content-layer">

        {/* 2. SITE HEADER */}
        <header className={`site-header ${mobileMenuOpen ? 'menu-open' : ''}`}>
          <div className="header-inner">
            <Link href="/" className="header-brand" onClick={() => setMobileMenuOpen(false)}>
              <BrandIcons.Logo size={36} color="var(--accent)" />
              <span className="header-brand-text">Boostra Agency</span>
            </Link>

            <ul className="header-nav-links">
              <li><Link href="/">الرئيسية</Link></li>
              <li><Link href="/gifts">المتجر</Link></li>
              <li><Link href="/gallery" style={{ color: 'var(--accent)', fontWeight: 700 }}>معرض النتائج</Link></li>
              <li><Link href="/#booking">تواصل معنا</Link></li>
            </ul>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link 
                href="/#booking" 
                className="btn-action header-cta-desktop" 
                style={{ padding: '10px 20px', fontSize: '0.9rem', textDecoration: 'none' }}
              >
                حجز استشارة
              </Link>

              <button 
                type="button" 
                className="hamburger-toggle-btn"
                onClick={() => setMobileMenuOpen(prev => !prev)}
                aria-label="القائمة"
              >
                {mobileMenuOpen ? <BrandIcons.Close /> : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                )}
              </button>
            </div>
          </div>

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
                  <span>المتجر</span>
                  <span style={{ color: 'var(--text-dim)' }}>←</span>
                </Link>
              </li>
              <li>
                <Link href="/gallery" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--accent)' }}>
                  <span>معرض النتائج</span>
                  <span style={{ color: 'var(--accent)' }}>←</span>
                </Link>
              </li>
              <li>
                <Link href="/#booking" onClick={() => setMobileMenuOpen(false)}>
                  <span>تواصل معنا</span>
                  <span style={{ color: 'var(--text-dim)' }}>←</span>
                </Link>
              </li>
            </ul>

            <div className="dropdown-cta-box">
              <Link 
                href="/#booking" 
                onClick={() => setMobileMenuOpen(false)} 
                className="btn-action" 
                style={{ width: '100%', textDecoration: 'none', padding: '12px 20px', fontSize: '0.95rem' }}
              >
                حجز استشارة الآن
              </Link>
            </div>
          </div>
        </header>

        {/* 3. MAIN CONTENT */}
        <main style={{ maxWidth: '1240px', margin: '0 auto', padding: '130px 24px 90px' }}>
          
          {/* HERO */}
          <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 34px' }}>
            <h1 className="hero-headline" style={{ fontSize: 'clamp(2.1rem, 5vw, 3.2rem)', marginBottom: '14px' }}>
              <span>بيانات الحملات و</span>
              <span className="brand-spark-anchor">
                <span style={{ color: 'var(--accent)' }}>أرقام الأداء</span>
                <span className="sparks-emitter" aria-hidden="true">
                  <span className="spark-star sp-1"><BrandIcons.SparkStar size={11} /></span>
                  <span className="spark-star sp-2"><BrandIcons.SparkStar size={13} /></span>
                  <span className="spark-star sp-3"><BrandIcons.SparkStar size={10} /></span>
                  <span className="spark-star sp-4"><BrandIcons.SparkStar size={12} /></span>
                </span>
              </span>
            </h1>

            <p className="hero-desc" style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.6 }}>
              لقطات حقيقية من مديري إعلانات Meta و Google ومحركات SEMrush تظهر تفاصيل تكلفة التفاعل، الرسائل، واكتساب العملاء.
            </p>
          </div>

          {/* 4. CONTINUOUS SUBTAB BAR (PURE JS / GPU SLIDER) */}
          <div className="continuous-tab-wrapper">
            <div className="continuous-tab-container" style={{ position: 'relative' }}>
              
              {/* المؤشر المنزلق النقي: خفيف جدا ويعمل عبر كارت الشاشة */}
              <div 
                className="pure-moving-indicator"
                style={{
                  transform: indicatorStyle.transform,
                  width: `${indicatorStyle.width}px`,
                  opacity: indicatorStyle.opacity
                }}
                aria-hidden="true"
              />

              {SUB_TABS.map((tab, idx) => {
                const isActive = activeTab === tab.id;
                return (
                  <React.Fragment key={tab.id}>
                    {idx > 0 && <div className="tab-divider-line" aria-hidden="true" />}
                    
                    <button
                      ref={(el) => { tabRefs.current[tab.id] = el; }}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`tab-segment-btn ${isActive ? 'active' : ''}`}
                    >
                      <span className="tab-label-text">{tab.label}</span>
                      <span className="tab-pill-count">{tab.count}</span>
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* 5. BENTO GRID: BORDERLESS & BOTTOM-LEFT TRANSPARENT CARDS */}
          <div className={`gallery-bento-chassis ${activeTab !== 'all' ? 'filtered-grid' : ''}`}>
            {filteredCards.map((card) => (
              <div 
                key={card.id} 
                className={`gallery-soft-card ${card.colSpan}`}
              >
                <div className="gallery-card-content">
                  

                  {/* Title */}
                  <h3 className="gallery-card-title">
                    {card.title}
                  </h3>

                  {/* Clean Non-Boxed Metrics */}
                  <div className="gallery-metric-row">
                    {card.metrics.map((m, idx) => (
                      <div key={idx} className="gallery-metric-item">
                        <span className="gallery-metric-val">{m.val}</span>
                        <span className="gallery-metric-lbl">{m.lbl}</span>
                      </div>
                    ))}
                  </div>

                  {/* Viewport Chassis */}
                  <div 
                    className="gallery-viewport-chassis"
                    onClick={() => setActiveModalData(card)}
                    title="معاينة اللقطة بالحجم الكامل"
                  >
                    <img 
                      src={card.imageSrc} 
                      alt={card.title}
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="gallery-inspect-action">
                      <BrandIcons.Zoom />
                      <span>تكبير المعاينة</span>
                    </div>
                  </div>

                </div>

                {/* THE UNIFIED BRAND PATTERN */}
                <UnifiedBrandPattern />
              </div>
            ))}
          </div>

          {/* 6. BOTTOM CTA */}
          <div style={{ textAlign: 'center', marginTop: '75px', paddingTop: '40px' }}>
            <h2 className="section-title" style={{ fontSize: 'clamp(1.5rem, 3.6vw, 2.1rem)', marginBottom: '12px' }}>
              تريد نتائج مماثلة؟؟
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: '0 auto 26px', maxWidth: '500px' }}>
               أنت في المكان المناسب
            </p>
            <Link href="/#booking" className="btn-action" style={{ textDecoration: 'none', padding: '15px 38px' }}>
              <span>تواصل معنا الآن</span>
              <BrandIcons.ArrowLeft />
            </Link>
          </div>

        </main>

        {/* 7. ULTRA-LIGHTWEIGHT PURE CSS LIGHTBOX MODAL */}
        {activeModalData && (
          <div className="clean-modal-overlay" onClick={closeModal}>
            
            <button 
              type="button" 
              className="clean-modal-close-btn"
              onClick={closeModal}
              aria-label="إغلاق"
            >
              <BrandIcons.Close />
            </button>

            <div className="clean-modal-img-wrapper" onClick={(e) => e.stopPropagation()}>
              <img 
                src={activeModalData.imageSrc} 
                alt={activeModalData.title}
                className="clean-modal-img"
                loading="eager"
              />
            </div>

          </div>
        )}

      </div>
    </div>
  );
}