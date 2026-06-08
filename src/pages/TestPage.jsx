import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testsAPI } from '../services/api';
import { FiArrowLeft, FiCheck, FiX, FiAward } from 'react-icons/fi';
import {useLocation } from 'react-router-dom';

import '../styles/pages/TestPage.css';

export default function TestPage() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const location = useLocation();

  useEffect(() => {
    generateTest();
  }, [documentId]);

  const generateTest = async () => {
     if (!loading) return;
    try {
      const res = await testsAPI.generate(documentId);
      setTest(res.data);
    } catch (err) {
      console.error('Error generando test:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (questionId, optionId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    if (!test) return;
    setSubmitting(true);
    try {
    const submitData = {
      testId: test.id,
      subjectId: location.state?.subjectId || null,
      answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({
        questionId,
        selectedOptionId,
      })),
    };
     
      const res = await testsAPI.submit(submitData);
      setResult(res.data);
    } catch (err) {
      console.error('Error enviando test:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const allAnswered = test?.questions?.length === Object.keys(answers).length;

  if (loading) {
    return (
      <div className="test-page">
        <div className="test-loading">
          <div className="test-spinner"></div>
          <p>Generando preguntas con IA...</p>
          <p className="test-loading-sub">Esto puede tardar unos segundos</p>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="test-page">
        <div className="test-result">
          <div className="result-header">
            <FiAward size={48} className="result-icon" />
            <h2>Test completado</h2>
            <div className="result-score">
              <span className="result-score-number">{result.score}</span>
              <span className="result-score-total">/10</span>
            </div>
            <p className="result-summary">
              {result.correctAnswers} de {result.totalQuestions} respuestas correctas
            </p>
          </div>

          <div className="result-details">
            {result.details?.map((detail, index) => (
              <div key={index} className={`result-item ${detail.correct ? 'correct' : 'incorrect'}`}>
                <div className="result-item-header">
                  {detail.correct ? <FiCheck className="result-correct" /> : <FiX className="result-incorrect" />}
                  <span className="result-item-number">Pregunta {index + 1}</span>
                </div>
                <p className="result-item-question">{detail.questionText}</p>
                <div className="result-item-answers">
                  <p><strong>Tu respuesta:</strong> {detail.selectedOption}</p>
                  {!detail.correct && <p><strong>Correcta:</strong> {detail.correctOption}</p>}
                </div>
                {detail.explanation && (
                  <p className="result-item-explanation">{detail.explanation}</p>
                )}
              </div>
            ))}
          </div>

          <div className="result-actions">
            <button className="result-btn-back" onClick={() => navigate(-1)}>
              Volver a la asignatura
            </button>
            <button className="result-btn-retry" onClick={() => { setResult(null); setAnswers({}); setCurrentQuestion(0); setLoading(true); generateTest(); }}>
              Repetir test
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = test?.questions?.[currentQuestion];

  return (
    <div className="test-page">
      <header className="test-header">
        <button className="test-back" onClick={() => navigate(-1)}>
          <FiArrowLeft size={20} />
        </button>
        <div className="test-progress">
          <div className="test-progress-bar">
            <div
              className="test-progress-fill"
              style={{ width: `${((currentQuestion + 1) / (test?.questions?.length || 1)) * 100}%` }}
            ></div>
          </div>
          <span className="test-progress-text">
            {currentQuestion + 1} / {test?.questions?.length}
          </span>
        </div>
      </header>

      <main className="test-main">
        {question && (
          <div className="test-question animate-slide-up" key={question.id}>
            <h3 className="test-question-text">{question.questionText}</h3>

            <div className="test-options">
              {question.options?.map((option, i) => {
                const letter = ['A', 'B', 'C', 'D'][i];
                const isSelected = answers[question.id] === option.id;
                return (
                  <button
                    key={option.id}
                    className={`test-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => selectAnswer(question.id, option.id)}
                  >
                    <span className="test-option-letter">{letter}</span>
                    <span className="test-option-text">{option.optionText}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <footer className="test-footer">
        <button
          className="test-nav-btn"
          disabled={currentQuestion === 0}
          onClick={() => setCurrentQuestion((prev) => prev - 1)}
        >
          Anterior
        </button>

        {currentQuestion < (test?.questions?.length || 0) - 1 ? (
          <button
            className="test-nav-btn primary"
            onClick={() => setCurrentQuestion((prev) => prev + 1)}
          >
            Siguiente
          </button>
        ) : (
          <button
            className="test-nav-btn submit"
            disabled={!allAnswered || submitting}
            onClick={handleSubmit}
          >
            {submitting ? 'Enviando...' : 'Enviar test'}
          </button>
        )}
      </footer>
    </div>
  );
}
