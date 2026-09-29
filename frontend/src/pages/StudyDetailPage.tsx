import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studiesApi } from '../api';
import { ArrowLeft, MapPin, Users, AlertTriangle, FileCheck, Activity } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';

const LIFECYCLE = [
  'PROTOCOL_CREATED','IEC_SUBMISSION','IEC_APPROVED','CTRI_REGISTERED','SITE_ACTIVATED',
  'RECRUITMENT_STARTED','ENROLLMENT','RANDOMIZATION','FOLLOW_UP','DATA_CLEANING','DATABASE_LOCK','STUDY_CLOSEOUT'
];
const LIFECYCLE_LABELS: Record<string, string> = {
  PROTOCOL_CREATED:'Protocol', IEC_SUBMISSION:'IEC Sub', IEC_APPROVED:'IEC App',
  CTRI_REGISTERED:'CTRI', SITE_ACTIVATED:'Sites', RECRUITMENT_STARTED:'Recruit',
  ENROLLMENT:'Enroll', RANDOMIZATION:'Randomize', FOLLOW_UP:'Follow-up',
  DATA_CLEANING:'DQ', DATABASE_LOCK:'Lock', STUDY_CLOSEOUT:'Closed'
};

const RISK_COLORS: Record<string, string> = { LOW: '#10b981', MEDIUM: '#f59e0b', HIGH: '#f97316', CRITICAL: '#ef4444' };

