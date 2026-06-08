import axios from 'axios';

const API_BASE = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});
export const ServiceErrorType = {
  SERVICE_DOWN: 'SERVICE_DOWN',
  NO_CONNECTION: 'NO_CONNECTION',
  TIMEOUT: 'TIMEOUT',
  NO_INTERNET: 'NO_INTERNET',
};

const getServiceName = (path) => {
  if (!path) return 'API Gateway (puerto 8080)';
  if (path.startsWith('/api/auth') || path.startsWith('/api/users')) {
    return 'Auth Service (puerto 8081)';
  }
  if (path.startsWith('/api/subjects') || path.startsWith('/api/enrollments') || path.startsWith('/api/classes')) {
    return 'Subject Service (puerto 8082)';
  }
  if (path.startsWith('/api/documents')) {
    return 'Document Service (puerto 8083)';
  }
  if (path.startsWith('/api/tests') || path.startsWith('/api/repaso')) {
    return 'Test Service (puerto 8084)';
  }
  return 'API Gateway (puerto 8080)';
};

let onGlobalServiceError = null;
export const registerErrorListener = (callback) => {
  onGlobalServiceError = callback;
};

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
  getUsers: () => api.get('/api/users'),
  deleteUser: (id) => api.delete(`/api/users/${id}`),
  getUserById: (id) => api.get(`/api/users/${id}`),

};

// ── Subjects ─────────────────────────────────────────
export const subjectsAPI = {
  getAll: () => api.get('/api/subjects'),
  getById: (id) => api.get(`/api/subjects/${id}`),
  getByTeacher: (teacherId) => api.get(`/api/subjects/teacher/${teacherId}`),
  create: (data) => api.post('/api/subjects', data),
  update: (id, data) => api.put(`/api/subjects/${id}`, data),
  delete: (id) => api.delete(`/api/subjects/${id}`),
  getByClass: (classId) => api.get(`/api/subjects/class/${classId}`),
};

// ── Enrollments ──────────────────────────────────────
export const enrollmentsAPI = {
  enroll: (subjectId) => api.post('/api/enrollments', { subjectId }),
  unenroll: (subjectId) => api.delete(`/api/enrollments/${subjectId}`),
  getMy: () => api.get('/api/enrollments/my'),
  getBySubject: (subjectId) => api.get(`/api/enrollments/subject/${subjectId}`),
};

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
  getMyStats: () => api.get('/api/tests/my-stats'),
  getMyGrades: () => api.get('/api/tests/my-grades'),
  getSubmissionsByDocument: (documentId) => api.get(`/api/tests/submissions/document/${documentId}`),
  getSubmissionDetail: (submissionId) => api.get(`/api/tests/submissions/${submissionId}/detail`),
  updateScore: (submissionId, score) => api.put(`/api/tests/submissions/${submissionId}/score`, { score }),
  getFeedback: (submissionId) => api.post(`/api/tests/submissions/${submissionId}/feedback`),
  getSubmissionsByStudentAndSubject: (studentId, subjectId) => 
  api.get(`/api/tests/submissions/student/${studentId}/subject/${subjectId}`),
};

// ── Classes ─────────────────────────────────────────────
export const classesAPI = {
  getAll: () => api.get('/api/classes'),
  getById: (id) => api.get(`/api/classes/${id}`),
  getMy: () => api.get('/api/classes/my'),
  create: (data) => api.post('/api/classes', data),
  update: (id, data) => api.put(`/api/classes/${id}`, data),
  delete: (id) => api.delete(`/api/classes/${id}`),
  getMembers: (classId) => api.get(`/api/classes/${classId}/members`),
  addMember: (classId, userId, role) => api.post(`/api/classes/${classId}/members`, { userId, role }),
  removeMember: (classId, userId) => api.delete(`/api/classes/${classId}/members/${userId}`),
};

export const repasoAPI = {
  getStats: () => api.get('/api/repaso/stats'),
  getBySubject: () => api.get('/api/repaso/subjects'),
  getStatsBySubject: (subjectId) => api.get(`/api/repaso/stats/${subjectId}`),
  generate: (subjectId) => api.post(`/api/repaso/generate${subjectId ? `?subjectId=${subjectId}` : ''}`),
  submit: (answers) => api.post('/api/repaso/submit', answers),
};


// ── Repaso ───────────────────────────────────────────────
export const getRepaso = () =>
  api.get('/api/repaso').then(res => res.data);




export default api;
