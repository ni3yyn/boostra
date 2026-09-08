// src/screens/admin/AdminDashboard.js (أو app/admin/AdminDashboard.js)
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { db, auth } from '../lib/firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import Link from 'next/link';

// ==================== THEME ====================
const THEME = {
  bgBase: '#F8FAFC',
  bgSurface: '#FFFFFF',
  bgSubtle: '#F1F5F9',
  textMain: '#0F172A',
  textMuted: '#64748B',
  textDim: '#94A3B8',
  accent: '#0000FF',
  accentHover: '#0000D8',
  accentSurface: 'rgba(0, 0, 255, 0.05)',
  accentBorder: 'rgba(0, 0, 255, 0.14)',
  accentGlow: 'rgba(0, 0, 255, 0.28)',
  accentCyan: '#00C5DE',
  border: 'rgba(15, 23, 42, 0.08)',
  whatsapp: '#25D366',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
};

const STATUS_CONFIG = {
  new: { label: 'جديد', color: '#0000FF', bg: 'rgba(0, 0, 255, 0.08)', nextStatus: 'contacted' },
  contacted: { label: 'تم الاتصال', color: '#D97706', bg: 'rgba(245, 158, 11, 0.12)', nextStatus: 'qualified' },
  qualified: { label: 'مؤهل', color: '#059669', bg: 'rgba(16, 185, 129, 0.12)', nextStatus: 'converted' },
  converted: { label: 'تم التعاقد', color: '#4F46E5', bg: 'rgba(79, 70, 229, 0.12)', nextStatus: 'lost' },
  lost: { label: 'منسحب', color: '#DC2626', bg: 'rgba(239, 68, 68, 0.12)', nextStatus: null },
  no_response: { label: 'لم يرد', color: '#64748B', bg: 'rgba(100, 116, 139, 0.12)', nextStatus: null },
};

const getStatusLabel = (status) => STATUS_CONFIG[status]?.label || 'جديد';

// ==================== VECTOR ICONS ====================
const Icons = {
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
Store: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  ),
  GoogleSheets: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="8" y1="13" x2="16" y2="13"/>
      <line x1="8" y1="17" x2="16" y2="17"/>
      <line x1="10" y1="9" x2="10" y2="9.01"/>
    </svg>
  ),
  Bell: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
    </svg>
  ),
  Logout: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.3-4.3"/>
    </svg>
  ),
  Phone: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  PhoneMissed: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="23" x2="17" y1="1" y2="7"/>
      <line x1="17" x2="23" y1="1" y2="7"/>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  WhatsApp: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.01 2.014c-5.46 0-9.89 4.43-9.89 9.89 0 1.76.46 3.47 1.32 4.97L2 22l5.3-1.39c1.45.79 3.09 1.21 4.71 1.21 5.46 0 9.89-4.43 9.89-9.89 0-5.46-4.43-9.89-9.89-9.89zm5.39 14.24c-.23.65-1.33 1.23-1.84 1.32-.47.08-1.07.14-3.4-.82-2.82-1.16-4.63-4.04-4.77-4.23-.14-.19-1.14-1.52-1.14-2.9s.72-2.06.97-2.33c.25-.27.54-.34.72-.34s.36 0 .52.01c.17.01.39-.06.6.45.23.55.77 1.88.84 2.02.07.14.12.3.02.5-.09.19-.14.3-.29.49-.14.18-.3.39-.42.54-.14.16-.28.34-.12.61.16.28.71 1.18 1.53 1.91.56.5 1.34 1.05 1.65 1.21.31.16.5.14.69-.08.19-.22.82-.96 1.04-1.29.23-.33.45-.27.74-.17.29.1 1.84.87 2.16 1.03.32.16.53.24.6.38.08.14.08.82-.16 1.47z"/>
    </svg>
  ),
  Eye: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  Edit: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
    </svg>
  ),
  Trash: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18"/>
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
    </svg>
  ),
  Close: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  ChevronDown: ({ rotated }) => (
    <svg 
      width="18" 
      height="18" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={{
        transform: rotated ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <polyline points="6 9 12 15 18 9"/>
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
  ),
};

// ==================== BACKGROUND GOOGLE SHEETS SYNC ====================
const syncToGoogleSheetsBackground = (actionType, record) => {
  try {
    const savedUrl = typeof window !== 'undefined' ? localStorage.getItem('google_sheet_webhook_url') : null;
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
        old_record: actionType === 'DELETE' ? { id: record.id } : undefined,
        items: record?.items || undefined
      })
    });
  } catch (e) {
    console.log('Sheet background sync note:', e);
  }
};

// ==================== TIME AGO (ARABIC) ====================
const timeAgo = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const seconds = Math.floor((new Date() - date) / 1000);

  if (seconds < 60) return 'الآن';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  return `منذ ${days} يوم`;
};

