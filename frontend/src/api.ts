import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

export const authApi = {
  login: (email: string, password: string) => {
    const form = new FormData();
    form.append('username', email);
    form.append('password', password);
    return api.post('/auth/login', form);
  },
  me: () => api.get('/auth/me'),
};

export const dashboardApi = {
  summary: () => api.get('/dashboard/summary'),
  enrollmentTrend: () => api.get('/dashboard/enrollment-trend'),
  recentAlerts: () => api.get('/dashboard/recent-alerts'),
};

export const studiesApi = {
  list: (params?: any) => api.get('/studies', { params }),
  get: (id: number) => api.get(`/studies/${id}`),
  create: (data: any) => api.post('/studies', data),
};

export const safetyApi = {
  listAE: (params?: any) => api.get('/safety/adverse-events', { params }),
  getAE: (id: number) => api.get(`/safety/adverse-events/${id}`),
  updateAEStatus: (id: number, data: any) => api.put(`/safety/adverse-events/${id}/status`, data),
  summary: () => api.get('/safety/summary'),
};

export const complianceApi = {
  iecApprovals: (params?: any) => api.get('/compliance/iec-approvals', { params }),
  ctriRecords: (params?: any) => api.get('/compliance/ctri-records', { params }),
  monitoringVisits: (params?: any) => api.get('/compliance/monitoring-visits', { params }),
  dashboard: () => api.get('/compliance/dashboard'),
};

export const alertsApi = {
  list: (params?: any) => api.get('/alerts', { params }),
  resolve: (id: number) => api.put(`/alerts/${id}/resolve`, {}),
  summary: () => api.get('/alerts/summary'),
};

export const auditApi = {
  list: (params?: any) => api.get('/audit', { params }),
  verify: () => api.get('/audit/verify'),
  tamperDemo: (id: number) => api.post(`/audit/tamper-demo/${id}`, {}),
};

export const fhirApi = {
  studyFhir: (id: number) => api.get(`/fhir/studies/${id}`),
  bundleStudies: () => api.get('/fhir/bundle/studies'),
  importResource: (data: any) => api.post('/fhir/import', data),
};

export const participantsApi = {
  list: (params?: any) => api.get('/participants', { params }),
};
