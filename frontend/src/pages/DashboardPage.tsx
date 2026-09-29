import React, { useEffect, useState } from 'react';
import { dashboardApi } from '../api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend
} from 'recharts';
import {
  FlaskConical, Users, ShieldAlert, Bell, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle2, Clock, Activity, RefreshCw
} from 'lucide-react';

const RISK_COLORS = { LOW: '#10b981', MEDIUM: '#f59e0b', HIGH: '#f97316', CRITICAL: '#ef4444' };
const STATUS_LIFECYCLE = [
  'PROTOCOL_CREATED', 'IEC_SUBMISSION', 'IEC_APPROVED', 'CTRI_REGISTERED',
  'SITE_ACTIVATED', 'RECRUITMENT_STARTED', 'ENROLLMENT', 'FOLLOW_UP',
  'DATA_CLEANING', 'DATABASE_LOCK', 'STUDY_CLOSEOUT'
];

function getStatusLabel(s: string) {
  const m: Record<string, string> = {
    PROTOCOL_CREATED: 'Protocol', IEC_SUBMISSION: 'IEC Sub', IEC_APPROVED: 'IEC App',
    CTRI_REGISTERED: 'CTRI', SITE_ACTIVATED: 'Sites', RECRUITMENT_STARTED: 'Recruit',
    ENROLLMENT: 'Enroll', FOLLOW_UP: 'Follow-up', DATA_CLEANING: 'DQ',
    DATABASE_LOCK: 'DB Lock', STUDY_CLOSEOUT: 'Closed'
  };
  return m[s] || s;
}

function RiskRing({ score, level }: { score: number; level: string }) {
  const color = RISK_COLORS[level as keyof typeof RISK_COLORS] || '#3b82f6';
  const pct = Math.min(score, 100);
  const r = 34; const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <div className="risk-score-ring" style={{ width: 88, height: 88 }}>
      <svg width="88" height="88" viewBox="0 0 88 88" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="44" cy="44" r={r} stroke="rgba(255,255,255,0.06)" strokeWidth="8" fill="none" />
        <circle cx="44" cy="44" r={r} stroke={color} strokeWidth="8" fill="none"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
        />
      </svg>
      <div className="risk-score-text">
        <span className="risk-score-num" style={{ color, fontSize: 17 }}>{Math.round(score)}%</span>
        <span className="risk-score-label">{level}</span>
      </div>
    </div>
  );
}

