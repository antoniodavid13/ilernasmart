import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useClass } from '../../context/ClassContext';
import { FiUser, FiBook, FiAward, FiLogOut, FiX, FiSun, FiMoon, FiRefreshCw, FiShield, FiRotateCcw } from 'react-icons/fi';
import '../../styles/components/Sidebar.css';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const { activeClass, clearClass } = useClass();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    clearClass();
    navigate('/login');
    onClose();
  };

  const handleChangeClass = () => {
    clearClass();
    navigate('/select-class');
    onClose();
  };

  const navItems = [
    { path: '/profile', icon: <FiUser />, label: 'Perfil' },
    { path: '/home', icon: <FiBook />, label: 'Asignaturas' },
    { path: '/grades', icon: <FiAward />, label: 'Calificaciones' },
  ];

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <h2 className="sidebar-logo">ILERNA</h2>
          <button className="sidebar-close" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        <div className="sidebar-user-section">
          <div className="sidebar-avatar">
            {user?.fullName?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user?.fullName}</span>
            {activeClass && (
              <span className="sidebar-class-name">{activeClass.name}</span>
            )}
          </div>
        </div>

        <nav className="sidebar-nav">
          {user?.role === 'admin' && (
            <button
              className={`sidebar-nav-item ${location.pathname === '/admin' ? 'active' : ''}`}
              onClick={() => handleNav('/admin')}
            >
              <FiShield />
              <span>Panel Admin</span>
            </button>
          )}
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`sidebar-nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => handleNav(item.path)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
          {user?.role === 'student' && (
            <button
              className={`sidebar-nav-item ${location.pathname === '/repaso' ? 'active' : ''}`}
              onClick={() => handleNav('/repaso')}
            >
              <FiRotateCcw />
              <span>Repaso</span>
            </button>
          )}
          {user?.role === 'teacher' && (
            <button className="sidebar-nav-item" onClick={handleChangeClass}>
              <FiRefreshCw />
              <span>Cambiar clase</span>
            </button>
          )}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-bottom-row">
            <button className="sidebar-logout-btn" onClick={handleLogout}>
              <FiLogOut />
              <span>Cerrar sesión</span>
            </button>
            <button className="sidebar-theme-toggle" onClick={toggleDarkMode} title={darkMode ? 'Modo claro' : 'Modo oscuro'}>
              {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}