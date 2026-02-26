import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProject } from '../api/projects';
import { listProjectLists, createList, updateList, deleteList } from '../api/lists';
import { createCard, updateCard, moveCard, deleteCard } from '../api/cards';
import type { Project, List, Card } from '../types';
import './Projects.css';

interface EditingCardState {
  listId: number;
  card: Card;
}

interface CardContextState {
  listId: number;
  cardId: number;
}

function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [listsError, setListsError] = useState('');

  const [newListTitle, setNewListTitle] = useState('');
  const [listCreateLoading, setListCreateLoading] = useState(false);
  const [listCreateError, setListCreateError] = useState('');
  const [showNewListForm, setShowNewListForm] = useState(false);
  const [editingListId, setEditingListId] = useState<number | null>(null);
  const [editListTitle, setEditListTitle] = useState('');
  const [listUpdateLoading, setListUpdateLoading] = useState(false);
  const [listUpdateError, setListUpdateError] = useState('');
  const [deleteListId, setDeleteListId] = useState<number | null>(null);
  const [listDeleteError, setListDeleteError] = useState('');

  const [newCardListId, setNewCardListId] = useState<number | null>(null);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardDescription, setNewCardDescription] = useState('');
  const [newCardAssigneeId, setNewCardAssigneeId] = useState('');
  const [newCardDueDate, setNewCardDueDate] = useState('');
  const [cardCreateLoading, setCardCreateLoading] = useState(false);
  const [cardCreateError, setCardCreateError] = useState('');
  const [editingCard, setEditingCard] = useState<EditingCardState | null>(null);
  const [editCardTitle, setEditCardTitle] = useState('');
  const [editCardDescription, setEditCardDescription] = useState('');
  const [editCardAssigneeId, setEditCardAssigneeId] = useState('');
  const [editCardDueDate, setEditCardDueDate] = useState('');
  const [cardUpdateLoading, setCardUpdateLoading] = useState(false);
  const [cardUpdateError, setCardUpdateError] = useState('');
  const [moveCardContext, setMoveCardContext] = useState<CardContextState | null>(null);
  const [cardMoveError, setCardMoveError] = useState('');
  const [deleteCardContext, setDeleteCardContext] = useState<CardContextState | null>(null);
  const [cardDeleteError, setCardDeleteError] = useState('');

  const loadProject = async () => {
    if (!id) return;
    setError('');
    setLoading(true);
    try {
      const data = await getProject(id);
      setProject(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar el proyecto';
      setError(msg);
      if (msg.includes('sesión')) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadLists = async () => {
    if (!id) return;
    setListsError('');
    try {
      const data = await listProjectLists(id);
      setLists(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar listas';
      setListsError(msg);
      if (msg.includes('sesión')) navigate('/login');
    }
  };

  useEffect(() => {
    loadProject();
  }, [id]);

  useEffect(() => {
    if (project && id) loadLists();
  }, [project, id]);

  const members = project?.members ?? [];
  const sortedLists = [...lists].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  const handleCreateList = async (e: FormEvent) => {
    e.preventDefault();
    if (!id || !newListTitle.trim()) return;
    setListCreateError('');
    setListCreateLoading(true);
    try {
      await createList(id, newListTitle.trim(), sortedLists.length);
      setNewListTitle('');
      setShowNewListForm(false);
      await loadLists();
    } catch (err) {
      setListCreateError(err instanceof Error ? err.message : 'Error al crear lista');
    } finally {
      setListCreateLoading(false);
    }
  };

  const startEditList = (list: List) => {
    setEditingListId(list.id);
    setEditListTitle(list.title || '');
    setListUpdateError('');
  };

  const cancelEditList = () => {
    setEditingListId(null);
    setEditListTitle('');
    setListUpdateError('');
  };

  const handleUpdateList = async (e: FormEvent) => {
    e.preventDefault();
    if (!id || editingListId == null) return;
    setListUpdateError('');
    setListUpdateLoading(true);
    try {
      await updateList(id, editingListId, editListTitle.trim());
      cancelEditList();
      await loadLists();
    } catch (err) {
      setListUpdateError(err instanceof Error ? err.message : 'Error al actualizar lista');
    } finally {
      setListUpdateLoading(false);
    }
  };

  const confirmDeleteList = async () => {
    if (!id || deleteListId == null) return;
    setListDeleteError('');
    try {
      await deleteList(id, deleteListId);
      setDeleteListId(null);
      await loadLists();
    } catch (err) {
      setListDeleteError(err instanceof Error ? err.message : 'Error al eliminar lista');
    }
  };

  const openNewCardForm = (listId: number) => {
    setNewCardListId(listId);
    setNewCardTitle('');
    setNewCardDescription('');
    setNewCardAssigneeId('');
    setNewCardDueDate('');
    setCardCreateError('');
  };

  const closeNewCardForm = () => {
    setNewCardListId(null);
    setCardCreateError('');
  };

  const handleCreateCard = async (e: FormEvent, listId: number, defaultPosition: number) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;
    setCardCreateError('');
    setCardCreateLoading(true);
    try {
      const assigneeId = newCardAssigneeId === '' ? null : Number(newCardAssigneeId);
      const dueDate = newCardDueDate === '' ? undefined : newCardDueDate;
      await createCard(listId, {
        title: newCardTitle.trim(),
        description: newCardDescription.trim() || undefined,
        position: defaultPosition,
        assigneeId,
        dueDate,
      });
      closeNewCardForm();
      await loadLists();
    } catch (err) {
      setCardCreateError(err instanceof Error ? err.message : 'Error al crear tarjeta');
    } finally {
      setCardCreateLoading(false);
    }
  };

  const startEditCard = (listId: number, card: Card) => {
    setEditingCard({ listId, card });
    setEditCardTitle(card.title || '');
    setEditCardDescription(card.description || '');
    setEditCardAssigneeId(card.assigneeId != null ? String(card.assigneeId) : '');
    setEditCardDueDate(card.dueDate ? card.dueDate.slice(0, 10) : '');
    setCardUpdateError('');
  };

  const cancelEditCard = () => {
    setEditingCard(null);
    setCardUpdateError('');
  };

  const handleUpdateCard = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingCard) return;
    setCardUpdateError('');
    setCardUpdateLoading(true);
    try {
      const assigneeId = editCardAssigneeId === '' ? null : Number(editCardAssigneeId);
      await updateCard(editingCard.listId, editingCard.card.id, {
        title: editCardTitle.trim(),
        description: editCardDescription.trim(),
        assigneeId,
        dueDate: editCardDueDate || null,
      });
      cancelEditCard();
      await loadLists();
    } catch (err) {
      setCardUpdateError(err instanceof Error ? err.message : 'Error al actualizar tarjeta');
    } finally {
      setCardUpdateLoading(false);
    }
  };

  const handleMoveCard = async (fromListId: number, cardId: number, targetListId: number) => {
    setCardMoveError('');
    try {
      await moveCard(fromListId, cardId, { targetListId });
      setMoveCardContext(null);
      await loadLists();
    } catch (err) {
      setCardMoveError(err instanceof Error ? err.message : 'Error al mover tarjeta');
    }
  };

  const confirmDeleteCard = async () => {
    if (!deleteCardContext) return;
    setCardDeleteError('');
    try {
      await deleteCard(deleteCardContext.listId, deleteCardContext.cardId);
      setDeleteCardContext(null);
      await loadLists();
    } catch (err) {
      setCardDeleteError(err instanceof Error ? err.message : 'Error al eliminar tarjeta');
    }
  };

  const memberOptions = members.map((m) => ({
    value: String(m.userId ?? m.id),
    label: m.email ?? m.name ?? `Usuario ${m.userId ?? m.id}`,
  }));

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

        {listsError && <div className="form-error">{listsError}</div>}

        <div className="detail-lists">
          {sortedLists.map((list) => {
            const cards = list.cards || [];
            const sortedCards = [...cards].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
            const isEditing = editingListId === list.id;

            return (
              <div key={list.id} className="detail-list">
                {isEditing ? (
                  <form className="detail-list-edit-form" onSubmit={handleUpdateList}>
                    <input
                      type="text"
                      value={editListTitle}
                      onChange={(e) => setEditListTitle(e.target.value)}
                      placeholder="Título de la lista"
                      required
                      autoFocus
                    />
                    {listUpdateError && <p className="detail-list-form-error">{listUpdateError}</p>}
                    <div className="detail-list-edit-actions">
                      <button type="submit" className="btn-primary" disabled={listUpdateLoading}>
                        {listUpdateLoading ? 'Guardando...' : 'Guardar'}
                      </button>
                      <button type="button" className="btn-secondary" onClick={cancelEditList}>
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="detail-list-header">
                      <h3 className="detail-list-title">{list.title || 'Sin título'}</h3>
                      <div className="detail-list-actions">
                        <button
                          type="button"
                          className="detail-list-btn detail-list-btn-edit"
                          onClick={() => startEditList(list)}
                          title="Editar lista"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="detail-list-btn detail-list-btn-delete"
                          onClick={() => setDeleteListId(list.id)}
                          title="Eliminar lista"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                    {sortedCards.map((card) => (
                      <div key={card.id} className="detail-card">
                        <div className="detail-card-content">
                          <h4>{card.title || 'Sin título'}</h4>
                          {card.description && <p>{card.description}</p>}
                          <div className="detail-card-meta">
                            {card.assigneeName && <span>Asignado: {card.assigneeName}</span>}
                            {card.dueDate && <span> · Vence: {new Date(card.dueDate).toLocaleDateString()}</span>}
                          </div>
                        </div>
                        <div className="detail-card-actions">
                          <button
                            type="button"
                            className="detail-card-btn detail-card-btn-edit"
                            onClick={() => startEditCard(list.id, card)}
                            title="Editar"
                          >
                            Editar
                          </button>
                          <div className="detail-card-move-wrap">
                            <button
                              type="button"
                              className="detail-card-btn detail-card-btn-move"
                              onClick={() => setMoveCardContext(moveCardContext?.cardId === card.id ? null : { listId: list.id, cardId: card.id })}
                              title="Mover"
                            >
                              Mover
                            </button>
                            {moveCardContext?.listId === list.id && moveCardContext?.cardId === card.id && (
                              <div className="detail-card-move-dropdown">
                                {cardMoveError && <p className="detail-list-form-error">{cardMoveError}</p>}
                                <p className="detail-card-move-label">Mover a:</p>
                                {sortedLists.filter((l) => l.id !== list.id).length === 0 ? (
                                  <p className="detail-card-move-empty">No hay otras listas</p>
                                ) : (
                                  sortedLists.filter((l) => l.id !== list.id).map((targetList) => (
                                    <button
                                      key={targetList.id}
                                      type="button"
                                      className="detail-card-move-option"
                                      onClick={() => handleMoveCard(list.id, card.id, targetList.id)}
                                    >
                                      {targetList.title || 'Sin título'}
                                    </button>
                                  ))
                                )}
                                <button type="button" className="detail-card-move-cancel" onClick={() => { setMoveCardContext(null); setCardMoveError(''); }}>
                                  Cancelar
                                </button>
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            className="detail-card-btn detail-card-btn-delete"
                            onClick={() => {
                              setDeleteCardContext({ listId: list.id, cardId: card.id });
                              setMoveCardContext(null);
                            }}
                            title="Eliminar"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                    {newCardListId === list.id ? (
                      <form className="detail-card-create-form" onSubmit={(e) => handleCreateCard(e, list.id, sortedCards.length)}>
                        <input
                          type="text"
                          value={newCardTitle}
                          onChange={(e) => setNewCardTitle(e.target.value)}
                          placeholder="Título de la tarjeta"
                          required
                          autoFocus
                        />
                        <textarea
                          value={newCardDescription}
                          onChange={(e) => setNewCardDescription(e.target.value)}
                          placeholder="Descripción (opcional)"
                          rows={2}
                        />
                        <select
                          value={newCardAssigneeId}
                          onChange={(e) => setNewCardAssigneeId(e.target.value)}
                          title="Asignado"
                        >
                          <option value="">Sin asignar</option>
                          {memberOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        <input
                          type="date"
                          value={newCardDueDate}
                          onChange={(e) => setNewCardDueDate(e.target.value)}
                          title="Fecha límite"
                        />
                        {cardCreateError && <p className="detail-list-form-error">{cardCreateError}</p>}
                        <div className="detail-card-create-actions">
                          <button type="submit" className="btn-primary" disabled={cardCreateLoading}>
                            {cardCreateLoading ? 'Creando...' : 'Añadir tarjeta'}
                          </button>
                          <button type="button" className="btn-secondary" onClick={closeNewCardForm}>
                            Cancelar
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        type="button"
                        className="detail-list-add-card-btn"
                        onClick={() => openNewCardForm(list.id)}
                      >
                        + Añadir tarjeta
                      </button>
                    )}
                  </>
                )}
              </div>
            );
          })}

          <div className="detail-list detail-list-new">
            {showNewListForm ? (
              <form className="detail-list-create-form" onSubmit={handleCreateList}>
                <input
                  type="text"
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  placeholder="Título de la lista"
                  required
                  autoFocus
                />
                {listCreateError && <p className="detail-list-form-error">{listCreateError}</p>}
                <div className="detail-list-create-actions">
                  <button type="submit" className="btn-primary" disabled={listCreateLoading}>
                    {listCreateLoading ? 'Creando...' : 'Crear lista'}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setShowNewListForm(false);
                      setNewListTitle('');
                      setListCreateError('');
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                className="detail-list-add-btn"
                onClick={() => setShowNewListForm(true)}
              >
                + Nueva lista
              </button>
            )}
          </div>
        </div>

      </main>

      {deleteListId != null && (
        <div className="modal-overlay" onClick={() => setDeleteListId(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>¿Eliminar esta lista?</h3>
            <p>Se eliminarán también todas las tarjetas. Esta acción no se puede deshacer.</p>
            {listDeleteError && <p className="detail-list-form-error">{listDeleteError}</p>}
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setDeleteListId(null)}>
                Cancelar
              </button>
              <button type="button" className="btn-danger" onClick={confirmDeleteList}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {editingCard != null && (
        <div className="modal-overlay" onClick={cancelEditCard}>
          <div className="modal-box modal-box-form" onClick={(e) => e.stopPropagation()}>
            <h3>Editar tarjeta</h3>
            <form onSubmit={handleUpdateCard}>
              <label>
                Título
                <input
                  type="text"
                  value={editCardTitle}
                  onChange={(e) => setEditCardTitle(e.target.value)}
                  required
                  placeholder="Título"
                />
              </label>
              <label>
                Descripción
                <textarea
                  value={editCardDescription}
                  onChange={(e) => setEditCardDescription(e.target.value)}
                  placeholder="Descripción (opcional)"
                  rows={3}
                />
              </label>
              <label>
                Asignado
                <select
                  value={editCardAssigneeId}
                  onChange={(e) => setEditCardAssigneeId(e.target.value)}
                >
                  <option value="">Sin asignar</option>
                  {memberOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </label>
              <label>
                Fecha límite
                <input
                  type="date"
                  value={editCardDueDate}
                  onChange={(e) => setEditCardDueDate(e.target.value)}
                />
              </label>
              {cardUpdateError && <p className="detail-list-form-error">{cardUpdateError}</p>}
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={cancelEditCard}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={cardUpdateLoading}>
                  {cardUpdateLoading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteCardContext != null && (
        <div className="modal-overlay" onClick={() => setDeleteCardContext(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>¿Eliminar esta tarjeta?</h3>
            <p>Esta acción no se puede deshacer.</p>
            {cardDeleteError && <p className="detail-list-form-error">{cardDeleteError}</p>}
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setDeleteCardContext(null)}>
                Cancelar
              </button>
              <button type="button" className="btn-danger" onClick={confirmDeleteCard}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectDetail;
