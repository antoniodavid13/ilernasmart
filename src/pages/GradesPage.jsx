import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/layout/Sidebar';
import { FiMenu, FiAward } from 'react-icons/fi';
import '../styles/pages/GradesPage.css';

export default function GradesPage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-content">
        <header className="grades-header">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
            <FiMenu size={22} />
          </button>
          <h1 className="grades-title">Calificaciones</h1>
          <div style={{ width: 36 }} />
        </header>

        <main className="grades-main">
          <div className="grades-placeholder">
            <FiAward size={48} />
            <h3>Próximamente</h3>
            <p>Las calificaciones detalladas estarán disponibles en la Fase 3</p>
          </div>
        </main>
      </div>
    </div>
  );
}