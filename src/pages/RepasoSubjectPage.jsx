import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { repasoAPI } from '../services/api';
import { FiMenu, FiArrowLeft, FiRotateCcw, FiCheck, FiBook, FiAlertCircle } from 'react-icons/fi';
import '../styles/pages/RepasoPage.css';

export default function RepasoSubjectPage() {
  const { subjectId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const subjectName = state?.subjectName || 'Asignatura';

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadStats();
  }, [subjectId]);

  const loadStats = async () => {
    try {
      const res = await repasoAPI.getStatsBySubject(subjectId);
      setStats(res.data);
    } catch (err) {
      console.error('Error cargando repaso:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await repasoAPI.generate(subjectId);
      const questions = res.data;
      if (!questions || questions.length === 0) {
        alert('No hay preguntas de repaso disponibles.');
        return;
      }
      navigate('/repaso/test', { state: { questions } });
    } catch (err) {
      console.error('Error generando repaso:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-content">
        <header className="grades-header">
          <button className="menu-btn" onClick={() => navigate('/repaso')}>
            <FiArrowLeft size={20} />
          </button>
          <h1 className="grades-title">{subjectName}</h1>
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
            <FiMenu size={22} />
          </button>
        </header>

        <main className="grades-main">
          {loading ? (
            <div className="grades-loading">
              <div className="home-spinner"></div>
              <p>Cargando repaso...</p>
            </div>
          ) : stats?.totalFailed === 0 ? (
            <div className="grades-empty">
              <FiCheck size={48} />
              <p>¡No tienes preguntas fallidas en esta asignatura!</p>
            </div>
          ) : (
            <div className="repaso-content">
              <div className="repaso-stats">
                <div className="repaso-stat">
                  <FiAlertCircle size={24} className="repaso-stat-icon failed" />
                  <span className="repaso-stat-number">{stats?.totalFailed || 0}</span>
                  <span className="repaso-stat-label">Pendientes</span>
                </div>
                <div className="repaso-stat">
                  <FiCheck size={24} className="repaso-stat-icon learned" />
                  <span className="repaso-stat-number">{stats?.totalLearned || 0}</span>
                  <span className="repaso-stat-label">Aprendidas</span>
                </div>
                <div className="repaso-stat">
                  <FiBook size={24} className="repaso-stat-icon total" />
                  <span className="repaso-stat-number">
                    {(stats?.totalFailed || 0) + (stats?.totalLearned || 0)}
                  </span>
                  <span className="repaso-stat-label">Total</span>
                </div>
              </div>

              {((stats?.totalFailed || 0) + (stats?.totalLearned || 0)) > 0 && (
                <div className="repaso-progress-card">
                  <div className="repaso-progress-header">
                    <span>Progreso de aprendizaje</span>
                    <span className="repaso-progress-pct">
                      {Math.round(((stats?.totalLearned || 0) /
                        ((stats?.totalFailed || 0) + (stats?.totalLearned || 0))) * 100)}%
                    </span>
                  </div>
                  <div className="repaso-progress-bar">
                    <div
                      className="repaso-progress-fill"
                      style={{
                        width: `${Math.round(((stats?.totalLearned || 0) /
                          ((stats?.totalFailed || 0) + (stats?.totalLearned || 0))) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="repaso-info-card">
                <FiBook size={20} />
                <p>
                  El test incluye hasta <strong>10 preguntas aleatorias</strong> de
                  tus {stats?.totalFailed} preguntas pendientes de esta asignatura.
                  Si las respondes bien se marcan como aprendidas.
                </p>
              </div>

              <button
                className="repaso-start-btn"
                onClick={handleGenerate}
                disabled={generating || stats?.totalFailed === 0}
              >
                {generating ? (
                  <>
                    <div className="repaso-btn-spinner"></div>
                    <span>Preparando repaso...</span>
                  </>
                ) : (
                  <>
                    <FiRotateCcw size={20} />
                    <span>Iniciar repaso ({Math.min(stats?.totalFailed || 0, 10)} preguntas)</span>
                  </>
                )}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}