import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/layout/Sidebar';
import { FiMenu, FiUser, FiEdit3, FiCheck, FiX } from 'react-icons/fi';
import '../styles/pages/ProfilePage.css';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editingBirth, setEditingBirth] = useState(false);
  const [nameValue, setNameValue] = useState(user?.fullName || '');
  const [birthValue, setBirthValue] = useState(user?.birthDate || '');
  const [saving, setSaving] = useState(false);

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
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
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

              {/* Sección según rol */}
              {user?.role === 'student' && (
                <div className="profile-info-card">
                  <h3 className="profile-info-title">Rendimiento académico</h3>
                  <div className="profile-metrics-placeholder">
                    <p>Las métricas de rendimiento estarán disponibles cuando completes tests</p>
                  </div>
                </div>
              )}

              {user?.role === 'teacher' && (
                <div className="profile-info-card">
                  <h3 className="profile-info-title">Asignaturas impartidas</h3>
                  <div className="profile-metrics-placeholder">
                    <p>La lista de asignaturas estará disponible en la Fase 3</p>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}