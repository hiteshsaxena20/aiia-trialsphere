import React, { useEffect, useState } from 'react';
import { participantsApi } from '../api';
import { Users, Search } from 'lucide-react';

const STATUS_MAP: Record<string, string> = {
  SCREENED: 'badge-info', ENROLLED: 'badge-success', COMPLETED: 'badge-cyan',
  WITHDRAWN: 'badge-danger', SCREEN_FAILED: 'badge-warning'
};

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    participantsApi.list({ limit: 100, status: statusFilter || undefined })
      .then(r => { setParticipants(r.data.participants); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  }, [statusFilter]);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 className="page-title">Participant Registry</h1>
        <p className="page-description">{total} de-identified participants across all studies</p>
      </div>

      <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: 16, fontSize: 12, color: '#fbbf24' }}>
        ⚠ Privacy Notice: All participant identifiers are synthetic/de-identified. No real patient data is stored in this system.
      </div>

      {/* Stats */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
        {[
          { label: 'Total Registered', value: total, color: '#94a3b8', icon: <Users size={20} /> },
          { label: 'Enrolled', value: participants.filter(p => p.status === 'ENROLLED').length, color: '#10b981', icon: '✓' },
          { label: 'Screened', value: participants.filter(p => p.status === 'SCREENED').length, color: '#3b82f6', icon: '🔍' },
          { label: 'Withdrawn', value: participants.filter(p => p.is_withdrawn).length, color: '#ef4444', icon: '✗' },
        ].map(item => (
          <div key={item.label} className="kpi-card" style={{ '--accent-color': item.color } as any}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{item.icon}</div>
            <div className="kpi-value" style={{ color: item.color }}>{item.value}</div>
            <div className="kpi-label">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="filter-tabs" style={{ marginBottom: 16, width: 'fit-content' }}>
        {['', 'ENROLLED', 'SCREENED', 'COMPLETED', 'WITHDRAWN'].map(s => (
          <button key={s || 'all'} className={`filter-tab ${statusFilter === s ? 'active' : ''}`}
            onClick={() => setStatusFilter(s)} id={`filter-participant-${s || 'all'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Participant ID</th>
              <th>Study ID</th>
              <th>Site</th>
              <th>Screening Date</th>
              <th>Enrollment Date</th>
              <th>Status</th>
              <th>Arm</th>
              <th>Current Visit</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32 }}>
                <div className="spinner" style={{ margin: '0 auto' }} />
              </td></tr>
            ) : participants.map(p => (
              <tr key={p.id} id={`participant-row-${p.id}`}>
                <td style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--accent-cyan)' }}>
                  {p.participant_code}
                </td>
                <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>Study #{p.study_id}</td>
                <td style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Site #{p.site_id}</td>
                <td style={{ fontSize: 12 }}>
                  {p.screening_date ? new Date(p.screening_date).toLocaleDateString() : '—'}
                </td>
                <td style={{ fontSize: 12 }}>
                  {p.enrollment_date ? new Date(p.enrollment_date).toLocaleDateString() : '—'}
                </td>
                <td>
                  <span className={`badge ${STATUS_MAP[p.status] || 'badge-neutral'}`}>{p.status}</span>
                  {p.is_withdrawn && <span className="badge badge-danger" style={{ marginLeft: 4 }}>Withdrawn</span>}
                </td>
                <td style={{ fontSize: 12 }}>
                  {p.randomization_arm ? (
                    <span className="badge badge-purple">{p.randomization_arm}</span>
                  ) : '—'}
                </td>
                <td style={{ fontSize: 12 }}>{p.current_visit || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
