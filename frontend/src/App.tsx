import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Sidebar from './Sidebar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StudiesPage from './pages/StudiesPage';
import StudyDetailPage from './pages/StudyDetailPage';
import SitesPage from './pages/SitesPage';
import ParticipantsPage from './pages/ParticipantsPage';
import SafetyPage from './pages/SafetyPage';
import CompliancePage from './pages/CompliancePage';
import AlertsPage from './pages/AlertsPage';
import AuditPage from './pages/AuditPage';
import FhirPage from './pages/FhirPage';

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-body">{children}</div>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/" element={<ProtectedLayout><DashboardPage /></ProtectedLayout>} />
      <Route path="/studies" element={<ProtectedLayout><StudiesPage /></ProtectedLayout>} />
      <Route path="/studies/:id" element={<ProtectedLayout><StudyDetailPage /></ProtectedLayout>} />
      <Route path="/sites" element={<ProtectedLayout><SitesPage /></ProtectedLayout>} />
      <Route path="/participants" element={<ProtectedLayout><ParticipantsPage /></ProtectedLayout>} />
      <Route path="/safety" element={<ProtectedLayout><SafetyPage /></ProtectedLayout>} />
      <Route path="/compliance" element={<ProtectedLayout><CompliancePage /></ProtectedLayout>} />
      <Route path="/alerts" element={<ProtectedLayout><AlertsPage /></ProtectedLayout>} />
      <Route path="/audit" element={<ProtectedLayout><AuditPage /></ProtectedLayout>} />
      <Route path="/fhir" element={<ProtectedLayout><FhirPage /></ProtectedLayout>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
