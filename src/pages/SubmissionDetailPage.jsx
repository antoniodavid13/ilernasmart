import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testsAPI } from '../services/api';
import Sidebar from '../components/layout/Sidebar';
import { FiArrowLeft, FiMenu, FiCheck, FiX, FiBookOpen } from 'react-icons/fi';
import '../styles/pages/SubmissionDetailPage.css';

export default function SubmissionDetailPage() {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  useEffect(() => {
    loadDetail();
  }, [submissionId]);

  const loadDetail = async () => {
    try {
      const res = await testsAPI.getSubmissionDetail(submissionId);
      setDetail(res.data);
    } catch (err) {
      console.error('Error cargando detalle:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetFeedback = async () => {
    setLoadingFeedback(true);
    try {
      const res = await testsAPI.getFeedback(submissionId);
      setFeedback(res.data);
    } catch (err) {
      console.error('Error obteniendo feedback:', err);
    } finally {
      setLoadingFeedback(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-content">
        <header className="subdetail-header">
          <button className="subdetail-back" onClick={() => navigate(-1)}>
            <FiArrowLeft size={20} />
          </button>
          <h1 className="subdetail-title">Detalle del test</h1>
          <button className="subdetail-menu" onClick={() => setSidebarOpen(true)}>
            <FiMenu size={20} />
          </button>
        </header>

        <main className="subdetail-main">
          {loading ? (
            <div className="subdetail-loading">
              <div className="home-spinner"></div>
              <p>Cargando detalle...</p>
            </div>
          ) : !detail ? (
            <div className="subdetail-loading">
              <p>No se encontró el detalle</p>
            </div>
          ) : (
            <>
              <div className="subdetail-summary">
                <div className="subdetail-score-circle">
                  <span className="subdetail-score-number">{detail.score}</span>
                  <span className="subdetail-score-total">/10</span>
                </div>
                <p className="subdetail-score-text">
                  {detail.correctAnswers} de {detail.totalQuestions} respuestas correctas
                </p>
              </div>

              {!feedback && (
                <button
                  className="subdetail-feedback-btn"
                  onClick={handleGetFeedback}
                  disabled={loadingFeedback}
                >
                  {loadingFeedback ? (
                    <>
                      <div className="subdetail-spinner"></div>
                      <span>Generando plan de estudio...</span>
                    </>
                  ) : (
                    <>
                      <FiBookOpen size={18} />
                      <span>Obtener plan de estudio personalizado</span>
                    </>
                  )}
                </button>
              )}

              {feedback && (
                <div className="subdetail-feedback">
                  <div className="subdetail-feedback-header">
                    <FiBookOpen size={20} />
                    <h3>Plan de estudio personalizado</h3>
                  </div>
                  {feedback.wrongCount === 0 ? (
                    <p className="subdetail-feedback-perfect">{feedback.feedback}</p>
                  ) : (
                    <>
                      <p className="subdetail-feedback-meta">
                        Basado en tus {feedback.wrongCount} respuesta{feedback.wrongCount > 1 ? 's' : ''} incorrecta{feedback.wrongCount > 1 ? 's' : ''}
                      </p>
                      <div className="subdetail-feedback-content">
                        {feedback.feedback}
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="subdetail-questions">
                {detail.details?.map((item, index) => (
                  <div key={item.questionId} className={`subdetail-question ${item.correct ? 'correct' : 'incorrect'}`}>
                    <div className="subdetail-question-header">
                      {item.correct ? (
                        <FiCheck className="subdetail-icon-correct" />
                      ) : (
                        <FiX className="subdetail-icon-incorrect" />
                      )}
                      <span className="subdetail-question-number">Pregunta {index + 1}</span>
                    </div>

                    <p className="subdetail-question-text">{item.questionText}</p>

                    <div className="subdetail-answers">
                      <div className="subdetail-answer-row">
                        <span className="subdetail-answer-label">Tu respuesta:</span>
                        <span className={`subdetail-answer-value ${item.correct ? 'correct' : 'incorrect'}`}>
                          {item.selectedOption}
                        </span>
                      </div>
                      {!item.correct && (
                        <div className="subdetail-answer-row">
                          <span className="subdetail-answer-label">Respuesta correcta:</span>
                          <span className="subdetail-answer-value correct">{item.correctOption}</span>
                        </div>
                      )}
                    </div>

                    {item.explanation && (
                      <p className="subdetail-explanation">{item.explanation}</p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}