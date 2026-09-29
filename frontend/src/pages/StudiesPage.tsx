import React, { useEffect, useState } from 'react';
import { studiesApi } from '../api';
import { Search, Plus, FlaskConical, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RISK_COLORS: Record<string, string> = {
  LOW: 'badge-success', MEDIUM: 'badge-warning', HIGH: 'badge-danger', CRITICAL: 'badge-danger'
};

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  PROTOCOL_CREATED: { label: 'Protocol Created', cls: 'badge-neutral' },
  IEC_SUBMISSION: { label: 'IEC Submission', cls: 'badge-info' },
  IEC_APPROVED: { label: 'IEC Approved', cls: 'badge-info' },
  CTRI_REGISTERED: { label: 'CTRI Registered', cls: 'badge-cyan' },
  SITE_ACTIVATED: { label: 'Site Activated', cls: 'badge-purple' },
  RECRUITMENT_STARTED: { label: 'Recruiting', cls: 'badge-warning' },
  ENROLLMENT: { label: 'Enrolling', cls: 'badge-success' },
  RANDOMIZATION: { label: 'Randomizing', cls: 'badge-success' },
  FOLLOW_UP: { label: 'Follow-up', cls: 'badge-info' },
  DATA_CLEANING: { label: 'Data Cleaning', cls: 'badge-warning' },
  DATABASE_LOCK: { label: 'DB Locked', cls: 'badge-success' },
  STUDY_CLOSEOUT: { label: 'Closed', cls: 'badge-neutral' },
};

export default function StudiesPage() {
  const [studies, setStudies] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  async function fetchStudies() {
    setLoading(true);
    try {
      const res = await studiesApi.list({ search, risk: riskFilter || undefined, limit: 50 });
      setStudies(res.data.studies);
      setTotal(res.data.total);
    } catch (e) { }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchStudies(); }, [search, riskFilter]);

  function getProgressColor(pct: number) {
    if (pct >= 80) return 'var(--success)';
    if (pct >= 50) return 'var(--warning)';
    return 'var(--danger)';
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Study Portfolio</h1>
          <p className="page-description">{total} studies across all phases and sites</p>
        </div>
        <button className="btn btn-primary" id="btn-create-study" onClick={() => setShowModal(true)}>
          <Plus size={15} /> New Study
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
        <div className="search-bar">
          <Search size={14} className="search-bar-icon" />
          <input
            id="search-studies"
            type="text"
            className="form-input"
            placeholder="Search studies..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 32, width: 240 }}
          />
        </div>
        <div className="filter-tabs">
          {['', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(r => (
            <button
              key={r}
              id={`filter-risk-${r || 'all'}`}
              className={`filter-tab ${riskFilter === r ? 'active' : ''}`}
              onClick={() => setRiskFilter(r)}
            >
              {r || 'All Risk'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Study Code</th>
              <th>Title</th>
              <th>Phase</th>
              <th>Sites</th>
              <th>Enrollment</th>
              <th>Status</th>
              <th>Risk</th>
              <th>PI</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                <div className="spinner" style={{ margin: '0 auto' }} />
              </td></tr>
            ) : studies.map(s => {
              const statusInfo = STATUS_MAP[s.status] || { label: s.status, cls: 'badge-neutral' };
              return (
                <tr key={s.id} onClick={() => navigate(`/studies/${s.id}`)}
                  style={{ cursor: 'pointer' }} id={`study-row-${s.id}`}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FlaskConical size={14} style={{ color: 'var(--primary)' }} />
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--accent-cyan)' }}>
                        {s.study_code}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: 13, fontWeight: 500, maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.therapeutic_area}</div>
                  </td>
                  <td><span className="badge badge-info">{s.phase}</span></td>
                  <td style={{ textAlign: 'center' }}>{s.site_count}</td>
                  <td style={{ minWidth: 140 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>
                      {s.current_enrollment} / {s.target_enrollment}
                    </div>
                    <div className="progress-bar" style={{ height: 4 }}>
                      <div className="progress-fill" style={{
                        width: `${s.enrollment_pct}%`,
                        background: `linear-gradient(90deg, ${getProgressColor(s.enrollment_pct)}, ${getProgressColor(s.enrollment_pct)}88)`
                      }} />
                    </div>
                    <div style={{ fontSize: 10, color: getProgressColor(s.enrollment_pct), marginTop: 2, fontWeight: 700 }}>
                      {s.enrollment_pct}%
                    </div>
                  </td>
                  <td><span className={`badge ${statusInfo.cls}`}>{statusInfo.label}</span></td>
                  <td>
                    <span className={`badge ${RISK_COLORS[s.risk_level] || 'badge-neutral'}`}>
                      {s.risk_level}
                    </span>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                      Score: {s.risk_score?.toFixed(0) ?? '—'}
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.pi_name || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
