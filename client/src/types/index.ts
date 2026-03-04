export interface User {
  _id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  tokens: AuthTokens;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
}

export interface Collaborator {
  user: User;
  permission: "read" | "write" | "admin";
  addedAt: string;
}

export interface Note {
  _id: string;
  title: string;
  content: string;
  owner: User;
  collaborators: Collaborator[];
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  lastEditedBy?: User;
}

export interface CreateNoteData {
  title: string;
  content?: string;
  tags?: string[];
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  tags?: string[];
  isPinned?: boolean;
  isArchived?: boolean;
}

export interface AddCollaboratorData {
  email: string;
  permission: "read" | "write" | "admin";
}

export interface SearchParams {
  q?: string;
  tags?: string[];
  archived?: boolean;
  pinned?: boolean;
}
