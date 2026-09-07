// src/app/gifts/page.js
"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import './gifts.css';

// --- BOOSTRA AGENCY LOGO ---
const BrandLogo = ({ size = 36, isAnimating = false }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    style={{ 
      flexShrink: 0,
      animation: isAnimating ? 'logoPulse 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite' : 'none'
    }}
  >
    <rect width="100" height="100" rx="23" fill="#0000FF" />
    <path d="M16 33A8.5 8.5 0 0 1 24.5 24.5H33V41.5H16V33Z" fill="#FFFFFF" />
    <rect x="33" y="41.5" width="34" height="17" fill="#FFFFFF" />
    <path d="M67 58.5H84V67A8.5 8.5 0 0 1 75.5 75.5H67V58.5Z" fill="#FFFFFF" />
  </svg>
);

// --- THE UNIFIED BRAND PATTERN ---
const UnifiedBrandPattern = ({ width = "380px", height = "240px", opacity = 0.25 }) => (
  <div
    aria-hidden="true"
    style={{
      position: "absolute",
      left: "0px",
      bottom: "0px",
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
        <radialGradient id="giftPatternFade" cx="0%" cy="100%" r="95%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="45%" stopColor="white" stopOpacity="0.88" />
          <stop offset="75%" stopColor="white" stopOpacity="0.45" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id="giftPatternMask">
          <rect width="510" height="335" fill="url(#giftPatternFade)" />
        </mask>
      </defs>
      <g fill="#4F46E5" fillOpacity="0.38" mask="url(#giftPatternMask)">
        <rect x="0" y="0" width="25" height="35" rx="0" /><rect x="25" y="35" width="81" height="35" rx="3" /><rect x="106" y="70" width="41" height="36" rx="3" /><rect x="0" y="108" width="25" height="35" rx="0" /><rect x="25" y="143" width="81" height="35" rx="3" /><rect x="106" y="178" width="41" height="36" rx="3" /><rect x="152" y="109" width="41" height="35" rx="3" /><rect x="193" y="144" width="79" height="35" rx="3" /><rect x="272" y="179" width="41" height="36" rx="3" /><rect x="0" y="215" width="25" height="35" rx="0" /><rect x="25" y="250" width="81" height="35" rx="3" /><rect x="106" y="285" width="41" height="36" rx="3" /><rect x="152" y="216" width="41" height="35" rx="3" /><rect x="193" y="251" width="79" height="35" rx="3" /><rect x="272" y="286" width="41" height="36" rx="3" /><rect x="314" y="215" width="41" height="35" rx="3" /><rect x="355" y="250" width="79" height="35" rx="3" /><rect x="434" y="285" width="41" height="36" rx="3" />
      </g>
    </svg>
  </div>
);

// --- VECTOR ICONS ---
const Icons = {
  Check: () => <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
  ArrowRight: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.4"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>,
  ArrowDown: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></svg>,
  Close: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  Clock: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
};

// --- COUNTDOWN TIMER COMPONENT (REUSABLE FOR CARDS AND MODAL) ---
const CountdownTimer = ({ targetDate, compact = false, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState('');
  
  useEffect(() => {
    if (!targetDate) return;
    const target = new Date(targetDate).getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;

      if (distance <= 0) {
        setTimeLeft('انتهى العرض');
        if (onExpire) onExpire();
        clearInterval(interval);
      } else {
        const d = Math.floor(distance / (1000 * 60 * 60 * 24));
        const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distance % (1000 * 60)) / 1000);

        if (compact) {
          setTimeLeft(`${d}ي ${h}س ${m}د ${s}ث`);
        } else {
          setTimeLeft(`ينتهي العرض خلال: ${d}يوم ${h}س ${m}د ${s}ث`);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate, compact, onExpire]);

  if (!targetDate) return null;
  return <span className={compact ? "card-timer-text" : "timer-text"}>{timeLeft}</span>;
};

const CATEGORIES = [
  { id: 'all', label: 'جميع الموارد' },
  { id: 'free', label: 'الموارد المجانية' },
  { id: 'limited', label: 'عروض محدودة' },
  { id: 'paid', label: 'الأدوات المدفوعة' }
];

export default function DigitalGiftsStorePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isFormInView, setIsFormInView] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isOfferExpired, setIsOfferExpired] = useState(false);
  
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const formRef = useRef(null);

  // جلب البيانات من Firebase
  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = [];
      snapshot.forEach(d => fetched.push({ id: d.id, ...d.data() }));
      setProducts(fetched);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 1. إدارة عزل التمرير بدون أي اهتزاز في العرض (Zero Layout Shift)
  useEffect(() => {
    if (!selectedProduct) return;

    document.documentElement.classList.add('modal-scroll-locked');
    document.body.classList.add('modal-scroll-locked');
    window.history.pushState({ productModalOpen: true }, '');

    const handlePopState = () => triggerCloseAnimation();
    const handleKeyDown = (e) => { if (e.key === 'Escape') closeProductModal(); };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.documentElement.classList.remove('modal-scroll-locked');
      document.body.classList.remove('modal-scroll-locked');
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedProduct]);

  // 2. مراقب الاستمارة لزر المتابعة التفاعلي
  useEffect(() => {
    if (selectedProduct && formRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsFormInView(entry.isIntersecting);
        },
        { root: null, threshold: 0.15 }
      );
      observer.observe(formRef.current);
      return () => observer.disconnect();
    }
  }, [selectedProduct]);

  const triggerCloseAnimation = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setSelectedProduct(null);
      setIsClosing(false);
      setIsSuccess(false);
      setIsFormInView(false);
      setCurrentImageIndex(0);
      setIsOfferExpired(false);
      setClientName('');
      setClientEmail('');
      setClientPhone('');
      document.documentElement.classList.remove('modal-scroll-locked');
      document.body.classList.remove('modal-scroll-locked');
    }, 280);
  };

  const closeProductModal = () => {
    triggerCloseAnimation();
    if (window.history.state?.productModalOpen) {
      window.history.back();
    }
  };

  const openProductModal = (prod) => {
    setSelectedProduct(prod);
    setCurrentImageIndex(0);
    if (prod.type === 'limited_free' && prod.expireAt) {
      const target = new Date(prod.expireAt).getTime();
      if (target - new Date().getTime() <= 0) {
        setIsOfferExpired(true);
      }
    }
  };

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (activeCategory === 'free') return p.type === 'always_free';
      if (activeCategory === 'limited') return p.type === 'limited_free';
      if (activeCategory === 'paid') return p.type === 'paid';
      return true;
    });
  }, [products, activeCategory]);

  const handleOrderProduct = async (e) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim()) {
      alert('يرجى كتابة الاسم ورقم الهاتف على الأقل');
      return;
    }

    setSubmitting(true);
    try {
      if (selectedProduct.type === 'paid') {
        // 1. الطلب المدفوع ➔ يذهب لـ leads لوحة التحكم للمتابعة الهاتفية والواتساب
        await addDoc(collection(db, 'leads'), {
          name: clientName.trim(),
          phone: clientPhone.trim(),
          email: clientEmail.trim() || '',
          pack: `طلب متجر: ${selectedProduct.title}`,
          status: 'new',
          source: 'store_checkout',
          createdAt: serverTimestamp()
        });
      } else {
        // 2. الطلب المجاني ➔ يسجل في gift_leads
        await addDoc(collection(db, 'gift_leads'), {
          name: clientName.trim(),
          email: clientEmail.trim() || '',
          phone: clientPhone.trim(),
          resource: selectedProduct.title,
          productId: selectedProduct.id,
          type: selectedProduct.type,
          status: 'new',
          createdAt: serverTimestamp()
        });

        // 3. الاتصال بالمسار الصحيح للمتجر ليرسل القالب الفخم الجديد بالكامل
        if (clientEmail.trim()) {
          fetch('/api/admin/send-gift', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              name: clientName.trim(), 
              email: clientEmail.trim(),
              productTitle: selectedProduct.title,
              productDesc: selectedProduct.desc || '',
              productFeatures: selectedProduct.features || [],
              productImage: selectedProduct.imageSrcs?.[0] || selectedProduct.imageSrc || '',
              priceText: selectedProduct.priceText || 'مورد مجاني',
              downloadUrl: selectedProduct.downloadUrl || '',
              resourceLink: selectedProduct.resourceLink || ''
            }),
          }).catch((err) => console.error("Email API fetch failed:", err));
        }
      }

      setIsSuccess(true);
    } catch (err) {
      console.error('Order Error:', err);
      alert('فشل إرسال الطلب: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const validImages = useMemo(() => {
    if (!selectedProduct) return [];
    if (selectedProduct.imageSrcs && selectedProduct.imageSrcs.length > 0) {
      return selectedProduct.imageSrcs.filter(Boolean);
    }
    if (selectedProduct.imageSrc) {
      return [selectedProduct.imageSrc];
    }
    return [];
  }, [selectedProduct]);

  return (
    <div className="app-wrapper">
      <div className="aurora-fixed-canvas" aria-hidden="true">
        <div className="aurora-orb orb-hero" />
        <div className="aurora-orb orb-middle" />
        <div className="aurora-orb orb-bottom" />
      </div>

      <div className="page-content-layer">

        {/* Header */}
        <header className={`site-header ${mobileMenuOpen ? 'menu-open' : ''}`}>
          <div className="header-inner">
            <Link href="/" className="header-brand" onClick={() => setMobileMenuOpen(false)}>
              <BrandLogo size={36} />
              <span className="header-brand-text">Boostra Agency</span>
            </Link>
            <ul className="header-nav-links">
              <li><Link href="/">الرئيسية</Link></li>
              <li><Link href="/gallery">معرض النتائج</Link></li>
              <li><Link href="/gifts" style={{ color: 'var(--accent)', fontWeight: 800 }}>المتجر والموارد</Link></li>
              <li><Link href="/#booking">تواصل معنا</Link></li>
            </ul>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link href="/#booking" className="btn-action header-cta-desktop" style={{ padding: '10px 20px', fontSize: '0.9rem', textDecoration: 'none' }}>
                حجز استشارة
              </Link>
              <button type="button" className="hamburger-toggle-btn" onClick={() => setMobileMenuOpen(prev => !prev)}>
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
              <li><Link href="/gallery" onClick={() => setMobileMenuOpen(false)}><span>معرض النتائج</span><span>←</span></Link></li>
              <li><Link href="/gifts" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--accent)' }}><span>المتجر والموارد</span><span style={{ color: 'var(--accent)' }}>←</span></Link></li>
              <li><Link href="/#booking" onClick={() => setMobileMenuOpen(false)}><span>تواصل معنا</span><span>←</span></Link></li>
            </ul>
          </div>
        </header>

        {/* Store Grid */}
        <main style={{ maxWidth: '1240px', margin: '0 auto', padding: '120px 24px 80px' }}>
          <div className="store-grid-view">
            <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 40px' }}>
              <h1 className="hero-headline" style={{ fontSize: 'clamp(2.1rem, 5vw, 3.2rem)', marginBottom: '14px' }}>
                <span>أدوات استراتيجية لـ</span>
                <span className="brand-spark-anchor"><span style={{ color: 'var(--accent)' }}>تحجيم متجرك</span></span>
              </h1>
              <p className="hero-desc" style={{ maxWidth: '620px', margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.65 }}>
                مجموعة متكاملة من الأدلة، الحاسبات المالية، وقوالب الإعلانات لتسريع نمو مبيعاتك.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '40px' }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`service-pill-btn ${activeCategory === cat.id ? 'active' : ''}`}
                  style={{ minHeight: 'auto', padding: '8px 18px', borderRadius: '100px', fontSize: '0.9rem' }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="loader-box">
                <BrandLogo size={48} isAnimating={true} />
                <span style={{ marginTop: '14px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)' }}>جاري مزامنة الموارد...</span>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>لا توجد موارد في هذه الفئة حالياً.</div>
            ) : (
              <div className="products-grid">
                {filteredProducts.map((prod) => {
                  const coverImg = prod.imageSrcs?.[0] || prod.imageSrc;
                  return (
                    <div key={prod.id} className="boostra-soft-card" onClick={() => openProductModal(prod)}>
                      <div className="product-image-chassis">
                        {coverImg ? (
                          <img src={coverImg} alt={prod.title} className="product-img" />
                        ) : (
                          <div className="product-img-fallback">
                            <BrandLogo size={42} color="rgba(255, 255, 255, 0.4)" />
                          </div>
                        )}
                        
                        <div className="product-badges-row">
                          <span className={`product-badge ${prod.type === 'paid' ? 'badge-paid' : 'badge-free'}`}>
                            {prod.type === 'paid' ? 'أداة احترافية' : (prod.type === 'limited_free' ? 'عرض مؤقت' : 'مورد مجاني')}
                          </span>

                          {/* العداد التنازلي يظهر مباشرة على البطاقة */}
                          {prod.type === 'limited_free' && prod.expireAt && (
                            <div className="product-card-timer-pill">
                              <Icons.Clock />
                              <CountdownTimer targetDate={prod.expireAt} compact={true} />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="product-card-body">
                        <h3 className="product-title">{prod.title}</h3>
                        <p className="product-desc-short">{prod.desc}</p>
                        
                        <div className="product-price-row">
                          <span className="product-price-main">{prod.priceText}</span>
                          {prod.originalPrice && (
                            <span className="product-price-crossed">{prod.originalPrice}</span>
                          )}
                        </div>
                      </div>
                      <UnifiedBrandPattern width="340px" height="200px" opacity={0.25} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        {/* Master Detail Sheet */}
        {selectedProduct && (
          <div className={`pm-backdrop ${isClosing ? 'pm-backdrop-closing' : ''}`} onClick={closeProductModal}>
            <div className={`pm-window ${isClosing ? 'pm-window-closing' : ''}`} onClick={e => e.stopPropagation()}>
              
              <button type="button" onClick={closeProductModal} className="btn-close-unified pm-abs-close">
                <Icons.Close />
              </button>

              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
                <UnifiedBrandPattern width="100%" height="280px" opacity={0.12} />
              </div>

              <div className="pm-scroll-area" data-lenis-prevent="true">
                <div className="pm-image-header">
                  {validImages.length > 0 ? (
                    <>
                      <img src={validImages[currentImageIndex]} alt={selectedProduct.title} className="pm-cover-img" />
                      {validImages.length > 1 && (
                        <div className="image-slider-dots">
                          {validImages.map((_, i) => (
                            <span 
                              key={i} 
                              onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(i); }}
                              className={`slider-dot ${i === currentImageIndex ? 'active' : ''}`} 
                            />
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="pm-cover-fallback">
                      <BrandLogo size={60} color="rgba(255, 255, 255, 0.4)" />
                    </div>
                  )}
                </div>

                <div className="pm-content-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <span className="pm-tag-category">{selectedProduct.type === 'paid' ? 'أداة احترافية' : 'مورد مجاني'}</span>
                    {selectedProduct.type === 'limited_free' && (
                      <span className="pm-tag-limited">مجاني لفترة محدودة</span>
                    )}
                    {selectedProduct.type === 'limited_free' && selectedProduct.expireAt && (
                      <CountdownTimer targetDate={selectedProduct.expireAt} onExpire={() => setIsOfferExpired(true)} />
                    )}
                  </div>

                  <h2 className="pm-title">{selectedProduct.title}</h2>
                  <p className="pm-desc">{selectedProduct.desc}</p>

                  <div className="pm-features-list">
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>
                      ماذا يتضمن هذا المورد؟
                    </span>
                    {(selectedProduct.features || []).filter(f => f.trim() !== '').map((feat, idx) => (
                      <div key={idx} className="pm-feature-item">
                        <span className="pm-feature-icon"><Icons.Check /></span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pm-form-section" ref={formRef}>
                    {isOfferExpired ? (
                      <div className="pm-expired-box">
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px 0' }}>انتهت فترة العرض</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>نأسف، لم يعد هذا المورد متاحاً للاستلام حالياً.</p>
                      </div>
                    ) : isSuccess ? (
                      <div className="pm-success-box">
                        <div className="pm-success-icon"><Icons.Check /></div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
                          تم استلام طلبك بنجاح
                        </h3>
                        {selectedProduct.type === 'paid' ? (
                          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                            سيقوم فريقنا بالتواصل معك قريباً لتأكيد الطلب وتسليم الأداة.
                          </p>
                        ) : (
                          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                            تم إرسال النسخة المجانية مع رابط الوصول مباشرة إلى بريدك الإلكتروني. يرجى التحقق من الـ Inbox.
                          </p>
                        )}
                      </div>
                    ) : (
                      <form id="product-order-form" onSubmit={handleOrderProduct} className="pm-action-form">
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 10px 0' }}>
                          {selectedProduct.type === 'paid' ? 'استمارة طلب الأداة' : 'استلام النسخة المجانية'}
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.6 }}>
                          {selectedProduct.type === 'paid' 
                            ? 'أدخل بياناتك وسيتم التواصل معك لإتمام الدفع والتسليم.' 
                            : 'أدخل بياناتك وسيصلك رابط المورد مباشرة على بريدك الإلكتروني.'}
                        </p>

                        <div className="tactile-input-group">
                          <label>الاسم الكامل: *</label>
                          <input type="text" required value={clientName} onChange={e => setClientName(e.target.value)} placeholder="الاسم واللقب" className="tactile-input-box" />
                        </div>

                        <div className="tactile-input-group">
                          <label>البريد الإلكتروني: {selectedProduct.type !== 'paid' && '*'}</label>
                          <input type="email" required={selectedProduct.type !== 'paid'} value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="name@domain.com" className="tactile-input-box" style={{ direction: 'ltr', textAlign: 'right' }} />
                        </div>

                        <div className="tactile-input-group">
                          <label>رقم الهاتف (واتساب): *</label>
                          <input type="tel" required value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="05 / 06 / 07..." className="tactile-input-box" style={{ direction: 'ltr', textAlign: 'right' }} />
                        </div>

                        <button type="submit" style={{ display: 'none' }} />
                      </form>
                    )}
                  </div>
                  
                  <div style={{ height: '90px' }} />
                </div>
              </div>

              {/* شريط الإجراءات الثابت السفلي */}
              {!isSuccess && (
                <div className="pm-sticky-footer">
                  <div className="pm-footer-price-box">
                    <span className="pm-price-main">{selectedProduct.priceText}</span>
                    {selectedProduct.originalPrice && (
                      <span className="pm-price-crossed">{selectedProduct.originalPrice}</span>
                    )}
                  </div>
                  
                  <button 
                    type={isFormInView ? "submit" : "button"}
                    form={isFormInView && !isOfferExpired ? "product-order-form" : undefined}
                    onClick={isFormInView ? undefined : scrollToForm}
                    disabled={submitting || isOfferExpired} 
                    className="btn-action pm-sticky-btn"
                    style={{ opacity: isOfferExpired ? 0.6 : 1, cursor: isOfferExpired ? 'not-allowed' : 'pointer' }}
                  >
                    <span>
                      {submitting ? 'جاري التنفيذ...' : (
                        isOfferExpired ? 'انتهى العرض' : (
                          isFormInView 
                            ? (selectedProduct.type === 'paid' ? 'تأكيد وإرسال الطلب' : 'استلام المورد') 
                            : 'متابعة الطلب'
                        )
                      )}
                    </span>
                    {!submitting && !isOfferExpired && (isFormInView ? <Icons.Check /> : <Icons.ArrowDown />)}
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}