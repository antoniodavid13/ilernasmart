import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { documentsAPI } from '../services/api';
import Sidebar from '../components/layout/Sidebar';
import { FiArrowLeft, FiMenu, FiFileText, FiPlus, FiMinus } from 'react-icons/fi';
import '../styles/pages/DocumentViewerPage.css';

export default function DocumentViewerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  useEffect(() => {
    loadDocument();
  }, [id]);

  const loadDocument = async () => {
    try {
      const res = await documentsAPI.getById(id);
      setDocument(res.data);
    } catch (err) {
      console.error('Error cargando documento:', err);
    } finally {
      setLoading(false);
    }
  };

  const pdfUrl = document?.fileUrl
    ? `http://localhost:8080/api/documents/${id}/file`
    : null;

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-content">
        <header className="viewer-header">
          <button className="viewer-back" onClick={() => navigate(-1)}>
            <FiArrowLeft size={20} />
          </button>
          <h1 className="viewer-title">{document?.title || 'Documento'}</h1>
          <button className="viewer-menu" onClick={() => setSidebarOpen(true)}>
            <FiMenu size={20} />
          </button>
        </header>

        <main className="viewer-main">
          {loading ? (
            <div className="viewer-loading">
              <div className="home-spinner"></div>
              <p>Cargando documento...</p>
            </div>
          ) : (
            <>
              {/* Resumen colapsable */}
              {document?.summary && (
                <div className="viewer-summary">
                  <button className="viewer-summary-toggle" onClick={() => setSummaryOpen(!summaryOpen)}>
                    <h3>Resumen generado por IA</h3>
                    {summaryOpen ? <FiMinus size={18} /> : <FiPlus size={18} />}
                  </button>
                  {summaryOpen && (
                    <div className="viewer-summary-content">
                      <p>{document.summary}</p>
                    </div>
                  )}
                </div>
              )}

              {/* PDF Viewer */}
              <div className="viewer-pdf-container">
                {pdfUrl ? (
                  <iframe
                    src={pdfUrl}
                    className="viewer-pdf-iframe"
                    title={document?.title}
                  />
                ) : (
                  <div className="viewer-no-pdf">
                    <FiFileText size={48} />
                    <p>No se puede mostrar el documento</p>
                  </div>
                )}
              </div>

              {/* Botón flotante Test (estudiantes Y profesores) */}
              <button
                className="viewer-test-fab"
                onClick={() => navigate(`/test/${id}`)}
                title="Iniciar Test"
              >
                <FiFileText size={22} />
                <span>Test</span>
              </button>
            </>
          )}
        </main>
      </div>
    </div>
  );
}