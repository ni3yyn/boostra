// src/app/admin/email/components/CampaignTab.js
"use client";

import React, { useState, useMemo, useRef } from 'react';
import styles from './CampaignTab.module.css'; // استيراد الـ Module
import EmailModal from './EmailModal';
import { db } from '../../../lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { apiUrl } from '../../../../lib/apiUrl';

// --- THE UNIFIED BRAND PATTERN ---
const UnifiedBrandPattern = ({ width = "450px", height = "280px", opacity = 0.35 }) => (
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
        <radialGradient id="campaignPatternFadeVibrant" cx="0%" cy="100%" r="95%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="45%" stopColor="white" stopOpacity="0.88" />
          <stop offset="75%" stopColor="white" stopOpacity="0.45" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id="campaignPatternMaskVibrant">
          <rect width="510" height="335" fill="url(#campaignPatternFadeVibrant)" />
        </mask>
      </defs>
      <g fill="#4F46E5" fillOpacity="0.38" mask="url(#campaignPatternMaskVibrant)">
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
  Send: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  Test: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" /><path d="m9 15 2 2 4-4" />
    </svg>
  ),
  Edit: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  ),
  Trash: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  ),
  Plus: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Minimize: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="14" x2="20" y2="14" />
    </svg>
  ),
  Close: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
};

