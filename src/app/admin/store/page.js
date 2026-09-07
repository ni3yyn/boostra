// src/app/admin/store/page.js
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { db, auth } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import styles from './store.module.css';

// استيراد المودال الموحد المعتمد
import EmailModal from '../email/components/EmailModal';

// --- BOOSTRA LOGO ---
const BoostraLogo = ({ size = 36, isAnimating = false }) => (
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

// --- UNIFIED BRAND PATTERN ---
const UnifiedBrandPattern = ({ width = "450px", height = "280px", opacity = 0.35 }) => (
  <div aria-hidden="true" style={{ position: "absolute", left: "4px", bottom: "4px", width, height, maxWidth: "100%", maxHeight: "100%", overflow: "hidden", pointerEvents: "none", zIndex: 0, opacity, display: "flex", alignItems: "flex-end", justifyContent: "flex-start" }}>
    <svg width="100%" height="100%" viewBox="0 0 510 335" preserveAspectRatio="xMinYMax meet" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="storePatternFade" cx="0%" cy="100%" r="95%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="45%" stopColor="white" stopOpacity="0.88" />
          <stop offset="75%" stopColor="white" stopOpacity="0.45" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id="storePatternMask">
          <rect width="510" height="335" fill="url(#storePatternFade)" />
        </mask>
      </defs>
      <g fill="#4F46E5" fillOpacity="0.38" mask="url(#storePatternMask)">
        <rect x="0" y="0" width="25" height="35" rx="0" /><rect x="25" y="35" width="81" height="35" rx="3" /><rect x="106" y="70" width="41" height="36" rx="3" /><rect x="0" y="108" width="25" height="35" rx="0" /><rect x="25" y="143" width="81" height="35" rx="3" /><rect x="106" y="178" width="41" height="36" rx="3" /><rect x="152" y="109" width="41" height="35" rx="3" /><rect x="193" y="144" width="79" height="35" rx="3" /><rect x="272" y="179" width="41" height="36" rx="3" /><rect x="0" y="215" width="25" height="35" rx="0" /><rect x="25" y="250" width="81" height="35" rx="3" /><rect x="106" y="285" width="41" height="36" rx="3" /><rect x="152" y="216" width="41" height="35" rx="3" /><rect x="193" y="251" width="79" height="35" rx="3" /><rect x="272" y="286" width="41" height="36" rx="3" /><rect x="314" y="215" width="41" height="35" rx="3" /><rect x="355" y="250" width="79" height="35" rx="3" /><rect x="434" y="285" width="41" height="36" rx="3" />
      </g>
    </svg>
  </div>
);

// --- STATUS CONFIGURATION FOR STORE ORDERS ---
const STATUS_CONFIG = {
  new: { label: 'جديد', color: '#0000FF', bg: 'rgba(0, 0, 255, 0.08)', nextStatus: 'contacted' },
  contacted: { label: 'تم الاتصال', color: '#D97706', bg: 'rgba(245, 158, 11, 0.12)', nextStatus: 'qualified' },
  no_answer: { label: 'لم يرد', color: '#F97316', bg: 'rgba(249, 115, 22, 0.12)', nextStatus: 'contacted' },
  qualified: { label: 'مؤهل للشراء', color: '#059669', bg: 'rgba(16, 185, 129, 0.12)', nextStatus: 'converted' },
  converted: { label: 'تم البيع والتسليم', color: '#4F46E5', bg: 'rgba(79, 70, 229, 0.12)', nextStatus: 'lost' },
  lost: { label: 'ملغي / منسحب', color: '#DC2626', bg: 'rgba(239, 68, 68, 0.12)', nextStatus: null },
};

const getStatusLabel = (status) => STATUS_CONFIG[status]?.label || 'جديد';

// ==================== BACKGROUND GOOGLE SHEETS SYNC (STORE) ====================
const syncStoreToGoogleSheetsBackground = (actionType, record) => {
  try {
    const savedUrl = typeof window !== 'undefined' ? localStorage.getItem('google_sheet_store_webhook_url') : null;
    if (!savedUrl) return;

    let safeRecord = { ...record };
    if (record?.status) {
      safeRecord.status = getStatusLabel(record.status);
    }
    if (record && record.createdAt) {
      if (typeof record.createdAt.toDate === 'function') {
        safeRecord.date = record.createdAt.toDate().toISOString();
      } else if (record.createdAt.seconds) {
        safeRecord.date = new Date(record.createdAt.seconds * 1000).toISOString();
      }
    }

    fetch(savedUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        type: actionType,
        record: safeRecord,
        old_record: actionType === 'DELETE' ? { id: record.id, phone: record.phone } : undefined,
        items: record?.items || undefined
      })
    });
  } catch (e) {
    console.log('Store Sheet sync note:', e);
  }
};

