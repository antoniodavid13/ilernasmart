import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FiUser, FiBook, FiAward, FiLogOut, FiX, FiSun, FiMoon } from 'react-icons/fi';
import '../../styles/components/Sidebar.css';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
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
          <span className="sidebar-user-name">{user?.fullName}</span>
        </div>

        <nav className="sidebar-nav">
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