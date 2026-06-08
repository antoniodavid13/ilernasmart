import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ClassProvider, useClass } from './context/ClassContext';
import SplashPage from './pages/SplashPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import SubjectPage from './pages/SubjectPage';
import TestPage from './pages/TestPage';
import ProfilePage from './pages/ProfilePage';
import GradesPage from './pages/GradesPage';
import SubjectSettingsPage from './pages/SubjectSettingsPage';
import DocumentViewerPage from './pages/DocumentViewerPage';
import SubmissionDetailPage from './pages/SubmissionDetailPage';
import ClassSelectPage from './pages/ClassSelectPage';
import AdminPage from './pages/AdminPage';
import RepasoPage from './pages/RepasoPage';
import RepasoTestPage from './pages/RepasoTestPage';
import RepasoSubjectPage from './pages/RepasoSubjectPage';

import { useState, useEffect } from 'react';
import { registerErrorListener } from './services/api'; // Ajusta la ruta si es necesario
import ServiceDownScreen from './pages/ServiceDownScreen';
import './styles/global.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/home" /> : children;
}

function TeacherClassGuard({ children }) {
  const { user, loading } = useAuth();
  const { activeClass } = useClass();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'teacher' && !activeClass) return <Navigate to="/select-class" />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SplashPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/select-class" element={<ProtectedRoute><ClassSelectPage /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
      <Route path="/home" element={<TeacherClassGuard><HomePage /></TeacherClassGuard>} />
      <Route path="/subject/:id" element={<ProtectedRoute><SubjectPage /></ProtectedRoute>} />
      <Route path="/subject/:id/settings" element={<ProtectedRoute><SubjectSettingsPage /></ProtectedRoute>} />
      <Route path="/document/:id/view" element={<ProtectedRoute><DocumentViewerPage /></ProtectedRoute>} />
      <Route path="/repaso/:subjectId" element={<ProtectedRoute><RepasoSubjectPage /></ProtectedRoute>} />
      <Route path="/repaso/test" element={<ProtectedRoute><RepasoTestPage /></ProtectedRoute>} />
      <Route path="/test/:documentId" element={<ProtectedRoute><TestPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/grades" element={<ProtectedRoute><GradesPage /></ProtectedRoute>} />
      <Route path="/submission/:submissionId" element={<ProtectedRoute><SubmissionDetailPage /></ProtectedRoute>} />
      <Route path="/repaso" element={<ProtectedRoute><RepasoPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  // Estado reactivo global de red
  const [globalError, setGlobalError] = useState(null);

  useEffect(() => {
    // Sincroniza las excepciones del interceptor de Axios con la interfaz
    registerErrorListener((error) => {
      setGlobalError(error);
    });
  }, []);

  // Si salta un error crítico de infraestructura, bloqueamos la app con su layout personalizado
  if (globalError) {
    return (
      <ServiceDownScreen 
        error={globalError} 
        onRetry={() => setGlobalError(null)} 
      />
    );
  }
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <ClassProvider>
            <AppRoutes />
          </ClassProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}