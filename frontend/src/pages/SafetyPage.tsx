import React, { useEffect, useState } from 'react';
import { safetyApi } from '../api';
import { ShieldAlert, AlertTriangle, Clock, CheckCircle2, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const SEV_COLORS: Record<string, string> = {
  MILD: '#10b981', MODERATE: '#f59e0b', SEVERE: '#f97316', LIFE_THREATENING: '#ef4444'
};
const STATUS_MAP: Record<string, { cls: string; label: string }> = {
  NEW: { cls: 'badge-info', label: 'New' },
  UNDER_REVIEW: { cls: 'badge-warning', label: 'Under Review' },
  CAUSALITY_ASSESSED: { cls: 'badge-purple', label: 'Assessed' },
  SUBMITTED: { cls: 'badge-success', label: 'Submitted' },
  CLOSED: { cls: 'badge-neutral', label: 'Closed' },
};

const CUSTOM_TOOLTIP = { background: '#0f1f36', border: '1px solid rgba(99,179,237,0.2)', borderRadius: 8, fontSize: 12, color: '#f0f6ff' };

export default function SafetyPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{ is_sae?: boolean; status?: string }>({});
  const [updating, setUpdating] = useState<number | null>(null);

  async function fetchAll() {
    setLoading(true);
    try {
      const [evR, smR] = await Promise.all([
        safetyApi.listAE({ ...filter, limit: 50 }),
        safetyApi.summary(),
      ]);
      setEvents(evR.data.events);
      setTotal(evR.data.total);
      setSummary(smR.data);
    } catch (e) { }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchAll(); }, [filter]);

  async function handleStatusUpdate(id: number, newStatus: string) {
    setUpdating(id);
    try {
      await safetyApi.updateAEStatus(id, { status: newStatus });
      await fetchAll();
    } catch (e) { }
    finally { setUpdating(null); }
  }

  const sevChartData = summary ? Object.entries(summary.severity_breakdown).map(([k, v]) => ({
    name: k, value: v as number, color: SEV_COLORS[k] || '#94a3b8'
  })) : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Pharmacovigilance</h1>
          <p className="page-description">Adverse event tracking, SAE management, and safety reporting</p>
        </div>
      </div>

      {/* Summary KPIs */}
      {summary && (
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
          <div className="kpi-card" style={{ '--accent-color': '#94a3b8' } as any}>
            <div className="kpi-icon" style={{ background: 'rgba(148,163,184,0.12)', color: '#94a3b8' }}>
              <ShieldAlert size={20} />
            </div>
            <div className="kpi-value">{summary.total_ae}</div>
            <div className="kpi-label">Total AEs</div>
          </div>
          <div className="kpi-card" style={{ '--accent-color': '#ef4444' } as any}>
            <div className="kpi-icon" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
              <AlertTriangle size={20} />
            </div>
            <div className="kpi-value">{summary.total_sae}</div>
            <div className="kpi-label">Serious AEs (SAE)</div>
          </div>
          <div className="kpi-card" style={{ '--accent-color': '#f59e0b' } as any}>
            <div className="kpi-icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
              <Clock size={20} />
            </div>
            <div className="kpi-value">{summary.open_events}</div>
            <div className="kpi-label">Open / Pending</div>
          </div>
          <div className="kpi-card" style={{ '--accent-color': '#f43f5e' } as any}>
            <div className="kpi-icon" style={{ background: 'rgba(244,63,94,0.12)', color: '#f43f5e' }}>
              <AlertTriangle size={20} />
            </div>
            <div className="kpi-value">{summary.overdue}</div>
            <div className="kpi-label">Overdue Reports</div>
          </div>
        </div>
      )}

      <div className="grid-2" style={{ gap: 16, marginBottom: 20 }}>
        {/* Severity chart */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>AE by Severity</div>
          <div style={{ height: 180 }}>
            <ResponsiveContainer>
              <BarChart data={sevChartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fill: '#4a5568', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#4a5568', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={CUSTOM_TOOLTIP} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {sevChartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SAE Workflow explanation */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>SAE Workflow</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['AE Recorded', 'Severity Assessment', 'SAE Determination', 'Medical Review', 'Causality Assessment', 'Regulatory Submission', 'Closed'].map((step, i) => (
              <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                  background: i < 4 ? 'linear-gradient(135deg,#3b82f6,#06b6d4)' : 'rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, color: i < 4 ? 'white' : 'var(--text-muted)'
                }}>{i + 1}</div>
                <span style={{ fontSize: 13, color: i < 4 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3" style={{ marginBottom: 12 }}>
        <div className="filter-tabs">
          {[
            { label: 'All Events', key: {} },
            { label: 'SAEs Only', key: { is_sae: true } },
            { label: 'Open', key: { status: 'NEW' } },
            { label: 'Overdue', key: { status: 'UNDER_REVIEW' } },
          ].map(f => (
            <button key={f.label}
              className={`filter-tab ${JSON.stringify(filter) === JSON.stringify(f.key) ? 'active' : ''}`}
              onClick={() => setFilter(f.key)}
              id={`filter-ae-${f.label.toLowerCase().replace(' ', '-')}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{total} events</span>
      </div>

      {/* Events Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>AE Code</th>
              <th>Study</th>
              <th>Participant</th>
              <th>Description</th>
              <th>Severity</th>
              <th>SAE</th>
              <th>Status</th>
              <th>Deadline</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: 32 }}>
                <div className="spinner" style={{ margin: '0 auto' }} />
              </td></tr>
            ) : events.map(ae => {
              const sInfo = STATUS_MAP[ae.status] || { cls: 'badge-neutral', label: ae.status };
              const isOverdue = ae.is_overdue;
              const daysLeft = ae.days_to_deadline;
              return (
                <tr key={ae.id} id={`ae-row-${ae.id}`} style={{ background: isOverdue ? 'rgba(239,68,68,0.03)' : undefined }}>
                  <td>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: ae.is_sae ? '#f43f5e' : 'var(--accent-cyan)' }}>
                      {ae.ae_code}
                    </span>
                  </td>
                  <td style={{ fontSize: 11, color: 'var(--accent-cyan)' }}>{ae.study_code}</td>
                  <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ae.participant_code || '—'}</td>
                  <td style={{ fontSize: 12, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ae.event_description}
                  </td>
                  <td>
                    <span className="badge" style={{
                      background: `${SEV_COLORS[ae.severity] || '#94a3b8'}18`,
                      color: SEV_COLORS[ae.severity] || '#94a3b8',
                      border: `1px solid ${SEV_COLORS[ae.severity] || '#94a3b8'}30`
                    }}>
                      {ae.severity}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {ae.is_sae ? <span style={{ color: '#f43f5e', fontSize: 16 }}>⚠</span> : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                  <td><span className={`badge ${sInfo.cls}`}>{sInfo.label}</span></td>
                  <td>
                    {ae.reporting_deadline ? (
                      <span style={{ fontSize: 11, color: isOverdue ? '#ef4444' : daysLeft <= 3 ? '#f59e0b' : 'var(--text-secondary)', fontWeight: isOverdue ? 700 : 400 }}>
                        {isOverdue ? `⚠ ${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? '🔴 Today' : `${daysLeft}d left`}
                      </span>
                    ) : '—'}
                  </td>
                  <td>
                    {ae.status !== 'CLOSED' && ae.status !== 'SUBMITTED' && (
                      <select
                        className="form-select"
                        style={{ padding: '4px 8px', fontSize: 11, width: 130 }}
                        defaultValue=""
                        disabled={updating === ae.id}
                        onChange={e => { if (e.target.value) handleStatusUpdate(ae.id, e.target.value); }}
                        id={`ae-action-${ae.id}`}
                      >
                        <option value="">Change status...</option>
                        <option value="UNDER_REVIEW">Under Review</option>
                        <option value="CAUSALITY_ASSESSED">Assessed</option>
                        <option value="SUBMITTED">Submit</option>
                        <option value="CLOSED">Close</option>
                      </select>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
