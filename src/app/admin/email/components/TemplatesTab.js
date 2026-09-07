// src/app/admin/email/components/TemplatesTab.js
"use client";

import React from 'react';

const PRESET_TEMPLATES = [
  {
    id: 'no_answer',
    badge: 'إعادة الاستهداف',
    title: 'متابعة الزبون الذي لم يرد هاتفياً',
    desc: 'رسالة ودية تفتح الباب للمحادثة عبر الواتساب لمن لم يتمكنوا من الإجابة على الهاتف.',
    subject: 'حاولنا الاتصال بك بخصوص استفسارك — Boostra Agency',
    body: 'مرحباً بك،\n\nحاول فريقنا التواصل معك هاتفياً لمناقشة استفسارك حول إعلانات متجرك الإلكتروني وتحديد الخطة الأنسب لخفض تكلفة الزبون (CAC).\n\nإذا كنت مشغولاً، يمكنك حجز موعد مباشر أو مراسلتنا فوراً عبر الواتساب في أي وقت يناسبك.',
    ctaText: 'محادثة مباشرة عبر واتساب',
    ctaUrl: 'https://wa.me/213794915286'
  },
  {
    id: 'growth_pitch',
    badge: 'زيادة المبيعات',
    title: 'عرض استشارة باقة النمو والتوسع',
    desc: 'عرض خاص لتدقيق الحملات الإعلانية مجاناً وتحديد ثغرات الهدر الإعلاني.',
    subject: 'عرض تدقيق إعلاني مجاني لمتجرك — Boostra Agency',
    body: 'يسعدنا تواصلك معنا!\n\nنقدم لك هذا الأسبوع مراجعة فنية مجانية لحساباتك الإعلانية على Meta و Google لكشف أسباب ارتفاع تكلفة الطلب وكيفية مضاعفة المبيعات اليومية.\n\nاضغط على الزر أدناه لتأكيد حجز جلستك المجانية مع مدير الحملات.',
    ctaText: 'احجز جلستك المجانية الآن',
    ctaUrl: 'https://boostraagency.org/#booking'
  },
  {
    id: 'ebook_followup',
    badge: 'تحويل زوار الهدايا',
    title: 'متابعة من حمّلوا دليل التجارة الإلكترونية',
    desc: 'تحويل زوار صفحة الهدايا من مجرد قارئين إلى عملاء يطلبون باقات الإعلانات.',
    subject: 'هل طبقت استراتيجيات دليل الإعلانات؟ خطوتك التالية لمتجرك',
    body: 'مرحباً بك،\n\nنتمنى أنك استفدت من دليل إعلانات المتاجر الإلكترونية الذي قمت بتحميله.\n\nقراءة الاستراتيجيات خطوة ممتازة، ولكن التطبيق العملي وضبط الـ CAPI واختبار الـ Creatives هو ما يصنع الفارق الحقيقي في الأرباح. فريقنا مستعد لمرافقتك في هذه الخطوة.',
    ctaText: 'اطلب خطتك الإعلانية المخصصة',
    ctaUrl: 'https://boostraagency.org/#booking'
  }
];

export default function TemplatesTab({ onApplyTemplate }) {
  return (
    <div className="templates-container">
      <div className="templates-header">
        <h2 className="templates-main-title">مكتبة قوالب الميديا باينغ الجاهزة</h2>
        <p className="templates-sub-title">اختر أي قالب لتطبيقه وتعديله وإطلاقه بنقرة واحدة</p>
      </div>

      <div className="templates-cards-grid">
        {PRESET_TEMPLATES.map(tpl => (
          <div key={tpl.id} className="template-card">
            <div className="template-card-top">
              <span className="template-badge">{tpl.badge}</span>
              <h3 className="template-title">{tpl.title}</h3>
              <p className="template-desc">{tpl.desc}</p>
            </div>

            <div className="template-preview-quote">
              <strong>العنوان المقترح:</strong> {tpl.subject}
            </div>

            <button onClick={() => onApplyTemplate(tpl)} className="apply-template-btn">
              <span>استخدام وتعديل هذا القالب</span>
              <span>←</span>
            </button>
          </div>
        ))}
      </div>

      <style jsx>{`
        .templates-container {
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(15, 23, 42, 0.06);
          border-radius: 20px;
          padding: 24px;
        }
        .templates-header { margin-bottom: 24px; }
        .templates-main-title { font-size: 16px; font-weight: 800; margin: 0; color: #0F172A; }
        .templates-sub-title { font-size: 12px; color: #64748B; margin: 4px 0 0 0; }

        .templates-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }

        .template-card {
          background: #FFFFFF;
          border: 1px solid rgba(15, 23, 42, 0.07);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.02);
          transition: transform 0.2s ease;
        }
        .template-card:hover { transform: translateY(-2px); }

        .template-badge {
          font-size: 11px;
          font-weight: 800;
          color: #0000FF;
          background: rgba(0, 0, 255, 0.08);
          padding: 3px 8px;
          border-radius: 6px;
          display: inline-block;
          margin-bottom: 10px;
        }

        .template-title { font-size: 14.5px; font-weight: 800; margin: 0 0 6px 0; color: #0F172A; }
        .template-desc { font-size: 12px; color: #64748B; margin: 0 0 14px 0; line-height: 1.6; }

        .template-preview-quote {
          background: rgba(15, 23, 42, 0.025);
          padding: 10px 12px;
          border-radius: 10px;
          font-size: 11.5px;
          color: #475569;
          margin-bottom: 16px;
        }

        .apply-template-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #F8FAFC;
          border: 1px solid rgba(15, 23, 42, 0.08);
          color: #0F172A;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 12.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .apply-template-btn:hover {
          background: #0000FF;
          color: #FFFFFF;
          border-color: #0000FF;
        }
      `}</style>
    </div>
  );
}