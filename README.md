# IlernaSmart Web — Frontend React

Aplicación web de la plataforma educativa IlernaSmart. Interfaz para estudiantes, profesores y administradores que permite gestionar asignaturas, documentos, tests y el módulo de repaso inteligente con IA.

## Tecnologías

- React 18
- Vite
- React Router v6
- Axios
- Lucide React (iconos)
- React Icons
- CSS modular

## Funcionalidad por rol

### Estudiante
- Consultar asignaturas matriculadas
- Ver documentos por temas y subtemas
- Realizar tests generados por IA
- Ver calificaciones e historial de intentos
- Módulo de repaso inteligente adaptado a sus fallos

### Profesor
- Gestionar asignaturas y clases
- Crear temas y subir documentos PDF
- Consultar calificaciones de sus alumnos por asignatura
- Ver detalle de cada intento de sus alumnos

### Administrador
- Gestión completa de usuarios, clases y asignaturas
- Panel de administración

## Estructura del proyecto

```
src/
├── api/
│   └── api.js              # Cliente Axios, interceptores y métodos API
├── context/
│   ├── AuthContext.jsx      # Contexto de autenticación
│   ├── ThemeContext.jsx     # Contexto de tema y colores
│   └── ClassContext.jsx     # Contexto de clase activa
├── pages/
│   ├── LoginPage.jsx
│   ├── HomePage.jsx
│   ├── SubjectPage.jsx
│   ├── DocumentViewerPage.jsx
│   ├── TestPage.jsx
│   ├── GradesPage.jsx
│   ├── ProfilePage.jsx
│   ├── RepasoPage.jsx
│   ├── RepasoSubjectPage.jsx
│   ├── RepasoTestPage.jsx
│   ├── AdminPage.jsx
│   ├── ClassSelectPage.jsx
│   └── ServiceDownScreen.jsx  # Pantalla de error por microservicio caído
├── components/
│   └── layout/
│       └── Sidebar.jsx
└── styles/
    ├── global.css
    └── pages/
```

## Configuración

La URL base de la API apunta al API Gateway:

```js
// src/api/api.js
const API_BASE = 'http://localhost:8080';
```

## Requisitos previos

- Node.js 18+
- npm 9+
- API Gateway en marcha en el puerto 8080

## Instalación y arranque

```bash
# Clonar el repositorio
git clone https://github.com/antoniodavid13/ilernasmart.git
cd ilernasmart

# Instalar dependencias
npm install

# Arrancar en modo desarrollo
npm run dev
```

La aplicación arranca en `http://localhost:5173`.

## Compilar para producción

```bash
npm run build
```

## Gestión de errores de red

La aplicación detecta automáticamente cuando un microservicio no está disponible y muestra una pantalla de error personalizada indicando qué servicio ha fallado, el código HTTP recibido y sugerencias para resolverlo. Al pulsar "Reintentar" se limpia el error y se puede volver a usar la app.

## Autenticación

El token JWT se almacena en `localStorage` bajo la clave `accessToken`. Todos los interceptores de Axios lo añaden automáticamente en la cabecera `Authorization: Bearer <token>` de cada petición.
