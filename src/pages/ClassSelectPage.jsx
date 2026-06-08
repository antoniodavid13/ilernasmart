import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useClass } from '../context/ClassContext';
import { classesAPI } from '../services/api';
import { FiLogOut, FiUsers } from 'react-icons/fi';
import '../styles/pages/ClassSelectPage.css';

export default function ClassSelectPage() {
  const { user, logout } = useAuth();
  const { selectClass } = useClass();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const res = await classesAPI.getMy();
      setClasses(res.data);
    } catch (err) {
      console.error('Error cargando clases:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (cls) => {
    selectClass(cls);
    navigate('/home');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="classselect-page">
      <header className="classselect-header">
        <h1 className="classselect-logo">ILERNA</h1>
        <button className="classselect-logout" onClick={handleLogout}>
          <FiLogOut size={18} />
        </button>
      </header>

      <main className="classselect-main">
        <div className="classselect-welcome">
          <h2>Bienvenido, {user?.fullName}</h2>
          <p>Selecciona una clase para continuar</p>
        </div>

        {loading ? (
          <div className="classselect-loading">
            <div className="home-spinner"></div>
          </div>
        ) : classes.length === 0 ? (
          <div className="classselect-empty">
            <FiUsers size={48} />
            <p>No tienes clases asignadas</p>
            <p className="classselect-empty-sub">Contacta con el administrador</p>
          </div>
        ) : (
          <div className="classselect-grid">
            {classes.map((cls, index) => (
              <button
                key={cls.id}
                className="classselect-card"
                onClick={() => handleSelect(cls)}
              >
                <div className="classselect-card-icon">
                  {cls.name.charAt(0).toUpperCase()}
                </div>
                <h3>{cls.name}</h3>
                {cls.description && <p>{cls.description}</p>}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}