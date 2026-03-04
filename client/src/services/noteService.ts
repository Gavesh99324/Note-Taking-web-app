import api from "../utils/api";
import {
  Note,
  CreateNoteData,
  UpdateNoteData,
  AddCollaboratorData,
  SearchParams,
} from "../types";

export const noteService = {
  async createNote(data: CreateNoteData): Promise<Note> {
    const response = await api.post("/notes", data);
    return response.data.note;
  },

  async getNotes(params?: {
    archived?: boolean;
    pinned?: boolean;
  }): Promise<Note[]> {
    const response = await api.get("/notes", { params });
    return response.data.notes;
  },

  async getNote(id: string): Promise<Note> {
    const response = await api.get(`/notes/${id}`);
    return response.data.note;
  },

  async updateNote(id: string, data: UpdateNoteData): Promise<Note> {
    const response = await api.patch(`/notes/${id}`, data);
    return response.data.note;
  },

  async deleteNote(id: string): Promise<void> {
    await api.delete(`/notes/${id}`);
  },

  async searchNotes(params: SearchParams): Promise<Note[]> {
    const response = await api.get("/notes/search", { params });
    return response.data.notes;
  },

  async addCollaborator(
    noteId: string,
    data: AddCollaboratorData,
  ): Promise<Note> {
    const response = await api.post(`/notes/${noteId}/collaborators`, data);
    return response.data.note;
  },

  async removeCollaborator(
    noteId: string,
    collaboratorId: string,
  ): Promise<void> {
    await api.delete(`/notes/${noteId}/collaborators/${collaboratorId}`);
  },

  async updateCollaboratorPermission(
    noteId: string,
    collaboratorId: string,
    permission: "read" | "write" | "admin",
  ): Promise<Note> {
    const response = await api.patch(
      `/notes/${noteId}/collaborators/${collaboratorId}`,
      { permission },
    );
    return response.data.note;
  },
};
