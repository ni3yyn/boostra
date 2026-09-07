// src/app/admin/email/components/AudienceTab.js
"use client";

import React, { useState, useMemo } from 'react';

export default function AudienceTab({ leads, loading, selectedLeadIds, setSelectedLeadIds, onSelectToSend }) {
  const [segmentFilter, setSegmentFilter] = useState('all');
  const [search, setSearch] = useState('');

  // استخراج من يملكون بريداً فقط
  const validEmailLeads = useMemo(() => {
    return leads.filter(l => l.email);
  }, [leads]);

  const filtered = useMemo(() => {
    return validEmailLeads.filter(l => {
      if (segmentFilter === 'no_answer' && l.status !== 'no_answer' && (!l.notes || !l.notes.includes('لم يرد'))) return false;
      if (segmentFilter === 'qualified' && l.status !== 'qualified') return false;
      if (segmentFilter === 'new' && l.status !== 'new') return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (l.name || '').toLowerCase().includes(q) || (l.email || '').toLowerCase().includes(q) || (l.pack || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [validEmailLeads, segmentFilter, search]);

  const toggleSelect = (id) => {
    const next = new Set(selectedLeadIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedLeadIds(next);
  };

  const selectAllFiltered = () => {
    if (selectedLeadIds.size === filtered.length) {
      setSelectedLeadIds(new Set());
    } else {
      setSelectedLeadIds(new Set(filtered.map(l => l.id)));
    }
  };

  return (
    <div className="audience-card">
      <div className="audience-header">
        <div>
          <h2 className="audience-title">قاعدة بيانات العملاء والمشتركين</h2>
          <p className="audience-desc">إجمالي المشتركين المؤكدين ببريد إلكتروني: {validEmailLeads.length} زبون</p>
        </div>

        {selectedLeadIds.size > 0 && (
          <button onClick={onSelectToSend} className="action-compose-btn">
            <span>مراسلة المحدد ({selectedLeadIds.size})</span>
            <span>←</span>
          </button>
        )}
      </div>

      {/* أدوات البحث والتقسيم */}
      <div className="audience-toolbar">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="بحث بالاسم أو البريد أو الباقة..."
          className="search-input"
        />

        <div className="segments-row">
          {[
            { id: 'all', label: `الكل (${validEmailLeads.length})` },
            { id: 'no_answer', label: 'لم يرد' },
            { id: 'qualified', label: 'المؤهلون' },
            { id: 'new', label: 'طلبات جديدة' }
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setSegmentFilter(s.id)}
              className={`segment-btn ${segmentFilter === s.id ? 'active' : ''}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* جدول البيانات النقي */}
      <div className="table-responsive">
        <table className="audience-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input
                  type="checkbox"
                  checked={selectedLeadIds.size === filtered.length && filtered.length > 0}
                  onChange={selectAllFiltered}
                />
              </th>
              <th>الزبون</th>
              <th>البريد الإلكتروني</th>
              <th>الباقة</th>
              <th>حالة الطلب</th>
              <th>آخر إيميل</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(lead => {
              const isChecked = selectedLeadIds.has(lead.id);
              return (
                <tr key={lead.id} className={isChecked ? 'row-selected' : ''}>
                  <td>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSelect(lead.id)}
                    />
                  </td>
                  <td style={{ fontWeight: 700 }}>{lead.name || 'بدون اسم'}</td>
                  <td style={{ direction: 'ltr', textAlign: 'right', color: '#0000FF', fontWeight: 600 }}>{lead.email}</td>
                  <td>{lead.pack || '—'}</td>
                  <td>
                    <span className="lead-tag">{lead.status || 'جديد'}</span>
                  </td>
                  <td style={{ fontSize: '11px', color: '#64748B' }}>
                    {lead.lastEmailSubject ? lead.lastEmailSubject : 'لم يُرسل بعد'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .audience-card {
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(15, 23, 42, 0.06);
          border-radius: 20px;
          padding: 24px;
        }

        .audience-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
          margin-bottom: 18px;
        }

        .audience-title { font-size: 16px; font-weight: 800; margin: 0; color: #0F172A; }
        .audience-desc { font-size: 12px; color: #64748B; margin: 4px 0 0 0; }

        .action-compose-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #0000FF;
          color: #FFFFFF;
          border: none;
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 12.5px;
          font-weight: 700;
          cursor: pointer;
        }

        .audience-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .search-input {
          flex: 1;
          min-width: 240px;
          background: #FFFFFF;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 10px;
          padding: 8px 14px;
          font-size: 12.5px;
          outline: none;
        }

        .segments-row { display: flex; gap: 6px; }
        .segment-btn {
          padding: 6px 12px;
          border-radius: 8px;
          border: 1px solid rgba(15, 23, 42, 0.06);
          background: #F8FAFC;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }
        .segment-btn.active {
          background: rgba(0, 0, 255, 0.08);
          border-color: #0000FF;
          color: #0000FF;
        }

        .table-responsive { overflow-x: auto; }
        .audience-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12.5px;
        }
        .audience-table th {
          text-align: right;
          padding: 10px 12px;
          background: rgba(15, 23, 42, 0.025);
          color: #64748B;
          font-weight: 700;
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
        }
        .audience-table td {
          padding: 12px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.04);
        }
        .row-selected { background: rgba(0, 0, 255, 0.02); }
        .lead-tag {
          font-size: 11px;
          font-weight: 700;
          background: rgba(15, 23, 42, 0.05);
          padding: 2px 8px;
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
}