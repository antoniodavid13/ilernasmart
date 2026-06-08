import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { subjectsAPI, enrollmentsAPI } from '../services/api';
import Sidebar from '../components/layout/Sidebar';
import { FiSearch, FiPlus, FiBook, FiMenu, FiGrid, FiList, FiUserPlus, FiSettings } from 'react-icons/fi';
import '../styles/pages/HomePage.css';
import { useClass } from '../context/ClassContext';
// dentro del componente:

export default function HomePage() {
  const { user } = useAuth();
  const { getSubjectColor } = useTheme();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', description: '' });
  const [enrollId, setEnrollId] = useState('');
  const [enrollError, setEnrollError] = useState('');
  const [enrollSuccess, setEnrollSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { activeClass } = useClass();


  useEffect(() => {
    loadSubjects();
  }, []);
const loadSubjects = async () => {
    try {
      if (user?.role === 'student') {
        const res = await enrollmentsAPI.getMy();
        // Filtrar solo las asignaturas de la clase activa
        const filtered = res.data.filter(e =>
          !activeClass || e.subject?.classId === activeClass?.id
        );
        setSubjects(filtered.map((e, i) => ({ ...e.subject, colorIndex: i })));
      } else if (user?.role === 'teacher' && activeClass) {
        const res = await subjectsAPI.getByClass(activeClass.id);
        setSubjects(res.data.map((s, i) => ({ ...s, colorIndex: i })));
      } else {
        const res = await subjectsAPI.getAll();
        setSubjects(res.data.map((s, i) => ({ ...s, colorIndex: i })));
      }
    } catch (err) {
      console.error('Error cargando asignaturas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    try {
      await subjectsAPI.create({ ...newSubject, classId: activeClass?.id });
      setNewSubject({ name: '', description: '' });
      setShowCreateModal(false);
      loadSubjects();
    } catch (err) {
      console.error('Error creando asignatura:', err);
    }
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    setEnrollError('');
    setEnrollSuccess('');
    try {
      await enrollmentsAPI.enroll(enrollId.trim());
      setEnrollSuccess('¡Matriculado correctamente!');
      setEnrollId('');
      loadSubjects();
      setTimeout(() => {
        setShowEnrollModal(false);
        setEnrollSuccess('');
      }, 1500);
    } catch (err) {
      setEnrollError(err.response?.data?.message || 'ID de asignatura no válido o ya estás matriculado');
    }
  };

  const filtered = subjects.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';
  const isStudent = user?.role === 'student';

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="app-content">
        <header className="home-header">
          <div className="home-header-content">
            <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
              <FiMenu size={22} />
            </button>
            <h1 className="home-logo">ILERNA</h1>
            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <FiGrid size={18} />
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <FiList size={18} />
              </button>
            </div>
          </div>
        </header>

        <div className="home-search-wrap">
          <div className="home-search">
            <FiSearch className="home-search-icon" />
            <input
              type="text"
              placeholder="Escribe alguna asignatura..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <main className="home-main">
          {loading ? (
            <div className="home-loading">
              <div className="home-spinner"></div>
              <p>Cargando asignaturas...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="home-empty">
              <FiBook size={48} />
              <p>{isStudent ? 'No estás matriculado en ninguna asignatura' : 'No hay asignaturas disponibles'}</p>
              {isStudent && (
                <button className="home-empty-enroll" onClick={() => setShowEnrollModal(true)}>
                  Matricularse con ID
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="subjects-grid">
              {filtered.map((subject, index) => {
                const color = getSubjectColor(subject.colorIndex ?? index);
                return (
                  <button
                    key={subject.id}
                    className="subject-card"
                    style={{
                      '--card-color': color,
                      animationDelay: `${index * 0.6}s`,
                    }}
                    onClick={() =>
                      navigate(`/subject/${subject.id}`, {
                        state: { colorIndex: subject.colorIndex ?? index },
                      })
                    }
                  >
                    <p className="subject-card-name">{subject.name}</p>
                  </button>
                );
              })}
            </div>
          ) : (
           <div className="subjects-list">
              {filtered.map((subject, index) => {
                const color = getSubjectColor(subject.colorIndex ?? index);
                return (
                  <div key={subject.id} className="subject-list-row animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                    <button
                      className="subject-list-item"
                      onClick={() =>
                        navigate(`/subject/${subject.id}`, {
                          state: { colorIndex: subject.colorIndex ?? index },
                        })
                      }
                    >
                      <div className="subject-list-color" style={{ background: color }} />
                      <div className="subject-list-info">
                        <h3>{subject.name}</h3>
                        {subject.description && (
                          <p className="subject-list-desc">{subject.description}</p>
                        )}
                        <span className="subject-list-id">ID: {subject.id}</span>
                      </div>
                    </button>
                    {isTeacher && (
                      <button
                        className="subject-list-config"
                        onClick={() => navigate(`/subject/${subject.id}/settings`, { state: { colorIndex: subject.colorIndex ?? index } })}
                        title="Configuración"
                      >
                        <FiSettings size={18} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* FAB profesor: crear asignatura */}
          {isTeacher && (
            <button className="home-fab" onClick={() => setShowCreateModal(true)}>
              <FiPlus size={24} />
            </button>
          )}

          {/* FAB estudiante: matricularse */}
          {isStudent && (
            <button className="home-fab" onClick={() => setShowEnrollModal(true)}>
              <FiUserPlus size={22} />
            </button>
          )}
        </main>

        {/* Modal crear asignatura (profesor) */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Nueva asignatura</h3>
              <form onSubmit={handleCreateSubject}>
                <div className="modal-input-group">
                  <input
                    type="text"
                    placeholder="Nombre de la asignatura"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                    required
                  />
                </div>
                <div className="modal-input-group">
                  <textarea
                    placeholder="Descripción (opcional)"
                    value={newSubject.description}
                    onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="modal-cancel" onClick={() => setShowCreateModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="modal-submit">Crear</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal matricularse (estudiante) */}
        {showEnrollModal && (
          <div className="modal-overlay" onClick={() => { setShowEnrollModal(false); setEnrollError(''); setEnrollSuccess(''); }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Matricularse en asignatura</h3>
              <p className="modal-description">Introduce el ID de la asignatura que te ha proporcionado tu profesor.</p>

              {enrollError && <div className="modal-error">{enrollError}</div>}
              {enrollSuccess && <div className="modal-success">{enrollSuccess}</div>}

              <form onSubmit={handleEnroll}>
                <div className="modal-input-group">
                  <input
                    type="text"
                    placeholder="ID de la asignatura"
                    value={enrollId}
                    onChange={(e) => setEnrollId(e.target.value)}
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="modal-cancel" onClick={() => { setShowEnrollModal(false); setEnrollError(''); setEnrollSuccess(''); }}>
                    Cancelar
                  </button>
                  <button type="submit" className="modal-submit">Matricularse</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <nav className="bottom-nav">
          <button className="bottom-nav-item" onClick={() => setSidebarOpen(true)}>
            <FiMenu />
            <span>Menú</span>
          </button>
          <button className="bottom-nav-item active">
            <FiBook />
            <span>Asignaturas</span>
          </button>
        </nav>
      </div>
    </div>
  );
}