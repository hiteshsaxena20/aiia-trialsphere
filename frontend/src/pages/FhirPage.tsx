import React, { useEffect, useState } from 'react';
import { fhirApi } from '../api';
import { Link2, Upload, Download, CheckCircle2, XCircle, Database } from 'lucide-react';

const SAMPLE_FHIR = {
  resourceType: "ResearchStudy",
  id: "AIIA-DEMO-001",
  identifier: [{ system: "https://aiia.gov.in/ctms/study", value: "AIIA-AYU-2026-001" }],
  title: "Evaluation of Triphala Churna for Metabolic Syndrome",
  status: "active",
  phase: { coding: [{ system: "http://terminology.hl7.org/CodeSystem/research-study-phase", code: "phase-2" }] },
  sponsor: { reference: "Organization/AIIA" }
};

const SAMPLE_AE_FHIR = {
  resourceType: "AdverseEvent",
  id: "AE-AIIA-0001",
  status: "new",
  actuality: "actual",
  event: { text: "Elevated liver enzymes (ALT >3x ULN)" },
  subject: { reference: "Patient/PT-AIIA-001" },
  seriousness: { coding: [{ code: "serious" }] },
  severity: { coding: [{ code: "severe" }] }
};

export default function FhirPage() {
  const [bundleData, setBundleData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [importJson, setImportJson] = useState(JSON.stringify(SAMPLE_FHIR, null, 2));
  const [importResult, setImportResult] = useState<any>(null);
  const [importing, setImporting] = useState(false);
  const [activeView, setActiveView] = useState<'bundle' | 'import' | 'cdisc'>('bundle');
  const [studyId, setStudyId] = useState(1);
  const [studyFhir, setStudyFhir] = useState<any>(null);
  const [fetchingStudy, setFetchingStudy] = useState(false);

  async function fetchBundle() {
    setLoading(true);
    try {
      const res = await fhirApi.bundleStudies();
      setBundleData(res.data);
    } catch (e) { }
    finally { setLoading(false); }
  }

  async function fetchStudyFhir() {
    setFetchingStudy(true);
    try {
      const res = await fhirApi.studyFhir(studyId);
      setStudyFhir(res.data);
    } catch (e) { setStudyFhir({ error: 'Study not found' }); }
    finally { setFetchingStudy(false); }
  }

  async function handleImport() {
    setImporting(true);
    try {
      const parsed = JSON.parse(importJson);
      const res = await fhirApi.importResource(parsed);
      setImportResult(res.data);
    } catch (e: any) {
      setImportResult({ status: 'ERROR', reason: e.message || 'Invalid JSON' });
    } finally { setImporting(false); }
  }

  const CDISC_EXPORTS = [
    { name: 'SDTM Export', desc: 'Study Data Tabulation Model — standardized for FDA submission', icon: '📤', url: '#' },
    { name: 'ADaM Export', desc: 'Analysis Data Model — ready for statistical analysis', icon: '📊', url: '#' },
    { name: 'Define-XML', desc: 'CDISC metadata definition file for dataset documentation', icon: '📋', url: '#' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 className="page-title">Interoperability Gateway</h1>
        <p className="page-description">FHIR R4 integration and CDISC export for regulatory submissions</p>
      </div>

      {/* Stats */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
        {[
          { label: 'FHIR Resources', value: '1,283', icon: '🔗', color: '#06b6d4' },
          { label: 'Validated', value: '1,244', icon: '✓', color: '#10b981' },
          { label: 'Rejected', value: '39', icon: '✗', color: '#ef4444' },
          { label: 'CDISC Ready', value: '12', icon: '📦', color: '#8b5cf6' },
        ].map(item => (
          <div key={item.label} className="kpi-card" style={{ '--accent-color': item.color } as any}>
            <div style={{ fontSize: 28 }}>{item.icon}</div>
            <div className="kpi-value" style={{ color: item.color }}>{item.value}</div>
            <div className="kpi-label">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="filter-tabs" style={{ marginBottom: 20, width: 'fit-content' }}>
        <button className={`filter-tab ${activeView === 'bundle' ? 'active' : ''}`} onClick={() => setActiveView('bundle')} id="fhir-tab-bundle">
          🔗 FHIR Bundle
        </button>
        <button className={`filter-tab ${activeView === 'import' ? 'active' : ''}`} onClick={() => setActiveView('import')} id="fhir-tab-import">
          📥 Import / Validate
        </button>
        <button className={`filter-tab ${activeView === 'cdisc' ? 'active' : ''}`} onClick={() => setActiveView('cdisc')} id="fhir-tab-cdisc">
          📊 CDISC Export
        </button>
      </div>

      {activeView === 'bundle' && (
        <div className="grid-2" style={{ gap: 16 }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">🔗 FHIR R4 Study Bundle</div>
              <button className="btn btn-primary btn-sm" onClick={fetchBundle} disabled={loading} id="btn-fetch-bundle">
                {loading ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <><Download size={13} /> Load Bundle</>}
              </button>
            </div>
            {bundleData ? (
              <div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
                  <span className="badge badge-success">✓ {bundleData.type}</span>
                  <span className="badge badge-info">{bundleData.total} entries</span>
                </div>
                <pre className="fhir-json" style={{ maxHeight: 300 }}>
                  {JSON.stringify(bundleData.entry?.[0]?.resource, null, 2)}
                </pre>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                  Showing first resource of {bundleData.total} in bundle
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <div style={{ fontSize: 40 }}>🔗</div>
                <div>Click "Load Bundle" to fetch all studies as a FHIR R4 Bundle</div>
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Study FHIR Export</div>
            </div>
            <div className="form-group">
              <label className="form-label">Study ID</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  className="form-input"
                  value={studyId}
                  onChange={e => setStudyId(Number(e.target.value))}
                  style={{ width: 100 }}
                  id="input-study-id-fhir"
                />
                <button className="btn btn-secondary btn-sm" onClick={fetchStudyFhir} disabled={fetchingStudy} id="btn-export-study-fhir">
                  {fetchingStudy ? <div className="spinner" style={{ width: 14, height: 14 }} /> : 'Export FHIR'}
                </button>
              </div>
            </div>
            {studyFhir && (
              <pre className="fhir-json">{JSON.stringify(studyFhir, null, 2)}</pre>
            )}
          </div>
        </div>
      )}

      {activeView === 'import' && (
        <div className="grid-2" style={{ gap: 16 }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">📥 Import FHIR Resource</div>
            </div>
            <div className="form-group">
              <label className="form-label">FHIR JSON</label>
              <textarea
                className="form-textarea"
                rows={12}
                value={importJson}
                onChange={e => setImportJson(e.target.value)}
                id="input-fhir-json"
                style={{ fontFamily: 'JetBrains Mono', fontSize: 12 }}
              />
            </div>
            <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-sm" onClick={handleImport} disabled={importing} id="btn-import-fhir">
                {importing ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Validating...</> : <><CheckCircle2 size={13} /> Validate & Import</>}
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setImportJson(JSON.stringify(SAMPLE_FHIR, null, 2))} id="btn-sample-study">
                Sample: ResearchStudy
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setImportJson(JSON.stringify(SAMPLE_AE_FHIR, null, 2))} id="btn-sample-ae">
                Sample: AdverseEvent
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Validation Result</div>
            </div>
            {importResult ? (
              <div>
                <div className={`integrity-badge ${importResult.status === 'VALIDATED' ? 'ok' : 'violated'}`} style={{ marginBottom: 16 }}>
                  {importResult.status === 'VALIDATED'
                    ? <><CheckCircle2 size={20} /> {importResult.message}</>
                    : <><XCircle size={20} /> {importResult.status}: {importResult.reason}</>}
                </div>
                <pre className="fhir-json">{JSON.stringify(importResult, null, 2)}</pre>
              </div>
            ) : (
              <div className="empty-state">
                <div style={{ fontSize: 40 }}>📥</div>
                <div>Submit a FHIR resource to see validation results</div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeView === 'cdisc' && (
        <div>
          <div style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 'var(--radius)', padding: '16px 20px', marginBottom: 20 }}>
            <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--primary-light)' }}>CDISC Alignment Architecture</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 12 }}>
              {[
                { label: 'CDASH', desc: 'Clinical Data Acquisition Standards Harmonization — data collection forms', color: '#6366f1' },
                { label: 'SDTM', desc: 'Study Data Tabulation Model — regulatory submission format', color: '#3b82f6' },
                { label: 'ADaM', desc: 'Analysis Data Model — statistical analysis datasets', color: '#06b6d4' },
              ].map(item => (
                <div key={item.label} style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: 16, border: `1px solid ${item.color}30` }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: item.color, marginBottom: 6 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid-3" style={{ gap: 16 }}>
            {CDISC_EXPORTS.map(exp => (
              <div key={exp.name} className="card" style={{ cursor: 'pointer' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{exp.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{exp.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>{exp.desc}</div>
                <button
                  className="btn btn-primary btn-sm"
                  id={`btn-export-${exp.name.toLowerCase().replace(' ', '-')}`}
                  onClick={() => alert(`${exp.name} generation would be triggered. In production, this exports the CDISC-formatted dataset.`)}
                >
                  <Download size={13} /> Generate {exp.name.split(' ')[0]}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
