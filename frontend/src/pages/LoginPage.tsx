import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api';
import { useAuth } from '../AuthContext';
import { Eye, EyeOff, Lock, Mail, Activity } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@aiia.gov.in');
  const [password, setPassword] = useState('Admin@123');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await authApi.login(email, password);
      login(res.data.user, res.data.access_token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  }

  const quickLogins = [
    { label: 'Admin', email: 'admin@aiia.gov.in', pw: 'Admin@123' },
    { label: 'PI', email: 'pi1@aiia.gov.in', pw: 'PI@1234' },
    { label: 'Coordinator', email: 'coord1@aiia.gov.in', pw: 'Coord@123' },
    { label: 'PV Officer', email: 'pv@aiia.gov.in', pw: 'PV@1234' },
    { label: 'Management', email: 'mgmt@aiia.gov.in', pw: 'Mgmt@123' },
  ];

  return (
    <div className="login-page">
      <div className="login-bg-effects">
        <div className="login-orb login-orb-1" />
        <div className="login-orb login-orb-2" />
        <div className="login-orb login-orb-3" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', position: 'relative', zIndex: 1 }}>
        <div className="login-card">
          <div className="login-logo">
            <div className="login-logo-icon">⚗</div>
            <div className="login-logo-text">
              <span className="login-title">AIIA TrialSphere</span>
              <span className="login-subtitle">Integrated CTMS Platform</span>
            </div>
          </div>

          <h2 className="login-heading">Welcome back</h2>
          <p className="login-desc">Sign in to access the clinical trial management system</p>

          {error && <div className="login-error">⚠ {error}</div>}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="input-email"
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: 36 }}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@aiia.gov.in"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="input-password"
                  type={showPw ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingLeft: 36, paddingRight: 40 }}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
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
                <><div className="spinner" style={{ width: 16, height: 16 }} /> Authenticating...</>
              ) : (
                <><Activity size={16} /> Sign In to TrialSphere</>
              )}
            </button>
          </form>
        </div>

        <div style={{ background: 'rgba(10,22,40,0.8)', backdropFilter: 'blur(20px)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px', width: 420 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10, fontWeight: 700 }}>Demo Quick Login</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {quickLogins.map(ql => (
              <button
                key={ql.label}
                className="btn btn-secondary btn-sm"
                id={`quick-login-${ql.label.toLowerCase().replace(' ', '-')}`}
                onClick={() => { setEmail(ql.email); setPassword(ql.pw); }}
              >
                {ql.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
