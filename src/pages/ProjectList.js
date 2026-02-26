import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../api/auth';
import { listProjects, deleteProject } from '../api/projects';
import './Projects.css';

function ProjectList() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const loadProjects = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await listProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Error al cargar proyectos');
      if (err.message && err.message.includes('sesión')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDelete = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setError('');
    try {
      await deleteProject(deleteId);
      setProjects((prev) => prev.filter((p) => p.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      setError(err.message || 'Error al eliminar');
    }
  };

  const cancelDelete = () => setDeleteId(null);

  return (
    <div className="project-layout">
      <header className="project-header">
        <h1>Mis proyectos</h1>
        <div className="project-header-actions">
          <Link to="/projects/new" className="btn-primary">
            Nuevo proyecto
          </Link>
          <Link to="/home" className="btn-secondary">
            Inicio
          </Link>
          <button type="button" className="btn-secondary" onClick={() => { logout(); navigate('/login'); }}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="project-content">
        {error && <div className="form-error">{error}</div>}
        {loading && <p className="projects-loading">Cargando proyectos...</p>}
        {!loading && !error && projects.length === 0 && (
          <p className="projects-loading">No tienes proyectos. Crea uno nuevo.</p>
        )}
        {!loading && projects.length > 0 && (
          <div className="projects-grid">
            {projects.map((p) => (
              <div key={p.id} className="project-card">
                <Link to={`/projects/${p.id}`}>
                  <h3>{p.name}</h3>
                  <p>{p.description || 'Sin descripción'}</p>
                  <p className="project-card-meta">
                    Por {p.createdByName || '—'} · {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''}
                  </p>
                </Link>
                <div className="project-card-actions">
                  <Link to={`/projects/${p.id}/edit`} onClick={(e) => e.stopPropagation()}>
                    Editar
                  </Link>
                  <button type="button" className="btn-danger" onClick={(e) => handleDelete(e, p.id)}>
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {deleteId && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>¿Eliminar este proyecto?</h3>
            <p>Esta acción no se puede deshacer.</p>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={cancelDelete}>
                Cancelar
              </button>
              <button type="button" className="btn-danger" onClick={confirmDelete}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectList;