export default function CampaignTab({
  leads,
  selectedLeadIds,
  draftSubject,
  setDraftSubject,
  draftBody,
  setDraftBody,
  draftCtaText,
  setDraftCtaText,
  draftCtaUrl,
  setDraftCtaUrl
}) {
  const [targetSegment, setTargetSegment] = useState('all');
  const [leadSearch, setLeadSearch] = useState('');
  const [customExcludedIds, setCustomExcludedIds] = useState(new Set());
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [displayLimit, setDisplayLimit] = useState(50);
  const [isMassImportOpen, setIsMassImportOpen] = useState(false);
const [massRawText, setMassRawText] = useState('');
const [defaultImportName, setDefaultImportName] = useState('صاحب المتجر');
const [defaultImportPack, setDefaultImportPack] = useState('باقة النمو');
const [skipDuplicates, setSkipDuplicates] = useState(true);
const [importing, setImporting] = useState(false);

  // CRUD Modals
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [newLeadData, setNewLeadData] = useState({ name: '', email: '', pack: 'باقة النمو' });

  // Test Modal
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [sending, setSending] = useState(false); 
  const [testEmailAddress, setTestEmailAddress] = useState('contact@boostraagency.org');

  // Background Dispatcher State
  const [dispatchQueue, setDispatchQueue] = useState({
    active: false,
    total: 0,
    sent: 0,
    failed: 0,
    currentName: '',
    isMinimized: false,
    isDone: false,
  });

  const existingEmailsSet = useMemo(() => {
  return new Set(leads.map(l => (l.email || '').toLowerCase()).filter(Boolean));
}, [leads]);

  const subjectInputRef = useRef(null);
  const bodyInputRef = useRef(null);

  const activeRecipients = useMemo(() => {
    return leads.filter(l => {
      if (!l.email) return false;
      if (customExcludedIds.has(l.id)) return false;

      if (targetSegment === 'no_answer' && l.status !== 'no_answer' && (!l.notes || !l.notes.includes('لم يرد'))) return false;
      if (targetSegment === 'qualified' && l.status !== 'qualified') return false;
      if (targetSegment === 'new' && l.status !== 'new' && l.status) return false;

      if (leadSearch.trim()) {
        const q = leadSearch.toLowerCase();
        const matchName = (l.name || '').toLowerCase().includes(q);
        const matchEmail = (l.email || '').toLowerCase().includes(q);
        const matchPack = (l.pack || '').toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchPack) return false;
      }

      return true;
    });
  }, [leads, targetSegment, customExcludedIds, leadSearch]);

  const toggleLeadInclusion = (id) => {
    setCustomExcludedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const parsedMassResults = useMemo(() => {
  if (!massRawText.trim()) return { valid: [], duplicatesCount: 0, invalidCount: 0 };

  const lines = massRawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  
  const validMap = new Map();
  let duplicates = 0;
  let invalid = 0;

  for (const line of lines) {
    const match = line.match(emailRegex);
    if (!match) {
      invalid++;
      continue;
    }

    const email = match[0].toLowerCase();

    if (validMap.has(email) || (skipDuplicates && existingEmailsSet.has(email))) {
      duplicates++;
      continue;
    }

    let name = '';
    let pack = defaultImportPack;
    const parts = line.split(/[,;\t|]/).map(p => p.trim());
    
    if (parts.length > 1) {
      const nonEmail = parts.filter(p => !emailRegex.test(p));
      if (nonEmail.length > 0) name = nonEmail[0];
      if (nonEmail.length > 1) pack = nonEmail[1];
    }

    validMap.set(email, {
      email,
      name: name || defaultImportName,
      pack: pack || defaultImportPack,
    });
  }

  return {
    valid: Array.from(validMap.values()),
    duplicatesCount: duplicates,
    invalidCount: invalid
  };
}, [massRawText, defaultImportName, defaultImportPack, skipDuplicates, existingEmailsSet]);

  const handleExecuteMassImport = async () => {
  if (parsedMassResults.valid.length === 0) return alert('لا توجد أي إيميلات صالحة للاستيراد!');

  setImporting(true);
  try {
    const { writeBatch, collection, doc, serverTimestamp } = await import('firebase/firestore');
    const chunkSize = 400;

    for (let i = 0; i < parsedMassResults.valid.length; i += chunkSize) {
      const chunk = parsedMassResults.valid.slice(i, i + chunkSize);
      const batch = writeBatch(db);

      chunk.forEach(item => {
        const docRef = doc(collection(db, 'leads'));
        batch.set(docRef, {
          name: item.name,
          email: item.email,
          pack: item.pack,
          status: 'new',
          source: 'mass_import',
          createdAt: serverTimestamp()
        });
      });

      await batch.commit();
    }

    alert(`🎉 تم بنجاح استيراد ${parsedMassResults.valid.length} زبون إلى قاعدة البيانات!`);
    setIsMassImportOpen(false);
    setMassRawText('');
  } catch (err) {
    alert('حدث خطأ أثناء الاستيراد: ' + err.message);
  } finally {
    setImporting(false);
  }
};

  const handleSelectAllCurrent = () => {
    if (activeRecipients.length === 0) {
      setCustomExcludedIds(new Set());
    } else {
      const allCurrentIds = activeRecipients.map(l => l.id);
      setCustomExcludedIds(new Set([...customExcludedIds, ...allCurrentIds]));
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    if (!newLeadData.email.trim()) return alert('البريد مطلوب!');
    try {
      await addDoc(collection(db, 'leads'), {
        name: newLeadData.name.trim() || 'زبون جديد',
        email: newLeadData.email.trim(),
        pack: newLeadData.pack,
        status: 'new',
        createdAt: serverTimestamp()
      });
      setIsAddLeadModalOpen(false);
      setNewLeadData({ name: '', email: '', pack: 'باقة النمو' });
    } catch (err) {
      alert('فشل حفظ الزبون: ' + err.message);
    }
  };

  const handleUpdateLead = async (e) => {
    e.preventDefault();
    if (!editingLead) return;
    try {
      await updateDoc(doc(db, 'leads', editingLead.id), {
        name: editingLead.name,
        email: editingLead.email,
        pack: editingLead.pack,
        updatedAt: serverTimestamp()
      });
      setEditingLead(null);
    } catch (err) {
      alert('فشل تعديل الزبون: ' + err.message);
    }
  };

  const handleDeleteLead = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الزبون نهائياً من النظام؟')) return;
    try {
      await deleteDoc(doc(db, 'leads', id));
    } catch (err) {
      alert('فشل الحذف: ' + err.message);
    }
  };

  const handleInsertToken = (tokenText, target = 'body') => {
    if (target === 'subject') {
      setDraftSubject(prev => `${prev} ${tokenText}`);
      subjectInputRef.current?.focus();
    } else {
      setDraftBody(prev => `${prev} ${tokenText}`);
      bodyInputRef.current?.focus();
    }
  };

  const previewSampleLead = activeRecipients[0] || { name: 'صهيب عالم', pack: 'باقة النمو' };

  const handleSendTest = async (e) => {
  e.preventDefault();
  if (!testEmailAddress.trim()) return;

  setSending(true);
  try {
    const res = await fetch(apiUrl('/api/admin/send-email'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipients: [{ 
          email: testEmailAddress.trim(), 
          name: previewSampleLead.name || 'صهيب عالم (تجربة)',
          pack: previewSampleLead.pack || 'باقة النمو'
        }],
        subject: `[فحص تجريبي]: ${draftSubject || 'حملة Boostra Agency'}`,
        body: draftBody || 'رسالة فحص وتأكد من الـ Inbox.',
        ctaText: draftCtaText,
        ctaUrl: draftCtaUrl,
      }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      alert(`✅ تم إرسال الإيميل التجريبي إلى ${testEmailAddress}`);
      setIsTestModalOpen(false);
    } else {
      alert(`فشل الفحص: ${data.error}`);
    }
  } catch (err) {
    alert('تعذر الاتصال بالخادم: ' + err.message);
  } finally {
    setSending(false);
  }
};

  const handleStartBackgroundDispatch = async () => {
    if (activeRecipients.length === 0) return alert('لم تحدد أي زبون مستهدف!');
    if (!draftSubject.trim() || !draftBody.trim()) return alert('يرجى كتابة عنوان ونص الرسالة أولاً!');

    const queueToSend = [...activeRecipients];

    setDispatchQueue({
      active: true,
      total: queueToSend.length,
      sent: 0,
      failed: 0,
      currentName: queueToSend[0]?.name || '',
      isMinimized: false,
      isDone: false,
    });

    for (let i = 0; i < queueToSend.length; i++) {
      const r = queueToSend[i];

      setDispatchQueue(prev => ({
        ...prev,
        currentName: r.name || r.email
      }));

      try {
        const res = await fetch(apiUrl('/api/admin/send-email'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipients: [{ id: r.id, name: r.name || '', email: r.email, pack: r.pack || 'باقة النمو' }],
            subject: draftSubject,
            body: draftBody,
            ctaText: draftCtaText,
            ctaUrl: draftCtaUrl,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setDispatchQueue(prev => ({ ...prev, sent: prev.sent + 1 }));
        } else {
          setDispatchQueue(prev => ({ ...prev, failed: prev.failed + 1 }));
        }
      } catch (err) {
        setDispatchQueue(prev => ({ ...prev, failed: prev.failed + 1 }));
      }

      await new Promise(res => setTimeout(res, 200));
    }

    setDispatchQueue(prev => ({ ...prev, active: false, isDone: true }));
  };

  return (
    <div className={styles.container}>
      
      {/* 1. الشريط العلوي */}
      <div className={styles.topBar}>
        <div className={styles.statsCluster}>
          <span className={styles.clusterLabel}>المستهدفون المؤكدون:</span>
          <span className={styles.clusterCounter}>{activeRecipients.length} زبون</span>
          <button 
            type="button" 
            onClick={() => setIsAddLeadModalOpen(true)}
            className={styles.btnAddRecipient}
          >
            <Icons.Plus />
            <span>إضافة مستلم</span>
          </button>

          <button 
  type="button" 
  onClick={() => setIsMassImportOpen(true)}
  className={styles.btnAddRecipient}
  
>
  <span>استيراد جماعي</span>
</button>

        </div>

        <div className={styles.buttonsCluster}>
          <div className={styles.deviceSwitcher}>
            <button
              type="button"
              onClick={() => setPreviewDevice('desktop')}
              className={`${styles.deviceBtn} ${previewDevice === 'desktop' ? styles.deviceBtnActive : ''}`}
            >
              حاسوب
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice('mobile')}
              className={`${styles.deviceBtn} ${previewDevice === 'mobile' ? styles.deviceBtnActive : ''}`}
            >
              هاتف
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsTestModalOpen(true)}
            className={styles.btnTest}
          >
            <Icons.Test />
            <span>فحص تجريبي لنفسي</span>
          </button>
        </div>
      </div>

      {/* 2. الشبكة الرئيسية */}
      <div className={styles.coreGrid}>
        
        {/* أ. لوحة صانع المحتوى وإدارة الاستهداف */}
        <div className={styles.dashboardCard}>
          <div className={styles.cardContent}>
            <h2 className={styles.cardHeaderTitle}>إعداد الحملة واختيار المستلمين</h2>

            {/* أداة تحديد الفئات */}
            <div className={styles.segmentsRow}>
              {[
                { id: 'all', label: `الكل (${leads.filter(l => l.email).length})` },
                { id: 'no_answer', label: `لم يرد (${leads.filter(l => (l.status === 'no_answer' || (l.notes && l.notes.includes('لم يرد'))) && l.email).length})` },
                { id: 'qualified', label: `المؤهلون (${leads.filter(l => l.status === 'qualified' && l.email).length})` },
                { id: 'new', label: `جديد (${leads.filter(l => (l.status === 'new' || !l.status) && l.email).length})` },
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTargetSegment(opt.id)}
                  className={`${styles.segmentPill} ${targetSegment === opt.id ? styles.segmentPillActive : ''}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* صندوق إدارة وتحديد المستلمين المدمج مع دعم مئات الإيميلات */}
<div className={styles.recipientsManagerBox}>
  <div className={styles.managerHeader}>
    <input
      type="text"
      placeholder="بحث سريع في الأسماء أو الإيميلات..."
      value={leadSearch}
      onChange={e => {
        setLeadSearch(e.target.value);
        setDisplayLimit(50); // إعادة التصفير عند البحث
      }}
      className={styles.searchInput}
    />
    
    <div style={{ display: 'flex', gap: '8px' }}>
      <button 
        type="button" 
        onClick={() => setCustomExcludedIds(new Set())} 
        className={styles.btnInvertSelect}
      >
        تحديد الكل
      </button>
      <span style={{ color: 'rgba(15,23,42,0.1)' }}>|</span>
      <button 
        type="button" 
        onClick={handleSelectAllCurrent} 
        className={styles.btnInvertSelect}
        style={{ color: '#64748B' }}
      >
        عكس التحديد
      </button>
    </div>
  </div>

  {/* قائمة التمرير الانسيابية */}
  <div className={styles.recipientsListScroll}>
    {activeRecipients.slice(0, displayLimit).map(l => {
      const isIncluded = !customExcludedIds.has(l.id);
      return (
        <div key={l.id} className={`${styles.recipientRow} ${isIncluded ? styles.recipientRowIncluded : ''}`}>
          <label className={styles.recipientLabel}>
            <input
              type="checkbox"
              checked={isIncluded}
              onChange={() => toggleLeadInclusion(l.id)}
              style={{ accentColor: '#0000FF' }}
            />
            <span className={styles.leadName}>{l.name || 'بدون اسم'}</span>
            <span className={styles.leadEmail}>({l.email})</span>
          </label>

          <div style={{ display: 'flex', gap: '4px' }}>
            <button type="button" onClick={() => setEditingLead(l)} className={styles.crudActionBtn} title="تعديل">
              <Icons.Edit />
            </button>
            <button type="button" onClick={() => handleDeleteLead(l.id)} className={`${styles.crudActionBtn} ${styles.btnDeleteLead}`} title="حذف">
              <Icons.Trash />
            </button>
          </div>
        </div>
      );
    })}

    {activeRecipients.length === 0 && (
      <div style={{ textAlign: 'center', padding: '20px 0', fontSize: '12px', color: '#64748B' }}>
        لا توجد أي نتائج مطابقة لمعايير البحث الحالية
      </div>
    )}
  </div>

  {/* عداد الـ ScrollView السفلي وزر عرض المزيد */}
  <div className={styles.listFooterCounter}>
    <span>
      يتم عرض {Math.min(displayLimit, activeRecipients.length)} من أصل {activeRecipients.length} زبون مستهدف
    </span>

    {activeRecipients.length > displayLimit && (
      <button 
        type="button" 
        onClick={() => setDisplayLimit(prev => prev + 50)} 
        className={styles.btnLoadMore}
      >
        + عرض 50 إضافية
      </button>
    )}
  </div>
</div>

            {/* الحقول التكتيكية بمقاسات Dashboard حقيقية */}
            <div className={styles.fieldGroup}>
              <div className={styles.fieldLabelRow}>
                <span>عنوان الرسالة (Subject): *</span>
                <button type="button" onClick={() => handleInsertToken('{{name}}', 'subject')} className={styles.tokenBtn}>
                  + إدراج {'{{name}}'}
                </button>
              </div>
              <input
                ref={subjectInputRef}
                type="text"
                required
                value={draftSubject}
                onChange={e => setDraftSubject(e.target.value)}
                placeholder="مثال: بخصوص خطة متجرك الإعلانية يا {{name}} — Boostra"
                className={styles.dashboardInput}
              />
            </div>

            <div className={styles.fieldGroup}>
              <div className={styles.fieldLabelRow}>
                <span>نص الرسالة التسويقية: *</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button type="button" onClick={() => handleInsertToken('{{name}}', 'body')} className={styles.tokenBtn}>
                    + الاسم
                  </button>
                  <button type="button" onClick={() => handleInsertToken('{{pack}}', 'body')} className={styles.tokenBtn}>
                    + الباقة
                  </button>
                </div>
              </div>
              <textarea
                ref={bodyInputRef}
                required
                rows={5}
                value={draftBody}
                onChange={e => setDraftBody(e.target.value)}
                placeholder="مرحباً {{name}}، لاحظ فريقنا اهتمامك بـ {{pack}} وحرصنا على وضع خطة ميديا باينغ تناسب متجرك..."
                className={`${styles.dashboardInput} ${styles.dashboardTextarea}`}
              />
            </div>

            <div className={styles.gridTwoInputs}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabelRow}>نص الزر (CTA):</label>
                <input
                  type="text"
                  value={draftCtaText}
                  onChange={e => setDraftCtaText(e.target.value)}
                  className={styles.dashboardInput}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabelRow}>رابط الزر (URL):</label>
                <input
                  type="url"
                  value={draftCtaUrl}
                  onChange={e => setDraftCtaUrl(e.target.value)}
                  className={`${styles.dashboardInput} ${styles.ltrInput}`}
                />
              </div>
            </div>

            <button
              type="button"
              disabled={dispatchQueue.active || activeRecipients.length === 0}
              onClick={handleStartBackgroundDispatch}
              className={styles.btnLaunchCampaign}
            >
              <Icons.Send />
              <span>إطلاق الحملة في الخلفية إلى ({activeRecipients.length}) زبون</span>
            </button>
          </div>

          <UnifiedBrandPattern width="380px" height="240px" />
        </div>

        {/* ب. كرت المعاينة الحية */}
        <div className={styles.dashboardCard}>
          <div className={styles.cardContent}>
            <h2 className={styles.cardHeaderTitle}>
              المعاينة الحية ({previewDevice === 'desktop' ? 'شاشة حاسوب' : 'تطبيق هاتف'})
            </h2>

            <div style={{ maxWidth: previewDevice === 'mobile' ? '375px' : '100%', margin: '0 auto', transition: 'max-width 0.3s ease', width: '100%' }}>
              <div className={styles.previewChassis}>
                <div className={styles.previewEmailSheet}>
                  <div className={styles.brandCardHeader}>
                    <div className={styles.brandBadge}>BOOSTRA AGENCY</div>
                    <h4 className={styles.brandSubject}>
                      {draftSubject ? draftSubject.replace(/{{name}}/g, previewSampleLead.name) : 'عنوان الإيميل...'}
                    </h4>
                  </div>

                  <div className={styles.brandBody}>
                    <p className={styles.saluteText}>مرحباً {previewSampleLead.name}،</p>
                    <p className={styles.paragraphText}>
                      {draftBody ? draftBody.replace(/{{name}}/g, previewSampleLead.name).replace(/{{pack}}/g, previewSampleLead.pack) : 'نص الرسالة التسويقية...'}
                    </p>

                    {draftCtaText && (
                      <div style={{ textAlign: 'center', margin: '24px 0' }}>
                        <span className={styles.previewCtaBtn}>
                          {draftCtaText}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className={styles.brandFooter}>
                    <p style={{ margin: '0 0 2px 0', fontWeight: 600, color: '#64748B' }}>Boostra Agency — إدارة وتحجيم الحملات الإعلانية الممولة</p>
                    <p style={{ margin: 0 }}>الجزائر العاصمة، الجزائر 🇩🇿</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <UnifiedBrandPattern width="380px" height="240px" />
        </div>

      </div>

      {/* 3. شريط الإرسال العائم في الخلفية (Non-blocking Dock) */}
      {(dispatchQueue.active || dispatchQueue.isDone) && (
        <div className={styles.floatingDispatcherDock}>
          <div className={styles.dockHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className={dispatchQueue.isDone ? styles.pulseDotDone : styles.pulseDotActive} />
              <span style={{ fontSize: '13px', fontWeight: 800 }}>
                {dispatchQueue.isDone ? 'اكتمل إرسال الحملة بنجاح!' : 'جاري الإرسال بالخلفية...'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setDispatchQueue(prev => ({ ...prev, isMinimized: !prev.isMinimized }))}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <Icons.Minimize />
              </button>
              {dispatchQueue.isDone && (
                <button
                  type="button"
                  onClick={() => setDispatchQueue({ active: false, total: 0, sent: 0, failed: 0, currentName: '', isMinimized: false, isDone: false })}
                  style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                >
                  <Icons.Close />
                </button>
              )}
            </div>
          </div>

          {!dispatchQueue.isMinimized && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#94A3B8', marginBottom: '6px' }}>
                <span>تم إرسال: {dispatchQueue.sent} من {dispatchQueue.total}</span>
                {dispatchQueue.failed > 0 && <span style={{ color: '#EF4444' }}>{dispatchQueue.failed} فشل</span>}
              </div>

              <div className={styles.progressTrack}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${dispatchQueue.total > 0 ? (dispatchQueue.sent / dispatchQueue.total) * 100 : 0}%` }} 
                />
              </div>

              {!dispatchQueue.isDone && (
                <div style={{ fontSize: '11.5px', color: '#E2E8F0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  جاري الإرسال إلى: <strong style={{ color: '#38BDF8' }}>{dispatchQueue.currentName}</strong>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ========================================================
    REUSABLE MODALS (EMAILMODAL UNIFIED SYSTEM)
   ======================================================== */}

{/* 1. مودال الفحص التجريبي لنفسك */}
<EmailModal
  isOpen={isTestModalOpen}
  onClose={() => setIsTestModalOpen(false)}
  title="إرسال فحص تجريبي لنفسي"
  subtitle="تأكد من مظهر الرسالة وتنسيقها في بريدك قبل إطلاق الحملة للعملاء."
  maxWidth="440px"
>
  <form onSubmit={handleSendTest} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
    <div>
      <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>بريد الاستلام:</label>
      <input
        type="email"
        required
        value={testEmailAddress}
        onChange={e => setTestEmailAddress(e.target.value)}
        className="tactile-input-box"
        style={{ direction: 'ltr', textAlign: 'left' }}
      />
    </div>

    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', marginTop: '14px' }}>
  <button 
    type="button" 
    onClick={() => setIsTestModalOpen(false)} 
    className="btn-cancel"
  >
    إلغاء
  </button>
  
  <button 
    type="submit" 
    disabled={sending} 
    className="btn-action" 
    style={{ height: '42px', padding: '0 24px', fontSize: '13px' }}
  >
    {sending ? 'جاري الإرسال...' : 'إرسال الفحص الآن'}
  </button>
</div>
  </form>
</EmailModal>

{/* 2. مودال إضافة مستلم جديد (CRUD) */}
<EmailModal
  isOpen={isAddLeadModalOpen}
  onClose={() => setIsAddLeadModalOpen(false)}
  title="إضافة مستلم جديد إلى القائمة"
  subtitle="سيتم حفظ الزبون في Firebase ليظهر في قائمة الاستهداف فوراً."
  maxWidth="440px"
>
  <form onSubmit={handleCreateLead} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
    <div>
      <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>الاسم الكامل:</label>
      <input
        type="text"
        placeholder="محمد العمري"
        value={newLeadData.name}
        onChange={e => setNewLeadData({ ...newLeadData, name: e.target.value })}
        className="tactile-input-box"
      />
    </div>

    <div>
      <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>البريد الإلكتروني: *</label>
      <input
        type="email"
        required
        placeholder="client@gmail.com"
        value={newLeadData.email}
        onChange={e => setNewLeadData({ ...newLeadData, email: e.target.value })}
        className="tactile-input-box"
        style={{ direction: 'ltr', textAlign: 'right' }}
      />
    </div>

    <div>
      <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>الباقة المستهدفة:</label>
      <select
        value={newLeadData.pack}
        onChange={e => setNewLeadData({ ...newLeadData, pack: e.target.value })}
        className="tactile-input-box"
      >
        <option value="باقة النمو">باقة النمو</option>
        <option value="باقة الانطلاقة">باقة الانطلاقة</option>
        <option value="باقة التأسيس">باقة التأسيس</option>
      </select>
    </div>

    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', marginTop: '14px' }}>
  <button 
    type="button" 
    onClick={() => setIsAddLeadModalOpen(false)} 
    className="btn-cancel"
  >
    إلغاء
  </button>
  
  <button 
    type="submit" 
    className="btn-action" 
    style={{ height: '42px', padding: '0 24px', fontSize: '13px' }}
  >
    حفظ وإضافة
  </button>
</div>
  </form>
</EmailModal>

{/* 3. مودال تعديل بيانات الزبون (CRUD) */}
<EmailModal
  isOpen={Boolean(editingLead)}
  onClose={() => setEditingLead(null)}
  title="تعديل بيانات الزبون"
  maxWidth="440px"
>
  {editingLead && (
    <form onSubmit={handleUpdateLead} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>الاسم:</label>
        <input
          type="text"
          value={editingLead.name || ''}
          onChange={e => setEditingLead({ ...editingLead, name: e.target.value })}
          className="tactile-input-box"
        />
      </div>

      <div>
        <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>البريد الإلكتروني:</label>
        <input
          type="email"
          required
          value={editingLead.email || ''}
          onChange={e => setEditingLead({ ...editingLead, email: e.target.value })}
          className="tactile-input-box"
          style={{ direction: 'ltr', textAlign: 'right' }}
        />
      </div>

      <div>
        <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>الباقة:</label>
        <input
          type="text"
          value={editingLead.pack || ''}
          onChange={e => setEditingLead({ ...editingLead, pack: e.target.value })}
          className="tactile-input-box"
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', marginTop: '14px' }}>
  <button 
    type="button" 
    onClick={() => setEditingLead(null)} 
    className="btn-cancel"
  >
    إلغاء
  </button>
  
  <button 
    type="submit" 
    className="btn-action" 
    style={{ height: '42px', padding: '0 24px', fontSize: '13px' }}
  >
    حفظ التعديل
  </button>
</div>
    </form>
  )}
</EmailModal>

      {/* 4. مودال الاستيراد الجماعي الموحد (MASS IMPORT MODAL) */}
<EmailModal
  isOpen={isMassImportOpen}
  onClose={() => setIsMassImportOpen(false)}
  title="استيراد إيميلات جماعية (Mass Import)"
  subtitle="الصق القائمة بأي صيغة وسيتولى النظام استخراج الإيميلات وتنسيقها وحفظها في Firebase."
  maxWidth="620px"
>
  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
    
    {/* خيارات الضبط التلقائي لمن ليس لديه اسم */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'rgba(15,23,42,0.025)', padding: '12px', borderRadius: '12px' }}>
      <div>
        <label style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '4px' }}>
          الاسم البديل لمن ليس لديه اسم:
        </label>
        <input
          type="text"
          value={defaultImportName}
          onChange={e => setDefaultImportName(e.target.value)}
          placeholder="مثال: صاحب المتجر"
          className="tactile-input-box"
        />
      </div>
      <div>
        <label style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '4px' }}>
          الباقة الافتراضية:
        </label>
        <select
          value={defaultImportPack}
          onChange={e => setDefaultImportPack(e.target.value)}
          className="tactile-input-box"
        >
          <option value="باقة النمو">باقة النمو</option>
          <option value="باقة الانطلاقة">باقة الانطلاقة</option>
          <option value="باقة التأسيس">باقة التأسيس</option>
        </select>
      </div>
    </div>

    {/* مساحة اللصق الجماعي */}
    <div>
      <label style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '4px' }}>
        الصق الإيميلات هنا (سطر بسطر أو مفصولة بفواصل):
      </label>
      <textarea
        rows={6}
        value={massRawText}
        onChange={e => setMassRawText(e.target.value)}
        placeholder={`client1@store.com\nkarim@gmail.com, كريم بلحاج\ncontact@fashion.dz\n...`}
        className="tactile-input-box tactile-textarea"
        style={{ direction: 'ltr', textAlign: 'left', minHeight: '110px' }}
      />
    </div>

    {/* شريط الإحصائيات اللحظية */}
    {massRawText.trim() && (
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '11.5px', fontWeight: 700 }}>
        <span style={{ background: 'rgba(16,185,129,0.1)', color: '#059669', padding: '3px 8px', borderRadius: '6px' }}>
          جاهز للاستيراد: {parsedMassResults.valid.length}
        </span>
        <span style={{ background: 'rgba(245,158,11,0.1)', color: '#D97706', padding: '3px 8px', borderRadius: '6px' }}>
          مكرر تم استبعاده: {parsedMassResults.duplicatesCount}
        </span>
        {parsedMassResults.invalidCount > 0 && (
          <span style={{ background: 'rgba(239,68,68,0.1)', color: '#DC2626', padding: '3px 8px', borderRadius: '6px' }}>
            أسطر غير صالحة: {parsedMassResults.invalidCount}
          </span>
        )}
      </div>
    )}

    {/* شريط الإجراءات السفلي لمودال الاستيراد الجماعي */}
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(15, 23, 42, 0.06)' }}>
  <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', userSelect: 'none' }}>
    <input
      type="checkbox"
      checked={skipDuplicates}
      onChange={e => setSkipDuplicates(e.target.checked)}
      style={{ accentColor: '#0000FF' }}
    />
    <span>استبعاد الإيميلات المسجلة مسبقاً</span>
  </label>

  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <button 
      type="button" 
      onClick={() => setIsMassImportOpen(false)} 
      className="btn-cancel"
    >
      إلغاء
    </button>

    <button
      type="button"
      disabled={importing || parsedMassResults.valid.length === 0}
      onClick={handleExecuteMassImport}
      className="btn-action"
      style={{ height: '42px', padding: '0 22px', fontSize: '13px' }}
    >
      {importing ? 'جاري الاستيراد...' : `استيراد (${parsedMassResults.valid.length}) زبون`}
    </button>
  </div>
