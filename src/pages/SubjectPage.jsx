import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { subjectsAPI, documentsAPI } from '../services/api';
import Sidebar from '../components/layout/Sidebar';
import {
  FiArrowLeft, FiChevronDown, FiChevronUp, FiFile, FiUpload,
  FiSearch, FiTrash2, FiPlus, FiMenu, FiBook, FiEye
} from 'react-icons/fi';
import '../styles/pages/SubjectPage.css';

export default function SubjectPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setSubjectColor, resetColor } = useTheme();

  const [subject, setSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [expandedTopic, setExpandedTopic] = useState(null);
  const [expandedSubtopic, setExpandedSubtopic] = useState(null);
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showSubtopicModal, setShowSubtopicModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [topicName, setTopicName] = useState('');
  const [subtopicName, setSubtopicName] = useState('');
  const [activeTopicId, setActiveTopicId] = useState(null);
  const [uploadData, setUploadData] = useState({ title: '', topicId: '', subtopicId: '', file: null });
  const [uploading, setUploading] = useState(false);

  const colorIndex = location.state?.colorIndex ?? 0;
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

  useEffect(() => {
    setSubjectColor(colorIndex);
    loadData();
    return () => resetColor();
  }, [id]);

  const loadData = async () => {
    try {
      const [subjectRes, topicsRes] = await Promise.all([
        subjectsAPI.getById(id),
        documentsAPI.getTopics(id),
      ]);
      setSubject(subjectRes.data);
      setTopics(topicsRes.data);
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!topicName.trim()) return;
    try {
      await documentsAPI.createTopic(id, topicName.trim());
      setTopicName('');
      setShowTopicModal(false);
      loadData();
    } catch (err) {
      console.error('Error creando tema:', err);
    }
  };

  const handleCreateSubtopic = async (e) => {
    e.preventDefault();
    if (!subtopicName.trim() || !activeTopicId) return;
    try {
      await documentsAPI.createSubtopic(activeTopicId, subtopicName.trim());
      setSubtopicName('');
      setShowSubtopicModal(false);
      loadData();
    } catch (err) {
      console.error('Error creando subtema:', err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.file || !uploadData.topicId) return;
    setUploading(true);
    try {
      await documentsAPI.upload(
        uploadData.title, id, uploadData.topicId,
        uploadData.subtopicId || null, uploadData.file
      );
      setShowUploadModal(false);
      setUploadData({ title: '', topicId: '', subtopicId: '', file: null });
      loadData();
    } catch (err) {
      console.error('Error subiendo documento:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDoc = async (docId) => {
    if (!confirm('¿Eliminar este documento?')) return;
    try {
      await documentsAPI.delete(docId);
      loadData();
    } catch (err) {
      console.error('Error eliminando documento:', err);
    }
  };

  const handleDeleteTopic = async (topicId) => {
    if (!confirm('¿Eliminar este tema y todos sus documentos?')) return;
    try {
      await documentsAPI.deleteTopic(topicId);
      loadData();
    } catch (err) {
      console.error('Error eliminando tema:', err);
    }
  };

  const openUploadModal = (topicId, subtopicId = '') => {
    setUploadData({ title: '', topicId, subtopicId, file: null });
    setShowUploadModal(true);
  };

  const filteredTopics = topics.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.documents?.some((d) => d.title.toLowerCase().includes(search.toLowerCase())) ||
    t.subtopics?.some((s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.documents?.some((d) => d.title.toLowerCase().includes(search.toLowerCase()))
    )
  );

  const renderDocument = (doc) => (
    <div key={doc.id} className="doc-item">
      <div className="doc-item-left">
        <FiFile className="doc-icon" />
        <span className="doc-name">{doc.title}</span>
      </div>
      <div className="doc-item-actions">
        <button className="doc-action-btn view-btn" onClick={() => navigate(`/document/${doc.id}/view`)} title="Ver documento">
          <FiEye size={16} />
        </button>
        {isTeacher && (
          <button className="doc-action-btn delete-doc-btn" onClick={() => handleDeleteDoc(doc.id)} title="Eliminar">
            <FiTrash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-content">
        {/* Header */}
        <header className="subject-header" style={{ background: 'var(--color-accent)' }}>
          <div className="subject-header-content">
            <button className="subject-back-btn" onClick={() => { resetColor(); navigate('/home'); }}>
              <FiArrowLeft size={20} />
            </button>
            <h1 className="subject-title">{subject?.name || 'ILERNA'}</h1>
            <button className="subject-menu-btn" onClick={() => setSidebarOpen(true)}>
              <FiMenu size={20} />
            </button>
          </div>
        </header>

        {/* Search sticky */}
        <div className="subject-search-wrap" style={{ background: 'var(--color-accent)' }}>
          <div className="subject-search">
            <FiSearch className="subject-search-icon" />
            <input
              type="text"
              placeholder="Buscar tema o documento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Content */}
        <main className="subject-main">
          {loading ? (
            <div className="subject-loading">
              <div className="home-spinner"></div>
              <p>Cargando contenido...</p>
            </div>
          ) : filteredTopics.length === 0 && !isTeacher ? (
            <div className="subject-empty">
              <FiBook size={48} />
              <p>No hay contenido en esta asignatura</p>
            </div>
          ) : (
            <div className="topics-list">
              {filteredTopics.map((topic, tIndex) => (
                <div key={topic.id} className="topic-item animate-slide-up" style={{ animationDelay: `${tIndex * 0.05}s` }}>
                  {/* Topic header */}
                  <button
                    className="topic-header"
                    onClick={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
                  >
                    <span className="topic-number">TEMA {tIndex + 1}:</span>
                    <span className="topic-name">{topic.name.toUpperCase()}</span>
                    {expandedTopic === topic.id ? <FiChevronUp /> : <FiChevronDown />}
                  </button>

                  {expandedTopic === topic.id && (
                    <div className="topic-content">
                      {/* Documentos directos del tema */}
                      {topic.documents?.map(renderDocument)}

                      {/* Subtemas */}
                      {topic.subtopics?.map((sub, sIndex) => (
                        <div key={sub.id} className="subtopic-item">
                          <button
                            className="subtopic-header"
                            onClick={() => setExpandedSubtopic(expandedSubtopic === sub.id ? null : sub.id)}
                          >
                            <span className="subtopic-name">{sub.name}</span>
                            {expandedSubtopic === sub.id ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                          </button>

                          {expandedSubtopic === sub.id && (
                            <div className="subtopic-content">
                              {sub.documents?.length > 0 ? (
                                sub.documents.map(renderDocument)
                              ) : (
                                <p className="no-docs">Sin documentos</p>
                              )}
                              {isTeacher && (
                                <button className="add-doc-inline" onClick={() => openUploadModal(topic.id, sub.id)}>
                                  <FiPlus size={14} />
                                  <span>Subir documento aquí</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Acciones del profesor dentro del tema */}
                      {isTeacher && (
                        <div className="topic-actions">
                          <button className="topic-action-btn" onClick={() => { setActiveTopicId(topic.id); setShowSubtopicModal(true); }}>
                            <FiPlus size={14} />
                            <span>Añadir subtema</span>
                          </button>
                          <button className="topic-action-btn" onClick={() => openUploadModal(topic.id)}>
                            <FiUpload size={14} />
                            <span>Subir documento</span>
                          </button>
                          <button className="topic-action-btn danger" onClick={() => handleDeleteTopic(topic.id)}>
                            <FiTrash2 size={14} />
                            <span>Eliminar tema</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Botón crear tema (profesor) */}
              {isTeacher && (
                <button className="add-topic-btn" onClick={() => setShowTopicModal(true)}>
                  <FiPlus size={18} />
                  <span>Crear nuevo tema</span>
                </button>
              )}
            </div>
          )}
        </main>

        {/* Modal crear tema */}
        {showTopicModal && (
          <div className="modal-overlay" onClick={() => setShowTopicModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Nuevo tema</h3>
              <form onSubmit={handleCreateTopic}>
                <div className="modal-input-group">
                  <input
                    type="text"
                    placeholder="Nombre del tema"
                    value={topicName}
                    onChange={(e) => setTopicName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="modal-cancel" onClick={() => setShowTopicModal(false)}>Cancelar</button>
                  <button type="submit" className="modal-submit">Crear</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal crear subtema */}
        {showSubtopicModal && (
          <div className="modal-overlay" onClick={() => setShowSubtopicModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Nuevo subtema</h3>
              <form onSubmit={handleCreateSubtopic}>
                <div className="modal-input-group">
                  <input
                    type="text"
                    placeholder="Nombre del subtema"
                    value={subtopicName}
                    onChange={(e) => setSubtopicName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="modal-cancel" onClick={() => setShowSubtopicModal(false)}>Cancelar</button>
                  <button type="submit" className="modal-submit">Crear</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal subir documento */}
        {showUploadModal && (
          <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Subir documento</h3>
              <form onSubmit={handleUpload}>
                <div className="modal-input-group">
                  <input
                    type="text"
                    placeholder="Nombre del documento"
                    value={uploadData.title}
                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="file-upload-area">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setUploadData({ ...uploadData, file: e.target.files[0] })}
                    required
                    id="file-input"
                  />
                  <label htmlFor="file-input" className="file-upload-label">
                    <FiUpload size={24} />
                    <span>{uploadData.file ? uploadData.file.name : 'Seleccionar PDF'}</span>
                  </label>
                </div>
                <div className="modal-actions">
                  <button type="button" className="modal-cancel" onClick={() => setShowUploadModal(false)}>Cancelar</button>
                  <button type="submit" className="modal-submit" disabled={uploading}>
                    {uploading ? 'Subiendo...' : 'Subir'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bottom nav mobile */}
        <nav className="bottom-nav">
          <button className="bottom-nav-item" onClick={() => { resetColor(); navigate('/home'); }}>
            <FiArrowLeft />
            <span>Volver</span>
          </button>
          <button className="bottom-nav-item active">
            <FiBook />
            <span>Temas</span>
          </button>
        </nav>
      </div>
    </div>
  );
}