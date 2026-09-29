import React, { useEffect, useState } from 'react';
import { auditApi } from '../api';
import { Shield, CheckCircle2, AlertTriangle, RefreshCw, Zap } from 'lucide-react';

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [tamperDemo, setTamperDemo] = useState<{ id: number | null; done: boolean }>({ id: null, done: false });
  const [tampering, setTampering] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  async function fetchLogs() {
    setLoading(true);
    try {
      const res = await auditApi.list({ limit: 50 });
      setLogs(res.data.logs);
      setTotal(res.data.total);
    } catch (e) { }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchLogs(); }, []);

  async function handleVerify() {
    setVerifying(true);
    try {
      const res = await auditApi.verify();
      setVerifyResult(res.data);
    } catch (e) { }
    finally { setVerifying(false); }
  }

  async function handleTamperDemo(id: number) {
    setTampering(true);
    try {
      await auditApi.tamperDemo(id);
      setTamperDemo({ id, done: true });
      setToast('Record tampered! Now run Verify Chain to detect it.');
      setTimeout(() => setToast(null), 3000);
    } catch (e) { }
    finally { setTampering(false); }
  }

  function truncHash(h: string) {
    return h ? `${h.slice(0, 8)}...${h.slice(-6)}` : '—';
  }

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Audit Ledger</h1>
          <p className="page-description">Tamper-evident audit trail with SHA-256 hash chain verification</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary btn-sm" onClick={fetchLogs} id="btn-refresh-audit">
            <RefreshCw size={13} /> Refresh
          </button>
          <button
            className={`btn btn-sm ${verifyResult?.integrity === 'COMPROMISED' ? 'btn-danger' : 'btn-success'}`}
            onClick={handleVerify}
            disabled={verifying}
            id="btn-verify-chain"
          >
            {verifying ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Verifying...</> : <><Shield size={14} /> Verify Chain</>}
          </button>
        </div>
      </div>

      {/* Verify Result Banner */}
      {verifyResult && (
        <div className={`integrity-badge ${verifyResult.integrity === 'COMPROMISED' ? 'violated' : 'ok'}`} style={{ marginBottom: 16 }}>
          {verifyResult.integrity === 'COMPROMISED'
            ? <><AlertTriangle size={20} /> INTEGRITY VIOLATION — {verifyResult.tampered_records?.length} tampered record(s) detected! Records: {verifyResult.tampered_records?.join(', ')}</>
            : <><CheckCircle2 size={20} /> Chain Verified — All {verifyResult.total_records} audit records are intact. No tampering detected.</>
          }
        </div>
      )}

      {/* Tamper Demo Panel */}
      <div className="card" style={{ marginBottom: 20, border: '1px solid rgba(244,63,94,0.25)', background: 'rgba(244,63,94,0.04)' }}>
        <div className="card-header">
          <div className="card-title">
            <Zap size={15} style={{ color: '#f43f5e' }} />
            <span style={{ color: '#f43f5e' }}>🔴 Tamper Detection Demo</span>
          </div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
          Simulate tampering a record to demonstrate the hash chain integrity verification system.
          After tampering, run "Verify Chain" to detect the violation.
        </p>

        {logs.length > 0 && (
          <div className="hash-demo-card" style={{ marginBottom: 12 }}>
            <div className="hash-demo-field">
              <span className="hash-key">Record ID</span>
              <span className="hash-value">#{logs[0]?.id}</span>
            </div>
            <div className="hash-demo-field">
              <span className="hash-key">Entity</span>
              <span className="hash-value">{logs[0]?.entity_type} / {logs[0]?.entity_id}</span>
            </div>
            <div className="hash-demo-field">
              <span className="hash-key">Action</span>
              <span className="hash-value">{logs[0]?.action}</span>
            </div>
            <div className="hash-demo-field">
              <span className="hash-key">Value</span>
              <span className={`hash-value ${tamperDemo.done && tamperDemo.id === logs[0]?.id ? 'tampered' : ''}`}>
                {logs[0]?.new_value}
              </span>
            </div>
            <div className="hash-demo-field">
              <span className="hash-key">Hash</span>
              <span className="hash-value">{truncHash(logs[0]?.hash_value)}</span>
            </div>
          </div>
        )}

        <button
          className="btn btn-danger btn-sm"
          onClick={() => logs[0] && handleTamperDemo(logs[0].id)}
          disabled={tampering || tamperDemo.done}
          id="btn-tamper-demo"
        >
          {tampering ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Tampering...</>
            : tamperDemo.done ? '✓ Record Tampered (Run Verify)' : '⚠ Simulate Tampering'}
        </button>
      </div>

      {/* Audit Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title"><Shield size={15} /> Audit Log ({total} entries)</div>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Timestamp</th>
                <th>User</th>
                <th>Entity</th>
                <th>ID</th>
                <th>Action</th>
                <th>Old Value</th>
                <th>New Value</th>
                <th>Hash (prev→current)</th>
                <th>Integrity</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: 32 }}>
                  <div className="spinner" style={{ margin: '0 auto' }} />
                </td></tr>
              ) : logs.map((log, i) => (
                <tr key={log.id} id={`audit-row-${log.id}`}
                  style={{ background: log.is_tampered ? 'rgba(239,68,68,0.06)' : undefined }}>
                  <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{log.id}</td>
                  <td style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}
                  </td>
                  <td style={{ fontSize: 12, fontWeight: 600 }}>{log.user_name || '—'}</td>
                  <td><span className="badge badge-info">{log.entity_type}</span></td>
                  <td style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--accent-cyan)' }}>{log.entity_id}</td>
                  <td style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{log.action}</td>
                  <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{log.old_value || '—'}</td>
                  <td style={{ fontSize: 11, color: log.is_tampered ? 'var(--danger)' : 'var(--text-primary)', fontWeight: log.is_tampered ? 700 : 400 }}>
                    {log.new_value || '—'}
                    {log.is_tampered && ' ⚠'}
                  </td>
                  <td style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-muted)' }}>
                    <span style={{ color: 'rgba(99,179,237,0.5)' }}>{truncHash(log.previous_hash)}</span>
                    <span style={{ color: 'rgba(255,255,255,0.2)', margin: '0 4px' }}>→</span>
                    <span style={{ color: log.is_tampered ? '#ef4444' : 'var(--accent-cyan)' }}>{truncHash(log.hash_value)}</span>
                  </td>
                  <td>
                    {log.is_tampered
                      ? <span className="badge badge-danger">⚠ TAMPERED</span>
                      : <span className="badge badge-success">✓ OK</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast */}
      {toast && <div className="toast toast-error">{toast}</div>}
    </div>
  );
}
