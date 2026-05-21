import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { subjectsAPI, enrollmentsAPI } from '../services/api';
import Sidebar from '../components/layout/Sidebar';
import { FiMenu, FiArrowLeft, FiCopy, FiCheck, FiTrash2, FiEdit3, FiChevronLeft, FiChevronRight, FiBook } from 'react-icons/fi';
import '../styles/pages/SubjectSettingsPage.css';

const STUDENTS_PER_PAGE = 10;

export default function SubjectSettingsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { setSubjectColor, resetColor } = useTheme();

  const [subject, setSubject] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const colorIndex = location.state?.colorIndex ?? 0;

  useEffect(() => {
    setSubjectColor(colorIndex);
    loadData();
    return () => resetColor();
  }, [id]);

  const loadData = async () => {
    try {
      const [subjectRes, studentsRes] = await Promise.all([
        subjectsAPI.getById(id),
        enrollmentsAPI.getBySubject(id),
      ]);
      setSubject(subjectRes.data);
      setEditName(subjectRes.data.name);
      setStudents(studentsRes.data || []);
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdateName = async () => {
    if (!editName.trim() || editName === subject.name) {
      setEditing(false);
      return;
    }
    try {
      await subjectsAPI.update(id, { ...subject, name: editName.trim() });
      setSubject({ ...subject, name: editName.trim() });
      setEditing(false);
    } catch (err) {
      console.error('Error actualizando nombre:', err);
    }
  };

  const handleDelete = async () => {
    try {
      await subjectsAPI.delete(id);
      resetColor();
      navigate('/home');
    } catch (err) {
      console.error('Error eliminando asignatura:', err);
    }
  };

  const totalPages = Math.ceil(students.length / STUDENTS_PER_PAGE);
  const paginatedStudents = students.slice(
    (currentPage - 1) * STUDENTS_PER_PAGE,
    currentPage * STUDENTS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="app-content">
          <div className="settings-loading">
            <div className="home-spinner"></div>
            <p>Cargando configuración...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-content">
        <header className="settings-header">
          <button className="settings-back" onClick={() => { resetColor(); navigate('/home'); }}>
            <FiArrowLeft size={20} />
          </button>
          <h1 className="settings-header-title">Configuración</h1>
          <div style={{ width: 36 }} />
        </header>

        <main className="settings-main">
          {/* Banner + Avatar */}
          <div className="settings-banner">
            <div className="settings-banner-bg" />
            <div className="settings-avatar-wrapper">
              <div className="settings-avatar-large">
                <FiBook size={36} />
              </div>
            </div>
          </div>

          <div className="settings-name-section">
            {editing ? (
              <div className="settings-edit-inline">
                <input
                  className="settings-edit-input"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleUpdateName()}
                />
                <div className="settings-edit-actions">
                  <button className="settings-save-btn" onClick={handleUpdateName}>Guardar</button>
                  <button className="settings-cancel-btn" onClick={() => { setEditing(false); setEditName(subject.name); }}>Cancelar</button>
                </div>
              </div>
            ) : (
              <div className="settings-name-row">
                <h2>{subject?.name}</h2>
                <button className="settings-edit-icon" onClick={() => setEditing(true)} title="Editar nombre">
                  <FiEdit3 size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Información básica */}
          <div className="profile-info-card">
            <h3 className="profile-info-title">Información de la asignatura</h3>
            <table className="profile-info-table">
              <tbody>
                <tr>
                  <td className="profile-label">Nombre</td>
                  <td className="profile-value">{subject?.name}</td>
                </tr>
                <tr>
                  <td className="profile-label">Profesor asignado</td>
                  <td className="profile-value">{subject?.teacherName || user?.fullName || 'No asignado'}</td>
                </tr>
                <tr>
                  <td className="profile-label">Estudiantes</td>
                  <td className="profile-value">{students.length} matriculados</td>
                </tr>
                <tr>
                  <td className="profile-label">ID de asignatura</td>
                  <td className="profile-value">
                    <div className="settings-id-row">
                      <code className="settings-id-code">{id}</code>
                      <button className="settings-copy-btn" onClick={handleCopyId}>
                        {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
                        <span>{copied ? 'Copiado' : 'Copiar'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Lista de estudiantes */}
          <div className="profile-info-card">
            <div className="settings-students-header">
              <h3 className="profile-info-title">Estudiantes matriculados</h3>
              <span className="settings-student-badge">{students.length}</span>
            </div>

            {students.length === 0 ? (
              <div className="settings-empty-students">
                <p>No hay estudiantes matriculados aún.</p>
                <p className="settings-empty-hint">Comparte el ID de la asignatura con tus estudiantes.</p>
              </div>
            ) : (
              <>
                <table className="profile-info-table">
                  <tbody>
                    {paginatedStudents.map((enrollment, index) => (
                      <tr key={enrollment.id || index}>
                        <td className="profile-label settings-student-cell">
                          <div className="settings-student-avatar">
                            {(enrollment.student?.fullName || enrollment.studentName || '?').charAt(0).toUpperCase()}
                          </div>
                          <span>{enrollment.student?.fullName || enrollment.studentName || 'Estudiante'}</span>
                        </td>
                        <td className="profile-value settings-student-email-cell">
                          {enrollment.student?.email || enrollment.studentEmail || ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {totalPages > 1 && (
                  <div className="settings-pagination">
                    <button
                      className="settings-page-btn"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      <FiChevronLeft size={16} />
                    </button>
                    <span className="settings-page-info">{currentPage} / {totalPages}</span>
                    <button
                      className="settings-page-btn"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      <FiChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Zona de peligro */}
          <div className="profile-info-card settings-danger-zone">
            <h3 className="profile-info-title settings-danger-label">Zona de peligro</h3>
            {showDeleteConfirm ? (
              <div className="settings-delete-confirm">
                <p>¿Estás seguro? Se eliminará la asignatura, todos sus documentos y tests asociados. Esta acción no se puede deshacer.</p>
                <div className="settings-delete-actions">
                  <button className="settings-cancel-btn" onClick={() => setShowDeleteConfirm(false)}>Cancelar</button>
                  <button className="settings-delete-final" onClick={handleDelete}>Sí, eliminar</button>
                </div>
              </div>
            ) : (
              <div className="settings-delete-row">
                <button className="settings-delete-btn" onClick={() => setShowDeleteConfirm(true)}>
                  <FiTrash2 size={16} />
                  <span>Eliminar asignatura</span>
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}