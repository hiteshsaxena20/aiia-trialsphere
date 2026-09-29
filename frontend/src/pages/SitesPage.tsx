import React, { useEffect, useState } from 'react';
import { studiesApi } from '../api';
import { MapPin, Users, TrendingUp, AlertTriangle } from 'lucide-react';

export default function SitesPage() {
  const [studies, setStudies] = useState<any[]>([]);
  const [siteDetails, setSiteDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studiesApi.list({ limit: 20 }).then(async r => {
      setStudies(r.data.studies);
      // Fetch first few studies' site data
      const details: any[] = [];
      for (const study of r.data.studies.slice(0, 8)) {
        try {
          const dr = await studiesApi.get(study.id);
          if (dr.data.sites) {
            dr.data.sites.forEach((site: any) => details.push({
              ...site,
              study_code: dr.data.study_code,
              study_title: dr.data.title.slice(0, 40) + (dr.data.title.length > 40 ? '...' : ''),
            }));
          }
        } catch (e) {}
      }
      setSiteDetails(details);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" style={{ width: 32, height: 32 }} /></div>;

  // Aggregate by site name
  const siteMap: Record<string, any> = {};
  siteDetails.forEach(sd => {
    if (!siteMap[sd.site_name]) {
      siteMap[sd.site_name] = {
        site_name: sd.site_name,
        location: sd.location,
        studies: 0,
        total_target: 0,
        total_enrolled: 0,
        total_deviations: 0,
        total_queries: 0,
        screen_failures: 0,
        issues: [],
      };
    }
    const agg = siteMap[sd.site_name];
    agg.studies++;
    agg.total_target += sd.target_patients;
    agg.total_enrolled += sd.enrolled_patients;
    agg.total_deviations += sd.protocol_deviations;
    agg.total_queries += sd.open_queries;
    agg.screen_failures += sd.screen_failures;
    const pct = sd.enrollment_pct;
    if (pct < 50) agg.issues.push(`⚠ Recruitment lag (${pct}%)`);
    if (sd.protocol_deviations > 3) agg.issues.push(`⚠ ${sd.protocol_deviations} deviations`);
    if (sd.open_queries > 10) agg.issues.push(`⚠ ${sd.open_queries} queries`);
  });

  const sites = Object.values(siteMap);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 className="page-title">Site Management</h1>
        <p className="page-description">{sites.length} sites aggregated across active studies</p>
      </div>

      {/* KPIs */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
        {[
          { label: 'Active Sites', value: sites.length, color: '#06b6d4', icon: '🗺' },
          { label: 'Total Enrolled', value: sites.reduce((a,s) => a + s.total_enrolled, 0), color: '#10b981', icon: '👥' },
          { label: 'Protocol Deviations', value: sites.reduce((a,s) => a + s.total_deviations, 0), color: '#f97316', icon: '⚠' },
          { label: 'Open Queries', value: sites.reduce((a,s) => a + s.total_queries, 0), color: '#f59e0b', icon: '❓' },
        ].map(item => (
          <div key={item.label} className="kpi-card" style={{ '--accent-color': item.color } as any}>
            <div style={{ fontSize: 24 }}>{item.icon}</div>
            <div className="kpi-value" style={{ color: item.color }}>{item.value}</div>
            <div className="kpi-label">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Site Cards Grid */}
      <div className="grid-3" style={{ gap: 16 }}>
        {sites.map((site, i) => {
          const pct = site.total_target ? Math.round(site.total_enrolled / site.total_target * 100) : 0;
          const barColor = pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
          return (
            <div key={i} className="card" id={`site-card-${i}`} style={{
              borderColor: site.issues.length > 0 ? 'rgba(245,158,11,0.3)' : undefined
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: 'linear-gradient(135deg,rgba(59,130,246,0.2),rgba(6,182,212,0.15))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0
                }}>🏥</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 2 }}>
                    {site.site_name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={10} /> {site.location} · {site.studies} studies
                  </div>
                </div>
                {site.issues.length > 0 && (
                  <span style={{ color: '#f59e0b', fontSize: 18 }}>⚠</span>
                )}
              </div>

              {/* Enrollment */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Enrollment</span>
                  <span style={{ fontWeight: 700, color: barColor }}>{pct}%</span>
                </div>
                <div className="progress-bar" style={{ height: 6 }}>
                  <div className="progress-fill" style={{ width: `${pct}%`, background: barColor }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  {site.total_enrolled} / {site.total_target} patients
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 10 }}>
                {[
                  { label: 'Screen Fails', value: site.screen_failures },
                  { label: 'Deviations', value: site.total_deviations, warn: site.total_deviations > 3 },
                  { label: 'Queries', value: site.total_queries, warn: site.total_queries > 10 },
                ].map(stat => (
                  <div key={stat.label} style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '8px', textAlign: 'center', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: stat.warn ? '#f59e0b' : 'var(--text-primary)' }}>
                      {stat.value}{stat.warn && ' ⚠'}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Issues */}
              {site.issues.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {site.issues.slice(0, 2).map((issue: string, j: number) => (
                    <div key={j} style={{ fontSize: 11, color: '#f59e0b', background: 'rgba(245,158,11,0.08)', borderRadius: 6, padding: '4px 8px' }}>
                      {issue}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
