// src/app/about/page.js
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import './about.css';

// --- THE UNIFIED BRAND PATTERN (EXACT FROM LANDING PAGE) ---
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
        <radialGradient id="whoamiPatternFade" cx="0%" cy="100%" r="75%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="45%" stopColor="white" stopOpacity="0.9" />
          <stop offset="75%" stopColor="white" stopOpacity="0.3" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id="whoamiSoftEdgeMask">
          <rect width="510" height="310" fill="url(#whoamiPatternFade)" />
        </mask>
      </defs>
      <g fill="#4F46E5" fillOpacity="0.18" mask="url(#whoamiSoftEdgeMask)">
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

// --- BRAND LOGO ---
const BrandLogo = ({ size = 36, color = "var(--accent)" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    style={{ flexShrink: 0 }}
  >
    <rect width="100" height="100" rx="23" fill={color} />
    <path d="M16 33A8.5 8.5 0 0 1 24.5 24.5H33V41.5H16V33Z" fill="#FFFFFF" />
    <rect x="33" y="41.5" width="34" height="17" fill="#FFFFFF" />
    <path d="M67 58.5H84V67A8.5 8.5 0 0 1 75.5 75.5H67V58.5Z" fill="#FFFFFF" />
  </svg>
);

const Icons = {
  ArrowLeft: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  ),
  Close: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Whatsapp: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.01 2.014c-5.46 0-9.89 4.43-9.89 9.89 0 1.76.46 3.47 1.32 4.97L2 22l5.3-1.39c1.45.79 3.09 1.21 4.71 1.21 5.46 0 9.89-4.43 9.89-9.89 0-5.46-4.43-9.89-9.89-9.89zm5.39 14.24c-.23.65-1.33 1.23-1.84 1.32-.47.08-1.07.14-3.4-.82-2.82-1.16-4.63-4.04-4.77-4.23-.14-.19-1.14-1.52-1.14-2.9s.72-2.06.97-2.33c.25-.27.54-.34.72-.34s.36 0 .52.01c.17.01.39-.06.6.45.23.55.77 1.88.84 2.02.07.14.12.3.02.5-.09.19-.14.3-.29.49-.14.18-.3.39-.42.54-.14.16-.28.34-.12.61.16.28.71 1.18 1.53 1.91.56.5 1.34 1.05 1.65 1.21.31.16.5.14.69-.08.19-.22.82-.96 1.04-1.29.23-.33.45-.27.74-.17.29.1 1.84.87 2.16 1.03.32.16.53.24.6.38.08.14.08.82-.16 1.47z"/>
    </svg>
  )
};