export default function StudyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [study, setStudy] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studiesApi.get(Number(id)).then(r => { setStudy(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-screen"><div className="spinner" style={{ width: 32, height: 32 }} /><span>Loading study...</span></div>;
  if (!study) return <div className="empty-state">Study not found</div>;

  const currentStepIdx = LIFECYCLE.indexOf(study.status);
  const riskColor = RISK_COLORS[study.risk_level] || '#3b82f6';
  const riskScore = study.risk_details?.overall ?? study.risk_score ?? 0;

  const radarData = study.risk_details?.components ? Object.entries(study.risk_details.components).map(([k, v]) => ({
    subject: k.charAt(0).toUpperCase() + k.slice(1),
    value: v as number,
    fullMark: 100,
  })) : [];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3" style={{ marginBottom: 20 }}>
        <button className="btn btn-secondary btn-icon" onClick={() => navigate('/studies')} id="btn-back-studies">
          <ArrowLeft size={16} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 13, color: 'var(--accent-cyan)' }}>{study.study_code}</span>
            <span className="badge badge-info">{study.phase}</span>
            <span className="badge badge-cyan">{study.study_type}</span>
          </div>
          <h1 className="page-title" style={{ fontSize: 18, marginTop: 2 }}>{study.title}</h1>
        </div>
      </div>

      {/* Lifecycle Stepper */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title" style={{ marginBottom: 12 }}>Study Lifecycle</div>
        <div className="lifecycle-steps">
          {LIFECYCLE.map((step, i) => {
            const completed = i < currentStepIdx;
            const active = i === currentStepIdx;
            return (
              <div key={step} className="lifecycle-step">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div className={`step-bubble ${completed ? 'completed' : active ? 'active' : ''}`}>
                    {completed ? '✓' : i + 1}
                  </div>
                  <div className="step-label" style={{ color: active ? 'var(--primary-light)' : completed ? 'var(--success)' : undefined }}>
                    {LIFECYCLE_LABELS[step]}
                  </div>
                </div>
                {i < LIFECYCLE.length - 1 && (
                  <div className={`step-line ${completed ? 'completed' : ''}`} style={{ marginTop: -14 }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid-2" style={{ gap: 16, marginBottom: 16 }}>
        {/* Overview */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Study Overview</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Therapeutic Area', value: study.therapeutic_area },
              { label: 'PI', value: study.pi_name },
              { label: 'Start Date', value: study.start_date ? new Date(study.start_date).toLocaleDateString() : '—' },
              { label: 'Expected Completion', value: study.expected_completion ? new Date(study.expected_completion).toLocaleDateString() : '—' },
              { label: 'Target Enrollment', value: study.target_enrollment },
              { label: 'Enrolled', value: study.current_enrollment },
            ].map(item => (
              <div key={item.label} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* Enrollment bar */}
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Enrollment Progress</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{study.enrollment_pct}%</span>
            </div>
            <div className="progress-bar" style={{ height: 8 }}>
              <div className="progress-fill" style={{
                width: `${study.enrollment_pct}%`,
                background: study.enrollment_pct >= 80 ? 'linear-gradient(90deg,#10b981,#34d399)' : study.enrollment_pct >= 50 ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' : 'linear-gradient(90deg,#ef4444,#f97316)'
              }} />
            </div>
          </div>
        </div>

        {/* Risk Score */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Study Risk Score</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 52, fontWeight: 900, color: riskColor, lineHeight: 1 }}>{Math.round(riskScore)}%</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Overall Risk</div>
              <span className="badge" style={{
                marginTop: 8, background: `${riskColor}20`, color: riskColor,
                border: `1px solid ${riskColor}40`, fontSize: 13, fontWeight: 800
              }}>
                {study.risk_level}
              </span>
            </div>
            {radarData.length > 0 && (
              <div style={{ flex: 1, height: 160 }}>
                <ResponsiveContainer>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.08)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#4a5568', fontSize: 10 }} />
                    <Radar name="Risk" dataKey="value" stroke={riskColor} fill={riskColor} fillOpacity={0.15} />
                    <Tooltip contentStyle={{ background: '#0f1f36', border: '1px solid rgba(99,179,237,0.2)', borderRadius: 8, fontSize: 11 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Component bars */}
          {study.risk_details?.components && Object.entries(study.risk_details.components).map(([k, v]) => {
            const val = v as number;
            const barColor = val >= 60 ? '#ef4444' : val >= 30 ? '#f59e0b' : '#10b981';
            return (
              <div key={k} className="risk-bar-row">
                <span className="risk-bar-label">{k.charAt(0).toUpperCase() + k.slice(1)}</span>
                <div className="risk-bar-fill">
                  <div className="progress-bar" style={{ height: 5 }}>
                    <div className="progress-fill" style={{ width: `${val}%`, background: barColor }} />
                  </div>
                </div>
                <span className="risk-bar-value" style={{ color: barColor }}>{val}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sites Table */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 16 }}><MapPin size={15} /> Sites ({study.sites?.length})</div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Site</th>
                <th>Location</th>
                <th>Enrollment</th>
                <th>Screen Failures</th>
                <th>Protocol Dev.</th>
                <th>Open Queries</th>
                <th>Next Monitoring</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {study.sites?.map((site: any) => {
                const color = site.enrollment_pct >= 80 ? '#10b981' : site.enrollment_pct >= 50 ? '#f59e0b' : '#ef4444';
                return (
                  <tr key={site.id} id={`site-row-${site.id}`}>
                    <td style={{ fontWeight: 600 }}>{site.site_name}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{site.location}</td>
                    <td>
                      <div style={{ fontSize: 12 }}>{site.enrolled_patients}/{site.target_patients}</div>
                      <div className="progress-bar" style={{ height: 4, marginTop: 4 }}>
                        <div className="progress-fill" style={{ width: `${site.enrollment_pct}%`, background: color }} />
                      </div>
                      <div style={{ fontSize: 10, color, fontWeight: 700, marginTop: 2 }}>{site.enrollment_pct}%</div>
                    </td>
                    <td style={{ textAlign: 'center' }}>{site.screen_failures}</td>
                    <td style={{ textAlign: 'center', color: site.protocol_deviations > 3 ? 'var(--danger)' : undefined }}>
                      {site.protocol_deviations}
                      {site.protocol_deviations > 3 && ' ⚠'}
                    </td>
                    <td style={{ textAlign: 'center', color: site.open_queries > 10 ? 'var(--warning)' : undefined }}>
                      {site.open_queries}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {site.next_monitoring_date ? new Date(site.next_monitoring_date).toLocaleDateString() : '—'}
                    </td>
                    <td><span className={`badge ${site.enrollment_pct < 50 ? 'badge-danger' : site.enrollment_pct < 80 ? 'badge-warning' : 'badge-success'}`}>
                      {site.enrollment_pct < 50 ? '⚠ Lagging' : site.enrollment_pct < 80 ? 'At Risk' : 'On Track'}
                    </span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
