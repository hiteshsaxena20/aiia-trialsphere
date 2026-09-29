import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api';
import { useAuth } from '../AuthContext';
import { Mail, Activity, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

const ROLE_PROFILES: Record<string, { id: number; name: string; email: string; role: string; title: string }> = {
  'admin@aiia.gov.in': { id: 1, name: 'Dr. Rajesh Sharma', email: 'admin@aiia.gov.in', role: 'ADMIN', title: 'Director & CTMS Admin' },
  'pi1@aiia.gov.in': { id: 2, name: 'Dr. Ananya Mishra', email: 'pi1@aiia.gov.in', role: 'PI', title: 'Principal Investigator' },
  'coord1@aiia.gov.in': { id: 3, name: 'Pooja Verma', email: 'coord1@aiia.gov.in', role: 'STUDY_COORDINATOR', title: 'Lead Study Coordinator' },
  'pv@aiia.gov.in': { id: 4, name: 'Dr. Suresh Nair', email: 'pv@aiia.gov.in', role: 'PV_OFFICER', title: 'Pharmacovigilance Officer' },
  'mgmt@aiia.gov.in': { id: 5, name: 'Dr. Vikram Seth', email: 'mgmt@aiia.gov.in', role: 'MANAGEMENT', title: 'Institutional Dean & Oversight' },
};

export default function LoginPage() {
  const [email, setEmail] = useState('admin@aiia.gov.in');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleLogin(targetEmail?: string) {
    setLoading(true);
    const selectedEmail = targetEmail || email || 'admin@aiia.gov.in';

    try {
      // Attempt backend login if available, otherwise seamlessly log in directly
      const res = await authApi.login(selectedEmail, 'Admin@123');
      login(res.data.user, res.data.access_token);
    } catch {
      // Bypassed: instant frontend login without any password check
      const profile = ROLE_PROFILES[selectedEmail] || {
        id: Math.floor(Math.random() * 1000) + 10,
        name: selectedEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        email: selectedEmail,
        role: selectedEmail.includes('admin')
          ? 'ADMIN'
          : selectedEmail.includes('pi')
          ? 'PI'
          : selectedEmail.includes('pv')
          ? 'PV_OFFICER'
          : selectedEmail.includes('coord')
          ? 'STUDY_COORDINATOR'
          : 'ADMIN',
        title: 'TrialSphere Member',
      };
      login(
        { id: profile.id, name: profile.name, email: profile.email, role: profile.role },
        'demo_token_' + btoa(selectedEmail + '_' + Date.now())
      );
    } finally {
      setLoading(false);
      navigate('/');
    }
  }

  const quickRoles = [
    { label: 'Director / Admin', email: 'admin@aiia.gov.in', badge: 'Full Access', color: '#6366f1' },
    { label: 'Principal Investigator', email: 'pi1@aiia.gov.in', badge: 'Clinical & EDC', color: '#10b981' },
    { label: 'Study Coordinator', email: 'coord1@aiia.gov.in', badge: 'Site & Patients', color: '#38bdf8' },
    { label: 'PV / Safety Officer', email: 'pv@aiia.gov.in', badge: 'SAE & ICSR', color: '#f59e0b' },
    { label: 'Management / Dean', email: 'mgmt@aiia.gov.in', badge: 'Executive View', color: '#ec4899' },
  ];

  return (
    <div className="login-page">
      <div className="login-bg-effects">
        <div className="login-orb login-orb-1" />
        <div className="login-orb login-orb-2" />
        <div className="login-orb login-orb-3" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', position: 'relative', zIndex: 1, width: '100%', maxWidth: '460px', padding: '0 16px' }}>
        <div className="login-card" style={{ width: '100%' }}>
          <div className="login-logo">
            <div className="login-logo-icon">⚗</div>
            <div className="login-logo-text">
              <span className="login-title">AIIA TrialSphere</span>
              <span className="login-subtitle">Integrated CTMS Platform</span>
            </div>
          </div>

          <h2 className="login-heading">Instant Access</h2>
          <p className="login-desc">Select any role or enter your email to enter the platform immediately.</p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Email / Identifier</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="input-email"
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: 36 }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email or name"
                />
              </div>
            </div>

            <button
              id="btn-login"
              type="submit"
              className="btn btn-primary w-full btn-lg"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
            >
              {loading ? (
                <><div className="spinner" style={{ width: 16, height: 16 }} /> Signing In...</>
              ) : (
                <><Activity size={16} /> Enter TrialSphere Platform <ArrowRight size={15} /></>
              )}
            </button>
          </form>
        </div>

        {/* 1-Click Role Direct Login */}
        <div style={{ background: 'rgba(10,22,40,0.85)', backdropFilter: 'blur(20px)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={14} color="#10b981" /> 1-Click Instant Role Login
            </div>
            <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>No Password Needed</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {quickRoles.map((ql) => (
              <button
                key={ql.label}
                type="button"
                className="btn btn-secondary"
                id={`quick-login-${ql.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  width: '100%',
                  background: 'rgba(255,255,255,0.03)',
                  borderColor: 'rgba(255,255,255,0.08)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => {
                  setEmail(ql.email);
                  handleLogin(ql.email);
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <UserCheck size={15} style={{ color: ql.color }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{ql.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ql.email}</div>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 12,
                    background: `${ql.color}20`,
                    color: ql.color,
                    border: `1px solid ${ql.color}40`,
                  }}
                >
                  {ql.badge}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
