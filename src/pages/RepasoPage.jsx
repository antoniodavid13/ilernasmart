import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/layout/Sidebar';
import { repasoAPI, subjectsAPI } from '../services/api';
import { FiMenu, FiCheck, FiChevronRight, FiAlertCircle } from 'react-icons/fi';
import '../styles/pages/RepasoPage.css';

export default function RepasoPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const res = await repasoAPI.getBySubject();
      const subjectStats = res.data;

      // Obtener nombres de asignaturas
      const enriched = await Promise.all(
        subjectStats.map(async (s) => {
          try {
            const subRes = await subjectsAPI.getById(s.subjectId);
            return { ...s, name: subRes.data.name };
          } catch {
            return { ...s, name: 'Asignatura' };
          }
        })
      );
      setSubjects(enriched);
    } catch (err) {
      console.error('Error cargando repaso:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-content">
        <header className="grades-header">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
            <FiMenu size={22} />
          </button>
          <h1 className="grades-title">Repaso</h1>
          <div style={{ width: 36 }} />
        </header>

        <main className="grades-main">
          {loading ? (
            <div className="grades-loading">
              <div className="home-spinner"></div>
              <p>Cargando repaso...</p>
            </div>
          ) : subjects.length === 0 ? (
            <div className="grades-empty">
              <FiCheck size={48} />
              <p>¡No tienes preguntas fallidas!</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                Sigue haciendo tests para acumular preguntas de repaso
              </p>
            </div>
          ) : (
            <div className="grades-list">
              {subjects.map((subject) => (
                <button
                  key={subject.subjectId}
                  className="grades-card grades-card-header"
                  onClick={() => navigate(`/repaso/${subject.subjectId}`, {
                    state: { subjectName: subject.name }
                  })}
                >
                  <div className="grades-card-info">
                    <h3>{subject.name}</h3>
                    <span className="grades-card-meta">
                      {subject.failed} pendientes · {subject.learned} aprendidas
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="grades-attempt-score fail">
                      <FiAlertCircle size={12} /> {subject.failed}
                    </span>
                    <FiChevronRight />
                  </div>
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}