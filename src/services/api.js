import axios from 'axios';

const API_BASE = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para refresh token automático
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE}/api/auth/refresh`, {
            refreshToken,
          });
          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/login';
        }
      } else {
        localStorage.clear();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// ── Auth ─────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  me: () => api.get('/api/auth/me'),
  updateProfile: (data) => api.put('/api/auth/me', data),
};

// ── Subjects ─────────────────────────────────────────
export const subjectsAPI = {
  getAll: () => api.get('/api/subjects'),
  getById: (id) => api.get(`/api/subjects/${id}`),
  getByTeacher: (teacherId) => api.get(`/api/subjects/teacher/${teacherId}`),
  create: (data) => api.post('/api/subjects', data),
  update: (id, data) => api.put(`/api/subjects/${id}`, data),
  delete: (id) => api.delete(`/api/subjects/${id}`),
};

// ── Enrollments ──────────────────────────────────────
export const enrollmentsAPI = {
  enroll: (subjectId) => api.post('/api/enrollments', { subjectId }),
  unenroll: (subjectId) => api.delete(`/api/enrollments/${subjectId}`),
  getMy: () => api.get('/api/enrollments/my'),
  getBySubject: (subjectId) => api.get(`/api/enrollments/subject/${subjectId}`),
};

// ── Documents ────────────────────────────────────────
// ── Documents ────────────────────────────────────
export const documentsAPI = {
  getBySubject: (subjectId) => api.get(`/api/documents/subject/${subjectId}`),
  getById: (id) => api.get(`/api/documents/${id}`),
  getChunks: (id) => api.get(`/api/documents/${id}/chunks`),
  upload: (title, subjectId, topicId, subtopicId, file) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('subjectId', subjectId);
    if (topicId) formData.append('topicId', topicId);
    if (subtopicId) formData.append('subtopicId', subtopicId);
    formData.append('file', file);
    return api.post('/api/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id) => api.delete(`/api/documents/${id}`),
  // Topics
  getTopics: (subjectId) => api.get(`/api/documents/topics/subject/${subjectId}`),
  createTopic: (subjectId, name) => api.post('/api/documents/topics', { subjectId, name }),
  deleteTopic: (topicId) => api.delete(`/api/documents/topics/${topicId}`),
  // Subtopics
  createSubtopic: (topicId, name) => api.post('/api/documents/subtopics', { topicId, name }),
};

// ── Tests ────────────────────────────────────────────
export const testsAPI = {
  generate: (documentId) => api.post(`/api/tests/generate/${documentId}`),
  submit: (data) => api.post('/api/tests/submit', data),
  getMyResults: () => api.get('/api/tests/my-results'),
};


export default api;