const AdminCountdownTimer = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState('');
  
  useEffect(() => {
    if (!targetDate) return;
    const target = new Date(targetDate).getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;

      if (distance <= 0) {
        setTimeLeft('انتهى');
        clearInterval(interval);
      } else {
        const d = Math.floor(distance / (1000 * 60 * 60 * 24));
        const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${d}ي ${h}س ${m}د`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (!targetDate) return null;
  return <span className={styles.timerPill}>{timeLeft}</span>;
};

const timeAgo = (dateString) => {
  if (!dateString) return '';
  const date = dateString.toDate ? dateString.toDate() : new Date(dateString);
  const seconds = Math.floor((new Date() - date) / 1000);

  if (seconds < 60) return 'الآن';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  return `منذ ${days} يوم`;
};

const Icons = {
  Image: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>,
  Plus: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Trash: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  Edit: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>,
  Save: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  Box: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m7.5 4.27 9 5.15M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/></svg>,
  ShoppingBag: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  Close: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Clock: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  Phone: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  PhoneMissed: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="23" y1="1" x2="17" y2="7"/><line x1="17" y1="23" x2="23" y2="17"/><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  WhatsApp: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12.01 2.014c-5.46 0-9.89 4.43-9.89 9.89 0 1.76.46 3.47 1.32 4.97L2 22l5.3-1.39c1.45.79 3.09 1.21 4.71 1.21 5.46 0 9.89-4.43 9.89-9.89 0-5.46-4.43-9.89-9.89-9.89zm5.39 14.24c-.23.65-1.33 1.23-1.84 1.32-.47.08-1.07.14-3.4-.82-2.82-1.16-4.63-4.04-4.77-4.23-.14-.19-1.14-1.52-1.14-2.9s.72-2.06.97-2.33c.25-.27.54-.34.72-.34s.36 0 .52.01c.17.01.39-.06.6.45.23.55.77 1.88.84 2.02.07.14.12.3.02.5-.09.19-.14.3-.29.49-.14.18-.3.39-.42.54-.14.16-.28.34-.12.61.16.28.71 1.18 1.53 1.91.56.5 1.34 1.05 1.65 1.21.31.16.5.14.69-.08.19-.22.82-.96 1.04-1.29.23-.33.45-.27.74-.17.29.1 1.84.87 2.16 1.03.32.16.53.24.6.38.08.14.08.82-.16 1.47z"/></svg>,
  Search: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  GoogleSheets: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="8" y1="13" x2="16" y2="13"/>
      <line x1="8" y1="17" x2="16" y2="17"/>
      <line x1="10" y1="9" x2="10" y2="9.01"/>
    </svg>
  ),
  Copy: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
    </svg>
  ),
  DownloadSimple: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  ),
  ExternalLink: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  ),
  Sync: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
    </svg>
  )
};

const INITIAL_STATE = {
  title: '', desc: '', category: 'guides', type: 'always_free',
  priceText: '', originalPrice: '', imageSrcs: ['', '', ''], resourceLink: '',
  expireAt: '', features: ['']
};

export default function StoreAdminPage() {
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'form' | 'orders'
  
  // بيانات المنتجات
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // بيانات الطلبات المجمعة
  const [storeOrders, setStoreOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  
  // تحديد جماعي للطلبات (Bulk Selection)
  const [selectedOrderIds, setSelectedOrderIds] = useState(new Set());

  // مودال Google Sheets
  const [isGoogleSheetModalOpen, setIsGoogleSheetModalOpen] = useState(false);

  const [formData, setFormData] = useState(INITIAL_STATE);
  const [editingId, setEditingId] = useState(null);
  const [uploadingSlots, setUploadingSlots] = useState({ 0: false, 1: false, 2: false });
  const [editingOrder, setEditingOrder] = useState(null);

  // Toasts & Confirm Dialogs
  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  // 1. مزامنة المنتجات
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

  // 2. مزامنة طلبات المنتجات المجانية فقط. مدفوعات leads تبقى للأدمن الرئيسي.
  useEffect(() => {
    const qGifts = query(collection(db, 'gift_leads'), orderBy('createdAt', 'desc'));
    let unsubscribeGifts = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        window.location.replace('/admin');
        return;
      }

      unsubscribeGifts();
      unsubscribeGifts = onSnapshot(qGifts, (snap) => {
        const giftsList = [];
        snap.forEach(d => {
          const data = d.data();
          giftsList.push({
            id: d.id,
            isFromGifts: true,
            ...data,
            pack: data.pack || data.resource || 'منتج مجاني'
          });
        });
        setStoreOrders(giftsList);
        setOrdersLoading(false);
      }, () => setOrdersLoading(false));
    });

    return () => {
      unsubscribeAuth();
      unsubscribeGifts();
    };
  }, []);

  // إحصائيات الطلبات
  const orderStats = useMemo(() => ({
    total: storeOrders.length,
    new: storeOrders.filter(o => o.status === 'new' || !o.status).length,
    contacted: storeOrders.filter(o => o.status === 'contacted').length,
    no_answer: storeOrders.filter(o => o.status === 'no_answer').length,
    qualified: storeOrders.filter(o => o.status === 'qualified').length,
    converted: storeOrders.filter(o => o.status === 'converted').length,
    lost: storeOrders.filter(o => o.status === 'lost').length,
  }), [storeOrders]);

  // فلترة الطلبات
  const filteredOrders = useMemo(() => {
    return storeOrders.filter(order => {
      if (orderStatusFilter !== 'all' && order.status !== orderStatusFilter) return false;
      if (orderSearchQuery.trim()) {
        const q = orderSearchQuery.toLowerCase().trim();
        const matchName = (order.name || '').toLowerCase().includes(q);
        const matchPhone = (order.phone || '').includes(q);
        const matchEmail = (order.email || '').toLowerCase().includes(q);
        const matchPack = (order.pack || '').toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchEmail && !matchPack) return false;
      }
      return true;
    });
  }, [storeOrders, orderStatusFilter, orderSearchQuery]);

  // --- دوال التحديد الجماعي (Bulk Selection Handlers) ---
  const toggleSelectOrder = (id) => {
    setSelectedOrderIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllOrders = () => {
    if (selectedOrderIds.size === filteredOrders.length) {
      setSelectedOrderIds(new Set());
    } else {
      setSelectedOrderIds(new Set(filteredOrders.map(o => o.id)));
    }
  };

  const handleBulkDeleteOrders = () => {
    if (selectedOrderIds.size === 0) return;
    setConfirmDialog({
      isOpen: true,
      title: 'حذف الطلبات المحددة',
      message: `هل أنت متأكد من حذف ${selectedOrderIds.size} طلب محدد نهائياً من السجلات؟`,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        const toastId = showToast('جاري حذف الطلبات المحددة...', 'loading');
        try {
          const toDelete = storeOrders.filter(o => selectedOrderIds.has(o.id));
          for (const order of toDelete) {
            const colName = order.isFromGifts ? 'gift_leads' : 'leads';
            await deleteDoc(doc(db, colName, order.id));
          }

          // مزامنة الحذف الجماعي مع Google Sheets
          syncStoreToGoogleSheetsBackground('DELETE_BULK', {
            items: toDelete.map(o => ({ id: o.id, phone: o.phone }))
          });

          setSelectedOrderIds(new Set());
          updateToast(toastId, `تم حذف ${toDelete.length} طلب بنجاح.`, 'success');
        } catch (err) {
          updateToast(toastId, 'فشل حذف بعض الطلبات.', 'error');
        }
      }
    });
  };

  const handleBulkStatusChangeOrders = async (newStatus) => {
    if (selectedOrderIds.size === 0) return;
    const toastId = showToast('جاري تحديث حالة الطلبات المحددة...', 'loading');
    try {
      const toUpdate = storeOrders.filter(o => selectedOrderIds.has(o.id));
      for (const order of toUpdate) {
        const colName = order.isFromGifts ? 'gift_leads' : 'leads';
        await updateDoc(doc(db, colName, order.id), {
          status: newStatus,
          updatedAt: serverTimestamp()
        });

        // مزامنة التحديث مع Google Sheets
        syncStoreToGoogleSheetsBackground('UPDATE', {
          ...order,
          status: newStatus
        });
      }

      setSelectedOrderIds(new Set());
      updateToast(toastId, `تم تغيير الحالة إلى: ${STATUS_CONFIG[newStatus]?.label || newStatus}`, 'success');
    } catch (err) {
      updateToast(toastId, 'فشل تحديث الحالة للطلبات المحددة.', 'error');
    }
  };

  // --- Toast Manager ---
  const showToast = (message, type = 'success') => {
    const id = Date.now().toString() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    if (type !== 'loading') {
      setTimeout(() => removeToast(id), 4000);
    }
    return id;
  };

  const updateToast = (id, message, type) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, message, type } : t));
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // --- Image Handling ---
  const handleImageUpload = async (e, index) => {
    const file = e.target.files[0];
    if(!file) return;
    
    setUploadingSlots(prev => ({ ...prev, [index]: true }));
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
    
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: data
      });
      const json = await res.json();
      if(json.secure_url) {
        const newImages = [...formData.imageSrcs];
        newImages[index] = json.secure_url;
        setFormData(prev => ({ ...prev, imageSrcs: newImages }));
      } else {
        throw new Error('فشل الرفع السحابي');
      }
    } catch (err) {
      showToast('تعذر رفع الصورة، تأكد من إعدادات Cloudinary.', 'error');
    } finally {
      setUploadingSlots(prev => ({ ...prev, [index]: false }));
    }
  };

  const removeImage = (index) => {
    const newImages = [...formData.imageSrcs];
    newImages[index] = '';
    setFormData(prev => ({ ...prev, imageSrcs: newImages }));
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const removeFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  // --- حفظ / تعديل منتج ---
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    
    const cleanFeatures = formData.features.filter(f => f.trim() !== '');
    const dataToSave = { ...formData, features: cleanFeatures };
    const currentId = editingId;

    setActiveTab('list');
    setFormData(INITIAL_STATE);
    setEditingId(null);
    
    const toastId = showToast('جاري حفظ وتحديث المنتج في الخلفية...', 'loading');

    try {
      if (currentId) {
        await updateDoc(doc(db, 'products', currentId), { ...dataToSave, updatedAt: serverTimestamp() });
        updateToast(toastId, 'تم تعديل المنتج بنجاح.', 'success');
      } else {
        await addDoc(collection(db, 'products'), { ...dataToSave, createdAt: serverTimestamp() });
        updateToast(toastId, 'تمت إضافة المنتج الجديد بنجاح.', 'success');
      }
    } catch (err) {
      updateToast(toastId, 'تعذر الحفظ: ' + err.message, 'error');
    }
  };

  const editProduct = (prod) => {
    setFormData({
      title: prod.title || '', 
      desc: prod.desc || '', 
      category: prod.category || 'guides',
      type: prod.type || 'always_free', 
      priceText: prod.priceText || '', 
      originalPrice: prod.originalPrice || '',
      imageSrcs: prod.imageSrcs?.length ? prod.imageSrcs : [prod.imageSrc || '', '', ''], 
      resourceLink: prod.resourceLink || prod.downloadUrl || '',
      expireAt: prod.expireAt || '',
      features: prod.features?.length > 0 ? prod.features : ['']
    });
    setEditingId(prod.id);
    setActiveTab('form');
  };

  const requestDeleteProduct = (id) => {
    setConfirmDialog({
      isOpen: true,
      title: 'حذف المنتج',
      message: 'هل أنت متأكد من حذف هذا المنتج نهائياً من المتجر؟',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        const toastId = showToast('جاري الحذف...', 'loading');
        try {
          await deleteDoc(doc(db, 'products', id));
          updateToast(toastId, 'تم الحذف بنجاح.', 'success');
        } catch (err) {
          updateToast(toastId, 'فشل الحذف.', 'error');
        }
      }
    });
  };

  // --- تحديث حالة الطلب ---
  const handleUpdateOrderStatus = async (order, newStatus) => {
    const colName = order.isFromGifts ? 'gift_leads' : 'leads';
    try {
      await updateDoc(doc(db, colName, order.id), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      // مزامنة الشيت تلقائياً في الخلفية
      syncStoreToGoogleSheetsBackground('UPDATE', {
        ...order,
        status: newStatus
      });

      showToast(`تم تحديث الحالة إلى: ${STATUS_CONFIG[newStatus]?.label || newStatus}`, 'success');
    } catch (err) {
      showToast('فشل تحديث الحالة', 'error');
    }
  };

  // --- تسجيل "لم يرد" السريع ---
  const handleQuickNoResponse = async (order) => {
    const colName = order.isFromGifts ? 'gift_leads' : 'leads';
    try {
      const currentNotes = order.notes || '';
      let newNotes = '';
      if (!currentNotes.includes('لم يرد')) {
        newNotes = currentNotes ? `لم يرد (محاولة 1)\n${currentNotes}` : 'لم يرد (محاولة 1)';
      } else {
        const match = currentNotes.match(/لم يرد \(محاولة (\d+)\)/);
        const count = match ? parseInt(match[1], 10) + 1 : 2;
        const clean = currentNotes.replace(/لم يرد(?: \(محاولة \d+\))?\n?/, '').trim();
        newNotes = clean ? `لم يرد (محاولة ${count})\n${clean}` : `لم يرد (محاولة ${count})`;
      }

      await updateDoc(doc(db, colName, order.id), {
        notes: newNotes,
        status: 'no_answer',
        updatedAt: serverTimestamp()
      });

      // مزامنة التحديث في الشيت
      syncStoreToGoogleSheetsBackground('UPDATE', {
        ...order,
        notes: newNotes,
        status: 'no_answer'
      });

      showToast('تم تسجيل: لم يرد', 'success');
    } catch (e) {
      showToast('حدث خطأ', 'error');
    }
  };

  // --- حفظ تعديل بيانات الطلب ---
  const handleSaveOrderEdit = async (e) => {
    e.preventDefault();
    if (!editingOrder) return;
    const colName = editingOrder.isFromGifts ? 'gift_leads' : 'leads';

    try {
      const updates = {
        name: editingOrder.name || '',
        phone: editingOrder.phone || '',
        email: editingOrder.email || '',
        pack: editingOrder.pack || editingOrder.resource || '',
        status: editingOrder.status || 'new',
        notes: editingOrder.notes || '',
        updatedAt: serverTimestamp()
      };

      if (editingOrder.isFromGifts) {
        updates.resource = editingOrder.pack || editingOrder.resource || '';
      }

      await updateDoc(doc(db, colName, editingOrder.id), updates);

      // مزامنة التعديل في الشيت
      syncStoreToGoogleSheetsBackground('UPDATE', {
        ...editingOrder,
        ...updates
      });

      showToast('تم تحديث بيانات وحالة الطلب بنجاح', 'success');
      setEditingOrder(null);
    } catch (err) {
      showToast('فشل حفظ التعديل: ' + err.message, 'error');
    }
  };

  // --- حذف الطلب ---
  const requestDeleteOrder = (order) => {
    const colName = order.isFromGifts ? 'gift_leads' : 'leads';
    setConfirmDialog({
      isOpen: true,
      title: 'حذف الطلب',
      message: 'هل أنت متأكد من حذف هذا الطلب نهائياً من السجلات؟',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          await deleteDoc(doc(db, colName, order.id));

          // مزامنة حذف السطر من الشيت
          syncStoreToGoogleSheetsBackground('DELETE', {
            id: order.id,
            phone: order.phone || ''
          });

          showToast('تم حذف الطلب بنجاح', 'success');
        } catch (err) {
          showToast('فشل الحذف', 'error');
        }
      }
    });
  };

  const handleTypeChange = (e) => {
    const type = e.target.value;
    let priceText = formData.priceText;
    if (type === 'always_free') priceText = 'منتج مجاني';
    if (type === 'limited_free') priceText = 'مجاني لفترة محدودة';
    
    setFormData({ ...formData, type, priceText });
  };

  return (
    <div className={styles.storeApp}>
      <div className="aurora-fixed-canvas" aria-hidden="true">
        <div className="aurora-orb orb-hero" />
        <div className="aurora-orb orb-middle" />
      </div>

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brandGroup}>
            <BoostraLogo size={36} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 className={styles.title}>إدارة المتجر والمبيعات</h1>
                <span className={styles.statusPill}>{products.length} منتج معروض</span>
              </div>
              <p className={styles.desc}>Boostra Agency — إدارة المنتجات الرقمية والطلبيات</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setIsGoogleSheetModalOpen(true)}
              className={styles.btnGoogleSheetsHeader}
              title="تصدير ومزامنة طلبات المتجر مع Google Sheets"
            >
              <Icons.GoogleSheets />
              <span>Google Sheets</span>
            </button>

            <Link href="/admin" className={styles.btnSecondary}>
              <span>العودة للوحة الإدارة</span>
              <span>←</span>
            </Link>
          </div>
        </div>
      </header>

      <main className={styles.mainContainer}>
        <div className={styles.layoutGrid}>
          
          {/* المسار الجانبي (Side Trail) */}
          <aside className={styles.sideTrail}>
            <nav className={styles.sideMenu}>
              <button 
                onClick={() => { setActiveTab('list'); setEditingId(null); setFormData(INITIAL_STATE); }} 
                className={`${styles.trailItem} ${activeTab === 'list' ? styles.trailItemActive : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icons.Box />
                  <span className={styles.trailLabel}>جميع المنتجات</span>
                </div>
              </button>

              <button 
                onClick={() => { setActiveTab('orders'); }} 
                className={`${styles.trailItem} ${activeTab === 'orders' ? styles.trailItemActive : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icons.ShoppingBag />
                  <span className={styles.trailLabel}>طلبات المتجر</span>
                </div>
                {orderStats.new > 0 && (
                  <span className={styles.ordersBadgeCount}>{orderStats.new}</span>
                )}
              </button>

              <button 
                onClick={() => setActiveTab('form')} 
                className={`${styles.trailItem} ${activeTab === 'form' ? styles.trailItemActive : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icons.Plus />
                  <span className={styles.trailLabel}>{editingId ? 'تعديل المنتج الحالي' : 'إضافة منتج جديد'}</span>
                </div>
              </button>
            </nav>
          </aside>

          {/* مساحة العرض الرئيسية */}
          <section className={styles.viewportArea}>
            
            {/* =========================================
                TAB 1: PRODUCTS LIST (جميع المنتجات)
               ========================================= */}
            {activeTab === 'list' && (
              <div className={styles.softCard}>
                <div className={styles.cardContent}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>المنتجات المعروضة حالياً</h2>
                    <button onClick={() => setActiveTab('form')} className={styles.btnPrimarySmall}>
                      <Icons.Plus /> <span>إضافة منتج</span>
                    </button>
                  </div>

                  {loading ? (
                    <div className={styles.loaderContainer}>
                      <BoostraLogo size={44} isAnimating={true} />
                      <span style={{ marginTop: '12px', color: '#64748B', fontSize: '13.5px', fontWeight: 600 }}>جاري التحميل...</span>
                    </div>
                  ) : products.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B' }}>
                      <p style={{ fontWeight: 700, fontSize: '15px' }}>لا توجد منتجات معروضة حالياً.</p>
                      <p style={{ fontSize: '13px', marginTop: '6px' }}>أضف دليلاً أو أداة جديدة لتظهر لعملائك.</p>
                    </div>
                  ) : (
                    <div className={styles.productsGrid}>
                      {products.map(prod => {
                        const coverImg = prod.imageSrcs?.[0] || prod.imageSrc;
                        return (
                          <div key={prod.id} className={styles.productItemCard}>
                            <div className={styles.productItemImgBox}>
                              {coverImg ? (
                                <img src={coverImg} alt={prod.title} className={styles.productItemImg} />
                              ) : (
                                <Icons.Image />
                              )}
                              
                              <div className={styles.badgesCluster}>
                                <span className={styles.productBadge}>
                                  {prod.type === 'paid' ? 'أداة احترافية' : (prod.type === 'limited_free' ? 'عرض مؤقت' : 'منتج مجاني')}
                                </span>

                                {prod.type === 'limited_free' && prod.expireAt && (
                                  <div className={styles.timerBadgeBox}>
                                    <Icons.Clock />
                                    <AdminCountdownTimer targetDate={prod.expireAt} />
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className={styles.productItemInfo}>
                              <h3 className={styles.productItemTitle} title={prod.title}>{prod.title}</h3>
                              <div className={styles.productItemMeta}>
                                <span className={styles.productItemPrice}>{prod.priceText}</span>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button onClick={() => editProduct(prod)} className={styles.iconBtn} title="تعديل"><Icons.Edit /></button>
                                  <button onClick={() => requestDeleteProduct(prod.id)} className={`${styles.iconBtn} ${styles.iconBtnDanger}`} title="حذف"><Icons.Trash /></button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <UnifiedBrandPattern />
              </div>
            )}

            {/* =========================================
                TAB 2: STORE ORDERS (طلبات المتجر ومتابعة المبيعات)
               ========================================= */}
            {activeTab === 'orders' && (
              <div className={styles.softCard}>
                <div className={styles.cardContent}>
                  
                  <div className={styles.cardHeader}>
                    <div>
                      <h2 className={styles.cardTitle}>طلبيات ومبيعات المتجر الرقمي</h2>
                      <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 0 0' }}>متابعة طلبات شراء الأدوات والمنتجات وتأكيد الدفع والتسليم</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsGoogleSheetModalOpen(true)}
                      className={styles.btnGoogleSheetsSmall}
                      title="مزامنة وتصدير إلى Google Sheets"
                    >
                      <Icons.GoogleSheets />
                      <span>تصدير Google Sheets</span>
                    </button>
                  </div>

                  {/* شريط إحصائيات الحالات الموحد */}
                  <div className={styles.ordersStatsStrip}>
                    <div onClick={() => setOrderStatusFilter('all')} className={`${styles.orderStatNode} ${orderStatusFilter === 'all' ? styles.orderStatActive : ''}`} style={{ '--node-c': '#0000FF' }}>
                      <span className={styles.orderStatLabel}>إجمالي الطلبات</span>
                      <span className={styles.orderStatVal}>{orderStats.total}</span>
                    </div>
                    <div onClick={() => setOrderStatusFilter('new')} className={`${styles.orderStatNode} ${orderStatusFilter === 'new' ? styles.orderStatActive : ''}`} style={{ '--node-c': STATUS_CONFIG.new.color }}>
                      <span className={styles.orderStatLabel}>جديد</span>
                      <span className={styles.orderStatVal}>{orderStats.new}</span>
                    </div>
                    <div onClick={() => setOrderStatusFilter('contacted')} className={`${styles.orderStatNode} ${orderStatusFilter === 'contacted' ? styles.orderStatActive : ''}`} style={{ '--node-c': STATUS_CONFIG.contacted.color }}>
                      <span className={styles.orderStatLabel}>تم الاتصال</span>
                      <span className={styles.orderStatVal}>{orderStats.contacted}</span>
                    </div>
                    <div onClick={() => setOrderStatusFilter('no_answer')} className={`${styles.orderStatNode} ${orderStatusFilter === 'no_answer' ? styles.orderStatActive : ''}`} style={{ '--node-c': STATUS_CONFIG.no_answer.color }}>
                      <span className={styles.orderStatLabel}>لم يرد</span>
                      <span className={styles.orderStatVal}>{orderStats.no_answer}</span>
                    </div>
                    <div onClick={() => setOrderStatusFilter('qualified')} className={`${styles.orderStatNode} ${orderStatusFilter === 'qualified' ? styles.orderStatActive : ''}`} style={{ '--node-c': STATUS_CONFIG.qualified.color }}>
                      <span className={styles.orderStatLabel}>مؤهل للشراء</span>
                      <span className={styles.orderStatVal}>{orderStats.qualified}</span>
                    </div>
                    <div onClick={() => setOrderStatusFilter('converted')} className={`${styles.orderStatNode} ${orderStatusFilter === 'converted' ? styles.orderStatActive : ''}`} style={{ '--node-c': STATUS_CONFIG.converted.color }}>
                      <span className={styles.orderStatLabel}>تم البيع والتسليم</span>
                      <span className={styles.orderStatVal}>{orderStats.converted}</span>
                    </div>
                    <div onClick={() => setOrderStatusFilter('lost')} className={`${styles.orderStatNode} ${orderStatusFilter === 'lost' ? styles.orderStatActive : ''}`} style={{ '--node-c': STATUS_CONFIG.lost.color }}>
                      <span className={styles.orderStatLabel}>ملغي</span>
                      <span className={styles.orderStatVal}>{orderStats.lost}</span>
                    </div>
                  </div>

                  {/* شريط البحث */}
                  <div className={styles.orderSearchShell}>
                    <span style={{ color: '#64748B', display: 'flex' }}><Icons.Search /></span>
                    <input 
                      type="text"
                      placeholder="بحث باسم الزبون، الهاتف، أو اسم الأداة المطلوبة..."
                      value={orderSearchQuery}
                      onChange={e => setOrderSearchQuery(e.target.value)}
                      className={styles.orderSearchInput}
                    />
                    {orderSearchQuery && (
                      <button onClick={() => setOrderSearchQuery('')} className={styles.clearSearchBtn}><Icons.Close /></button>
                    )}
                  </div>

                  {/* شريط تحديد الكل المعتمد */}
                  <div className={styles.selectAllHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={selectedOrderIds.size === filteredOrders.length && filteredOrders.length > 0}
                        onChange={toggleSelectAllOrders}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#0000FF' }}
                      />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>
                        تحديد الكل ({filteredOrders.length})
                      </span>
                    </div>

                    {selectedOrderIds.size > 0 && (
                      <span style={{ fontSize: '13px', color: '#0000FF', fontWeight: 700 }}>
                        تم تحديد {selectedOrderIds.size} طلب
                      </span>
                    )}
                  </div>

                  {/* شبكة بطاقات الطلبات */}
                  {ordersLoading ? (
                    <div className={styles.loaderContainer}>
                      <BoostraLogo size={40} isAnimating={true} />
                      <span style={{ marginTop: '10px', fontSize: '13px', color: '#64748B' }}>جاري جلب الطلبات...</span>
                    </div>
                  ) : filteredOrders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748B' }}>
                      <p style={{ fontWeight: 700, fontSize: '14.5px' }}>لا توجد طلبات متجر مطابقة للمعايير الحالية.</p>
                    </div>
                  ) : (
                    <div className={styles.ordersCardsGrid}>
                      {filteredOrders.map(order => {
                        const status = order.status || 'new';
                        const statusConf = STATUS_CONFIG[status] || STATUS_CONFIG.new;
                        const nextStatus = statusConf.nextStatus;
                        const cleanPhone = (order.phone || '').replace(/[^0-9]/g, '');
                        const waNumber = cleanPhone.startsWith('0') && cleanPhone.length === 10 ? '213' + cleanPhone.substring(1) : cleanPhone;
                        const waText = encodeURIComponent(`مرحباً ${order.name || 'صديقنا'}، معك فريق Boostra Agency بخصوص طلبك لـ "${order.pack || 'المنتج الرقمي'}".`);
                        const isSelected = selectedOrderIds.has(order.id);

                        return (
                          <div 
                            key={order.id} 
                            className={`${styles.storeOrderCard} ${isSelected ? styles.storeOrderCardSelected : ''}`}
                          >
                            
                            {/* رأس بطاقة الطلب */}
                            <div className={styles.orderCardHeader}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelectOrder(order.id)}
                                  style={{ width: '17px', height: '17px', cursor: 'pointer', accentColor: '#0000FF' }}
                                />
                                <div>
                                  <h3 className={styles.orderClientName}>{order.name || 'بدون اسم'}</h3>
                                  <span className={styles.orderTimeAgo}>{timeAgo(order.createdAt)}</span>
                                </div>
                              </div>

                              <span className={styles.orderStatusBadge} style={{ backgroundColor: statusConf.bg, color: statusConf.color, border: `1px solid ${statusConf.color}30` }}>
                                {statusConf.label}
                              </span>
                            </div>

                            {/* تفاصيل المنتج والاتصال */}
                            <div className={styles.orderDetailsBox}>
                              <div className={styles.orderDetailRow}>
                                <span className={styles.orderDetailLbl}>المنتج المطلوب:</span>
                                <span className={styles.orderProductTitle}>{order.pack || 'منتج غير محدد'}</span>
                              </div>

                              <div className={styles.orderDetailRow}>
                                <span className={styles.orderDetailLbl}>الهاتف:</span>
                                <span className={styles.orderPhoneText}>{order.phone || '—'}</span>
                              </div>

                              {order.email && (
                                <div className={styles.orderDetailRow}>
                                  <span className={styles.orderDetailLbl}>البريد:</span>
                                  <span className={styles.orderEmailText}>{order.email}</span>
                                </div>
                              )}
                            </div>

                            {/* سجل الملاحظات ومحاولات الاتصال */}
                            {order.notes && (
                              <div className={styles.orderNotesDisplay}>
                                {order.notes}
                              </div>
                            )}

                            {/* أزرار الإجراءات السريعة */}
                            <div className={styles.orderActionsFooter}>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <a 
                                  href={`tel:${order.phone}`} 
                                  className={`${styles.orderQuickBtn} ${styles.btnCall}`}
                                  title="اتصال هاتفي"
                                >
                                  <Icons.Phone />
                                </a>

                                <a 
                                  href={`https://wa.me/${waNumber}?text=${waText}`} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className={`${styles.orderQuickBtn} ${styles.btnWa}`}
                                  title="محادثة واتساب مجهزة"
                                >
                                  <Icons.WhatsApp />
                                </a>

                                <button 
                                  type="button" 
                                  onClick={() => handleQuickNoResponse(order)}
                                  className={`${styles.orderQuickBtn} ${styles.btnMissed}`}
                                  title="تسجيل: لم يرد"
                                >
                                  <Icons.PhoneMissed />
                                  <span>لم يرد</span>
                                </button>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {nextStatus && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateOrderStatus(order, nextStatus)}
                                    className={styles.btnNextStatus}
                                    style={{
                                      backgroundColor: STATUS_CONFIG[nextStatus].bg,
                                      color: STATUS_CONFIG[nextStatus].color,
                                      borderColor: `${STATUS_CONFIG[nextStatus].color}40`
                                    }}
                                  >
                                    {STATUS_CONFIG[nextStatus].label}
                                  </button>
                                )}

                                <button 
                                  type="button" 
                                  onClick={() => setEditingOrder({ ...order, pack: order.pack || order.resource || '' })} 
                                  className={`${styles.orderQuickBtn} ${styles.btnEdit}`}
                                  title="تعديل بيانات وحالة الطلب"
                                >
                                  <Icons.Edit />
                                </button>

                                <button 
                                  type="button" 
                                  onClick={() => requestDeleteOrder(order)} 
                                  className={`${styles.orderQuickBtn} ${styles.btnDelete}`}
                                  title="حذف الطلب"
                                >
                                  <Icons.Trash />
                                </button>
                              </div>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
                <UnifiedBrandPattern />
              </div>
            )}

            {/* =========================================
                TAB 3: ADD/EDIT FORM (إضافة وتعديل منتج)
               ========================================= */}
            {activeTab === 'form' && (
              <div className={styles.softCard}>
                <div className={styles.cardContent}>
                  <h2 className={styles.cardTitle} style={{ marginBottom: '24px' }}>
                    {editingId ? 'تعديل بيانات المنتج' : 'إضافة منتج رقمي جديد'}
                  </h2>

                  <form onSubmit={handleSaveProduct} className={styles.formLayout}>
                    
                    {/* الصور الثلاث */}
                    <div className={styles.imageUploadSection}>
                      <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '10px' }}>
                        صور الغلاف (حتى 3 صور للعرض):
                      </label>
                      <div className={styles.imageSlotsGrid}>
                        {[0, 1, 2].map(idx => (
                          <div key={idx} className={styles.imageSlotBox}>
                            {formData.imageSrcs[idx] ? (
                              <>
                                <img src={formData.imageSrcs[idx]} alt="Preview" className={styles.slotImg} />
                                <button type="button" onClick={() => removeImage(idx)} className={styles.btnRemoveImg}>
                                  <Icons.Close />
                                </button>
                              </>
                            ) : uploadingSlots[idx] ? (
                              <div className={styles.slotLoader}>
                                <BoostraLogo size={22} isAnimating={true} />
                              </div>
                            ) : (
                              <label className={styles.slotUploadLabel}>
                                <Icons.Plus />
                                <span>رفع صورة</span>
                                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, idx)} style={{ display: 'none' }} />
                              </label>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={styles.tactileGroup}>
                      <label>اسم المنتج / الأداة: *</label>
                      <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="مثال: دليل إعلانات المتاجر 2026" className={styles.tactileInput} />
                    </div>

                    <div className={styles.tactileGroup}>
                      <label>وصف جذاب: *</label>
                      <textarea required rows={3} value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} placeholder="نبذة توضح القيمة التي يقدمها المنتج للزبون..." className={`${styles.tactileInput} ${styles.tactileTextarea}`} />
                    </div>

                    <div className={styles.gridTwo}>
                      <div className={styles.tactileGroup}>
                        <label>التصنيف:</label>
                        <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className={styles.tactileInput}>
                          <option value="guides">أدلة واستراتيجيات</option>
                          <option value="templates">قوالب ونصوص</option>
                          <option value="tools">حاسبات وأدوات</option>
                          <option value="courses">برامج وتدريب</option>
                        </select>
                      </div>

                      <div className={styles.tactileGroup}>
                        <label>نوع الطرح:</label>
                        <select value={formData.type} onChange={handleTypeChange} className={styles.tactileInput}>
                          <option value="always_free">مجاني بشكل دائم</option>
                          <option value="limited_free">مجاني لفترة محدودة</option>
                          <option value="paid">أداة احترافية مدفوعة</option>
                        </select>
                      </div>
                    </div>

                    {formData.type === 'limited_free' && (
                      <div className={styles.tactileGroup}>
                        <label>تاريخ ووقت انتهاء العرض المجاني: *</label>
                        <input 
                          type="datetime-local" 
                          required 
                          value={formData.expireAt} 
                          onChange={e => setFormData({...formData, expireAt: e.target.value})} 
                          className={styles.tactileInput} 
                          style={{ direction: 'ltr', textAlign: 'left' }}
                        />
                      </div>
                    )}

                    <div className={styles.gridTwo}>
                      <div className={styles.tactileGroup}>
                        <label>نص السعر المكتوب: *</label>
                        <input type="text" required value={formData.priceText} onChange={e => setFormData({...formData, priceText: e.target.value})} placeholder="مثال: منتج مجاني أو 7,900 د.ج" className={styles.tactileInput} />
                      </div>

                      <div className={styles.tactileGroup}>
                        <label>السعر الأصلي المشطوب (اختياري):</label>
                        <input type="text" value={formData.originalPrice} onChange={e => setFormData({...formData, originalPrice: e.target.value})} placeholder="مثال: 3,500 د.ج" className={styles.tactileInput} />
                      </div>
                    </div>

                    <div className={styles.tactileGroup}>
                      <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>العناصر المشمولة (ماذا يتضمن هذا المنتج؟)</span>
                        <button type="button" onClick={addFeature} className={styles.btnAddFeature}>+ عنصر جديد</button>
                      </label>
                      <div className={styles.featuresList}>
                        {formData.features.map((feat, index) => (
                          <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input 
                              type="text" 
                              value={feat} 
                              onChange={e => handleFeatureChange(index, e.target.value)} 
                              placeholder="ميزة يقدمها المنتج..." 
                              className={styles.tactileInput} 
                            />
                            {formData.features.length > 1 && (
                              <button type="button" onClick={() => removeFeature(index)} className={styles.btnRemoveFeature} title="حذف">
                                <Icons.Trash />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={styles.tactileGroup}>
                      <label>رابط المصدر (Google Drive / السحابة):</label>
                      <p style={{ fontSize: '11px', color: '#64748B', margin: '0 0 6px 0' }}>يُرسل هذا الرابط تلقائياً لبريد الزبون بعد استلام طلبه.</p>
                      <input type="url" value={formData.resourceLink} onChange={e => setFormData({...formData, resourceLink: e.target.value})} placeholder="https://drive.google.com/..." className={styles.tactileInput} style={{ direction: 'ltr', textAlign: 'left' }} />
                    </div>

                    <div className={styles.formActions}>
                      {editingId && (
                        <button type="button" onClick={() => { setEditingId(null); setActiveTab('list'); setFormData(INITIAL_STATE); }} className={styles.btnCancel}>إلغاء التعديل</button>
                      )}
                      <button type="submit" className={styles.btnSave}>
                        <Icons.Save /> <span>{editingId ? 'حفظ التعديلات' : 'إضافة المنتج ونشره'}</span>
                      </button>
                    </div>

                  </form>
                </div>
                <UnifiedBrandPattern />
              </div>
            )}

          </section>
        </div>
      </main>

      {/* =========================================================================
          شريط الإجراءات الجماعية العائم (Prominent Bulk Floating Dock)
         ========================================================================= */}
      {activeTab === 'orders' && selectedOrderIds.size > 0 && (
        <div className={styles.prominentBulkBar}>
          
          {/* شريط الديسكتوب المتناسق والبارز */}
          <div className={styles.bulkBarDesktopLayout}>
            <div className={styles.bulkBadgeBox}>
              <span className={styles.bulkCountBadge}>{selectedOrderIds.size}</span>
              <span className={styles.bulkCountTxt}>طلبات محددة</span>
            </div>

            <div className={styles.bulkVerticalLine} />

            <div className={styles.bulkStatusRow}>
              <span className={styles.bulkSectionLabel}>تغيير الحالة إلى:</span>
              <button 
                type="button"
                onClick={() => handleBulkStatusChangeOrders('contacted')} 
                className={styles.bulkActionPill}
              >
                <span className={styles.colorDot} style={{ backgroundColor: STATUS_CONFIG.contacted.color }} />
                تم الاتصال
              </button>
              <button 
                type="button"
                onClick={() => handleBulkStatusChangeOrders('no_answer')} 
                className={styles.bulkActionPill}
              >
                <span className={styles.colorDot} style={{ backgroundColor: STATUS_CONFIG.no_answer.color }} />
                لم يرد
              </button>
              <button 
                type="button"
                onClick={() => handleBulkStatusChangeOrders('qualified')} 
                className={styles.bulkActionPill}
              >
                <span className={styles.colorDot} style={{ backgroundColor: STATUS_CONFIG.qualified.color }} />
                مؤهل للشراء
              </button>
              <button 
                type="button"
                onClick={() => handleBulkStatusChangeOrders('converted')} 
                className={styles.bulkActionPill}
              >
                <span className={styles.colorDot} style={{ backgroundColor: STATUS_CONFIG.converted.color }} />
                تم البيع
              </button>
              <button 
                type="button"
                onClick={() => handleBulkStatusChangeOrders('lost')} 
                className={styles.bulkActionPill}
              >
                <span className={styles.colorDot} style={{ backgroundColor: STATUS_CONFIG.lost.color }} />
                ملغي
              </button>
            </div>

            <div className={styles.bulkVerticalLine} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                type="button"
                onClick={handleBulkDeleteOrders} 
                className={styles.bulkDeleteProminent}
              >
                <Icons.Trash />
                <span>حذف المحدد</span>
              </button>

              <button 
                type="button"
                onClick={() => setSelectedOrderIds(new Set())} 
                className={styles.bulkDismissBtn} 
                title="إلغاء التحديد"
              >
                <Icons.Close />
              </button>
            </div>
          </div>

          {/* شريط الموبايل المنظم (Mobile 2-Tier Dock) */}
          <div className={styles.bulkBarMobileDock}>
            <div className={styles.bulkMTopRow}>
              <div className={styles.bulkBadgeBox}>
                <span className={styles.bulkCountBadge}>{selectedOrderIds.size}</span>
                <span className={styles.bulkCountTxt} style={{ fontSize: '13px' }}>طلبات محددة</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                  type="button"
                  onClick={handleBulkDeleteOrders} 
                  className={styles.bulkDeleteProminentMobile}
                >
                  <Icons.Trash />
                  <span>حذف ({selectedOrderIds.size})</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setSelectedOrderIds(new Set())} 
                  className={styles.bulkDismissBtn}
                >
                  <Icons.Close />
                </button>
              </div>
            </div>

            <div className={styles.bulkMStatusGrid}>
              <button 
                type="button"
                onClick={() => handleBulkStatusChangeOrders('contacted')} 
                className={styles.bulkMChip}
              >
                تم الاتصال
              </button>
              <button 
                type="button"
                onClick={() => handleBulkStatusChangeOrders('no_answer')} 
                className={styles.bulkMChip}
              >
                لم يرد
              </button>
              <button 
                type="button"
                onClick={() => handleBulkStatusChangeOrders('qualified')} 
                className={styles.bulkMChip}
              >
                مؤهل
              </button>
              <button 
                type="button"
                onClick={() => handleBulkStatusChangeOrders('converted')} 
                className={styles.bulkMChip}
              >
                تم البيع
              </button>
              <button 
                type="button"
                onClick={() => handleBulkStatusChangeOrders('lost')} 
                className={styles.bulkMChip}
              >
                ملغي
              </button>
            </div>
          </div>

        </div>
      )}

      {/* --- نافذة تصدير ومزامنة GOOGLE SHEETS لطلبات المتجر --- */}
      <GoogleSheetsStoreModal
        isOpen={isGoogleSheetModalOpen}
        onClose={() => setIsGoogleSheetModalOpen(false)}
        orders={filteredOrders}
        showToast={showToast}
      />

      {/* --- مودال تعديل بيانات وحالة الطلب عبر EMAILMODAL الموحد --- */}
      <EmailModal
        isOpen={Boolean(editingOrder)}
        onClose={() => setEditingOrder(null)}
        title="تعديل طلب الزبون"
        subtitle="تعديل بيانات الزبون، المنتج المطلوب، وسجل المتابعة والحالة."
        maxWidth="500px"
      >
        {editingOrder && (
          <form onSubmit={handleSaveOrderEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className={styles.tactileGroup}>
              <label>اسم الزبون:</label>
              <input 
                type="text" 
                value={editingOrder.name || ''} 
                onChange={e => setEditingOrder({ ...editingOrder, name: e.target.value })} 
                className={styles.tactileInput} 
              />
            </div>

            <div className={styles.gridTwo}>
              <div className={styles.tactileGroup}>
                <label>رقم الهاتف:</label>
                <input 
                  type="tel" 
                  value={editingOrder.phone || ''} 
                  onChange={e => setEditingOrder({ ...editingOrder, phone: e.target.value })} 
                  className={styles.tactileInput} 
                  style={{ direction: 'ltr', textAlign: 'right' }} 
                />
              </div>

              <div className={styles.tactileGroup}>
                <label>حالة الطلب:</label>
                <select 
                  value={editingOrder.status || 'new'} 
                  onChange={e => setEditingOrder({ ...editingOrder, status: e.target.value })} 
                  className={styles.tactileInput}
                >
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.tactileGroup}>
              <label>المنتج / الباقة المطلوبة:</label>
              <input 
                type="text" 
                value={editingOrder.pack || ''} 
                onChange={e => setEditingOrder({ ...editingOrder, pack: e.target.value })} 
                className={styles.tactileInput} 
              />
            </div>

            <div className={styles.tactileGroup}>
              <label>البريد الإلكتروني:</label>
              <input 
                type="email" 
                value={editingOrder.email || ''} 
                onChange={e => setEditingOrder({ ...editingOrder, email: e.target.value })} 
                className={styles.tactileInput} 
                style={{ direction: 'ltr', textAlign: 'right' }} 
              />
            </div>

            {/* ملاحظات المتابعة مع أزرار سريعة */}
            <div className={styles.tactileGroup}>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>سجل وملاحظات المتابعة:</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
                {['تم الرد', 'تم إرسال تفاصيل الدفع', 'طلب مهلة', 'السعر غير مناسب', 'الرقم مغلق'].map(chip => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setEditingOrder(prev => ({
                      ...prev,
                      notes: prev.notes ? `${chip}\n${prev.notes}` : chip
                    }))}
                    className={styles.tokenBtn}
                  >
                    + {chip}
                  </button>
                ))}
              </div>
              <textarea 
                rows={3} 
                value={editingOrder.notes || ''} 
                onChange={e => setEditingOrder({ ...editingOrder, notes: e.target.value })} 
                placeholder="اكتب تفاصيل الاتصال بالزبون..." 
                className={`${styles.tactileInput} ${styles.tactileTextarea}`} 
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button type="button" className={styles.btnCancel} onClick={() => setEditingOrder(null)}>إلغاء</button>
              <button type="submit" className={styles.btnSave} style={{ height: '42px', padding: '0 20px', fontSize: '13px' }}>حفظ التعديلات</button>
            </div>
          </form>
        )}
      </EmailModal>

      {/* --- نافذة تأكيد الحذف عبر EMAILMODAL الموحد --- */}
      <EmailModal
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        title={confirmDialog.title || "تأكيد الإجراء"}
        maxWidth="440px"
        showPattern={false}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
            {confirmDialog.message}
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button 
              type="button" 
              className={styles.btnCancel} 
              onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
            >
              إلغاء
            </button>
            <button 
              type="button" 
              className={styles.btnDialogDanger} 
              onClick={confirmDialog.onConfirm}
            >
              تأكيد الحذف
            </button>
          </div>
        </div>
      </EmailModal>

      {/* --- TOAST CONTAINER --- */}
      <div className={styles.toastContainer}>
        {toasts.map(t => (
          <div key={t.id} className={`${styles.toastMessage} ${t.type === 'loading' ? styles.toastLoading : (t.type === 'error' ? styles.toastError : styles.toastSuccess)}`}>
            {t.type === 'loading' ? (
              <BoostraLogo size={20} isAnimating={true} />
            ) : t.type === 'success' ? (
              <Icons.Check />
            ) : null}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== مودال GOOGLE SHEETS المخصص لطلبات المتجر ====================
function GoogleSheetsStoreModal({ isOpen, onClose, orders, showToast }) {
  const [copied, setCopied] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('google_sheet_store_webhook_url');
      if (saved) setWebhookUrl(saved);
    }
  }, []);

  const copyForGoogleSheets = async () => {
    try {
      const headers = ['اسم الزبون', 'رقم الهاتف', 'البريد الإلكتروني', 'المنتج المطلوب', 'نوع الطلب', 'الحالة', 'ملاحظات المتابعة', 'تاريخ الطلب'];
      const rows = orders.map(o => [
        o.name || 'بدون اسم',
        o.phone ? "'" + String(o.phone).trim() : '',
        o.email || '',
        o.pack || o.resource || o.productTitle || '',
        o.isFromGifts ? 'منتج مجاني' : 'طلب شراء متجر',
        getStatusLabel(o.status),
        (o.notes || '').replace(/\r?\n/g, ' '),
        o.createdAt?.toDate ? o.createdAt.toDate().toLocaleString('ar-DZ') : ''
      ]);

      const tsv = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
      await navigator.clipboard.writeText(tsv);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
      showToast('تم نسخ بيانات طلبات المتجر بتنسيق جداول البيانات', 'success');
    } catch (e) {
      showToast('تعذر نسخ البيانات', 'error');
    }
  };

  const downloadStoreCsv = () => {
    try {
      const headers = ['اسم الزبون', 'رقم الهاتف', 'البريد الإلكتروني', 'المنتج المطلوب', 'نوع الطلب', 'الحالة', 'ملاحظات المتابعة', 'تاريخ الطلب'];
      const rows = orders.map(o => [
        `"${(o.name || '').replace(/"/g, '""')}"`,
        `"${(o.phone || '').replace(/"/g, '""')}"`,
        `"${(o.email || '').replace(/"/g, '""')}"`,
        `"${(o.pack || o.resource || o.productTitle || '').replace(/"/g, '""')}"`,
        `"${o.isFromGifts ? 'منتج مجاني' : 'طلب شراء متجر'}"`,
        `"${getStatusLabel(o.status)}"`,
        `"${(o.notes || '').replace(/"/g, '""')}"`,
        `"${o.createdAt?.toDate ? o.createdAt.toDate().toLocaleString('ar-DZ') : ''}"`
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `boostra_store_orders_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('تم تنزيل ملف CSV بنجاح', 'success');
    } catch (e) {
      showToast('فشل تصدير ملف CSV', 'error');
    }
  };

  const syncToWebhook = async () => {
    if (!webhookUrl.trim()) {
      showToast('يرجى إدخال رابط Webhook الخاص بـ Google Sheet أولاً', 'error');
      return;
    }

    setSyncing(true);
    try {
      localStorage.setItem('google_sheet_store_webhook_url', webhookUrl.trim());
      const payload = {
        orders: orders.map(o => ({
          id: o.id,
          name: o.name || 'بدون اسم',
          phone: o.phone || '',
          email: o.email || '',
          pack: o.pack || o.resource || o.productTitle || 'منتج غير محدد',
          isFromGifts: Boolean(o.isFromGifts),
          status: getStatusLabel(o.status),
          notes: o.notes || '',
          date: o.createdAt?.toDate ? o.createdAt.toDate().toLocaleString('ar-DZ') : ''
        }))
      };

      await fetch(webhookUrl.trim(), {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });

      showToast('تم إرسال أمر المزامنة لـ Google Sheets بنجاح!', 'success');
    } catch (e) {
      showToast('تعذر إرسال البيانات للـ Webhook', 'error');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <EmailModal
      isOpen={isOpen}
      onClose={onClose}
      title="تصدير ومزامنة طلبات المتجر مع Google Sheets"
      subtitle="إدارة وتصدير كل طلبيات الأدوات والمنتجات ومزامنتها لحظياً مع جدولك السحابي."
      maxWidth="540px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {/* الخيار 1: نسخ فوري */}
        <div
          onClick={copyForGoogleSheets}
          className={styles.gsOptionCard}
          style={{
            borderColor: copied ? '#10B981' : 'rgba(15, 23, 42, 0.08)',
            backgroundColor: copied ? 'rgba(16, 185, 129, 0.06)' : 'rgba(15, 23, 42, 0.02)'
          }}
        >
          <div className={styles.gsOptionIcon} style={{ backgroundColor: copied ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0, 0, 255, 0.08)', color: copied ? '#10B981' : '#0000FF' }}>
            <Icons.Copy />
          </div>
          <div>
            <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A', display: 'block' }}>
              {copied ? 'تم النسخ بنجاح! الصق الآن (Ctrl+V) في الشيت الجديد' : 'نسخ بتنسيق Google Sheets (الموصى به)'}
            </span>
            <span style={{ fontSize: '11.5px', color: '#64748B' }}>
              انسخ كل طلبيات المتجر الحالية بضغطة واحدة وافتح جدول الشيت والصقها فورا.
            </span>
          </div>
        </div>

        {/* الخيار 2: تنزيل CSV */}
        <div onClick={downloadStoreCsv} className={styles.gsOptionCard}>
          <div className={styles.gsOptionIcon} style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#059669' }}>
            <Icons.DownloadSimple />
          </div>
          <div>
            <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A', display: 'block' }}>
              تحميل ملف CSV متوافق باللغة العربية
            </span>
            <span style={{ fontSize: '11.5px', color: '#64748B' }}>
              ملف مهيأ بحروف UTF-8 يفتح بدون أي تشويه في الإكسل وGoogle Sheets.
            </span>
          </div>
        </div>

        {/* الخيار 3: فتح صفحة جديدة */}
        <a
          href="https://sheets.new"
          target="_blank"
          rel="noreferrer"
          className={styles.gsOptionCard}
          style={{ textDecoration: 'none' }}
        >
          <div className={styles.gsOptionIcon} style={{ backgroundColor: 'rgba(0, 0, 255, 0.08)', color: '#0000FF' }}>
            <Icons.ExternalLink />
          </div>
          <div>
            <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A', display: 'block' }}>
              فتح صفحة Google Sheet جديدة
            </span>
            <span style={{ fontSize: '11.5px', color: '#64748B' }}>
              ينقلك مباشرة لإنشاء شيت فارغ في حساب Google للصق الطلبات فيه.
            </span>
          </div>
        </a>

        {/* قسم الـ Webhook التلقائي */}
        <div style={{ borderTop: '1px solid rgba(15, 23, 42, 0.08)', paddingTop: '14px', marginTop: '6px' }}>
          <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '6px' }}>
            المزامنة السحابية التلقائية (Google Apps Script Webhook لمتجر المنتجات):
          </span>
          <p style={{ fontSize: '11.5px', color: '#64748B', margin: '0 0 10px 0', lineHeight: 1.5 }}>
            ألصق رابط نشر الـ Webhook الخاص بالشيت الجديد ليتم تحديثه وحذف الطلبات منه تلقائياً:
          </p>

          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/.../exec"
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '12px',
              border: '1px solid rgba(15, 23, 42, 0.1)',
              backgroundColor: '#F8FAFC',
              fontSize: '12.5px',
              outline: 'none',
              direction: 'ltr',
              marginBottom: '10px',
              boxSizing: 'border-box'
            }}
          />

          <button
            type="button"
            onClick={syncToWebhook}
            disabled={syncing}
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: '#0000FF',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '13px',
              cursor: syncing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(0, 0, 255, 0.25)'
            }}
          >
            <Icons.Sync />
            {syncing ? 'جاري المزامنة...' : 'مزامنة طلبات المتجر السحابية الآن'}
          </button>
        </div>

      </div>
    </EmailModal>
  );
}