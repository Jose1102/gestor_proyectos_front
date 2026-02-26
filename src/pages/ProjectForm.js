import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createProject, getProject, updateProject } from '../api/projects';
import './Projects.css';

function ProjectForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      let cancelled = false;
      setLoading(true);
      setError('');
      getProject(id)
        .then((p) => {
          if (!cancelled) {
            setName(p.name || '');
            setDescription(p.description || '');
          }
        })
        .catch((err) => {
          if (!cancelled) setError(err.message || 'Error al cargar proyecto');
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => { cancelled = true; };
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) {
        await updateProject(id, name, description);
        navigate(`/projects/${id}`);
      } else {
        const project = await createProject(name, description);
        navigate(`/projects/${project.id}`);
      }
    } catch (err) {
      setError(err.message || 'Error al guardar');
      setLoading(false);
    }
  };

  return (
    <div className="project-layout">
      <header className="project-header">
        <h1>{isEdit ? 'Editar proyecto' : 'Nuevo proyecto'}</h1>
        <div className="project-header-actions">
          <Link to={isEdit ? `/projects/${id}` : '/projects'} className="btn-secondary">
            Volver
          </Link>
        </div>
      </header>

      <main className="project-content">
        {error && <div className="form-error">{error}</div>}
        {loading && !name && isEdit && <p className="projects-loading">Cargando...</p>}
        <div className="form-card">
          <h1>{isEdit ? 'Editar proyecto' : 'Crear proyecto'}</h1>
          <form onSubmit={handleSubmit}>
            <label>
              Nombre
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Nombre del proyecto"
              />
            </label>
            <label>
              Descripción
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción (opcional)"
              />
            </label>
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear proyecto'}
              </button>
              <Link to={isEdit ? `/projects/${id}` : '/projects'} className="btn-secondary">
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default ProjectForm;
