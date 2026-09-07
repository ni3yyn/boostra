// src/app/gifts/page.js
"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import './gifts.css';
import { apiUrl } from '../../lib/apiUrl';

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
  { id: 'all', label: 'الكل' },
  { id: 'free', label: 'المجانية' },
  { id: 'limited', label: 'عروض محدودة' },
  { id: 'paid', label: 'المدفوعة' }
];

export default function DigitalGiftsStorePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeImageViewer, setActiveImageViewer] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isFormInView, setIsFormInView] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [cardImageIndexes, setCardImageIndexes] = useState({});
  const [isOfferExpired, setIsOfferExpired] = useState(false);
  
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const formRef = useRef(null);

  // مراجع إيماءات اللمس السريعة (Touch Gestures)
  const cardTouchStartX = useRef(null);
  const cardTouchStartY = useRef(null);
  const modalTouchStartX = useRef(null);
  const modalTouchStartY = useRef(null);
  const viewerTouchStartX = useRef(null);
  const viewerTouchStartY = useRef(null);
  const sheetTouchStartY = useRef(null);

  // كبح النقرات العرضية عند السحب
  const suppressCardClick = useRef(false);
  const suppressModalClick = useRef(false);

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

  useEffect(() => {
    if (!activeImageViewer) return;

    window.history.pushState({ imageViewerOpen: true }, '');
    const handlePopState = () => setActiveImageViewer(null);
    const handleKeyDown = (e) => { if (e.key === 'Escape') closeImageViewer(); };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeImageViewer?.images]);

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

  // مراجع ومؤشر السلايدر السريع (Pure JS GPU Slider)
  const tabRefs = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({
    transform: 'translate3d(0, 0, 0)',
    width: 0,
    opacity: 0
  });

  // حساب عدد المنتجات في كل فئة ديناميكياً
  const categoryCounts = useMemo(() => ({
    all: products.length,
    free: products.filter(p => p.type === 'always_free').length,
    limited: products.filter(p => p.type === 'limited_free').length,
    paid: products.filter(p => p.type === 'paid').length,
  }), [products]);

  // تحريك المؤشر مع تغيير التبويب وتغيير مقاس الشاشة
  useEffect(() => {
    const updateIndicator = () => {
      const el = tabRefs.current[activeCategory];
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
  }, [activeCategory, products]);

  const closeProductModal = () => {
    triggerCloseAnimation();
    if (window.history.state?.productModalOpen) {
      window.history.back();
    }
  };

  const getProductImages = (product) => {
    if (product?.imageSrcs?.length) return product.imageSrcs.filter(Boolean);
    return product?.imageSrc ? [product.imageSrc] : [];
  };

  const shiftImage = (images, index, direction) => {
    if (images.length < 2) return index;
    return (index + direction + images.length) % images.length;
  };

  const changeCardImage = (event, product, direction) => {
    if (event?.stopPropagation) event.stopPropagation();
    const images = getProductImages(product);
    setCardImageIndexes(prev => ({
      ...prev,
      [product.id]: shiftImage(images, prev[product.id] || 0, direction),
    }));
  };

  const openImageViewer = (event, images, index, title) => {
    if (event?.stopPropagation) event.stopPropagation();
    setActiveImageViewer({ images, index, title });
  };

  const closeImageViewer = () => {
    if (window.history.state?.imageViewerOpen) {
      window.history.back();
    } else {
      setActiveImageViewer(null);
    }
  };

  const shiftImageViewer = (event, direction) => {
    if (event?.stopPropagation) event.stopPropagation();
    setActiveImageViewer(prev => prev ? {
      ...prev,
      index: shiftImage(prev.images, prev.index, direction),
    } : prev);
  };

  // --- معالجة حركات السحب لبطاقة المنتج في القائمة (Card Gestures) ---
  const handleCardTouchStart = (event) => {
    cardTouchStartX.current = event.changedTouches[0].clientX;
    cardTouchStartY.current = event.changedTouches[0].clientY;
  };

  const handleCardTouchEnd = (event, product) => {
    if (cardTouchStartX.current === null) return;
    const deltaX = event.changedTouches[0].clientX - cardTouchStartX.current;
    const deltaY = event.changedTouches[0].clientY - (cardTouchStartY.current || 0);
    cardTouchStartX.current = null;
    cardTouchStartY.current = null;

    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY)) {
      suppressCardClick.current = true;
      changeCardImage(event, product, deltaX < 0 ? 1 : -1);
      setTimeout(() => {
        suppressCardClick.current = false;
      }, 300);
    }
  };

  // --- معالجة حركات السحب لنافذة المنتج (Modal / Bottomsheet Gestures) ---
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

  const handleModalTouchStart = (event) => {
    modalTouchStartX.current = event.changedTouches[0].clientX;
    modalTouchStartY.current = event.changedTouches[0].clientY;
  };

  const handleModalTouchEnd = (event) => {
    if (modalTouchStartX.current === null) return;
    const deltaX = event.changedTouches[0].clientX - modalTouchStartX.current;
    const deltaY = event.changedTouches[0].clientY - (modalTouchStartY.current || 0);
    modalTouchStartX.current = null;
    modalTouchStartY.current = null;

    // السحب الأفقي: تقليب الصور
    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY)) {
      suppressModalClick.current = true;
      setCurrentImageIndex(prev => shiftImage(validImages, prev, deltaX < 0 ? 1 : -1));
      setTimeout(() => {
        suppressModalClick.current = false;
      }, 300);
    } 
    // السحب للأسفل من أعلى الصورة: إغلاق النافذة
    else if (deltaY > 70 && deltaY > Math.abs(deltaX) * 1.4) {
      closeProductModal();
    }
  };

  // سحب مقبض النافذة العلوية للأسفل للإغلاق (Sheet Drag Handle)
  const handleSheetTouchStart = (event) => {
    sheetTouchStartY.current = event.changedTouches[0].clientY;
  };

  const handleSheetTouchEnd = (event) => {
    if (sheetTouchStartY.current === null) return;
    const deltaY = event.changedTouches[0].clientY - sheetTouchStartY.current;
    sheetTouchStartY.current = null;
    if (deltaY > 50) {
      closeProductModal();
    }
  };

  // سحب عارض الصور بملء الشاشة
  const handleViewerTouchStart = (event) => {
    viewerTouchStartX.current = event.changedTouches[0].clientX;
    viewerTouchStartY.current = event.changedTouches[0].clientY;
  };

  const handleViewerTouchEnd = (event) => {
    if (viewerTouchStartX.current === null || !activeImageViewer) return;
    const deltaX = event.changedTouches[0].clientX - viewerTouchStartX.current;
    const deltaY = event.changedTouches[0].clientY - (viewerTouchStartY.current || 0);
    viewerTouchStartX.current = null;
    viewerTouchStartY.current = null;

    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY)) {
      shiftImageViewer(event, deltaX < 0 ? 1 : -1);
    } else if (deltaY > 80 && deltaY > Math.abs(deltaX) * 1.4) {
      closeImageViewer();
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

        // 3. الاتصال بالمسار الصحيح للمتجر ليرسل القالب
        if (clientEmail.trim()) {
          fetch(apiUrl('/api/admin/send-gift'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              name: clientName.trim(), 
              email: clientEmail.trim(),
              productTitle: selectedProduct.title,
              productDesc: selectedProduct.desc || '',
              productFeatures: selectedProduct.features || [],
              productImage: selectedProduct.imageSrcs?.[0] || selectedProduct.imageSrc || '',
              priceText: selectedProduct.priceText || 'منتج مجاني',
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
              <li><Link href="/gifts" style={{ color: 'var(--accent)', fontWeight: 800 }}>المتجر</Link></li>
              <li><Link href="/gallery">معرض النتائج</Link></li>
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
              <li><Link href="/gifts" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--accent)' }}><span>المتجر</span><span style={{ color: 'var(--accent)' }}>←</span></Link></li>
              <li><Link href="/gallery" onClick={() => setMobileMenuOpen(false)}><span>معرض النتائج</span><span>←</span></Link></li>
              <li><Link href="/#booking" onClick={() => setMobileMenuOpen(false)}><span>تواصل معنا</span><span>←</span></Link></li>
            </ul>
          </div>
        </header>

        {/* Store Grid */}
        <main style={{ maxWidth: '1240px', margin: '0 auto', padding: '120px 24px 80px' }}>
          <div className="store-grid-view">
            {/* CONTINUOUS SUBTAB BAR (PURE JS / GPU SLIDER) */}
            <div className="continuous-tab-wrapper">
              <div className="continuous-tab-container" style={{ position: 'relative' }}>
                
                {/* المؤشر المنزلق الخفيف */}
                <div 
                  className="pure-moving-indicator"
                  style={{
                    transform: indicatorStyle.transform,
                    width: `${indicatorStyle.width}px`,
                    opacity: indicatorStyle.opacity
                  }}
                  aria-hidden="true"
                />

                {CATEGORIES.map((cat, idx) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <React.Fragment key={cat.id}>
                      {idx > 0 && <div className="tab-divider-line" aria-hidden="true" />}
                      
                      <button
                        ref={(el) => { tabRefs.current[cat.id] = el; }}
                        type="button"
                        onClick={() => setActiveCategory(cat.id)}
                        className={`tab-segment-btn ${isActive ? 'active' : ''}`}
                      >
                        <span className="tab-label-text">{cat.label}</span>
                        <span className="tab-pill-count">{categoryCounts[cat.id] || 0}</span>
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {loading ? (
              <div className="loader-box">
                <BrandLogo size={48} isAnimating={true} />
                <span style={{ marginTop: '14px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)' }}>جاري مزامنة المنتجات...</span>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>لا توجد منتجات في هذه الفئة حالياً.</div>
            ) : (
              <div className="products-grid">
                {filteredProducts.map((prod) => {
                  const cardImages = getProductImages(prod);
                  const cardImageIndex = cardImageIndexes[prod.id] || 0;
                  const coverImg = cardImages[cardImageIndex] || cardImages[0];
                  return (
                    <div 
                      key={prod.id} 
                      className="boostra-soft-card" 
                      onClick={() => {
                        if (suppressCardClick.current) return;
                        openProductModal(prod);
                      }}
                    >
                      <div
                        className="product-image-chassis"
                        onTouchStart={handleCardTouchStart}
                        onTouchEnd={(event) => handleCardTouchEnd(event, prod)}
                      >
                        {coverImg ? (
                          <img
                            src={coverImg}
                            alt={prod.title}
                            className="product-img"
                            onClick={(event) => {
                              if (suppressCardClick.current) {
                                event.stopPropagation();
                                return;
                              }
                              openImageViewer(event, cardImages, cardImageIndex, prod.title);
                            }}
                          />
                        ) : (
                          <div className="product-img-fallback">
                            <BrandLogo size={42} color="rgba(255, 255, 255, 0.4)" />
                          </div>
                        )}

                        {/* مؤشرات الصور (Dots) فقط بدون الأسهم */}
                        {cardImages.length > 1 && (
                          <div className="product-image-dots" aria-hidden="true">
                            {cardImages.map((_, index) => <span key={index} className={index === cardImageIndex ? 'active' : ''} />)}
                          </div>
                        )}
                        
                        <div className="product-badges-row">
                          <span className={`product-badge ${prod.type === 'paid' ? 'badge-paid' : 'badge-free'}`}>
                            {prod.type === 'paid' ? 'أداة احترافية' : (prod.type === 'limited_free' ? 'عرض مؤقت' : 'منتج مجاني')}
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
              
              {/* مقبض سحب النافذة السفلية للهواتف (Swipe Down Handle) */}
              <div 
                className="pm-sheet-drag-handle" 
                onTouchStart={handleSheetTouchStart}
                onTouchEnd={handleSheetTouchEnd}
                aria-hidden="true"
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '10px 0 6px',
                  cursor: 'grab',
                  touchAction: 'none'
                }}
              >
                <span style={{
                  width: '40px',
                  height: '4.5px',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(255, 255, 255, 0.28)',
                  display: 'block'
                }} />
              </div>

              <button type="button" onClick={closeProductModal} className="btn-close-unified pm-abs-close">
                <Icons.Close />
              </button>

              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
                <UnifiedBrandPattern width="100%" height="280px" opacity={0.12} />
              </div>

              <div className="pm-scroll-area" data-lenis-prevent="true">
                {/* رأس صورة المودال مع دعم كامل لإيماءات السحب واللمس باليد */}
                <div 
                  className="pm-image-header"
                  onTouchStart={handleModalTouchStart}
                  onTouchEnd={handleModalTouchEnd}
                >
                  {validImages.length > 0 ? (
                    <>
                      <img
                        src={validImages[currentImageIndex]}
                        alt={selectedProduct.title}
                        className="pm-cover-img"
                        onClick={(event) => {
                          if (suppressModalClick.current) return;
                          openImageViewer(event, validImages, currentImageIndex, selectedProduct.title);
                        }}
                      />
                      {validImages.length > 1 && (
                        <>
                          <button 
                            type="button" 
                            className="pm-image-arrow pm-image-arrow-prev" 
                            onClick={(event) => { 
                              event.stopPropagation(); 
                              setCurrentImageIndex(shiftImage(validImages, currentImageIndex, 1)); 
                            }} 
                            aria-label="الصورة التالية"
                          >
                            ‹
                          </button>
                          <button 
                            type="button" 
                            className="pm-image-arrow pm-image-arrow-next" 
                            onClick={(event) => { 
                              event.stopPropagation(); 
                              setCurrentImageIndex(shiftImage(validImages, currentImageIndex, -1)); 
                            }} 
                            aria-label="الصورة السابقة"
                          >
                            ›
                          </button>
                        </>
                      )}
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
                    <span className="pm-tag-category">{selectedProduct.type === 'paid' ? 'أداة احترافية' : 'منتج مجاني'}</span>
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
                      ماذا يتضمن هذا المنتج؟
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
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>نأسف، لم يعد هذا المنتج متاحاً للاستلام حالياً.</p>
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
                            : 'أدخل بياناتك وسيصلك رابط المنتج مباشرة على بريدك الإلكتروني.'}
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
                            ? (selectedProduct.type === 'paid' ? 'تأكيد وإرسال الطلب' : 'استلام المنتج') 
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

        {/* عارض الصور بكامل الشاشة مع دعم السحب باليد */}
        {activeImageViewer && (
          <div 
            className="image-viewer-overlay" 
            onClick={closeImageViewer}
            onTouchStart={handleViewerTouchStart}
            onTouchEnd={handleViewerTouchEnd}
          >
            <button type="button" className="image-viewer-close" onClick={closeImageViewer} aria-label="إغلاق">×</button>
            {activeImageViewer.images.length > 1 && (
              <>
                <button type="button" className="image-viewer-arrow image-viewer-arrow-prev" onClick={(event) => shiftImageViewer(event, 1)} aria-label="الصورة التالية">‹</button>
                <button type="button" className="image-viewer-arrow image-viewer-arrow-next" onClick={(event) => shiftImageViewer(event, -1)} aria-label="الصورة السابقة">›</button>
              </>
            )}
            <img
              src={activeImageViewer.images[activeImageViewer.index]}
              alt={activeImageViewer.title}
              className="image-viewer-image"
              onClick={(event) => event.stopPropagation()}
            />
          </div>
        )}

      </div>
    </div>
  );
}