// ==================== MAIN COMPONENT ====================
export default function AdminDashboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [packFilter, setPackFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState(null);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isGoogleSheetModalOpen, setIsGoogleSheetModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [expandedCardIds, setExpandedCardIds] = useState(new Set());
  const [isReady, setIsReady] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  useEffect(() => {
    const previousOverflowY = document.documentElement.style.overflowY;
    document.documentElement.style.overflowY = 'scroll';

    return () => {
      document.documentElement.style.overflowY = previousOverflowY;
    };
  }, []);

  // Realtime Firestore Listener
  useEffect(() => {
    document.title = 'Boostra Agency | لوحة التحكم';
    const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = [];
      snapshot.forEach((docSnap) => {
        fetched.push({ id: docSnap.id, ...docSnap.data() });
      });

      setLeads(fetched);
      setLoading(false);
      setIsReady(true);
    }, (error) => {
      console.error('Firestore Error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isReady]);

  // Request Notifications
  const handleRequestNotifications = async () => {
    if (typeof Notification !== 'undefined') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('تم تفعيل التنبيهات بنجاح!', { body: 'ستصلك إشعارات فورية بكل زبون يسجل' });
      }
    }
  };

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (packFilter !== 'all' && item.pack !== packFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.name?.toLowerCase().includes(q);
        const matchPhone = item.phone?.includes(q);
        const matchEmail = item.email?.toLowerCase().includes(q);
        const matchPack = item.pack?.toLowerCase().includes(q);
        const matchProject = item.projectInfo?.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchEmail && !matchPack && !matchProject) return false;
      }
      return true;
    });
  }, [leads, statusFilter, packFilter, searchQuery]);

  // Stats
  const stats = useMemo(() => ({
    total: leads.length,
    new: leads.filter(l => l.status === 'new' || !l.status).length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    converted: leads.filter(l => l.status === 'converted').length,
    lost: leads.filter(l => l.status === 'lost').length,
    no_response: leads.filter(l => l.status === 'no_response').length,
  }), [leads]);

  // Toggle Accordion on Mobile
  const toggleCardAccordion = (id) => {
    setExpandedCardIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Actions
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'leads', id), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      const currentLead = leads.find(l => l.id === id);
      if (currentLead) {
        syncToGoogleSheetsBackground('UPDATE', {
          ...currentLead,
          status: newStatus
        });
      }
    } catch (err) {
      alert('حدث خطأ أثناء تحديث الحالة');
    }
  };

  const handleQuickNoResponse = async (lead) => {
    try {
      const currentNotes = lead.notes || '';
      let newNotes = '';
      if (!currentNotes.includes('لم يرد')) {
        newNotes = currentNotes ? `لم يرد (محاولة 1)\n${currentNotes}` : 'لم يرد (محاولة 1)';
      } else {
        const match = currentNotes.match(/لم يرد \(محاولة (\d+)\)/);
        const count = match ? parseInt(match[1], 10) + 1 : 2;
        const clean = currentNotes.replace(/لم يرد(?: \(محاولة \d+\))?\n?/, '').trim();
        newNotes = clean ? `لم يرد (محاولة ${count})\n${clean}` : `لم يرد (محاولة ${count})`;
      }

      await updateDoc(doc(db, 'leads', lead.id), {
        notes: newNotes,
        status: 'no_response',
        updatedAt: serverTimestamp()
      });

      syncToGoogleSheetsBackground('UPDATE', {
        ...lead,
        notes: newNotes,
        status: 'no_response'
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteLead = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الزبون نهائيا؟')) {
      try {
        const leadToDelete = leads.find(l => l.id === id);
        await deleteDoc(doc(db, 'leads', id));
        
        syncToGoogleSheetsBackground('DELETE', { 
          id: id,
          phone: leadToDelete?.phone || ''
        });
      } catch (err) {
        alert('فشل في حذف الزبون');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`هل أنت متأكد من حذف ${selectedIds.size} زبون محدد؟`)) {
      try {
        const idsToDelete = Array.from(selectedIds);
        const leadsToDelete = leads.filter(l => selectedIds.has(l.id));

        for (const id of idsToDelete) {
          await deleteDoc(doc(db, 'leads', id));
        }

        syncToGoogleSheetsBackground('DELETE_BULK', {
          items: leadsToDelete.map(l => ({ id: l.id, phone: l.phone }))
        });

        setSelectedIds(new Set());
      } catch (e) {
        alert('حدث خطأ أثناء الحذف');
      }
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    if (selectedIds.size === 0) return;
    try {
      const selectedLeads = leads.filter(l => selectedIds.has(l.id));

      for (const id of selectedIds) {
        await updateDoc(doc(db, 'leads', id), {
          status: newStatus,
          updatedAt: serverTimestamp()
        });
      }

      for (const item of selectedLeads) {
        syncToGoogleSheetsBackground('UPDATE', {
          ...item,
          status: newStatus
        });
      }

      setSelectedIds(new Set());
    } catch (e) {
      alert('حدث خطأ أثناء تحديث الحالة');
    }
  };

  const toggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredLeads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredLeads.map(l => l.id)));
    }
  };

  const handleLogout = async () => {
    if (window.confirm('هل تريد تسجيل الخروج؟')) {
      await signOut(auth);
      window.location.href = '/admin';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: THEME.bgBase,
      color: THEME.textMain,
      direction: 'rtl',
      fontFamily: 'inherit',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      
      {/* AURORA CANVAS */}
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '550px', height: '550px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0, 0, 255, 0.28) 0%, rgba(0, 197, 222, 0.18) 50%, transparent 75%)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', top: '40%', left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0, 197, 222, 0.22) 0%, rgba(0, 0, 255, 0.15) 55%, transparent 75%)', filter: 'blur(80px)' }} />
      </div>

      {/* =========================================
    SITE HEADER (FIXED WITH SMOOTH GRADIENT FADE)
   ========================================= */}
<header className={`site-header ${mobileMenuOpen ? 'menu-open' : ''}`}>
  <div className="header-inner">
    
    {/* الشعار والعنوان */}
    <div className="header-brand">
      <Icons.Logo size={36} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span className="header-brand-text">لوحة التحكم — Boostra</span>
        <span style={{ fontSize: '11.5px', color: THEME.textMuted }}>إدارة ومتابعة الطلبات </span>
      </div>
    </div>

    {/* أزرار الديسكتوب (تختفي تلقائياً على الموبايل عبر كلاس header-nav-links) */}
    <div className="header-nav-links">
      {/* زر الانتقال لمتجر الإدارة */}
      <Link
        href="/admin/store"
        title="إدارة المتجر والمبيعات"
        style={{
          ...headerBtnStyle,
          backgroundColor: 'rgba(0, 0, 255, 0.06)',
          color: 'var(--accent, #0000FF)',
          borderColor: 'rgba(0, 0, 255, 0.18)',
          fontSize: '12.5px',
          fontWeight: 700,
          textDecoration: 'none'
        }}
      >
        <Icons.Store />
        <span>إدارة المتجر</span>
      </Link>
      <button
        onClick={() => setIsGoogleSheetModalOpen(true)}
        title="تصدير ومزامنة Google Sheets"
        style={{
          ...headerBtnStyle,
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          color: '#059669',
          borderColor: 'rgba(16, 185, 129, 0.25)',
          fontSize: '12.5px',
          fontWeight: 700
        }}
      >
        <Icons.GoogleSheets />
        <span>Google Sheets</span>
      </button>

      <button
        onClick={handleRequestNotifications}
        title="تفعيل الإشعارات الفورية"
        style={headerBtnStyle}
      >
        <Icons.Bell />
      </button>

      <button
        onClick={handleLogout}
        title="تسجيل الخروج"
        style={{
          ...headerBtnStyle,
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          color: THEME.error,
          borderColor: 'rgba(239, 68, 68, 0.2)',
          fontSize: '12.5px',
          fontWeight: 700
        }}
      >
        <Icons.Logout />
        <span>خروج</span>
      </button>
    </div>

    {/* زر الهامبرغر المعتمد (يظهر في الموبايل فقط عبر كلاس hamburger-toggle-btn) */}
    <button 
      type="button"
      className="hamburger-toggle-btn"
      onClick={() => setMobileMenuOpen(prev => !prev)}
      aria-label="تبديل القائمة"
    >
      {mobileMenuOpen ? (
        <Icons.Close />
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      )}
    </button>
  </div>

  {/* القائمة المنسدلة المعتمدة بنفس كلاسات globals.css */}
  <div className="header-dropdown-menu">
    <ul className="dropdown-nav-list">
      {/* رابط المتجر للموبايل */}
      <li>
        <Link
          href="/admin/store"
          onClick={() => setMobileMenuOpen(false)}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderRadius: '14px',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: 'var(--accent, #0000FF)',
            textDecoration: 'none',
            cursor: 'pointer',
            boxSizing: 'border-box'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icons.Store />
            <span>إدارة المتجر والمبيعات</span>
          </span>
          <span style={{ color: 'var(--text-dim)' }}>←</span>
        </Link>
      </li>
      <li>
        <button
          type="button"
          onClick={() => { setIsGoogleSheetModalOpen(true); setMobileMenuOpen(false); }}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderRadius: '14px',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: '#059669',
            cursor: 'pointer'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icons.GoogleSheets />
            <span>تصدير ومزامنة Google Sheets</span>
          </span>
          <span style={{ color: 'var(--text-dim)' }}>←</span>
        </button>
      </li>

      <li>
        <button
          type="button"
          onClick={() => { handleRequestNotifications(); setMobileMenuOpen(false); }}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderRadius: '14px',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            cursor: 'pointer'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icons.Bell />
            <span>تفعيل الإشعارات الفورية</span>
          </span>
          <span style={{ color: 'var(--text-dim)' }}>←</span>
        </button>
      </li>

      <li>
        <button
          type="button"
          onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderRadius: '14px',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: THEME.error,
            cursor: 'pointer'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icons.Logout />
            <span>تسجيل الخروج</span>
          </span>
          <span style={{ color: 'var(--text-dim)' }}>←</span>
        </button>
      </li>
    </ul>
  </div>
