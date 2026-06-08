
import { WifiOff, CloudOff, Clock, Wrench, RefreshCw, Info } from 'lucide-react';
import { ServiceErrorType } from '../services/api';

const errorConfig = {
  [ServiceErrorType.NO_INTERNET]: {
    icon: WifiOff,
    color: '#6B7280',
    bg: '#F3F4F6',
    title: 'Sin conexión a internet',
    subtitle: 'No se detecta conexión de red en el dispositivo.',
    hint: 'Comprueba que tienes WiFi o datos activos e inténtalo de nuevo.',
  },
  [ServiceErrorType.NO_CONNECTION]: {
    icon: CloudOff,
    color: '#EF4444',
    bg: '#FEF2F2',
    title: 'Servidor no disponible',
    subtitle: 'No se puede conectar con el API Gateway en el puerto 8080.',
    hint: 'Asegúrate de que el servidor está en marcha y es accesible.',
  },
  [ServiceErrorType.TIMEOUT]: {
    icon: Clock,
    color: '#F59E0B',
    bg: '#FFFBEB',
    title: 'Tiempo de espera agotado',
    subtitle: (name) => `${name} tardó demasiado en responder.`,
    hint: 'El servidor puede estar sobrecargado. Espera unos segundos e inténtalo.',
  },
  [ServiceErrorType.SERVICE_DOWN]: {
    icon: Wrench,
    color: '#EF4444',
    bg: '#FEF2F2',
    title: 'Microservicio caído',
    subtitle: (name, code) => `${name} no está disponible (Error ${code}).`,
    hint: 'Este microservicio no está en marcha. Arráncalo desde tu entorno de desarrollo.',
  },
};

export default function ServiceDownScreen({ error, onRetry }) {
  if (!error) return null;

  const config = errorConfig[error.type] || errorConfig[ServiceErrorType.NO_CONNECTION];
  const Icon = config.icon;

  const subtitle = typeof config.subtitle === 'function'
    ? config.subtitle(error.serviceName, error.code)
    : config.subtitle;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F9FAFB',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px',
    }}>
      <div style={{
        maxWidth: '420px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        textAlign: 'center',
      }}>
        <div style={{
          width: '88px',
          height: '88px',
          borderRadius: '22px',
          backgroundColor: config.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Icon size={44} color={config.color} />
        </div>

        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: 0 }}>
          {config.title}
        </h1>

        <div style={{
          width: '100%',
          backgroundColor: config.bg,
          borderRadius: '10px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          textAlign: 'left',
        }}>
          <Info size={16} color={config.color} style={{ marginTop: '2px', flexShrink: 0 }} />
          <p style={{ fontSize: '13px', color: '#4B5563', margin: 0, lineHeight: '20px' }}>
            {subtitle}
          </p>
        </div>

        <p style={{ fontSize: '13px', color: '#9CA3AF', margin: 0, lineHeight: '20px' }}>
          {config.hint}
        </p>

        {error.code > 0 && (
          <div style={{
            backgroundColor: '#F3F4F6',
            borderRadius: '8px',
            padding: '6px 12px',
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#6B7280',
          }}>
            HTTP {error.code}
          </div>
        )}

        <button
          onClick={onRetry}
          style={{
            width: '100%',
            height: '50px',
            backgroundColor: '#2563EB',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <RefreshCw size={18} />
          Reintentar
        </button>
      </div>
    </div>
  );
}
