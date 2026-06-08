import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/pages/SplashPage.css';

export default function SplashPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/home');
        }
      } else {
        navigate('/login');
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [user, navigate]);

  return (
    <div className="splash-page">
      <div className="splash-bg">
        <div className="splash-block block-1"></div>
        <div className="splash-block block-2"></div>
        <div className="splash-block block-3"></div>
        <div className="splash-block block-4"></div>
        <div className="splash-block block-5"></div>
        <div className="splash-block block-6"></div>
        <div className="splash-block block-7"></div>
        <div className="splash-block block-8"></div>
      </div>
      <div className="splash-content">
        <h1 className="splash-title">
          <span className="splash-ilerna">ILERNA</span>
          <span className="splash-smart">Smart</span>
        </h1>
        <div className="splash-loader">
          <div className="splash-loader-bar"></div>
        </div>
      </div>
    </div>
  );
}
