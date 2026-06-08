import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { testsAPI, subjectsAPI, documentsAPI } from '../services/api';
import Sidebar from '../components/layout/Sidebar';
import { FiMenu, FiUser, FiEdit3, FiCheck, FiX, FiAward, FiTrendingUp } from 'react-icons/fi';
import '../styles/pages/ProfilePage.css';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { getSubjectColor } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editingBirth, setEditingBirth] = useState(false);
  const [nameValue, setNameValue] = useState(user?.fullName || '');
  const [birthValue, setBirthValue] = useState(user?.birthDate || '');
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState(null);
  const [teacherSubjects, setTeacherSubjects] = useState([]);

  useEffect(() => {
    if (user?.role === 'student') {
      loadStudentStats();
    }
    if (user?.role === 'teacher') {
      loadTeacherSubjects();
    }
  }, [user]);

  const loadStudentStats = async () => {
    try {
      const res = await testsAPI.getMyStats();
      // Intentar obtener nombre del documento
      if (res.data.bestDocument?.documentId) {
        try {
          const docRes = await documentsAPI.getById(res.data.bestDocument.documentId);
          res.data.bestDocument.title = docRes.data.title;
        } catch (e) {}
      }
      setStats(res.data);
    } catch (err) {
      console.error('Error cargando stats:', err);
    }
  };

  const loadTeacherSubjects = async () => {
    try {
      const res = await subjectsAPI.getByTeacher(user.id);
      setTeacherSubjects(res.data);
    } catch (err) {
      console.error('Error cargando asignaturas:', err);
    }
  };

  const handleSaveName = async () => {
    if (!nameValue.trim() || nameValue === user?.fullName) {
      setEditingName(false);
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ fullName: nameValue.trim() });
      setEditingName(false);
    } catch (err) {
      console.error('Error actualizando nombre:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBirth = async () => {
    if (!birthValue) {
      setEditingBirth(false);
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ birthDate: birthValue });
      setEditingBirth(false);
    } catch (err) {
      console.error('Error actualizando fecha:', err);
    } finally {
      setSaving(false);
    }
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const age = calculateAge(user?.birthDate);

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-content">
        <header className="profile-header">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
            <FiMenu size={22} />
          </button>
          <h1 className="profile-title">Perfil</h1>
          <div style={{ width: 36 }} />
        </header>

        <main className="profile-main">
          {user?.role === 'admin' ? (
            <div className="profile-admin">
              <FiUser size={48} />
              <p>Panel de Administrador</p>
            </div>
          ) : (
            <>
              {/* Banner + Avatar */}
              <div className="profile-banner">
                <div className="profile-banner-bg" />
                <div className="profile-avatar-wrapper">
                  <div className="profile-avatar-large">
                    {user?.fullName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                </div>
              </div>

              <div className="profile-name-section">
                <h2>{user?.fullName}</h2>
              </div>

              {/* Información básica */}
              <div className="profile-info-card">
                <h3 className="profile-info-title">Información básica</h3>
                <table className="profile-info-table">
                  <tbody>
                    <tr>
                      <td className="profile-label">Nombre completo</td>
                      <td className="profile-value">
                        {editingName ? (
                          <div className="profile-edit-row">
                            <input
                              className="profile-edit-input"
                              type="text"
                              value={nameValue}
                              onChange={(e) => setNameValue(e.target.value)}
                              autoFocus
                              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                            />
                            <button className="profile-edit-save" onClick={handleSaveName} disabled={saving}>
                              <FiCheck size={16} />
                            </button>
                            <button className="profile-edit-cancel" onClick={() => { setEditingName(false); setNameValue(user?.fullName || ''); }}>
                              <FiX size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className="profile-value-row">
                            <span>{user?.fullName}</span>
                            <button className="profile-edit-btn" onClick={() => setEditingName(true)}>
                              <FiEdit3 size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="profile-label">Correo electrónico</td>
                      <td className="profile-value">{user?.email}</td>
                    </tr>
                    <tr>
                      <td className="profile-label">Rol</td>
                      <td className="profile-value">
                        <span className="profile-role-badge">{user?.role}</span>
                      </td>
                    </tr>
                    {user?.role === 'student' && (
                      <tr>
                        <td className="profile-label">Edad</td>
                        <td className="profile-value">
                          {editingBirth ? (
                            <div className="profile-edit-row">
                              <input
                                className="profile-edit-input"
                                type="date"
                                value={birthValue}
                                onChange={(e) => setBirthValue(e.target.value)}
                                autoFocus
                              />
                              <button className="profile-edit-save" onClick={handleSaveBirth} disabled={saving}>
                                <FiCheck size={16} />
                              </button>
                              <button className="profile-edit-cancel" onClick={() => { setEditingBirth(false); setBirthValue(user?.birthDate || ''); }}>
                                <FiX size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className="profile-value-row">
                              <span>{age !== null ? `${age} años` : 'No configurada'}</span>
                              <button className="profile-edit-btn" onClick={() => setEditingBirth(true)}>
                                <FiEdit3 size={14} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Estudiante: Métricas */}
              {user?.role === 'student' && (
                <div className="profile-info-card">
                  <h3 className="profile-info-title">Rendimiento académico</h3>
                  {stats && stats.totalTests > 0 ? (
                    <div className="profile-metrics">
                      <div className="profile-metrics-row">
                        <div className="profile-metric-card best">
                          <FiAward size={24} />
                          <div className="profile-metric-info">
                            <span className="profile-metric-label">Mejor documento</span>
                            <span className="profile-metric-value">{stats.bestDocument?.title || 'Documento'}</span>
                            <span className="profile-metric-score">{stats.bestDocument?.averageScore?.toFixed(1)}/10</span>
                          </div>
                        </div>
                        <div className="profile-metric-card average">
                          <FiTrendingUp size={24} />
                          <div className="profile-metric-info">
                            <span className="profile-metric-label">Media general</span>
                            <span className="profile-metric-score large">{stats.averageScore?.toFixed(1)}/10</span>
                            <span className="profile-metric-sub">{stats.totalTests} tests realizados</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="profile-metrics-placeholder">
                      <p>Completa tests para ver tus métricas de rendimiento</p>
                    </div>
                  )}
                </div>
              )}

              {/* Profesor: Asignaturas */}
              {user?.role === 'teacher' && (
                <div className="profile-info-card">
                  <h3 className="profile-info-title">Asignaturas impartidas</h3>
                  {teacherSubjects.length > 0 ? (
                    <div className="profile-subjects-list">
                      {teacherSubjects.map((subject, index) => (
                        <div key={subject.id} className="profile-subject-item">
                          <div className="profile-subject-color" style={{ background: getSubjectColor(index) }} />
                          <span>{subject.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="profile-metrics-placeholder">
                      <p>No tienes asignaturas asignadas</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}