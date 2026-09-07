// src/app/admin/email/page.js
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

// استيراد الـ CSS Module الخاص بالمنسق
import styles from './email.module.css';

// استيراد التبويبات الفرعية
import CampaignTab from './components/CampaignTab';
import AudienceTab from './components/AudienceTab';
import TemplatesTab from './components/TemplatesTab';
import SettingsTab from './components/SettingsTab';

const BoostraLogo = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={{ flexShrink: 0 }}>
    <rect width="100" height="100" rx="23" fill="#0000FF" />
    <path d="M16 33A8.5 8.5 0 0 1 24.5 24.5H33V41.5H16V33Z" fill="#FFFFFF" />
    <rect x="33" y="41.5" width="34" height="17" fill="#FFFFFF" />
    <path d="M67 58.5H84V67A8.5 8.5 0 0 1 75.5 75.5H67V58.5Z" fill="#FFFFFF" />
  </svg>
);

const NAV_TABS = [
  { id: 'campaign', label: 'استوديو الحملات', icon: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8', badge: 'مطور' },
  { id: 'audience', label: 'الجمهور والقوائم', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  { id: 'templates', label: 'القوالب الجاهزة', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
  { id: 'settings', label: 'حالة الخادم و SMTP', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' }
];

export default function EmailOrchestratorPage() {
  const [activeTab, setActiveTab] = useState('campaign');
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  // بيانات الحملة المشتركة
  const [selectedLeadIds, setSelectedLeadIds] = useState(new Set());
  const [draftSubject, setDraftSubject] = useState('');
  const [draftBody, setDraftBody] = useState('');
  const [draftCtaText, setDraftCtaText] = useState('حجز جلسة استشارة مجانية');
  const [draftCtaUrl, setDraftCtaUrl] = useState('https://wa.me/213794915286');

  useEffect(() => {
    const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = [];
      snapshot.forEach(d => fetched.push({ id: d.id, ...d.data() }));
      setLeads(fetched);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLoadTemplate = (tpl) => {
    setDraftSubject(tpl.subject);
    setDraftBody(tpl.body);
    setDraftCtaText(tpl.ctaText);
    setDraftCtaUrl(tpl.ctaUrl);
    setActiveTab('campaign');
  };

  return (
    <div className={styles.emailApp}>
      {/* 1. خلفية الأورورا الحية */}
      <div className={styles.auroraCanvas} aria-hidden="true">
        <div className={`${styles.auroraOrb} ${styles.orbHero}`} />
        <div className={`${styles.auroraOrb} ${styles.orbMiddle}`} />
        <div className={`${styles.auroraOrb} ${styles.orbBottom}`} />
      </div>

      {/* 2. الهيدر الإداري */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brandGroup}>
            <BoostraLogo size={36} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 className={styles.title}>استوديو البريد والتحجيم</h1>
                <span className={styles.statusPill}>سيرفر Octenium متصل</span>
              </div>
              <p className={styles.desc}>Boostra Agency — إدارة الحملات البريدية وإعادة الاستهداف</p>
            </div>
          </div>

          <Link href="/admin" className={styles.btnSecondary}>
            <span>العودة للوحة العملاء</span>
            <span>←</span>
          </Link>
        </div>
      </header>

      {/* 3. حاوية العمل مع المسار الجانبي */}
      <main className={styles.mainContainer}>
        <div className={styles.layoutGrid}>
          
          <aside className={styles.sideTrail}>
            <nav className={styles.sideMenu}>
              {NAV_TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${styles.trailItem} ${isActive ? styles.trailItemActive : ''}`}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: isActive ? '#0000FF' : '#64748B' }}>
                        <path d={tab.icon} />
                      </svg>
                      <span className={styles.trailLabel}>{tab.label}</span>
                    </div>

                    {tab.id === 'audience' && (
                      <span className={styles.trailCounter}>{leads.filter(l => l.email).length}</span>
                    )}
                    {tab.badge && !isActive && (
                      <span className={styles.trailBadge}>{tab.badge}</span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className={styles.trailFooterBox}>
              <div className={styles.senderIndicator}>
                <span className={styles.indicatorDot} />
                <span className={styles.senderText}>contact@boostraagency.org</span>
              </div>
              <span className={styles.senderSub}>سيرفر معتمد ومصادق بـ SPF/DKIM</span>
            </div>
          </aside>

          <section className={styles.viewportArea}>
            {activeTab === 'campaign' && (
              <CampaignTab 
                leads={leads}
                selectedLeadIds={selectedLeadIds}
                draftSubject={draftSubject}
                setDraftSubject={setDraftSubject}
                draftBody={draftBody}
                setDraftBody={setDraftBody}
                draftCtaText={draftCtaText}
                setDraftCtaText={setDraftCtaText}
                draftCtaUrl={draftCtaUrl}
                setDraftCtaUrl={setDraftCtaUrl}
              />
            )}

            {activeTab === 'audience' && (
              <AudienceTab 
                leads={leads}
                loading={loading}
                selectedLeadIds={selectedLeadIds}
                setSelectedLeadIds={setSelectedLeadIds}
                onSelectToSend={() => setActiveTab('campaign')}
              />
            )}

            {activeTab === 'templates' && (
              <TemplatesTab onApplyTemplate={handleLoadTemplate} />
            )}

            {activeTab === 'settings' && (
              <SettingsTab />
            )}
          </section>

        </div>
      </main>
    </div>
  );
}