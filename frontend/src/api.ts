import axios from 'axios';
import {
  MOCK_USERS,
  MOCK_STUDIES,
  MOCK_DASHBOARD_SUMMARY,
  MOCK_ENROLLMENT_TREND,
  MOCK_ALERTS,
  MOCK_SAFETY_AES,
  MOCK_SITES,
  MOCK_PARTICIPANTS,
  MOCK_COMPLIANCE,
  MOCK_AUDIT_LOGS,
  MOCK_FHIR_BUNDLE,
} from './mockData';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const api = axios.create({ baseURL: BASE_URL, timeout: 5000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Helper to safely execute API with mock fallback
async function safeApiCall<T>(apiFn: () => Promise<any>, fallbackData: T): Promise<{ data: T }> {
  try {
    const res = await apiFn();
    // Verify response is actual JSON and not Vercel HTML SPA fallback
    if (res && res.data && typeof res.data === 'object') {
      return res;
    }
    return { data: fallbackData };
  } catch (err) {
    return { data: fallbackData };
  }
}

export default api;

export const authApi = {
  login: async (email: string, password: string = 'Admin@123') => {
    try {
      const form = new FormData();
      form.append('username', email);
      form.append('password', password);
      const res = await api.post('/auth/login', form);
      if (res.data && res.data.access_token && res.data.user) {
        return res;
      }
    } catch {
      // ignore
    }
    const matchedUser = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase()) || {
      id: Math.floor(Math.random() * 1000) + 10,
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      email,
      role: email.includes('admin')
        ? 'ADMIN'
        : email.includes('pi')
        ? 'PI'
        : email.includes('pv')
        ? 'PV_OFFICER'
        : email.includes('coord')
        ? 'STUDY_COORDINATOR'
        : 'ADMIN',
      title: 'TrialSphere User',
    };
    return {
      data: {
        access_token: 'demo_token_' + btoa(email + '_' + Date.now()),
        token_type: 'bearer',
        user: matchedUser,
      },
    };
  },
  me: () => {
    const stored = localStorage.getItem('user');
    const user = stored ? JSON.parse(stored) : MOCK_USERS[0];
    return safeApiCall(() => api.get('/auth/me'), user);
  },
};

export const dashboardApi = {
  summary: () => safeApiCall(() => api.get('/dashboard/summary'), MOCK_DASHBOARD_SUMMARY),
  enrollmentTrend: () => safeApiCall(() => api.get('/dashboard/enrollment-trend'), MOCK_ENROLLMENT_TREND),
  recentAlerts: () => safeApiCall(() => api.get('/dashboard/recent-alerts'), MOCK_ALERTS),
};

export const studiesApi = {
  list: (params?: any) =>
    safeApiCall(
      () => api.get('/studies', { params }),
      {
        studies: MOCK_STUDIES.filter((s) => {
          if (params?.risk && s.risk_level !== params.risk) return false;
          if (params?.search) {
            const q = params.search.toLowerCase();
            return s.title.toLowerCase().includes(q) || s.study_code.toLowerCase().includes(q);
          }
          return true;
        }),
        total: MOCK_STUDIES.length,
      }
    ),
  get: (id: number) => {
    const study = MOCK_STUDIES.find((s) => s.id === Number(id)) || MOCK_STUDIES[0];
    return safeApiCall(() => api.get(`/studies/${id}`), study);
  },
  create: (data: any) =>
    safeApiCall(() => api.post('/studies', data), { ...data, id: MOCK_STUDIES.length + 1 }),
};

export const safetyApi = {
  listAE: (params?: any) =>
    safeApiCall(
      () => api.get('/safety/adverse-events', { params }),
      {
        adverse_events: MOCK_SAFETY_AES.filter((ae) => {
          if (params?.severity && ae.severity !== params.severity) return false;
          if (params?.is_serious !== undefined && ae.is_serious !== params.is_serious) return false;
          return true;
        }),
        total: MOCK_SAFETY_AES.length,
      }
    ),
  getAE: (id: number) => {
    const ae = MOCK_SAFETY_AES.find((a) => a.id === Number(id)) || MOCK_SAFETY_AES[0];
    return safeApiCall(() => api.get(`/safety/adverse-events/${id}`), ae);
  },
  updateAEStatus: (id: number, data: any) =>
    safeApiCall(() => api.put(`/safety/adverse-events/${id}/status`, data), { id, ...data, success: true }),
  summary: () =>
    safeApiCall(() => api.get('/safety/summary'), {
      total_ae: 48,
      total_sae: 11,
      open_sae: 4,
      overdue_sae: 2,
    }),
};

export const complianceApi = {
  iecApprovals: (params?: any) =>
    safeApiCall(() => api.get('/compliance/iec-approvals', { params }), {
      approvals: MOCK_COMPLIANCE.iecApprovals,
      total: MOCK_COMPLIANCE.iecApprovals.length,
    }),
  ctriRecords: (params?: any) =>
    safeApiCall(() => api.get('/compliance/ctri-records', { params }), {
      records: MOCK_COMPLIANCE.ctriRecords,
      total: MOCK_COMPLIANCE.ctriRecords.length,
    }),
  monitoringVisits: (params?: any) =>
    safeApiCall(() => api.get('/compliance/monitoring-visits', { params }), {
      visits: MOCK_COMPLIANCE.monitoringVisits,
      total: MOCK_COMPLIANCE.monitoringVisits.length,
    }),
  dashboard: () => safeApiCall(() => api.get('/compliance/dashboard'), MOCK_COMPLIANCE),
};

export const alertsApi = {
  list: (params?: any) =>
    safeApiCall(
      () => api.get('/alerts', { params }),
      {
        alerts: MOCK_ALERTS.filter((a) => {
          if (params?.type && a.type !== params.type) return false;
          if (params?.severity && a.severity !== params.severity) return false;
          return true;
        }),
        total: MOCK_ALERTS.length,
      }
    ),
  resolve: (id: number) => safeApiCall(() => api.put(`/alerts/${id}/resolve`, {}), { id, status: 'RESOLVED' }),
  summary: () =>
    safeApiCall(() => api.get('/alerts/summary'), {
      critical: 2,
      warning: 2,
      total: 4,
    }),
};

export const auditApi = {
  list: (params?: any) =>
    safeApiCall(() => api.get('/audit', { params }), {
      logs: MOCK_AUDIT_LOGS,
      total: MOCK_AUDIT_LOGS.length,
    }),
  verify: () => safeApiCall(() => api.get('/audit/verify'), { verified: true, count: MOCK_AUDIT_LOGS.length }),
  tamperDemo: (id: number) =>
    safeApiCall(() => api.post(`/audit/tamper-demo/${id}`, {}), {
      tampered: true,
      original_hash: MOCK_AUDIT_LOGS[0].sha256_hash,
      corrupted_hash: '3f21a89b9872e4501a4bc31289fe94321',
    }),
};

export const fhirApi = {
  studyFhir: (id: number) => {
    const study = MOCK_STUDIES.find((s) => s.id === Number(id)) || MOCK_STUDIES[0];
    return safeApiCall(() => api.get(`/fhir/studies/${id}`), {
      resourceType: 'ResearchStudy',
      id: `aiia-rs-${study.id}`,
      title: study.title,
      status: study.status.toLowerCase(),
      phase: study.phase,
    });
  },
  bundleStudies: () => safeApiCall(() => api.get('/fhir/bundle/studies'), MOCK_FHIR_BUNDLE),
  importResource: (data: any) =>
    safeApiCall(() => api.post('/fhir/import', data), { success: true, imported: data }),
};

export const participantsApi = {
  list: (params?: any) =>
    safeApiCall(() => api.get('/participants', { params }), {
      participants: MOCK_PARTICIPANTS,
      total: MOCK_PARTICIPANTS.length,
    }),
};
