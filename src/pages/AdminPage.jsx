import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { classesAPI, authAPI } from '../services/api';
import Sidebar from '../components/layout/Sidebar';
import { FiMenu, FiPlus, FiTrash2, FiEdit3, FiUsers, FiBook, FiUserPlus, FiX, FiCheck } from 'react-icons/fi';
import '../styles/pages/AdminPage.css';

export default function AdminPage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('classes');

  // Clases
  const [classes, setClasses] = useState([]);
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [classForm, setClassForm] = useState({ name: '', description: '' });

  // Usuarios
  const [users, setUsers] = useState([]);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [userForm, setUserForm] = useState({ fullName: '', email: '', password: '', role: 'student' });

  // Añadir miembro
  const [showAddMember, setShowAddMember] = useState(null);
  const [memberForm, setMemberForm] = useState({ userId: '', role: 'student' });
  const [classMembers, setClassMembers] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [classRes, userRes] = await Promise.all([
        classesAPI.getAll(),
        authAPI.getUsers(),
      ]);
      setClasses(classRes.data);
      setUsers(userRes.data);
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadClassMembers = async (classId) => {
    if (classMembers[classId]) return;
    try {
      const res = await classesAPI.getMembers(classId);
      setClassMembers((prev) => ({ ...prev, [classId]: res.data }));
    } catch (err) {
      console.error('Error cargando miembros:', err);
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      await classesAPI.create(classForm);
      setClassForm({ name: '', description: '' });
      setShowCreateClass(false);
      loadData();
    } catch (err) {
      setError('Error al crear la clase');
    }
  };

  const handleUpdateClass = async (e) => {
    e.preventDefault();
    try {
      await classesAPI.update(editingClass.id, classForm);
      setEditingClass(null);
      setClassForm({ name: '', description: '' });
      loadData();
    } catch (err) {
      setError('Error al actualizar la clase');
    }
  };

  const handleDeleteClass = async (id) => {
    if (!confirm('¿Eliminar esta clase?')) return;
    try {
      await classesAPI.delete(id);
      loadData();
    } catch (err) {
      setError('Error al eliminar la clase');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await authAPI.register(userForm);
      setUserForm({ fullName: '', email: '', password: '', role: 'student' });
      setShowCreateUser(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear el usuario');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('¿Eliminar este usuario?')) return;
    try {
      await authAPI.deleteUser(id);
      loadData();
    } catch (err) {
      setError('Error al eliminar el usuario');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await classesAPI.addMember(showAddMember, memberForm.userId, memberForm.role);
      setMemberForm({ userId: '', role: 'student' });
      setShowAddMember(null);
      setClassMembers({});
      loadClassMembers(showAddMember);
    } catch (err) {
      const msg = err.response?.data?.message 
        || err.response?.data?.error 
        || err.response?.data 
        || 'Error al añadir miembro';
      setError(typeof msg === 'string' ? msg : 'El alumno ya pertenece a una clase. Elimínalo primero de su clase actual.');
    }
  };

  const handleRemoveMember = async (classId, userId) => {
    try {
      await classesAPI.removeMember(classId, userId);
      setClassMembers({});
      loadClassMembers(classId);
    } catch (err) {
      setError('Error al eliminar miembro');
    }
  };

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-content">
        <header className="admin-header">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
            <FiMenu size={22} />
          </button>
          <h1 className="admin-title">Panel de Administración</h1>
          <div style={{ width: 36 }} />
        </header>

        <main className="admin-main">
          {error && (
            <div className="admin-error" onClick={() => setError('')}>
              {error} ✕
            </div>
          )}

          {/* Tabs */}
          <div className="admin-tabs">
            <button
              className={`admin-tab ${activeTab === 'classes' ? 'active' : ''}`}
              onClick={() => setActiveTab('classes')}
            >
              <FiBook size={16} />
              <span>Clases</span>
            </button>
            <button
              className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <FiUsers size={16} />
              <span>Usuarios</span>
            </button>
          </div>

          {loading ? (
            <div className="admin-loading">
              <div className="home-spinner"></div>
            </div>
          ) : activeTab === 'classes' ? (

            /* ── Gestión de clases ── */
            <div className="admin-section">
              <div className="admin-section-header">
                <h2>Clases ({classes.length})</h2>
                <button className="admin-add-btn" onClick={() => setShowCreateClass(true)}>
                  <FiPlus size={16} />
                  <span>Nueva clase</span>
                </button>
              </div>

              {showCreateClass && (
                <div className="admin-form-card">
                  <h3>Nueva clase</h3>
                  <form onSubmit={handleCreateClass}>
                    <input
                      className="admin-input"
                      type="text"
                      placeholder="Nombre de la clase"
                      value={classForm.name}
                      onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                      required
                      autoFocus
                    />
                    <input
                      className="admin-input"
                      type="text"
                      placeholder="Descripción (opcional)"
                      value={classForm.description}
                      onChange={(e) => setClassForm({ ...classForm, description: e.target.value })}
                    />
                    <div className="admin-form-actions">
                      <button type="button" className="admin-cancel-btn" onClick={() => setShowCreateClass(false)}>Cancelar</button>
                      <button type="submit" className="admin-submit-btn">Crear</button>
                    </div>
                  </form>
                </div>
              )}

              <div className="admin-list">
                {classes.map((cls) => (
                  <div key={cls.id} className="admin-card">
                    {editingClass?.id === cls.id ? (
                      <form onSubmit={handleUpdateClass} className="admin-edit-form">
                        <input
                          className="admin-input"
                          type="text"
                          value={classForm.name}
                          onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                          required
                          autoFocus
                        />
                        <input
                          className="admin-input"
                          type="text"
                          value={classForm.description}
                          onChange={(e) => setClassForm({ ...classForm, description: e.target.value })}
                        />
                        <div className="admin-form-actions">
                          <button type="button" className="admin-cancel-btn" onClick={() => setEditingClass(null)}>Cancelar</button>
                          <button type="submit" className="admin-submit-btn">Guardar</button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="admin-card-info">
                          <h3>{cls.name}</h3>
                          {cls.description && <p>{cls.description}</p>}
                        </div>
                        <div className="admin-card-actions">
                          <button
                            className="admin-icon-btn"
                            onClick={() => {
                              setEditingClass(cls);
                              setClassForm({ name: cls.name, description: cls.description || '' });
                            }}
                            title="Editar"
                          >
                            <FiEdit3 size={16} />
                          </button>
                          <button
                            className="admin-icon-btn"
                            onClick={() => {
                              setShowAddMember(cls.id);
                              loadClassMembers(cls.id);
                            }}
                            title="Añadir miembro"
                          >
                            <FiUserPlus size={16} />
                          </button>
                          <button
                            className="admin-icon-btn danger"
                            onClick={() => handleDeleteClass(cls.id)}
                            title="Eliminar"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </>
                    )}

                    {/* Miembros */}
                    {classMembers[cls.id] && (
                      <div className="admin-members">
                        <h4>Miembros</h4>
                        {classMembers[cls.id].map((m) => {
                          const u = users.find((u) => u.id === m.userId);
                          return (
                            <div key={m.id} className="admin-member-row">
                              <span className="admin-member-name">{u?.fullName || m.userId.substring(0, 8)}</span>
                              <span className={`admin-member-role ${m.role}`}>{m.role}</span>
                              <button
                                className="admin-member-remove"
                                onClick={() => handleRemoveMember(cls.id, m.userId)}
                              >
                                <FiX size={12} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Modal añadir miembro */}
                    {showAddMember === cls.id && (
                      <div className="admin-form-card">
                        <h3>Añadir miembro</h3>
                        <form onSubmit={handleAddMember}>
                          <select
                            className="admin-input"
                            value={memberForm.userId}
                            onChange={(e) => setMemberForm({ ...memberForm, userId: e.target.value })}
                            required
                          >
                            <option value="">Seleccionar usuario</option>
                            {users.filter(u => u.role !== 'admin').map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.fullName} ({u.role})
                              </option>
                            ))}
                          </select>
                          <select
                            className="admin-input"
                            value={memberForm.role}
                            onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                          >
                            <option value="student">Estudiante</option>
                            <option value="teacher">Profesor</option>
                          </select>
                          <div className="admin-form-actions">
                            <button type="button" className="admin-cancel-btn" onClick={() => setShowAddMember(null)}>Cancelar</button>
                            <button type="submit" className="admin-submit-btn">Añadir</button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          ) : (

            /* ── Gestión de usuarios ── */
            <div className="admin-section">
              <div className="admin-section-header">
                <h2>Usuarios ({users.length})</h2>
                <button className="admin-add-btn" onClick={() => setShowCreateUser(true)}>
                  <FiPlus size={16} />
                  <span>Nuevo usuario</span>
                </button>
              </div>

              {showCreateUser && (
                <div className="admin-form-card">
                  <h3>Nuevo usuario</h3>
                  <form onSubmit={handleCreateUser}>
                    <input
                      className="admin-input"
                      type="text"
                      placeholder="Nombre completo"
                      value={userForm.fullName}
                      onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                      required
                      autoFocus
                    />
                    <input
                      className="admin-input"
                      type="email"
                      placeholder="Correo electrónico"
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      required
                    />
                    <input
                      className="admin-input"
                      type="password"
                      placeholder="Contraseña"
                      value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      required
                      minLength={6}
                    />
                    <select
                      className="admin-input"
                      value={userForm.role}
                      onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    >
                      <option value="student">Estudiante</option>
                      <option value="teacher">Profesor</option>
                    </select>
                    <div className="admin-form-actions">
                      <button type="button" className="admin-cancel-btn" onClick={() => setShowCreateUser(false)}>Cancelar</button>
                      <button type="submit" className="admin-submit-btn">Crear</button>
                    </div>
                  </form>
                </div>
              )}

              <div className="admin-list">
                {users.filter(u => u.role !== 'admin').map((u) => (
                  <div key={u.id} className="admin-card">
                    <div className="admin-card-info">
                      <h3>{u.fullName}</h3>
                      <p>{u.email}</p>
                    </div>
                    <div className="admin-card-right">
                      <span className={`admin-user-role ${u.role}`}>{u.role}</span>
                      <button
                        className="admin-icon-btn danger"
                        onClick={() => handleDeleteUser(u.id)}
                        title="Eliminar"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}