</div>

  </div>
</EmailModal>

    </div>
  );
}

// --- مكون نافذة الاستيراد الجماعي الذكي (MASS IMPORT MODAL) ---
function MassImportModal({ isOpen, onClose, existingEmails }) {
  const [rawText, setRawText] = useState('');
  const [defaultName, setDefaultName] = useState('صاحب المتجر');
  const [defaultPack, setDefaultPack] = useState('باقة النمو');
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [saving, setSaving] = useState(false);

  // الفرز اللحظي وتحليل البيانات المدخلة
  const parsedResults = useMemo(() => {
    if (!rawText.trim()) return { valid: [], duplicatesCount: 0, invalidCount: 0 };

    const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    
    const validMap = new Map();
    let duplicates = 0;
    let invalid = 0;

    for (const line of lines) {
      const match = line.match(emailRegex);
      if (!match) {
        invalid++;
        continue;
      }

      const email = match[0].toLowerCase();

      // فحص التكرار مع قاعدة البيانات الحالية والقائمة المدخلة
      if (validMap.has(email) || (skipDuplicates && existingEmails.has(email))) {
        duplicates++;
        continue;
      }

      // محاولة استخراج الاسم إذا كان مفصولاً بفاصلة أو Tab
      let name = '';
      let pack = defaultPack;
      const parts = line.split(/[,;\t|]/).map(p => p.trim());
      
      if (parts.length > 1) {
        const nonEmail = parts.filter(p => !emailRegex.test(p));
        if (nonEmail.length > 0) name = nonEmail[0];
        if (nonEmail.length > 1) pack = nonEmail[1];
      }

      validMap.set(email, {
        email,
        name: name || defaultName,
        isNameDefault: !name,
        pack: pack || defaultPack,
      });
    }

    return {
      valid: Array.from(validMap.values()),
      duplicatesCount: duplicates,
      invalidCount: invalid
    };
  }, [rawText, defaultName, defaultPack, skipDuplicates, existingEmails]);

  // تنفيذ الحفظ السريع عبر Firestore Batch
  const handleExecuteImport = async () => {
    if (parsedResults.valid.length === 0) return alert('لا يوجد أي إيميلات صالحة للحفظ!');

    setSaving(true);
    try {
      const { writeBatch, collection, doc, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('../../../lib/firebase');

      // تقسيم البيانات إلى دفعات (Chunks) بحد أقصى 400 لكل دفعة
      const chunkSize = 400;
      for (let i = 0; i < parsedResults.valid.length; i += chunkSize) {
        const chunk = parsedResults.valid.slice(i, i + chunkSize);
        const batch = writeBatch(db);

        chunk.forEach(item => {
          const docRef = doc(collection(db, 'leads'));
          batch.set(docRef, {
            name: item.name,
            email: item.email,
            pack: item.pack,
            status: 'new',
            source: 'mass_import',
            createdAt: serverTimestamp()
          });
        });

        await batch.commit();
      }

      alert(`🎉 تم بنجاح استيراد ${parsedResults.valid.length} زبون إلى قاعدة البيانات!`);
      onClose();
    } catch (err) {
      alert('حدث خطأ أثناء الاستيراد: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#FFFFFF', borderRadius: '24px', padding: '26px', maxWidth: '600px', width: '100%', boxShadow: '0 25px 60px rgba(15,23,42,0.2)', direction: 'rtl' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid rgba(15,23,42,0.06)', paddingBottom: '12px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#0F172A' }}>استيراد قائمة إيميلات جماعية (Mass Import)</h3>
            <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>الصق القائمة بأي شكل وسيتولى النظام استخراج الإيميلات وتنسيقها</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#64748B' }}>✕</button>
        </div>

        {/* خيارات الضبط التلقائي للإيميلات الناقصة */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px', background: 'rgba(15,23,42,0.025)', padding: '12px', borderRadius: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '4px' }}>
              الاسم الافتراضي لمن ليس لديه اسم:
            </label>
            <input
              type="text"
              value={defaultName}
              onChange={e => setDefaultName(e.target.value)}
              placeholder="مثال: صاحب المتجر"
              style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(15,23,42,0.1)', fontSize: '12.5px' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '4px' }}>
              الباقة الافتراضية:
            </label>
            <select
              value={defaultPack}
              onChange={e => setDefaultPack(e.target.value)}
              style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(15,23,42,0.1)', fontSize: '12.5px' }}
            >
              <option value="باقة النمو">باقة النمو</option>
              <option value="باقة الانطلاقة">باقة الانطلاقة</option>
              <option value="باقة التأسيس">باقة التأسيس</option>
            </select>
          </div>
        </div>

        {/* خانة اللصق الجماعي */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '4px' }}>
            الصق الإيميلات هنا (سطر بسطر أو مفصولة بفواصل):
          </label>
          <textarea
            rows={7}
            value={rawText}
            onChange={e => setRawText(e.target.value)}
            placeholder={`mohamed@store.com\nkarim@gmail.com, كريم بلحاج\ncontact@fashion.dz\n...`}
            style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid rgba(15,23,42,0.1)', fontSize: '12px', direction: 'ltr', textAlign: 'left', outline: 'none' }}
          />
        </div>

        {/* شريط الإحصائيات والتحقق اللحظي */}
        {rawText.trim() && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px', fontSize: '11.5px', fontWeight: 700 }}>
            <span style={{ background: 'rgba(16,185,129,0.1)', color: '#059669', padding: '3px 8px', borderRadius: '6px' }}>
              جاهز للاستيراد: {parsedResults.valid.length}
            </span>
            <span style={{ background: 'rgba(245,158,11,0.1)', color: '#D97706', padding: '3px 8px', borderRadius: '6px' }}>
              مكرر تم استبعاده: {parsedResults.duplicatesCount}
            </span>
            {parsedResults.invalidCount > 0 && (
              <span style={{ background: 'rgba(239,68,68,0.1)', color: '#DC2626', padding: '3px 8px', borderRadius: '6px' }}>
                أسطر غير صالحة: {parsedResults.invalidCount}
              </span>
            )}
          </div>
        )}

        {/* الأزرار السفلية */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={skipDuplicates}
              onChange={e => setSkipDuplicates(e.target.checked)}
              style={{ accentColor: '#0000FF' }}
            />
            <span>استبعاد الإيميلات المسجلة مسبقاً في النظام</span>
          </label>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', background: '#F1F5F9', cursor: 'pointer', fontSize: '13px' }}>
              إلغاء
            </button>
            <button
              type="button"
              disabled={saving || parsedResults.valid.length === 0}
              onClick={handleExecuteImport}
              className="btn-action"
              style={{ padding: '8px 20px', fontSize: '13px', background: '#0000FF' }}
            >
              {saving ? 'جاري الاستيراد...' : `استيراد (${parsedResults.valid.length}) زبون`}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}