export default function WhoAmIPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [portraitLoaded, setPortraitLoaded] = useState(true);

  return (
    <div className="app-wrapper" dir="rtl">
      {/* خلفية الأورورا الموحدة */}
      <div className="aurora-fixed-canvas" aria-hidden="true">
        <div className="aurora-orb orb-hero" />
        <div className="aurora-orb orb-middle" />
        <div className="aurora-orb orb-bottom" />
      </div>

      <div className="page-content-layer">

        {/* الهيدر الموحد */}
        <header className={`site-header ${mobileMenuOpen ? 'menu-open' : ''}`}>
          <div className="header-inner">
            <Link href="/" className="header-brand" onClick={() => setMobileMenuOpen(false)}>
              <BrandLogo size={36} />
              <span className="header-brand-text">Boostra Agency</span>
            </Link>

            <ul className="header-nav-links">
              <li><Link href="/">الرئيسية</Link></li>
              <li><Link href="/about" style={{ color: 'var(--accent)', fontWeight: 700 }}>من أنا</Link></li>
              <li><Link href="/gifts">المتجر</Link></li>
              <li><Link href="/gallery">معرض النتائج</Link></li>
              <li><Link href="/#booking">تواصل معنا</Link></li>
            </ul>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link href="/#booking" className="btn-action header-cta-desktop" style={{ padding: '10px 20px', fontSize: '0.9rem', textDecoration: 'none' }}>
                حجز استشارة
              </Link>
              <button 
                type="button" 
                className="hamburger-toggle-btn" 
                onClick={() => setMobileMenuOpen(prev => !prev)}
                aria-label="القائمة"
              >
                {mobileMenuOpen ? <Icons.Close /> : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="header-dropdown-menu">
            <ul className="dropdown-nav-list">
              <li><Link href="/" onClick={() => setMobileMenuOpen(false)}><span>الرئيسية</span><span>←</span></Link></li>
              <li><Link href="/about" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--accent)' }}><span>من أنا</span><span style={{ color: 'var(--accent)' }}>←</span></Link></li>
              <li><Link href="/gifts" onClick={() => setMobileMenuOpen(false)}><span>المتجر</span><span>←</span></Link></li>
              <li><Link href="/gallery" onClick={() => setMobileMenuOpen(false)}><span>معرض النتائج</span><span>←</span></Link></li>
              <li><Link href="/#booking" onClick={() => setMobileMenuOpen(false)}><span>تواصل معنا</span><span>←</span></Link></li>
            </ul>
          </div>
        </header>

        {/* الحاوية الأساسية للصفحة */}
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 24px', paddingTop: '110px' }}>

          {/* =========================================
              SECTION 1: HERO (أيمن بويديا + البورتريه الشخصي)
             ========================================= */}
          <section className="whoami-hero-section">
            <div className="whoami-hero-layout">
              
              {/* النصوص والتعريف */}
              <div className="whoami-hero-text">
                <h1 className="hero-headline" style={{ margin: '0 0 20px 0' }}>
                  مرحباً، أنا <span style={{ color: 'var(--accent)' }}>أيمن بويديا</span> — أساعد العلامات التجارية على النمو وتحقيق أرباح مستدامة رقمياً.
                </h1>

                <p className="hero-desc" style={{ maxWidth: '620px', margin: '0 0 32px 0' }}>
                  أنا ميديا باير محترف (Professional Media Buyer)، رائد أعمال في التجارة الإلكترونية، ومسوق رقمي متخصص في بناء وتوسيع المشاريع الإلكترونية المربحة. أدمج بين الإعلانات الممولة، الاستراتيجيات الإبداعية، تحليل البيانات، ورؤى الأعمال لتحويل المنتجات إلى براندات قابلة للتوسع والحملات إلى نمو قابل للقياس.
                </p>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <Link href="/#booking" className="btn-action" style={{ textDecoration: 'none' }}>
                    <span>ابدأ العمل معي</span>
                    <Icons.ArrowLeft />
                  </Link>

                  <Link href="/gallery" className="whoami-btn-ghost">
                    <span>استكشف نتائج أعمالي</span>
                  </Link>
                </div>
              </div>

              {/* البورتريه الشخصي الرسمي (Face & Shoulders) */}
              <div className="whoami-portrait-column">
                <div className="integrated-chassis-card portrait-integrated-chassis">
                  <div className="card-content-stack" style={{ padding: '16px' }}>
                    <div className="portrait-viewport-frame">
                      {portraitLoaded ? (
                        <img 
                          src="aymen.png" 
                          alt="أيمن بويديا | Aimen Bouidia"
                          className="portrait-rendered-img"
                          onError={() => setPortraitLoaded(false)}
                        />
                      ) : (
                        <div className="portrait-fallback-view">
                          <BrandLogo size={52} />
                          <span style={{ fontWeight: 800, fontSize: '1.2rem', marginTop: '12px' }}>Aimen Bouidia</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Media Buyer & Growth Strategist</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <UnifiedBrandPattern />
                </div>
              </div>

            </div>
          </section>

          {/* =========================================
              SECTION 2: ABOUT ME (بدون حاوية كبرى تحيط بالبطاقات)
             ========================================= */}
          <section style={{ padding: '60px 0' }}>
            <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 44px' }}>
              <h2 className="section-title">لا أكتفي بإطلاق الإعلانات. أنا أبني منظومات نمو متكاملة.</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '24px', alignItems: 'stretch' }}>
              
              <div className="integrated-chassis-card bento-unit">
                <div className="card-content-stack">
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    نظرة شاملة لرحلة العميل بالكامل
                  </h3>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.96rem', lineHeight: 1.75 }}>
                    أنا ميديا باير محترف ورائد أعمال في التجارة الإلكترونية، تركيزي ينصب على مساعدة الشركات في اكتساب عملاء جدد، زيادة الإيرادات، والتوسع بربحية من خلال الإعلانات الرقمية. نهجي يتجاوز مجرد إطلاق الحملات؛ إذ أدرس رحلة العميل بالكامل — بدءاً من المحتوى الإبداعي والعرض (Offer)، مروراً بالاستهداف والتحويل، وحتى التوسع الشامل.
                  </p>
                </div>
                <UnifiedBrandPattern />
              </div>

              <div className="integrated-chassis-card bento-unit">
                <div className="card-content-stack">
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    عقلية مدفوعة بالأداء ونتائج الأعمال
                  </h3>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.96rem', lineHeight: 1.75 }}>
                    من خلال سنوات من العمل في التسويق الرقمي والتجارة الإلكترونية، طوّرت عقلية ترتكز على الأداء (Performance-Driven Mindset)، حيث يُبنى كل قرار على البيانات، الاختبارات المنهجية، ونتائج الأعمال الحقيقية. أؤمن بأن الإعلان الناجح ليس مجرد إنفاق مبالغ أكبر، بل بناء نظام ذكي يجعل كل دولار يُستثمر يعمل بأعلى كفاءة لتحقيق أقصى عائد.
                  </p>
                </div>
                <UnifiedBrandPattern />
              </div>

            </div>
          </section>

          {/* =========================================
              SECTION 3: WHAT I DO (بدون أرقام وبدون أيقونات)
             ========================================= */}
          <section style={{ padding: '50px 0 80px' }}>
            <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 44px' }}>
              <h2 className="section-title">من الميزانية الإعلانية إلى نمو حقيقي في أعمالك</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.02rem', lineHeight: 1.6, margin: 0 }}>
                أربع ركائز أساسية أعتمد عليها لتحويل المتاجر والمشاريع إلى علامات تجارية رائدة تحقق عوائد استثنائية.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '24px', alignItems: 'stretch' }}>
              
              {/* CARD 01 */}
              <div className="integrated-chassis-card bento-unit">
                <div className="card-content-stack">
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    إدارة وشراء الإعلانات (Media Buying)
                  </h3>
                  <h4 style={{ margin: '0 0 14px 0', fontSize: '0.92rem', fontWeight: 600, color: 'var(--accent)' }}>
                    حملات إعلانية مدفوعة بالنتائج والأداء العالي
                  </h4>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.65 }}>
                    أخطط، أطلق، أحسّن وأوسع الحملات الإعلانية المدفوعة عبر منصات Meta (فيسبوك وانستغرام)، تيك توك، وغيرها من قنوات اكتساب العملاء الفعالة.
                  </p>
                </div>
                <UnifiedBrandPattern />
              </div>

              {/* CARD 02 */}
              <div className="integrated-chassis-card bento-unit">
                <div className="card-content-stack">
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    الاستراتيجية الإبداعية (Creative Strategy)
                  </h3>
                  <h4 style={{ margin: '0 0 14px 0', fontSize: '0.92rem', fontWeight: 600, color: 'var(--accent)' }}>
                    إعلانات تجذب الانتباه وتدفع لاتخاذ إجراء
                  </h4>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.65 }}>
                    أعمل على الجانب الاستراتيجي للمحتوى الإعلاني — تحديد الزوايا التسويقية (Hooks & Angles)، صياغة العروض، واختيار التنسيقات والرسائل القادرة على تحويل المشاهدات إلى مبيعات مؤكدة.
                  </p>
                </div>
                <UnifiedBrandPattern />
              </div>

              {/* CARD 03 */}
              <div className="integrated-chassis-card bento-unit">
                <div className="card-content-stack">
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    تنمية التجارة الإلكترونية (E-Commerce Growth)
                  </h3>
                  <h4 style={{ margin: '0 0 14px 0', fontSize: '0.92rem', fontWeight: 600, color: 'var(--accent)' }}>
                    بناء مشاريع تجارية متكاملة، وليس مجرد حملات
                  </h4>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.65 }}>
                    بفضل خبرتي المباشرة كصاحب متاجر إلكترونية، أفهم لغة الأرقام خلف كل إعلان: هوامش الربح، تكلفة الاستحواذ (CAC)، متوسط سلة الشراء (AOV)، معدلات التحويل، وصافي الربحية.
                  </p>
                </div>
                <UnifiedBrandPattern />
              </div>

              {/* CARD 04 */}
              <div className="integrated-chassis-card bento-unit">
                <div className="card-content-stack">
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    تطوير وتوسيع البراندات (Brand Growth)
                  </h3>
                  <h4 style={{ margin: '0 0 14px 0', fontSize: '0.92rem', fontWeight: 600, color: 'var(--accent)' }}>
                    من أول مبيعة إلى علامة تجارية قابلة للتوسع
                  </h4>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.65 }}>
                    أساعد الشركات في تأسيس الأنظمة، التموضع السوقي التنافسي (Positioning)، استراتيجيات الإعلان، ومسارات اكتساب العملاء اللازمة لتحقيق نمو مستدام ومستقر رقمياً.
                  </p>
                </div>
                <UnifiedBrandPattern />
              </div>

            </div>
          </section>

          {/* =========================================
              SECTION 4: FINAL CTA (مستوحى من شكل وبنية الهبوط)
             ========================================= */}
          <section style={{ padding: '20px 0 60px' }}>
            <div className="integrated-chassis-card bento-unit highlight-card" style={{ padding: '48px 40px' }}>
              <div className="card-content-stack" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '32px', flexWrap: 'wrap' }}>
                <div style={{ maxWidth: '620px' }}>
                  <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 10px 0' }}>
                    هل أنت جاهز لتوسيع مشروعك وتحقيق نمو حقيقي؟
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1.02rem', margin: 0, lineHeight: 1.6 }}>
                    دعنا نتحدث عن أهدافك الحالية ونضع استراتيجية واضحة ومربحة للانتقال بنشاطك التجاري إلى المستوى التالي.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <Link href="/#booking" className="btn-action" style={{ textDecoration: 'none', padding: '16px 36px', fontSize: '1.02rem' }}>
                    <span>احجز استشارتك الآن</span>
                    <Icons.ArrowLeft />
                  </Link>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    جلسة مخصصة لمراجعة أرقامك الحالية وفرص التوسع
                  </span>
                </div>
              </div>
              <UnifiedBrandPattern />
            </div>
          </section>

          {/* =========================================
              FOOTER SECTION (BOOSTRA AGENCY STANDARDIZED)
             ========================================= */}
          <footer className="site-footer">
            <div className="footer-hairline-divider" aria-hidden="true" />

            <div className="footer-container">
              <div className="footer-grid">
                
                <div className="footer-col footer-col-brand">
                  <Link href="/" className="footer-brand-header">
                    <BrandLogo size={34} />
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

                <div className="footer-col">
                  <h4 className="footer-col-heading">روابط سريعة</h4>
                  <ul className="footer-nav-list">
                    <li><Link href="/">الرئيسية</Link></li>
                    <li><Link href="/about">من أنا</Link></li>
                    <li><Link href="/gallery">معرض النتائج</Link></li>
                    <li><Link href="/gifts">المتجر</Link></li>
                    <li><Link href="/#booking">حجز استشارة</Link></li>
                  </ul>
                </div>

                <div className="footer-col">
                  <h4 className="footer-col-heading">قنوات الإعلانات</h4>
                  <ul className="footer-nav-list">
                    <li><span>إعلانات Meta (فيسبوك وإنستغرام)</span></li>
                    <li><span>إعلانات TikTok Ads</span></li>
                    <li><span>حملات Google Ads والبحث</span></li>
                    <li><span>إعلانات Snapchat Ads</span></li>
                  </ul>
                </div>

                <div className="footer-col">
                  <h4 className="footer-col-heading">تواصل مباشر</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 14px 0' }}>
                    جاهز لتحجيم مبيعات متجرك وخفض تكلفة الاستحواذ؟ تواصل معنا عبر الواتساب فوراً.
                  </p>
                  
                  <a 
                    href="https://wa.me/213794915286" 
                    target="_blank" 
                    rel="noreferrer"
                    className="footer-whatsapp-cta"
                  >
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      <Icons.Whatsapp />
                    </span>
                    <span style={{ direction: 'ltr', fontWeight: 600, fontSize: '0.95rem' }}>+213 794 91 52 86</span>
                  </a>
                </div>

              </div>

              <div className="footer-bottom-bar">
                <span>© {new Date().getFullYear()} Boostra Agency. جميع الحقوق محفوظة.</span>
                <span className="footer-tagline">إدارة إعلانات مبنية على الأرقام الحقيقية.</span>
              </div>

              <UnifiedBrandPattern width="420px" height="240px" opacity={0.35} />
            </div>
          </footer>

        </div>
      </div>
    </div>
  );
}