</header>

      {/* MAIN CONTENT LAYER */}
      <main style={{ position: 'relative', zIndex: 10, maxWidth: '1360px', margin: '0 auto', padding: '108px 20px 24px' }}>
        
        {/* ========================================================
            1. NEW STATS STRIP DESIGN (LESS BORDERING, JUST DIVIDERS)
           ======================================================== */}
        <div className="stats-unified-strip">
          <StatStripItem title="إجمالي الطلبات" count={stats.total} color={THEME.accent} active={statusFilter === 'all'} onClick={() => setStatusFilter('all')} />
          <StatStripItem title="جديد" count={stats.new} color={STATUS_CONFIG.new.color} active={statusFilter === 'new'} onClick={() => setStatusFilter('new')} />
          <StatStripItem title="تم الاتصال" count={stats.contacted} color={STATUS_CONFIG.contacted.color} active={statusFilter === 'contacted'} onClick={() => setStatusFilter('contacted')} />
          <StatStripItem title="مؤهل" count={stats.qualified} color={STATUS_CONFIG.qualified.color} active={statusFilter === 'qualified'} onClick={() => setStatusFilter('qualified')} />
          <StatStripItem title="تم التعاقد" count={stats.converted} color={STATUS_CONFIG.converted.color} active={statusFilter === 'converted'} onClick={() => setStatusFilter('converted')} />
          <StatStripItem title="منسحب" count={stats.lost} color={STATUS_CONFIG.lost.color} active={statusFilter === 'lost'} onClick={() => setStatusFilter('lost')} isLast />
          <StatStripItem title="لم يرد" count={stats.no_response} color={STATUS_CONFIG.no_response.color} active={statusFilter === 'no_response'} onClick={() => setStatusFilter('no_response')} isLast />
        </div>

        {/* SEARCH & FILTERS BAR */}
<div style={{
  background: 'rgba(255, 255, 255, 0.65)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: '1px solid rgba(15, 23, 42, 0.06)',
  borderRadius: '18px',
  padding: '12px 16px',
  marginBottom: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '14px',
  boxShadow: '0 4px 18px -4px rgba(15, 23, 42, 0.03)'
}}>
  <div style={{
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.025)',
    borderRadius: '12px',
    border: '1px solid rgba(15, 23, 42, 0.04)',
    padding: '0 14px',
    height: '42px',
    flex: '1',
    minWidth: '260px',
    gap: '8px'
  }}>
    <span style={{ color: THEME.textMuted, display: 'flex' }}><Icons.Search /></span>
    <input
      type="text"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="بحث بالاسم، رقم الهاتف، الباقة، أو تفاصيل المشروع..."
      style={{
        background: 'transparent',
        border: 'none',
        outline: 'none',
        color: THEME.textMain,
        width: '100%',
        fontSize: '13px'
      }}
    />
    {searchQuery && (
      <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', color: THEME.textMuted, cursor: 'pointer' }}>
        <Icons.Close />
      </button>
    )}
  </div>

  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <span style={{ fontSize: '13px', color: THEME.textMuted, fontWeight: 600 }}>الباقة:</span>
    <select
      value={packFilter}
      onChange={(e) => setPackFilter(e.target.value)}
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.025)',
        border: '1px solid rgba(15, 23, 42, 0.04)',
        color: THEME.textMain,
        borderRadius: '10px',
        padding: '9px 14px',
        fontSize: '13px',
        fontWeight: 600,
        outline: 'none',
        cursor: 'pointer'
      }}
    >
      <option value="all">كل الباقات</option>
      <option value="باقة التأسيس">باقة التأسيس</option>
      <option value="باقة الانطلاقة">باقة الانطلاقة</option>
      <option value="باقة النمو">باقة النمو</option>
      <option value="استشارة / حل مخصص">استشارة مخصصة</option>
    </select>
  </div>
