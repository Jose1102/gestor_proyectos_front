/** Respuesta de login/register */
export interface AuthResponse {
  token: string;
  type?: string;
  userId: number;
  email: string;
  role: string;
}

/** Proyecto (lista y detalle) */
export interface Project {
  id: number;
  name: string;
  description?: string;
  createdById?: number;
  createdByName?: string;
  createdAt?: string;
  members?: ProjectMember[];
  lists?: List[];
}

export interface ProjectMember {
  userId: number;
  id?: number;
  email?: string;
  name?: string;
}

/** Lista con tarjetas */
export interface List {
  id: number;
  title: string;
  position?: number;
  projectId?: number;
  cards?: Card[];
}

/** Tarjeta */
export interface Card {
  id: number;
  title: string;
  description?: string;
  position?: number;
  listId?: number;
  assigneeId?: number | null;
  assigneeName?: string;
  dueDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/** Datos para crear/actualizar tarjeta */
export interface CardInput {
  title: string;
  description?: string;
  position?: number;
  assigneeId?: number | null;
  dueDate?: string | null;
}

/** Datos para mover tarjeta */
export interface MoveCardInput {
  targetListId: number;
  newPosition?: number;
}
