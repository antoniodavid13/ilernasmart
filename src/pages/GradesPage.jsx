import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useClass } from '../context/ClassContext';
import { testsAPI, subjectsAPI, documentsAPI, classesAPI, authAPI, enrollmentsAPI } from '../services/api';import Sidebar from '../components/layout/Sidebar';
import { FiMenu, FiAward, FiChevronDown, FiChevronUp, FiEye, FiUser, FiWifiOff  } from 'react-icons/fi';
import '../styles/pages/GradesPage.css';

export default function GradesPage() {
  const { user } = useAuth();
  const { getSubjectColor } = useTheme();
  const { activeClass } = useClass();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [networkError, setNetworkError] = useState(false);

  // Estudiante
  const [grades, setGrades] = useState([]);
  const [docNames, setDocNames] = useState({});
  const [expandedDoc, setExpandedDoc] = useState(null);

  // Profesor
  const [subjects, setSubjects] = useState([]);
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [subjectStudents, setSubjectStudents] = useState({});
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [studentSubmissions, setStudentSubmissions] = useState({});
  const [studentNames, setStudentNames] = useState({});

  useEffect(() => {
    if (user?.role === 'student') loadStudentGrades();
    if (user?.role === 'teacher' || user?.role === 'admin') loadTeacherData();
  }, [user]);

  // ── Estudiante ──────────────────────────────────────────────────────────────

  const loadStudentGrades = async () => {
    try {
      const res = await testsAPI.getMyGrades();
      setGrades(res.data);

      const names = {};
      const topicCache = {};

      for (const grade of res.data) {
        try {
          const docRes = await documentsAPI.getById(grade.documentId);
          const doc = docRes.data;
          let topicName = '';

          if (doc.topicId && doc.subjectId) {
            if (!topicCache[doc.subjectId]) {
              try {
                const topicsRes = await documentsAPI.getTopics(doc.subjectId);
                topicCache[doc.subjectId] = topicsRes.data;
              } catch (e) {}
            }
            const topics = topicCache[doc.subjectId] || [];
            const topic = topics.find((t) => t.id === doc.topicId);
            if (topic) topicName = topic.name;
          }
          names[grade.documentId] = { title: doc.title, topicName };
        } catch (e) {
          names[grade.documentId] = { title: 'Documento', topicName: '' };
        }
      }
      setDocNames(names);
      } catch (err) {
        if (!err.response || err.response.status >= 500) {
          setNetworkError(true);
        }
        console.error('Error cargando calificaciones:', err);
      } finally {
        setLoading(false);
      }
  };

  // ── Profesor ────────────────────────────────────────────────────────────────

  const loadTeacherData = async () => {
    try {
      let subjectsData = [];
      if (activeClass) {
        const res = await subjectsAPI.getByClass(activeClass.id);
        subjectsData = res.data;
      } else {
        const res = await subjectsAPI.getByTeacher(user.id);
        subjectsData = res.data;
      }
      setSubjects(subjectsData);
      } catch (err) {
        if (!err.response) {
          setNetworkError(true);
        }
        console.error('Error cargando asignaturas:', err);
      } finally {
        setLoading(false);
      }
  };

  const loadSubjectStudents = async (subjectId) => {
    if (subjectStudents[subjectId]) return;
    try {
      // Obtener alumnos matriculados en la asignatura
      const res = await enrollmentsAPI.getBySubject(subjectId);
      const enrollments = res.data;

      // Filtrar por alumnos de la clase activa si existe
      let students = enrollments;
      if (activeClass) {
        const membersRes = await classesAPI.getMembers(activeClass.id);
        const classStudentIds = new Set(
          membersRes.data.filter(m => m.role === 'student').map(m => m.userId)
        );
        students = enrollments.filter(e => classStudentIds.has(e.studentId));
      }

      setSubjectStudents(prev => ({ ...prev, [subjectId]: students }));

      // Obtener nombres de alumnos
      for (const enrollment of students) {
        if (!studentNames[enrollment.studentId]) {
          try {
            const userRes = await authAPI.getUserById(enrollment.studentId);
            setStudentNames(prev => ({
              ...prev,
              [enrollment.studentId]: userRes.data.fullName || userRes.data.email
            }));
          } catch (e) {
            setStudentNames(prev => ({
              ...prev,
              [enrollment.studentId]: enrollment.studentId.substring(0, 8)
            }));
          }
        }
      }
    } catch (err) {
      console.error('Error cargando alumnos:', err);
    }
  };

  const loadStudentSubmissions = async (studentId, subjectId) => {
    const key = `${studentId}-${subjectId}`;
    if (studentSubmissions[key]) return;
    try {
      const res = await testsAPI.getSubmissionsByStudentAndSubject(studentId, subjectId);
      setStudentSubmissions(prev => ({ ...prev, [key]: res.data }));
    } catch (err) {
      console.error('Error cargando submissions del alumno:', err);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-content">
        <header className="grades-header">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
            <FiMenu size={22} />
          </button>
          <h1 className="grades-title">
            Calificaciones
            {activeClass && user?.role === 'teacher' && (
              <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', marginLeft: 8, fontWeight: 500 }}>
                · {activeClass.name}
              </span>
            )}
          </h1>
          <div style={{ width: 36 }} />
        </header>

        <main className="grades-main">
        {loading ? (
          <div className="grades-loading">
            <div className="home-spinner"></div>
            <p>Cargando calificaciones...</p>
          </div>
            ) : networkError ? (
              <div className="grades-empty">
                <FiWifiOff size={48} color="#EF4444" />
                <p style={{ color: '#EF4444', fontWeight: 600 }}>Error al cargar las calificaciones</p>
                <p style={{ fontSize: '13px', color: '#9CA3AF' }}>
                  El servidor devolvió un error. Comprueba que los microservicios funcionan correctamente.
                </p>
                <button>Reintentar</button>
              </div>
        ) : user?.role === 'student' ? (

            /* ── Vista estudiante ── */
            grades.length === 0 ? (
              <div className="grades-empty">
                <FiAward size={48} />
                <p>No tienes calificaciones aún</p>
              </div>
            ) : (
              <div className="grades-list">
                {grades.map((grade) => (
                  <div key={grade.documentId} className="grades-card">
                    <button
                      className="grades-card-header"
                      onClick={() => setExpandedDoc(expandedDoc === grade.documentId ? null : grade.documentId)}
                    >
                      <div className="grades-card-info">
                        <h3>
                          {docNames[grade.documentId]?.topicName && (
                            <span className="grades-topic-name">{docNames[grade.documentId].topicName} › </span>
                          )}
                          {docNames[grade.documentId]?.title || 'Documento'}
                        </h3>
                        <span className="grades-card-meta">
                          {grade.totalAttempts} intento{grade.totalAttempts > 1 ? 's' : ''} · Mejor: {grade.bestScore}/10
                        </span>
                      </div>
                      <div className="grades-card-score">
                        <span className="grades-score-number">{grade.averageScore}</span>
                        <span className="grades-score-label">media</span>
                      </div>
                      {expandedDoc === grade.documentId ? <FiChevronUp /> : <FiChevronDown />}
                    </button>

                    {expandedDoc === grade.documentId && (
                      <div className="grades-card-details">
                        {grade.attempts?.map((attempt, i) => (
                          <div key={attempt.submissionId} className="grades-attempt">
                            <span className="grades-attempt-number">Intento {i + 1}</span>
                            <span className="grades-attempt-date">
                              {new Date(attempt.completedAt).toLocaleDateString('es-ES')}
                            </span>
                            <span className={`grades-attempt-score ${attempt.score >= 5 ? 'pass' : 'fail'}`}>
                              {attempt.score}/10
                            </span>
                            <button
                              className="grades-view-btn"
                              onClick={() => navigate(`/submission/${attempt.submissionId}`)}
                              title="Ver detalle"
                            >
                              <FiEye size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )

          ) : (

            /* ── Vista profesor ── */
            subjects.length === 0 ? (
              <div className="grades-empty">
                <FiAward size={48} />
                <p>No hay asignaturas en esta clase</p>
              </div>
            ) : (
              <div className="grades-list">
                {subjects.map((subject, sIndex) => (
                  <div key={subject.id} className="grades-card">
                    {/* Cabecera asignatura */}
                    <button
                      className="grades-card-header"
                      onClick={() => {
                        const isExpanded = expandedSubject === subject.id;
                        setExpandedSubject(isExpanded ? null : subject.id);
                        if (!isExpanded) loadSubjectStudents(subject.id);
                      }}
                    >
                      <div className="grades-card-color" style={{ background: getSubjectColor(sIndex) }} />
                      <div className="grades-card-info">
                        <h3>{subject.name}</h3>
                      </div>
                      {expandedSubject === subject.id ? <FiChevronUp /> : <FiChevronDown />}
                    </button>

                    {/* Lista de alumnos */}
                    {expandedSubject === subject.id && (
                      <div className="grades-card-details">
                        {(subjectStudents[subject.id] || []).length === 0 ? (
                          <p className="grades-no-subs">Sin alumnos matriculados</p>
                        ) : (
                          (subjectStudents[subject.id] || []).map((enrollment) => {
                            const studentKey = `${enrollment.studentId}-${subject.id}`;
                            const isStudentExpanded = expandedStudent === studentKey;
                            const subs = studentSubmissions[studentKey] || [];

                            return (
                              <div key={enrollment.studentId} className="grades-doc-section">
                                {/* Cabecera alumno */}
                                <button
                                  className="grades-doc-header grades-student-header"
                                  onClick={() => {
                                    setExpandedStudent(isStudentExpanded ? null : studentKey);
                                    if (!isStudentExpanded) loadStudentSubmissions(enrollment.studentId, subject.id);
                                  }}
                                >
                                  <div className="grades-student-info">
                                    <div className="grades-student-avatar">
                                      <FiUser size={12} />
                                    </div>
                                    <span>{studentNames[enrollment.studentId] || enrollment.studentId.substring(0, 8)}</span>
                                  </div>
                                  {isStudentExpanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                                </button>

                                {/* Tests del alumno */}
                                {isStudentExpanded && (
                                  <div className="grades-submissions">
                                    {subs.length === 0 ? (
                                      <p className="grades-no-subs">Sin tests realizados</p>
                                    ) : (
                                      subs.map((sub) => (
                                        <div key={sub.submissionId} className="grades-submission-row">
                                          <span className="grades-sub-student" style={{ flex: 1 }}>
                                            {sub.documentTitle || 'Documento'}
                                          </span>
                                          <span className="grades-sub-date">
                                            {new Date(sub.completedAt).toLocaleDateString('es-ES')}
                                          </span>
                                          <div className="grades-sub-score-row">
                                            <span className={`grades-attempt-score ${sub.score >= 5 ? 'pass' : 'fail'}`}>
                                              {sub.score}/10
                                            </span>
                                            <button
                                              className="grades-view-btn"
                                              onClick={() => navigate(`/submission/${sub.submissionId}`)}
                                              title="Ver detalle"
                                            >
                                              <FiEye size={14} />
                                            </button>
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
}