</div>

        {/* SELECT ALL HEADER */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 4px',
          marginBottom: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={selectedIds.size === filteredLeads.length && filteredLeads.length > 0}
              onChange={toggleSelectAll}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: THEME.accent }}
            />
            <span style={{ fontSize: '13px', fontWeight: 600, color: THEME.textMuted }}>
              تحديد الكل ({filteredLeads.length})
            </span>
          </div>

          {selectedIds.size > 0 && (
            <span style={{ fontSize: '13px', color: THEME.accent, fontWeight: 700 }}>
              تم تحديد {selectedIds.size} زبون
            </span>
          )}
        </div>

        {/* LEADS GRID */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: THEME.textMuted }}>
            جاري مزامنة بيانات العملاء...
          </div>
        ) : filteredLeads.length === 0 ? (
          <div style={{
            backgroundColor: THEME.bgSurface,
            border: `1px solid ${THEME.border}`,
            borderRadius: '24px',
            padding: '70px 20px',
            textAlign: 'center',
            boxShadow: '0 4px 20px -4px rgba(15, 23, 42, 0.04)'
          }}>
            <p style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 6px 0', color: THEME.textMain }}>
              لا توجد طلبات مطابقة
            </p>
            <p style={{ fontSize: '13px', color: THEME.textMuted, margin: 0 }}>
              عندما يسجل زبون جديد في صفحة الهبوط، ستظهر بياناته هنا فورا وبشكل حي.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
            {filteredLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                isSelected={selectedIds.has(lead.id)}
                isExpanded={expandedCardIds.has(lead.id)}
                onToggleExpand={() => toggleCardAccordion(lead.id)}
                onToggleSelect={() => toggleSelect(lead.id)}
                onView={() => { setSelectedLead(lead); setIsViewModalOpen(true); }}
                onEdit={() => { setSelectedLead(lead); setIsEditModalOpen(true); }}
                onDelete={() => handleDeleteLead(lead.id)}
                onStatusChange={(status) => handleUpdateStatus(lead.id, status)}
                onQuickNoResponse={() => handleQuickNoResponse(lead)}
              />
            ))}
          </div>
        )}

        <div style={{ height: '120px' }} />
      </main>

      {/* =========================================================================
          2. UPGRADED CENTERED & PROMINENT FLOATING BULK BAR (DESKTOP + MOBILE)
         ========================================================================= */}
      {selectedIds.size > 0 && (
        <div className="prominent-bulk-bar">
          
          {/* A. DESKTOP BAR (CENTERED, MUCH BIGGER, HIGH ELEVATION) */}
          <div className="bulk-bar-desktop-layout">
            <div className="bulk-badge-box">
              <span className="bulk-count-badge">{selectedIds.size}</span>
              <span className="bulk-count-txt">عملاء محددين</span>
            </div>

            <div className="bulk-vertical-line" />

            <div className="bulk-status-row">
              <span className="bulk-section-label">تغيير الحالة إلى:</span>
              <button onClick={() => handleBulkStatusChange('contacted')} className="bulk-action-pill status-contacted">
                <span className="color-dot" style={{ backgroundColor: '#D97706' }} />
                تم الاتصال
              </button>
              <button onClick={() => handleBulkStatusChange('qualified')} className="bulk-action-pill status-qualified">
                <span className="color-dot" style={{ backgroundColor: '#059669' }} />
                مؤهل
              </button>
              <button onClick={() => handleBulkStatusChange('converted')} className="bulk-action-pill status-converted">
                <span className="color-dot" style={{ backgroundColor: '#4F46E5' }} />
                تم التعاقد
              </button>
              <button onClick={() => handleBulkStatusChange('lost')} className="bulk-action-pill status-lost">
                <span className="color-dot" style={{ backgroundColor: '#DC2626' }} />
                منسحب
              </button>
            </div>

            <div className="bulk-vertical-line" />

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button onClick={handleBulkDelete} className="bulk-delete-prominent">
                <Icons.Trash />
                <span>حذف المحدد</span>
              </button>

              <button onClick={() => setSelectedIds(new Set())} className="bulk-dismiss-btn" title="إلغاء التحديد">
                <Icons.Close />
              </button>
            </div>
          </div>

          {/* B. MOBILE DOCK (CLEAN 2-TIER WITH SAFE PADDING - ZERO CLIPPING) */}
          <div className="bulk-bar-mobile-dock">
            <div className="bulk-m-top-row">
              <div className="bulk-badge-box">
                <span className="bulk-count-badge">{selectedIds.size}</span>
                <span className="bulk-count-txt" style={{ fontSize: '13px' }}>عملاء محددين</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button onClick={handleBulkDelete} className="bulk-delete-prominent-mobile">
                  <Icons.Trash />
                  <span>حذف ({selectedIds.size})</span>
                </button>
                <button onClick={() => setSelectedIds(new Set())} className="bulk-dismiss-btn">
                  <Icons.Close />
                </button>
              </div>
            </div>

            <div className="bulk-m-status-grid">
              <button onClick={() => handleBulkStatusChange('contacted')} className="bulk-m-chip status-contacted">
                تم الاتصال
              </button>
              <button onClick={() => handleBulkStatusChange('qualified')} className="bulk-m-chip status-qualified">
                مؤهل
              </button>
              <button onClick={() => handleBulkStatusChange('converted')} className="bulk-m-chip status-converted">
                تعاقد
              </button>
              <button onClick={() => handleBulkStatusChange('lost')} className="bulk-m-chip status-lost">
                منسحب
              </button>
            </div>
          </div>

        </div>
      )}

      {/* 3. GOOGLE SHEETS MODAL */}
      {isGoogleSheetModalOpen && (
        <GoogleSheetsModal
          leads={filteredLeads}
          onClose={() => setIsGoogleSheetModalOpen(false)}
        />
      )}

      {/* 4. VIEW MODAL */}
      {isViewModalOpen && selectedLead && (
        <ModalWrapper onClose={() => setIsViewModalOpen(false)} title="تفاصيل طلب الزبون">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <a
                href={`tel:${selectedLead.phone}`}
                style={{ ...modalActionBtn, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.3)' }}
              >
                <Icons.Phone />
                اتصال هاتفي
              </a>
              <a
                href={`https://wa.me/${selectedLead.phone?.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                style={{ ...modalActionBtn, backgroundColor: 'rgba(37, 211, 102, 0.12)', color: '#16A34A', border: '1px solid rgba(37, 211, 102, 0.3)' }}
              >
                <Icons.WhatsApp />
                محادثة واتساب
              </a>
            </div>

            <InfoRow label="اسم الزبون" value={selectedLead.name} />
            <InfoRow label="رقم الهاتف" value={selectedLead.phone} isLtr />
            <InfoRow label="البريد الإلكتروني" value={selectedLead.email || 'غير مدخل'} isLtr />
            <InfoRow label="الباقة المختارة" value={selectedLead.pack} highlight />
            <InfoRow label="تاريخ التسجيل" value={selectedLead.createdAt?.toDate ? selectedLead.createdAt.toDate().toLocaleString('ar-DZ') : 'غير محدد'} />

            <div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: THEME.textMuted, display: 'block', marginBottom: '6px' }}>معلومات المشروع:</span>
              <div style={{ backgroundColor: THEME.bgSubtle, padding: '12px 14px', borderRadius: '12px', fontSize: '13px', lineHeight: 1.6, color: THEME.textMain, border: `1px solid ${THEME.border}` }}>
                {selectedLead.projectInfo || 'لا توجد تفاصيل إضافية مسجلة'}
              </div>
            </div>

            {selectedLead.notes && (
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: THEME.textMuted, display: 'block', marginBottom: '6px' }}>سجل المتابعة والملاحظات:</span>
                <div style={{ backgroundColor: THEME.accentSurface, border: `1px solid ${THEME.accentBorder}`, padding: '12px 14px', borderRadius: '12px', fontSize: '13px', lineHeight: 1.6, color: THEME.accent }}>
                  {selectedLead.notes}
                </div>
              </div>
            )}
          </div>
        </ModalWrapper>
      )}

      {/* 5. EDIT MODAL */}
      {isEditModalOpen && selectedLead && (
        <EditModal
          lead={selectedLead}
          onClose={() => setIsEditModalOpen(false)}
          onSave={async (updates) => {
            await updateDoc(doc(db, 'leads', selectedLead.id), {
              ...updates,
              updatedAt: serverTimestamp()
            });

            syncToGoogleSheetsBackground('UPDATE', {
              ...selectedLead,
              ...updates
            });

            setIsEditModalOpen(false);
          }}
        />
      )}

      {/* ========================================================
          PURE CSS STYLES (SLIDE UP/DOWN, CUSTOM SCROLLBAR & DOCK)
         ======================================================== */}
      <style jsx global>{`
        /* 1. Global Font Inheritance */
        button, input, select, textarea {
          font-family: inherit !important;
        }

        /* 2. Custom Sleek Scrollbars inside Modals */
        .modal-box-pure::-webkit-scrollbar {
          width: 5px;
        }
        .modal-box-pure::-webkit-scrollbar-track {
          background: transparent;
        }
        .modal-box-pure::-webkit-scrollbar-thumb {
          background: rgba(15, 23, 42, 0.14);
          border-radius: 10px;
        }
        .modal-box-pure::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 255, 0.35);
        }
        .modal-box-pure {
          scrollbar-width: thin;
          scrollbar-color: rgba(15, 23, 42, 0.14) transparent;
        }

        /* 3. Pure CSS Modal Sliding & Blur Animations */
        @keyframes modalBackdropFadeIn {
          from { opacity: 0; backdrop-filter: blur(0px); -webkit-backdrop-filter: blur(0px); }
          to { opacity: 1; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
        }
        @keyframes modalBackdropFadeOut {
          from { opacity: 1; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
          to { opacity: 0; backdrop-filter: blur(0px); -webkit-backdrop-filter: blur(0px); }
        }

        @keyframes modalSlideUpIn {
          from { opacity: 0; transform: translateY(35px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes modalSlideDownOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(35px) scale(0.96); }
        }

        @keyframes bottomSheetSlideUp {
          from { opacity: 0; transform: translateY(100%); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bottomSheetSlideDown {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(100%); }
        }

        .modal-overlay-pure {
          position: fixed;
          inset: 0;
          background-color: rgba(15, 23, 42, 0.42);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 200;
          padding: 20px;
          direction: rtl;
          animation: modalBackdropFadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .modal-overlay-pure.is-closing {
          animation: modalBackdropFadeOut 0.2s ease-in forwards;
        }

        .modal-box-pure {
          background-color: #FFFFFF;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 24px;
          width: 100%;
          max-width: 560px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 28px;
          box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.25);
          position: relative;
          animation: modalSlideUpIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .modal-box-pure.is-closing {
          animation: modalSlideDownOut 0.2s cubic-bezier(0.4, 0, 1, 1) forwards;
        }

        @media (max-width: 768px) {
          .modal-overlay-pure {
            align-items: flex-end;
            padding: 0;
          }
          .modal-box-pure {
            max-width: 100%;
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
            border-top-left-radius: 26px;
            border-top-right-radius: 26px;
            max-height: 85vh;
            padding: 22px 18px 30px;
            animation: bottomSheetSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .modal-box-pure.is-closing {
            animation: bottomSheetSlideDown 0.2s ease-in forwards;
          }
        }

        /* 4. Unified Stats Strip (Dividers only, zero outer box noise) */
        .stats-unified-strip {
  display: flex;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 20px;
  box-shadow: 0 4px 18px -4px rgba(15, 23, 42, 0.03);
  overflow: hidden;
  margin-bottom: 24px;
}

        .stat-strip-node {
  flex: 1;
  padding: 16px 20px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-left: 1px solid rgba(15, 23, 42, 0.05);
  text-align: right;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
        .stat-strip-node.is-last {
          border-left: none;
        }
        .stat-strip-node:hover {
  background-color: rgba(255, 255, 255, 0.45);
}

.stat-strip-node.active-node {
  background-color: rgba(0, 0, 255, 0.035);
}
        .stat-strip-node.active-node::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--node-color, #0000FF);
        }

        .stat-strip-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .stat-strip-title {
          font-size: 13px;
          font-weight: 700;
          color: #64748B;
        }
        .stat-strip-node.active-node .stat-strip-title {
          color: var(--node-color, #0F172A);
        }
        .stat-strip-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
        }
        .stat-strip-value {
          font-size: 26px;
          font-weight: 800;
          color: #0F172A;
          line-height: 1.1;
        }

        @media (max-width: 992px) {
          .stats-unified-strip {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            border-radius: 18px;
          }
          .stat-strip-node {
            padding: 14px 16px;
            border-left: 1px solid rgba(15, 23, 42, 0.07) !important;
            border-bottom: 1px solid rgba(15, 23, 42, 0.07);
          }
          .stat-strip-node:nth-child(3n) {
            border-left: none !important;
          }
          .stat-strip-node:nth-last-child(-n+3) {
            border-bottom: none;
          }
        }
        @media (max-width: 520px) {
          .stats-unified-strip {
            grid-template-columns: repeat(2, 1fr);
          }
          .stat-strip-node:nth-child(2n) {
            border-left: none !important;
          }
          .stat-strip-node:nth-last-child(-n+2) {
            border-bottom: none;
          }
        }

        /* 5. Prominent Floating Bulk Bar */
        @keyframes bulkSlideUpCenter {
  from { 
    opacity: 0; 
    transform: translateY(30px); /* تحريك عمودي فقط بدون لمس المحور الأفقي */
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}
        @keyframes bulkDockSlideUpMobile {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

        .prominent-bulk-bar {
  position: fixed;
  bottom: 28px;
  left: 0;
  right: 0;
  margin: 0 auto;
  width: fit-content;
  max-width: calc(100vw - 32px);
  z-index: 120;
  direction: rtl;
  user-select: none;
  pointer-events: none; /* لمنع حجب النقرات خارج محيط الشريط */
}

        /* Desktop Bar: Center, Large, Highly Elevated */
        .bulk-bar-desktop-layout {
  pointer-events: auto; /* تفعيل النقرات على الشريط نفسه */
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 255, 0.14);
  border-radius: 100px;
  padding: 8px 22px;
  box-shadow: 0 20px 45px -10px rgba(0, 0, 255, 0.15), 0 8px 20px -4px rgba(15, 23, 42, 0.08);
  animation: bulkSlideUpCenter 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

        .bulk-badge-box {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .bulk-count-badge {
          background: #0000FF;
          color: #FFFFFF;
          font-weight: 800;
          font-size: 12px;
          min-width: 26px;
          height: 26px;
          border-radius: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 6px;
        }
        .bulk-count-txt {
          font-size: 14px;
          font-weight: 700;
          color: #0F172A;
          white-space: nowrap;
        }

        .bulk-vertical-line {
          width: 1.5px;
          height: 24px;
          background: rgba(15, 23, 42, 0.1);
        }

        .bulk-status-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .bulk-section-label {
          font-size: 12.5px;
          font-weight: 600;
          color: #64748B;
          margin-left: 4px;
          white-space: nowrap;
        }

        .bulk-action-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 13px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid rgba(15, 23, 42, 0.04);
  background: rgba(15, 23, 42, 0.03);
  color: #0F172A;
  transition: all 0.2s ease;
  white-space: nowrap;
}
        .color-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .bulk-action-pill:hover {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(15, 23, 42, 0.1);
  transform: translateY(-1px);
}

        .bulk-delete-prominent {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #DC2626;
          padding: 8px 16px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .bulk-delete-prominent:hover {
          background: #DC2626;
          color: #FFFFFF;
          border-color: #DC2626;
        }

        .bulk-dismiss-btn {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: none;
          background: #F1F5F9;
          color: #64748B;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .bulk-dismiss-btn:hover {
          background: #E2E8F0;
          color: #0F172A;
        }

        /* Mobile Dock (Hidden on Desktop) */
        .bulk-bar-mobile-dock {
          display: none;
        }

        @media (max-width: 860px) {
          .prominent-bulk-bar {
            left: 14px;
            right: 14px;
            bottom: 14px;
            transform: none;
            width: auto;
            max-width: 100%;
          }

          .bulk-bar-desktop-layout {
            display: none;
          }

          .bulk-bar-mobile-dock {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 255, 0.14);
  border-radius: 22px;
  padding: 14px 16px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.15);
  animation: bulkDockSlideUpMobile 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

          .bulk-m-top-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .bulk-delete-prominent-mobile {
            display: flex;
            align-items: center;
            gap: 5px;
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.25);
            color: #DC2626;
            padding: 6px 14px;
            border-radius: 100px;
            font-size: 12px;
            font-weight: 700;
          }

          .bulk-m-status-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 6px;
          }

          .bulk-m-chip {
            padding: 9px 4px;
            border-radius: 10px;
            font-size: 11.5px;
            font-weight: 700;
            border: 1px solid rgba(15, 23, 42, 0.08);
            background: #F8FAFC;
            color: #0F172A;
            text-align: center;
          }
          .bulk-m-chip:active {
            background: #E2E8F0;
          }
        }

        /* Pure CSS Mobile Accordion */
        .card-accordion-container {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .card-accordion-container.is-open {
          grid-template-rows: 1fr;
        }
        .card-accordion-content {
          overflow: hidden;
        }

        @media (min-width: 769px) {
          .card-accordion-container {
            grid-template-rows: 1fr !important;
          }
          .mobile-accordion-toggle {
            display: none !important;
          }
        }
      `}</style>

    </div>
  );
}

// ==================== NEW STAT STRIP ITEM ====================
function StatStripItem({ title, count, color, active, onClick, isLast }) {
  return (
    <div
      onClick={onClick}
      className={`stat-strip-node ${active ? 'active-node' : ''} ${isLast ? 'is-last' : ''}`}
      style={{ '--node-color': color }}
    >
      <div className="stat-strip-header">
        <span className="stat-strip-title">{title}</span>
        <span className="stat-strip-dot" style={{ backgroundColor: color }} />
      </div>
      <div className="stat-strip-value">{count || 0}</div>
    </div>
  );
}

// ==================== LEAD CARD WITH ACCORDION ====================
// ==================== LEAD CARD (SOFT FROSTED GLASS & AMBIENT BG) ====================
function LeadCard({ lead, isSelected, isExpanded, onToggleExpand, onToggleSelect, onView, onEdit, onDelete, onStatusChange, onQuickNoResponse }) {
  const status = lead.status || 'new';
  const statusConf = STATUS_CONFIG[status] || STATUS_CONFIG.new;
  const nextStatus = statusConf.nextStatus;

  return (
    <div style={{
      /* 1. بدلاً من الأبيض الصامت #FFFFFF، تدرج زجاجي خفيف ينساب مع لون الخلفية والأورورا */
      background: isSelected 
        ? 'rgba(255, 255, 255, 0.85)' 
        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.65) 0%, rgba(248, 250, 252, 0.5) 100%)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      border: `1px solid ${isSelected ? THEME.accent : 'rgba(15, 23, 42, 0.06)'}`,
      borderRadius: '20px',
      padding: '18px 20px',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: isSelected 
        ? '0 8px 24px -4px rgba(0, 0, 255, 0.12)' 
        : '0 4px 18px -4px rgba(15, 23, 42, 0.03)',
      position: 'relative',
      transition: 'all 0.22s ease'
    }}>
      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            style={{ width: '17px', height: '17px', cursor: 'pointer', accentColor: THEME.accent }}
          />
          <div 
            onClick={onToggleExpand} 
            style={{ cursor: 'pointer' }}
          >
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: THEME.textMain, margin: 0 }}>{lead.name}</h3>
            <span style={{ fontSize: '11px', color: THEME.textDim, fontWeight: 500 }}>{timeAgo(lead.createdAt)}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            backgroundColor: statusConf.bg,
            color: statusConf.color,
            borderRadius: '8px',
            padding: '3px 9px',
            fontSize: '11px',
            fontWeight: 700
          }}>
            {statusConf.label}
          </span>

          <button
            onClick={onToggleExpand}
            className="mobile-accordion-toggle"
            style={{
              background: 'none',
              border: 'none',
              color: THEME.textMuted,
              cursor: 'pointer',
              display: 'flex',
              padding: '4px'
            }}
          >
            <Icons.ChevronDown rotated={isExpanded} />
          </button>
        </div>
      </div>

      {/* Accordion Body */}
      <div className={`card-accordion-container ${isExpanded ? 'is-open' : ''}`}>
        <div className="card-accordion-content">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '14px' }}>
            
            {/* صندوق معلومات الزبون أصبح مدمجاً وشفافاً بدلاً من الرمادي المصمت */}
            <div style={{
              backgroundColor: 'rgba(15, 23, 42, 0.025)',
              borderRadius: '14px',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '13px',
              border: '1px solid rgba(15, 23, 42, 0.04)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: THEME.textMuted, fontWeight: 600 }}>الباقة:</span>
                <span style={{ fontWeight: 700, color: THEME.accent }}>{lead.pack}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: THEME.textMuted, fontWeight: 600 }}>الهاتف:</span>
                <span style={{ direction: 'ltr', fontWeight: 700, color: THEME.textMain }}>{lead.phone}</span>
              </div>
              {lead.email && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: THEME.textMuted, fontWeight: 600 }}>الإيميل:</span>
                  <span style={{ direction: 'ltr', fontSize: '12px', color: THEME.textMuted }}>{lead.email}</span>
                </div>
              )}
            </div>

            {lead.notes && (
              <div style={{
                backgroundColor: THEME.accentSurface,
                border: `1px solid ${THEME.accentBorder}`,
                borderRadius: '10px',
                padding: '8px 12px',
                fontSize: '12px',
                color: THEME.accent,
                maxHeight: '48px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontWeight: 600
              }}>
                {lead.notes}
              </div>
            )}

            {/* صف الإجراءات السفلي */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(15, 23, 42, 0.06)', paddingTop: '12px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <a
                  href={`tel:${lead.phone}`}
                  style={{ ...cardIconBtnStyle, backgroundColor: 'rgba(16, 185, 129, 0.08)', color: '#059669', borderColor: 'rgba(16, 185, 129, 0.18)' }}
                  title="اتصال هاتفي"
                >
                  <Icons.Phone />
                </a>
                <a
                  href={`https://wa.me/${lead.phone?.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ ...cardIconBtnStyle, backgroundColor: 'rgba(37, 211, 102, 0.08)', color: '#16A34A', borderColor: 'rgba(37, 211, 102, 0.18)' }}
                  title="واتساب مباشر"
                >
                  <Icons.WhatsApp />
                </a>
                <button
                  onClick={onQuickNoResponse}
                  style={{ ...cardIconBtnStyle, backgroundColor: 'rgba(239, 68, 68, 0.06)', color: THEME.error, borderColor: 'rgba(239, 68, 68, 0.18)', padding: '0 8px', width: 'auto', gap: '4px' }}
                  title="تسجيل: لم يرد"
                >
                  <Icons.PhoneMissed />
                  <span style={{ fontSize: '11px', fontWeight: 700 }}>لم يرد</span>
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {nextStatus && (
                  <button
                    onClick={() => onStatusChange(nextStatus)}
                    style={{
                      backgroundColor: STATUS_CONFIG[nextStatus].bg,
                      border: 'none',
                      color: STATUS_CONFIG[nextStatus].color,
                      borderRadius: '8px',
                      padding: '6px 10px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {STATUS_CONFIG[nextStatus].label}
                  </button>
                )}
                <button onClick={onView} style={cardIconBtnStyle} title="عرض التفاصيل"><Icons.Eye /></button>
                <button onClick={onEdit} style={cardIconBtnStyle} title="تعديل"><Icons.Edit /></button>
                <button onClick={onDelete} style={{ ...cardIconBtnStyle, color: THEME.error }} title="حذف"><Icons.Trash /></button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== MODAL WRAPPER WITH PURE CSS SLIDE & BLUR ====================
function ModalWrapper({ children, onClose, title }) {
  const [isClosing, setIsClosing] = useState(false);

  const handleGracefulClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200); // ينتظر انتهاء حركة الـ Slide Down وتلاشي الـ Blur
  };

  return (
    <div 
      className={`modal-overlay-pure ${isClosing ? 'is-closing' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleGracefulClose();
      }}
    >
      <div className={`modal-box-pure ${isClosing ? 'is-closing' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: `1px solid ${THEME.border}`, paddingBottom: '14px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: THEME.textMain }}>{title}</h2>
          <button onClick={handleGracefulClose} style={{ background: 'none', border: 'none', color: THEME.textMuted, cursor: 'pointer', display: 'flex' }}>
            <Icons.Close />
          </button>
        </div>
        {typeof children === 'function' ? children(handleGracefulClose) : children}
      </div>
    </div>
  );
}

// ==================== GOOGLE SHEETS MODAL ====================
function GoogleSheetsModal({ leads, onClose }) {
  const [copied, setCopied] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('google_sheet_webhook_url');
      if (saved) setWebhookUrl(saved);
    }
  }, []);

  const copyForGoogleSheets = async () => {
    try {
      const headers = ['الاسم', 'رقم الهاتف', 'البريد الإلكتروني', 'الباقة المختارة', 'تفاصيل المشروع', 'الحالة', 'ملاحظات', 'تاريخ التسجيل'];
      const rows = leads.map(l => [
        l.name || '',
        l.phone ? "'" + String(l.phone).trim() : '',
        l.email || '',
        l.pack || '',
        (l.projectInfo || '').replace(/\r?\n/g, ' '),
        getStatusLabel(l.status),
        (l.notes || '').replace(/\r?\n/g, ' '),
        l.createdAt?.toDate ? l.createdAt.toDate().toLocaleString('ar-DZ') : ''
      ]);

      const tsv = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
      await navigator.clipboard.writeText(tsv);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      alert('تعذر نسخ البيانات');
    }
  };

  const downloadGoogleSheetsCsv = () => {
    try {
      const headers = ['الاسم', 'رقم الهاتف', 'البريد الإلكتروني', 'الباقة المختارة', 'تفاصيل المشروع', 'الحالة', 'ملاحظات', 'تاريخ التسجيل'];
      const rows = leads.map(l => [
        `"${(l.name || '').replace(/"/g, '""')}"`,
        `"${(l.phone || '').replace(/"/g, '""')}"`,
        `"${(l.email || '').replace(/"/g, '""')}"`,
        `"${(l.pack || '').replace(/"/g, '""')}"`,
        `"${(l.projectInfo || '').replace(/"/g, '""')}"`,
        `"${getStatusLabel(l.status)}"`,
        `"${(l.notes || '').replace(/"/g, '""')}"`,
        `"${l.createdAt?.toDate ? l.createdAt.toDate().toLocaleString('ar-DZ') : ''}"`
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `google_sheets_leads_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('فشل تصدير ملف CSV');
    }
  };

  const syncToWebhook = async () => {
    if (!webhookUrl.trim()) {
      alert('يرجى إدخال رابط Webhook الخاص بـ Google Sheet أولا');
      return;
    }

    setSyncing(true);
    try {
      localStorage.setItem('google_sheet_webhook_url', webhookUrl.trim());
      const payload = {
        leads: leads.map(l => ({
          id: l.id,
          name: l.name || '',
          phone: l.phone || '',
          email: l.email || '',
          pack: l.pack || '',
          projectInfo: l.projectInfo || '',
          status: getStatusLabel(l.status),
          notes: l.notes || '',
          date: l.createdAt?.toDate ? l.createdAt.toDate().toLocaleString('ar-DZ') : ''
        }))
      };

      await fetch(webhookUrl.trim(), {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });

      alert('تم إرسال أمر المزامنة! تحقق من جدول Google Sheets الخاص بك.');
    } catch (e) {
      alert('تعذر إرسال البيانات للـ Webhook');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <ModalWrapper onClose={onClose} title="تصدير ومزامنة Google Sheets">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <div
          onClick={copyForGoogleSheets}
          style={{
            ...gsOptionBox,
            borderColor: copied ? '#10B981' : THEME.border,
            backgroundColor: copied ? 'rgba(16, 185, 129, 0.06)' : THEME.bgSubtle
          }}
        >
          <div style={{ ...gsOptionIcon, backgroundColor: copied ? 'rgba(16, 185, 129, 0.15)' : THEME.accentSurface, color: copied ? '#10B981' : THEME.accent }}>
            <Icons.Copy />
          </div>
          <div>
            <span style={{ fontSize: '14px', fontWeight: 800, color: THEME.textMain, display: 'block' }}>
              {copied ? 'تم النسخ بنجاح! الصق الآن (Ctrl+V) في الخلية A1' : 'نسخ بتنسيق Google Sheets (الموصى به)'}
            </span>
            <span style={{ fontSize: '12px', color: THEME.textMuted }}>
              انسخ كل البيانات وافتح أي شيت واضغط لصق مباشرة وتتوزع في الأعمدة فورا.
            </span>
          </div>
        </div>

        <div onClick={downloadGoogleSheetsCsv} style={gsOptionBox}>
          <div style={{ ...gsOptionIcon, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#059669' }}>
            <Icons.DownloadSimple />
          </div>
          <div>
            <span style={{ fontSize: '14px', fontWeight: 800, color: THEME.textMain, display: 'block' }}>
              تحميل ملف CSV متوافق مع اللغة العربية
            </span>
            <span style={{ fontSize: '12px', color: THEME.textMuted }}>
              ملف مهيأ بحروف UTF-8 معتمدة يفتح بسلاسة داخل Google Sheets دون تشويه.
            </span>
          </div>
        </div>

        <a
          href="https://sheets.new"
          target="_blank"
          rel="noreferrer"
          style={{ ...gsOptionBox, textDecoration: 'none' }}
        >
          <div style={{ ...gsOptionIcon, backgroundColor: THEME.accentSurface, color: THEME.accent }}>
            <Icons.ExternalLink />
          </div>
          <div>
            <span style={{ fontSize: '14px', fontWeight: 800, color: THEME.textMain, display: 'block' }}>
              فتح صفحة Google Sheet جديدة
            </span>
            <span style={{ fontSize: '12px', color: THEME.textMuted }}>
              ينقلك مباشرة لإنشاء جدول بيانات سحابي جديد للصق البيانات فيه.
            </span>
          </div>
        </a>

        <div style={{ borderTop: `1px solid ${THEME.border}`, paddingTop: '16px', marginTop: '4px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: THEME.textMain, display: 'block', marginBottom: '6px' }}>
            المزامنة السحابية التلقائية (Google Apps Script Webhook):
          </span>
          <p style={{ fontSize: '12px', color: THEME.textMuted, margin: '0 0 10px 0', lineHeight: 1.5 }}>
            إذا قمت بربط كود Webhook مخصص في Google Apps Script، أدخل الرابط لمزامنة البيانات بضغطة زر:
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
              border: `1px solid ${THEME.border}`,
              backgroundColor: THEME.bgSubtle,
              fontSize: '13px',
              outline: 'none',
              direction: 'ltr',
              marginBottom: '10px',
              boxSizing: 'border-box'
            }}
          />

          <button
            onClick={syncToWebhook}
            disabled={syncing}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: THEME.accent,
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
            {syncing ? 'جاري المزامنة...' : 'مزامنة فورية إلى Google Sheet'}
          </button>
        </div>

      </div>
    </ModalWrapper>
  );
}

// ==================== EDIT MODAL ====================
function EditModal({ lead, onClose, onSave }) {
  const [name, setName] = useState(lead.name || '');
  const [phone, setPhone] = useState(lead.phone || '');
  const [email, setEmail] = useState(lead.email || '');
  const [pack, setPack] = useState(lead.pack || 'باقة النمو');
  const [status, setStatus] = useState(lead.status || 'new');
  const [projectInfo, setProjectInfo] = useState(lead.projectInfo || '');
  const [notes, setNotes] = useState(lead.notes || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave({ name, phone, email, pack, status, projectInfo, notes });
    setSaving(false);
  };

  return (
    <ModalWrapper onClose={onClose} title="تعديل بيانات الزبون">
      {(triggerClose) => (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={modalLabel}>الاسم الكامل:</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required style={modalInput} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={modalLabel}>الهاتف (واتساب):</label>
              <input type="text" value={phone} onChange={e => setPhone(e.target.value)} required style={{ ...modalInput, direction: 'ltr' }} />
            </div>
            <div>
              <label style={modalLabel}>البريد الإلكتروني:</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ ...modalInput, direction: 'ltr' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={modalLabel}>الباقة:</label>
              <select value={pack} onChange={e => setPack(e.target.value)} style={modalInput}>
                <option value="باقة التأسيس">باقة التأسيس</option>
                <option value="باقة الانطلاقة">باقة الانطلاقة</option>
                <option value="باقة النمو">باقة النمو</option>
                <option value="استشارة / حل مخصص">استشارة مخصصة</option>
              </select>
            </div>
            <div>
              <label style={modalLabel}>حالة الطلب:</label>
              <select value={status} onChange={e => setStatus(e.target.value)} style={modalInput}>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={modalLabel}>ملاحظات المتابعة (سجل المكالمة):</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
              {['تم الرد ✔️', 'مهتم جدا', 'طلب اجتماع', 'سعر غير مناسب', 'مشغول - اتصل لاحقا', 'الرقم مغلق'].map(chip => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setNotes(prev => prev ? `${chip}\n${prev}` : chip)}
                  style={{
                    backgroundColor: THEME.bgSubtle,
                    border: `1px solid ${THEME.border}`,
                    color: THEME.textMain,
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  + {chip}
                </button>
              ))}
            </div>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="اكتب ملاحظات التواصل هنا..."
              style={{ ...modalInput, resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={modalLabel}>نبذة عن مشروع الزبون:</label>
            <textarea
              rows={2}
              value={projectInfo}
              onChange={e => setProjectInfo(e.target.value)}
              style={{ ...modalInput, resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={triggerClose} style={modalCancelBtn}>إلغاء</button>
            <button type="submit" disabled={saving} style={modalSaveBtn}>
              {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
            </button>
          </div>
        </form>
      )}
    </ModalWrapper>
  );
}

function InfoRow({ label, value, isLtr, highlight }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${THEME.border}` }}>
      <span style={{ color: THEME.textMuted, fontSize: '13px', fontWeight: 600 }}>{label}:</span>
      <span style={{
        color: highlight ? THEME.accent : THEME.textMain,
        fontWeight: highlight ? 800 : 700,
        fontSize: '14px',
        direction: isLtr ? 'ltr' : 'rtl'
      }}>
        {value || '—'}
      </span>
    </div>
  );
}

// ==================== REUSABLE STYLES ====================
const headerBtnStyle = {
  backgroundColor: '#FFFFFF',
  border: `1px solid ${THEME.border}`,
  color: THEME.textMain,
  borderRadius: '12px',
  padding: '8px 14px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
  transition: 'all 0.2s ease'
};

const cardIconBtnStyle = {
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  backgroundColor: 'rgba(255, 255, 255, 0.65)', /* بدلاً من الأبيض الصامت */
  border: '1px solid rgba(15, 23, 42, 0.06)',
  color: THEME.textMain,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  textDecoration: 'none',
  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.02)',
  transition: 'all 0.2s ease'
};

const modalActionBtn = {
  flex: 1,
  padding: '12px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  fontWeight: 700,
  fontSize: '14px',
  textDecoration: 'none',
  cursor: 'pointer'
};

const gsOptionBox = {
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  padding: '14px 16px',
  borderRadius: '16px',
  border: `1.5px solid ${THEME.border}`,
  backgroundColor: THEME.bgSubtle,
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const gsOptionIcon = {
  width: '42px',
  height: '42px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0
};

const modalLabel = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 700,
  color: THEME.textMuted,
  marginBottom: '6px'
};

const modalInput = {
  width: '100%',
  backgroundColor: THEME.bgSubtle,
  border: `1px solid ${THEME.border}`,
  borderRadius: '12px',
  padding: '10px 14px',
  color: THEME.textMain,
  fontSize: '13px',
  fontWeight: 600,
  outline: 'none',
  boxSizing: 'border-box'
};

const modalCancelBtn = {
  backgroundColor: 'transparent',
  border: `1px solid ${THEME.border}`,
  color: THEME.textMuted,
  padding: '10px 18px',
  borderRadius: '10px',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer'
};

const modalSaveBtn = {
  backgroundColor: THEME.accent,
  border: 'none',
  color: '#FFFFFF',
  padding: '10px 22px',
  borderRadius: '10px',
  fontSize: '13px',
  fontWeight: 700,
  cursor: 'pointer',
  boxShadow: `0 4px 14px ${THEME.accentGlow}`
};