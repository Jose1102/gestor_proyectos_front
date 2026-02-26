import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProject, addProjectMember, removeProjectMember } from '../api/projects';
import './Projects.css';

function getCurrentUserId() {
  try {
    const u = localStorage.getItem('authUser');
    return u ? JSON.parse(u).userId : null;
  } catch {
    return null;
  }
}

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUserId = getCurrentUserId();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberError, setMemberError] = useState('');
  const [memberLoading, setMemberLoading] = useState(false);
  const [removeUserId, setRemoveUserId] = useState('');
  const [removeError, setRemoveError] = useState('');

  const loadProject = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await getProject(id);
      setProject(data);
    } catch (err) {
      setError(err.message || 'Error al cargar el proyecto');
      if (err.message && err.message.includes('sesión')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [id]);

  const isOwner = project && currentUserId != null && project.createdById === currentUserId;
  const members = project?.members ?? [];

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail.trim()) return;
    setMemberError('');
    setMemberLoading(true);
    try {
      await addProjectMember(id, memberEmail.trim());
      setMemberEmail('');
      await loadProject();
    } catch (err) {
      setMemberError(err.message || 'Error al añadir miembro');
    } finally {
      setMemberLoading(false);
    }
  };

  const handleRemoveMember = async (e) => {
    e.preventDefault();
    const userId = removeUserId.trim();
    if (!userId) return;
    setRemoveError('');
    try {
      await removeProjectMember(id, userId);
      setRemoveUserId('');
      await loadProject();
    } catch (err) {
      setRemoveError(err.message || 'Error al eliminar miembro');
    }
  };

  const handleRemoveMemberById = async (userId) => {
    setRemoveError('');
    try {
      await removeProjectMember(id, userId);
      await loadProject();
    } catch (err) {
      setRemoveError(err.message || 'Error al eliminar miembro');
    }
  };

  if (loading) {
    return (
      <div className="project-layout">
        <header className="project-header">
          <h1>Proyecto</h1>
          <Link to="/projects" className="btn-secondary">Volver a proyectos</Link>
        </header>
        <main className="project-content">
          <p className="projects-loading">Cargando...</p>
        </main>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="project-layout">
        <header className="project-header">
          <h1>Proyecto</h1>
          <Link to="/projects" className="btn-secondary">Volver a proyectos</Link>
        </header>
        <main className="project-content">
          <div className="detail-error">{error || 'Proyecto no encontrado'}</div>
        </main>
      </div>
    );
  }

  const lists = project.lists || [];
  const sortedLists = [...lists].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  return (
    <div className="project-layout">
      <header className="project-header">
        <h1>{project.name}</h1>
        <div className="project-header-actions">
          <Link to={`/projects/${id}/edit`} className="btn-primary">Editar</Link>
          <Link to="/projects" className="btn-secondary">Volver a proyectos</Link>
        </div>
      </header>

      <main className="project-content">
        <div className="detail-header">
          <h1>{project.name}</h1>
          {project.description && <p className="detail-meta">{project.description}</p>}
          <p className="detail-meta">
            Creado por {project.createdByName || '—'}
            {project.createdAt && ` · ${new Date(project.createdAt).toLocaleString()}`}
          </p>
        </div>

        <div className="detail-lists">
          {sortedLists.map((list) => {
            const cards = list.cards || [];
            const sortedCards = [...cards].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
            return (
              <div key={list.id} className="detail-list">
                <h3 className="detail-list-title">{list.title || 'Sin título'}</h3>
                {sortedCards.map((card) => (
                  <div key={card.id} className="detail-card">
                    <h4>{card.title || 'Sin título'}</h4>
                    {card.description && <p>{card.description}</p>}
                    <div className="detail-card-meta">
                      {card.assigneeName && <span>Asignado: {card.assigneeName}</span>}
                      {card.dueDate && <span> · Vence: {new Date(card.dueDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {isOwner && (
          <div className="detail-members">
            <h3>Miembros del proyecto</h3>
            <form onSubmit={handleAddMember}>
              <input
                type="email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder="Email del usuario a añadir"
                required
              />
              <button type="submit" disabled={memberLoading}>
                {memberLoading ? 'Añadiendo...' : 'Añadir'}
              </button>
            </form>
            {memberError && <p className="detail-add-member-error">{memberError}</p>}

            {members.length > 0 ? (
              <ul className="members-list">
                {members.map((m) => (
                  <li key={m.userId ?? m.id ?? m.email}>
                    <span>{m.email ?? m.name ?? `Usuario ${m.userId ?? m.id}`}</span>
                    <button type="button" onClick={() => handleRemoveMemberById(m.userId ?? m.id)}>
                      Quitar
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <>
                <p className="detail-meta">Eliminar miembro por ID de usuario:</p>
                <form onSubmit={handleRemoveMember}>
                  <input
                    type="text"
                    value={removeUserId}
                    onChange={(e) => setRemoveUserId(e.target.value)}
                    placeholder="User ID"
                  />
                  <button type="submit">Eliminar miembro</button>
                </form>
                {removeError && <p className="detail-add-member-error">{removeError}</p>}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default ProjectDetail;
