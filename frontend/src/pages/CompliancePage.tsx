import React, { useEffect, useState } from 'react';
import { complianceApi } from '../api';
import { FileCheck, Calendar, Clock, AlertTriangle } from 'lucide-react';

function UrgencyBadge({ urgency }: { urgency: string }) {
  const map: Record<string, string> = {
    OK: 'badge-success', ATTENTION: 'badge-info', WARNING: 'badge-warning',
    CRITICAL: 'badge-danger', EXPIRED: 'badge-danger', OVERDUE: 'badge-danger'
  };
  return <span className={`badge ${map[urgency] || 'badge-neutral'}`}>{urgency}</span>;
}

function ComplianceSection({ title, icon, items, columns, emptyMsg }: any) {
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="card-header">
        <div className="card-title">{icon} {title}</div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{items?.length || 0} records</span>
      </div>
      <div className="table-container">
        <table>
          <thead><tr>{columns.map((c: string) => <th key={c}>{c}</th>)}</tr></thead>
          <tbody>
            {items?.length === 0 && (
              <tr><td colSpan={columns.length} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>{emptyMsg}</td></tr>
            )}
            {items?.map((item: any, i: number) => (
              <tr key={i} id={`compliance-row-${i}`}>{item}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function CompliancePage() {
  const [iec, setIec] = useState<any[]>([]);
  const [ctri, setCtri] = useState<any[]>([]);
  const [monitoring, setMonitoring] = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('IEC');

  useEffect(() => {
    Promise.all([
      complianceApi.iecApprovals(),
      complianceApi.ctriRecords(),
      complianceApi.monitoringVisits(),
      complianceApi.dashboard(),
    ]).then(([i, c, m, d]) => {
      setIec(i.data.approvals);
      setCtri(c.data.records);
      setMonitoring(m.data.visits);
      setDashboard(d.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" style={{ width: 32, height: 32 }} /></div>;

  const iecRows = iec.map(a => <>
    <td style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--accent-cyan)' }}>{a.study_code}</td>
    <td style={{ fontSize: 12, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.study_title}</td>
    <td style={{ fontSize: 12 }}>{a.approval_number}</td>
    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{a.committee_name}</td>
    <td style={{ fontSize: 12 }}>{a.approval_date ? new Date(a.approval_date).toLocaleDateString() : '—'}</td>
    <td style={{ fontSize: 12 }}>{a.expiry_date ? new Date(a.expiry_date).toLocaleDateString() : '—'}</td>
    <td><UrgencyBadge urgency={a.urgency} /></td>
    <td style={{ fontSize: 12, color: a.days_to_expiry < 30 ? 'var(--danger)' : 'var(--text-secondary)' }}>
      {a.days_to_expiry != null ? (a.days_to_expiry < 0 ? `Expired ${Math.abs(a.days_to_expiry)}d ago` : `${a.days_to_expiry}d`) : '—'}
    </td>
  </>);

  const ctriRows = ctri.map(r => <>
    <td style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--accent-cyan)' }}>{r.study_code}</td>
    <td style={{ fontFamily: 'JetBrains Mono', fontSize: 11 }}>{r.registration_number}</td>
    <td style={{ fontSize: 12 }}>{r.registration_date ? new Date(r.registration_date).toLocaleDateString() : '—'}</td>
    <td style={{ fontSize: 12 }}>{r.next_update_due ? new Date(r.next_update_due).toLocaleDateString() : '—'}</td>
    <td style={{ fontSize: 12, color: r.days_to_update < 7 ? 'var(--danger)' : r.days_to_update < 30 ? 'var(--warning)' : 'var(--text-secondary)' }}>
      {r.days_to_update != null ? (r.days_to_update < 0 ? `⚠ Overdue ${Math.abs(r.days_to_update)}d` : `${r.days_to_update}d`) : '—'}
    </td>
    <td><UrgencyBadge urgency={r.urgency} /></td>
  </>);

  const monRows = monitoring.map(v => <>
    <td style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--accent-cyan)' }}>{v.study_code}</td>
    <td style={{ fontSize: 12 }}>{v.site_name}</td>
    <td><span className="badge badge-info">{v.visit_type}</span></td>
    <td style={{ fontSize: 12 }}>{v.planned_date ? new Date(v.planned_date).toLocaleDateString() : '—'}</td>
    <td style={{ fontSize: 12 }}>{v.actual_date ? new Date(v.actual_date).toLocaleDateString() : '—'}</td>
    <td style={{ fontSize: 12 }}>{v.monitor_name || '—'}</td>
    <td>
      <span className={`badge ${v.status === 'COMPLETED' ? 'badge-success' : v.is_overdue ? 'badge-danger' : 'badge-warning'}`}>
        {v.is_overdue ? '⚠ Overdue' : v.status}
      </span>
    </td>
  </>);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 className="page-title">Compliance & Ethics</h1>
        <p className="page-description">IEC approvals, CTRI registrations, and monitoring visit management</p>
      </div>

      {/* Dashboard summary */}
      {dashboard && (
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
          {[
            { label: 'IEC Expiring (90d)', value: dashboard.iec_expiring_90d, color: '#f59e0b', icon: '📋' },
            { label: 'IEC Expired', value: dashboard.iec_expired, color: '#ef4444', icon: '⛔' },
            { label: 'CTRI Updates Overdue', value: dashboard.ctri_overdue, color: '#f97316', icon: '🗂' },
            { label: 'Monitoring Overdue', value: dashboard.monitoring_overdue, color: '#ef4444', icon: '🔍' },
          ].map(item => (
            <div key={item.label} className="kpi-card" style={{ '--accent-color': item.color } as any}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>{item.icon}</div>
              <div className="kpi-value" style={{ color: item.color }}>{item.value}</div>
              <div className="kpi-label">{item.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="filter-tabs" style={{ marginBottom: 16, width: 'fit-content' }}>
        {['IEC', 'CTRI', 'MONITORING'].map(tab => (
          <button
            key={tab}
            className={`filter-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
            id={`compliance-tab-${tab.toLowerCase()}`}
          >
            {tab === 'IEC' ? '📋 IEC Approvals' : tab === 'CTRI' ? '🗂 CTRI Records' : '🔍 Monitoring Visits'}
          </button>
        ))}
      </div>

      {activeTab === 'IEC' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">📋 IEC Approval Tracker</div>
          </div>
          <div className="table-container">
            <table>
              <thead><tr>
                <th>Study</th><th>Title</th><th>Approval No.</th><th>Committee</th>
                <th>Approved</th><th>Expires</th><th>Status</th><th>Days Left</th>
              </tr></thead>
              <tbody>{iecRows.map((row, i) => <tr key={i} id={`iec-row-${i}`}>{row}</tr>)}</tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'CTRI' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">🗂 CTRI Registry Tracker</div>
          </div>
          <div className="table-container">
            <table>
              <thead><tr>
                <th>Study</th><th>Reg. Number</th><th>Registered</th><th>Next Update</th><th>Days Left</th><th>Status</th>
              </tr></thead>
              <tbody>{ctriRows.map((row, i) => <tr key={i} id={`ctri-row-${i}`}>{row}</tr>)}</tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'MONITORING' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">🔍 Monitoring Visit Tracker</div>
          </div>
          <div className="table-container">
            <table>
              <thead><tr>
                <th>Study</th><th>Site</th><th>Type</th><th>Planned</th><th>Actual</th><th>Monitor</th><th>Status</th>
              </tr></thead>
              <tbody>{monRows.map((row, i) => <tr key={i} id={`monitor-row-${i}`}>{row}</tr>)}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
