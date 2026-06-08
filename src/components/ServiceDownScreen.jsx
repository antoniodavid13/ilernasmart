import React from 'react';
import { ServiceErrorType } from '../utils/serviceMapper';

// Configuración visual única para cada tipo de error
const errorDesigns = {
  [ServiceErrorType.SERVICE_DOWN]: {
    cardBg: '#FFF5F5',
    accentColor: '#E53E3E',
    textColor: '#9B2C2C',
    icon: '⚙️',
    title: 'Módulo en Mantenimiento',
    subtitle: 'El microservicio asignado a esta sección se encuentra caído o fuera de línea.',
    actionText: 'Reintentar Conexión',
    showMicroservice: true,
    showTechDetails: true,
  },
  [ServiceErrorType.NO_CONNECTION]: {
    cardBg: '#F0F4F8',
    accentColor: '#3182CE',
    textColor: '#2B6CB0',
    icon: '🔌',
    title: 'Fallo de Enlace General',
    subtitle: 'No se puede establecer contacto con el API Gateway principal de la aplicación.',
    actionText: 'Comprobar Enlace',
    showMicroservice: false,
    showTechDetails: true,
  },
  [ServiceErrorType.TIMEOUT]: {
    cardBg: '#FFFAF0',
    accentColor: '#DD6B20',
    textColor: '#9C4221',
    icon: '⏳',
    title: 'Tiempo de Espera Agotado',
    subtitle: 'El servidor está tardando demasiado en responder. Es posible que esté saturado.',
    actionText: 'Volver a Intentar',
    showMicroservice: true,
    showTechDetails: false,
  },
  [ServiceErrorType.NO_INTERNET]: {
    cardBg: '#F7FAFC',
    accentColor: '#4A5568',
    textColor: '#2D3748',
    icon: '🌐',
    title: 'Sin Conexión a Internet',
    subtitle: 'Comprueba tu estado de red, Wi-Fi o datos móviles antes de continuar.',
    actionText: 'Verificar Red Local',
    showMicroservice: false,
    showTechDetails: false,
  }
};

export const ServiceDownScreen = ({ error, onRetry }) => {
  const design = errorDesigns[error.errorType] || {
    cardBg: '#FFFFFF',
    accentColor: '#718096',
    textColor: '#1A202C',
    icon: '⚠️',
    title: 'Error de Red Desconocido',
    subtitle: 'Ocurrió un problema inesperado de comunicación con los servicios.',
    actionText: 'Reintentar',
    showMicroservice: true,
    showTechDetails: true
  };

  return (
    <div style={styles.overlay}>
      <div style={{ 
        ...styles.card, 
        backgroundColor: design.cardBg, 
        borderTop: `8px solid ${design.accentColor}` 
      }}>
        
        {/* Icono animado/personalizado por error */}
        <div style={{ ...styles.iconContainer, color: design.accentColor }}>
          {design.icon}
        </div>

        {/* Título y descripción */}
        <h2 style={{ ...styles.title, color: design.textColor }}>{design.title}</h2>
        <p style={styles.subtitle}>{design.subtitle}</p>

        {/* Muestra el microservicio afectado (Solo si aplica) */}
        {design.showMicroservice && (
          <div style={{ ...styles.badge, backgroundColor: `${design.accentColor}1C`, color: design.accentColor }}>
            Servicio: {error.serviceName}
          </div>
        )}

        {/* Caja técnica con códigos HTTP (Opcional según el error) */}
        {design.showTechDetails && (
          <div style={styles.techBox}>
            <p style={styles.techText}><strong>Código Interno:</strong> {error.errorType}</p>
            {error.errorCode > 0 && <p style={styles.techText}><strong>Status HTTP:</strong> {error.errorCode}</p>}
          </div>
        )}

        <p style={styles.message}>"{error.message}"</p>

        {/* Botón adaptado al color corporativo del error */}
        <button 
          style={{ ...styles.button, backgroundColor: design.accentColor }} 
          onClick={onRetry}
          onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(0.9)'}
          onMouseOut={(e) => e.currentTarget.style.filter = 'none'}
        >
          {design.actionText}
        </button>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    backgroundColor: 'rgba(23, 25, 35, 0.9)', backdropFilter: 'blur(5px)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999999,
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  card: {
    padding: '2.5rem 2rem', borderRadius: '16px', maxWidth: '460px', width: '90%',
    textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)', transition: 'all 0.3s ease'
  },
  iconContainer: { fontSize: '4.5rem', marginBottom: '0.75rem', lineHeight: '1' },
  title: { margin: '0 0 0.5rem 0', fontSize: '1.6rem', fontWeight: '700' },
  subtitle: { color: '#4A5568', fontSize: '0.95rem', lineHeight: '1.45', margin: '0 0 1.5rem 0' },
  badge: { padding: '0.4rem 1rem', borderRadius: '9999px', fontWeight: '600', fontSize: '0.85rem', display: 'inline-block', marginBottom: '1.25rem' },
  techBox: { backgroundColor: 'rgba(255,255,255,0.6)', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.6rem 0.8rem', marginBottom: '1rem', textAlign: 'left' },
  techText: { margin: '0', fontSize: '0.75rem', color: '#718096', lineHeight: '1.4' },
  message: { color: '#718096', fontStyle: 'italic', fontSize: '0.85rem', marginBottom: '1.5rem' },
  button: { color: '#FFFFFF', border: 'none', padding: '0.75rem 2rem', borderRadius: '8px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', width: '100%', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', transition: 'filter 0.2s' }
};