function KPICard({ icon, value, label, color, bgColor, trend }: any) {
  return (
    <div className="kpi-card" style={{ '--accent-color': color, '--icon-color': color, '--icon-bg': bgColor } as any}>
      <div className="kpi-icon">{icon}</div>
      <div className="kpi-value">{typeof value === 'number' ? value.toLocaleString() : value}</div>
      <div className="kpi-label">{label}</div>
      {trend && (
        <div className={`kpi-trend ${trend.dir}`}>
          {trend.dir === 'up' ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {trend.text}
        </div>
      )}
    </div>
  );
}

const CUSTOM_TOOLTIP_STYLE = {
  background: '#0f1f36',
  border: '1px solid rgba(99,179,237,0.2)',
  borderRadius: 8,
  fontSize: 12,
  color: '#f0f6ff',
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [trend, setTrend] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  async function fetchAll() {
    setLoading(true);
    try {
      const [s, t, a] = await Promise.all([
        dashboardApi.summary(),
        dashboardApi.enrollmentTrend(),
        dashboardApi.recentAlerts(),
      ]);
      setSummary(s.data);
      setTrend(t.data);
      setAlerts(a.data);
      setLastRefresh(new Date());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchAll(); }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" style={{ width: 32, height: 32 }} /><span>Loading dashboard data...</span></div>;
  if (!summary) return null;

  const { kpis, risk_distribution, safety, compliance, alerts_breakdown } = summary;

  const riskPieData = Object.entries(risk_distribution).map(([k, v]) => ({ name: k, value: v as number, color: RISK_COLORS[k as keyof typeof RISK_COLORS] }));

  const alertsBarData = Object.entries(alerts_breakdown).map(([k, v]) => ({
    name: k.replace('_', ' '),
    value: v as number,
    fill: k === 'SAFETY' ? '#ef4444' : k === 'COMPLIANCE' ? '#f59e0b' : k === 'RECRUITMENT' ? '#f97316' : '#6366f1',
  }));

  const complianceItems = [
    { label: 'IEC Approvals Expiring', value: compliance.iec_due, icon: '📋', color: '#f59e0b' },
    { label: 'CTRI Updates Due', value: compliance.ctri_due, icon: '🗂', color: '#f97316' },
    { label: 'Monitoring Overdue', value: compliance.monitoring_due, icon: '🔍', color: '#ef4444' },
  ];

  function getAlertIcon(type: string) {
    if (type === 'SAFETY') return '🛡';
    if (type === 'RECRUITMENT') return '📊';
    if (type === 'COMPLIANCE') return '⚖';
    if (type === 'MONITORING') return '🔍';
    return '⚠';
  }

  function getAlertClass(severity: string) {
    if (severity === 'CRITICAL') return 'critical';
    if (severity === 'WARNING') return 'warning';
    return 'info';
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Executive Dashboard</h1>
          <p className="page-description">Real-time overview of all AIIA clinical trial operations</p>
        </div>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
          <button className="btn btn-secondary btn-sm" onClick={fetchAll} id="btn-refresh-dashboard">
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: 24 }}>
        <KPICard icon={<FlaskConical size={20} />} value={kpis.total_studies} label="Total Studies"
          color="#3b82f6" bgColor="rgba(59,130,246,0.12)" trend={{ dir: 'up', text: `${kpis.active_studies} active` }} />
        <KPICard icon={<Activity size={20} />} value={kpis.active_studies} label="Active Studies"
          color="#06b6d4" bgColor="rgba(6,182,212,0.12)" />
        <KPICard icon={<Users size={20} />} value={kpis.total_participants.toLocaleString()} label="Participants"
          color="#10b981" bgColor="rgba(16,185,129,0.12)" trend={{ dir: 'up', text: `${kpis.enrollment_pct}% enrolled` }} />
        <KPICard icon={<ShieldAlert size={20} />} value={kpis.total_sae} label="Serious AEs"
          color="#ef4444" bgColor="rgba(239,68,68,0.12)" trend={{ dir: kpis.overdue_sae > 0 ? 'down' : 'up', text: `${kpis.overdue_sae} overdue` }} />
        <KPICard icon={<Bell size={20} />} value={kpis.total_alerts} label="Open Alerts"
          color="#f59e0b" bgColor="rgba(245,158,11,0.12)" trend={{ dir: 'down', text: 'Requires attention' }} />
      </div>

      {/* Row 2: Enrollment + Risk Distribution */}
      <div className="grid-2" style={{ gap: 16, marginBottom: 16 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title"><TrendingUp size={15} /> Enrollment Performance</div>
              <div className="card-subtitle">{kpis.total_enrolled.toLocaleString()} / {kpis.total_target.toLocaleString()} target ({kpis.enrollment_pct}%)</div>
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <div className="progress-bar">
              <div className="progress-fill" style={{
                width: `${kpis.enrollment_pct}%`,
                background: kpis.enrollment_pct >= 80 ? 'linear-gradient(90deg,#10b981,#34d399)' :
                  kpis.enrollment_pct >= 50 ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' :
                    'linear-gradient(90deg,#ef4444,#f97316)'
              }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
              Overall enrollment across all {kpis.total_studies} studies
            </div>
          </div>
          <div className="chart-container" style={{ height: 200 }}>
            <ResponsiveContainer>
              <BarChart data={trend.slice(0, 8)} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="study_code" tick={{ fill: '#4a5568', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#4a5568', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
                <Bar dataKey="target" fill="rgba(59,130,246,0.15)" radius={[4, 4, 0, 0]} name="Target" />
                <Bar dataKey="enrolled" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Enrolled" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Study Risk Distribution</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 160, height: 160 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={riskPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                    {riskPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {riskPieData.map(item => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="status-dot" style={{ background: item.color, boxShadow: `0 0 6px ${item.color}` }} />
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--text-secondary)' }}>{item.name}</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Safety + Compliance + Alerts */}
      <div className="grid-3" style={{ gap: 16, marginBottom: 16 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title"><ShieldAlert size={15} /> Safety Summary</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Total AEs', value: safety.total_ae, color: '#94a3b8' },
              { label: 'SAEs', value: safety.total_sae, color: '#ef4444' },
              { label: 'Open / Under Review', value: safety.open_sae, color: '#f59e0b' },
              { label: 'Overdue Reports', value: safety.overdue_sae, color: '#f43f5e' },
            ].map(item => (
              <div key={item.label} style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: '14px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: item.color }}>{item.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">⚖ Compliance Status</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {complianceItems.map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ flex: 1, fontSize: 13, color: 'var(--text-secondary)' }}>{item.label}</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title"><Bell size={15} /> Alerts by Category</div>
          </div>
          <div className="chart-container" style={{ height: 160 }}>
            <ResponsiveContainer>
              <BarChart data={alertsBarData} layout="vertical" margin={{ left: 0, right: 10 }}>
                <XAxis type="number" tick={{ fill: '#4a5568', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} width={80} />
                <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {alertsBarData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="card">
        <div className="card-header">
          <div className="card-title"><Bell size={15} /> Recent Open Alerts</div>
          <button className="btn btn-secondary btn-sm" onClick={() => window.location.href = '/alerts'} id="btn-view-all-alerts">
            View All →
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {alerts.slice(0, 6).map((alert: any) => (
            <div key={alert.id} className={`alert-item ${getAlertClass(alert.severity)}`}>
              <div className="alert-icon" style={{
                background: alert.severity === 'CRITICAL' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                color: alert.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b',
                fontSize: 16
              }}>
                {getAlertIcon(alert.type)}
              </div>
              <div className="alert-content">
                <div className="alert-title">{alert.title}</div>
                <div className="alert-msg">{alert.message}</div>
              </div>
              <span className={`badge ${alert.severity === 'CRITICAL' ? 'badge-danger' : 'badge-warning'}`}>
                {alert.severity}
              </span>
            </div>
          ))}
          {alerts.length === 0 && <div className="empty-state"><div className="empty-state-icon">✓</div><div>No open alerts</div></div>}
        </div>
      </div>
    </div>
  );
}
