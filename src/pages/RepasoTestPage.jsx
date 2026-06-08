import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { repasoAPI } from '../services/api';
import { FiArrowLeft, FiCheck, FiX, FiAward } from 'react-icons/fi';
import '../styles/pages/TestPage.css';

export default function RepasoTestPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const failedQuestions = state?.questions || [];

  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  if (!failedQuestions.length) {
    return (
      <div className="test-page">
        <div className="test-loading">
          <p>No hay preguntas de repaso disponibles.</p>
          <button className="result-btn-back" onClick={() => navigate('/repaso')}>
            Volver al repaso
          </button>
        </div>
      </div>
    );
  }

  const selectAnswer = (questionId, optionId) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const answers = failedQuestions.map(q => ({
        questionId: q.questionId,
        selectedOptionId: selectedAnswers[q.questionId] || '',
      }));
      const res = await repasoAPI.submit(answers);
      setResult(res.data);
    } catch (err) {
      console.error('Error enviando repaso:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const allAnswered = failedQuestions.length === Object.keys(selectedAnswers).length;

  if (result) {
    return (
      <div className="test-page">
        <div className="test-result">
          <div className="result-header">
            <FiAward size={48} className="result-icon" />
            <h2>Repaso completado</h2>
            <div className="result-score">
              <span className="result-score-number">{result.score}</span>
              <span className="result-score-total">/10</span>
            </div>
            <p className="result-summary">
              {result.correctAnswers} de {result.totalQuestions} preguntas correctas
            </p>
          </div>

          <div className="result-details">
            {result.details?.map((detail, index) => (
              <div key={index} className={`result-item ${detail.isCorrect ? 'correct' : 'incorrect'}`}>
                <div className="result-item-header">
                  {detail.isCorrect
                    ? <FiCheck className="result-correct" />
                    : <FiX className="result-incorrect" />}
                  <span className="result-item-number">Pregunta {index + 1}</span>
                </div>
                <p className="result-item-question">{detail.questionText}</p>
                <div className="result-item-answers">
                  <p><strong>Tu respuesta:</strong> {detail.selectedOption}</p>
                  {!detail.isCorrect && <p><strong>Correcta:</strong> {detail.correctOption}</p>}
                </div>
                {detail.explanation && (
                  <p className="result-item-explanation">{detail.explanation}</p>
                )}
              </div>
            ))}
          </div>

          <div className="result-actions">
            <button className="result-btn-back" onClick={() => navigate('/repaso')}>
              Volver al repaso
            </button>
            <button
              className="result-btn-retry"
              onClick={() => {
                setResult(null);
                setSelectedAnswers({});
                setCurrentQuestion(0);
              }}
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = failedQuestions[currentQuestion];

  return (
    <div className="test-page">
      <header className="test-header">
        <button className="test-back" onClick={() => navigate('/repaso')}>
          <FiArrowLeft size={20} />
        </button>
        <div className="test-progress">
          <div className="test-progress-bar">
            <div
              className="test-progress-fill"
              style={{ width: `${((currentQuestion + 1) / failedQuestions.length) * 100}%` }}
            />
          </div>
          <span className="test-progress-text">
            {currentQuestion + 1} / {failedQuestions.length}
          </span>
        </div>
      </header>

      <main className="test-main">
        <div className="test-question animate-slide-up" key={question.questionId}>
          <h3 className="test-question-text">{question.questionText}</h3>
          <div className="test-options">
            {question.allOptions.map((opt, i) => {
              const letter = ['A', 'B', 'C', 'D'][i];
              const isSelected = selectedAnswers[question.questionId] === opt.id;
              return (
                <button
                  key={opt.id}
                  className={`test-option ${isSelected ? 'selected' : ''}`}
                  onClick={() => selectAnswer(question.questionId, opt.id)}
                >
                  <span className="test-option-letter">{letter}</span>
                  <span className="test-option-text">{opt.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      </main>

      <footer className="test-footer">
        <button
          className="test-nav-btn"
          disabled={currentQuestion === 0}
          onClick={() => setCurrentQuestion(prev => prev - 1)}
        >
          Anterior
        </button>

        {currentQuestion < failedQuestions.length - 1 ? (
          <button
            className="test-nav-btn primary"
            onClick={() => setCurrentQuestion(prev => prev + 1)}
          >
            Siguiente
          </button>
        ) : (
          <button
            className="test-nav-btn submit"
            disabled={!allAnswered || submitting}
            onClick={handleSubmit}
          >
            {submitting ? 'Enviando...' : 'Enviar repaso'}
          </button>
        )}
      </footer>
    </div>
  );
}