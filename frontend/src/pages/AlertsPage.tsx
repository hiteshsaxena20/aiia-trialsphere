import React, { useEffect, useState } from 'react';
import { alertsApi } from '../api';
import { Bell, CheckCircle2, AlertTriangle, Info, Filter } from 'lucide-react';

const TYPE_ICONS: Record<string, string> = {
  RECRUITMENT: '📊', SAFETY: '🛡', COMPLIANCE: '⚖', DATA_QUALITY: '📁', MONITORING: '🔍'
};

const SEV_CLASS: Record<string, string> = { CRITICAL: 'critical', WARNING: 'warning', INFO: 'info' };

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [resolving, setResolving] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  async function fetchAlerts() {
    setLoading(true);
    try {
      const res = await alertsApi.list({ limit: 100, alert_type: typeFilter || undefined });
      setAlerts(res.data.alerts);
      setTotal(res.data.total);
    } catch (e) { }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchAlerts(); }, [typeFilter]);

  async function handleResolve(id: number) {
    setResolving(id);
    try {
      await alertsApi.resolve(id);
      setToast('Alert resolved successfully');
      setTimeout(() => setToast(null), 2000);
      await fetchAlerts();
    } catch (e) { }
    finally { setResolving(null); }
  }

  const types = ['', 'RECRUITMENT', 'SAFETY', 'COMPLIANCE', 'DATA_QUALITY', 'MONITORING'];

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Alert Center</h1>
          <p className="page-description">{total} open alerts requiring attention</p>
        </div>
      </div>

      {/* Filter */}
      <div className="filter-tabs" style={{ marginBottom: 16, width: 'fit-content' }}>
        {types.map(t => (
          <button key={t || 'all'}
            className={`filter-tab ${typeFilter === t ? 'active' : ''}`}
            onClick={() => setTypeFilter(t)}
            id={`alert-filter-${t || 'all'}`}
          >
            {t ? `${TYPE_ICONS[t]} ${t.replace('_', ' ')}` : 'All Alerts'}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading ? (
          <div className="loading-screen"><div className="spinner" style={{ width: 28, height: 28 }} /></div>
        ) : alerts.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 48 }}>✓</div>
            <div className="empty-state-text">No open alerts</div>
          </div>
        ) : alerts.map(alert => (
          <div key={alert.id} className={`alert-item ${SEV_CLASS[alert.severity] || 'info'}`} id={`alert-${alert.id}`}>
            <div className="alert-icon" style={{
              background: alert.severity === 'CRITICAL' ? 'rgba(239,68,68,0.15)' : alert.severity === 'WARNING' ? 'rgba(245,158,11,0.15)' : 'rgba(59,130,246,0.15)',
              color: alert.severity === 'CRITICAL' ? '#ef4444' : alert.severity === 'WARNING' ? '#f59e0b' : '#3b82f6',
              fontSize: 18,
            }}>
              {TYPE_ICONS[alert.alert_type] || '⚠'}
            </div>
            <div className="alert-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <span className="alert-title">{alert.title}</span>
                <span className={`badge ${alert.severity === 'CRITICAL' ? 'badge-danger' : alert.severity === 'WARNING' ? 'badge-warning' : 'badge-info'}`}>
                  {alert.severity}
                </span>
                <span className="badge badge-neutral">{alert.alert_type.replace('_', ' ')}</span>
              </div>
              <div className="alert-msg">{alert.message}</div>
              <div className="alert-meta">
                {alert.created_at && `Triggered ${new Date(alert.created_at).toLocaleString()}`}
              </div>
            </div>
            <button
              className="btn btn-success btn-sm"
              onClick={() => handleResolve(alert.id)}
              disabled={resolving === alert.id}
              id={`btn-resolve-${alert.id}`}
            >
              {resolving === alert.id ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <><CheckCircle2 size={13} /> Resolve</>}
            </button>
          </div>
        ))}
      </div>

      {toast && <div className="toast toast-success"><CheckCircle2 size={16} /> {toast}</div>}
    </div>
  );
}
