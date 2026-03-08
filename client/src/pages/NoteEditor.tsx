import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Navbar from "../components/Navbar";
import CollaboratorModal from "../components/CollaboratorModal";
import { noteService } from "../services/noteService";
import { socketService } from "../services/socketService";
import { Note, UpdateNoteData } from "../types";
import { useAuth } from "../contexts/AuthContext";

const NoteEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [showCollaboratorModal, setShowCollaboratorModal] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[400px] p-4",
      },
    },
    onUpdate: ({ editor }) => {
      if (note && !saving) {
        handleContentChange(editor.getHTML());
      }
    },
  });

  const fetchNote = useCallback(async () => {
    try {
      const data = await noteService.getNote(id!);
      setNote(data);
      if (editor) {
        editor.commands.setContent(data.content);
      }
    } catch (error) {
      console.error("Error fetching note:", error);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  }, [id, editor, navigate]);

  const handleNoteUpdate = useCallback((data: any) => {
    if (data.userId !== user?._id) {
      if (data.updates.content !== undefined && editor) {
        editor.commands.setContent(data.updates.content);
      }
      if (data.updates.title !== undefined && note) {
        setNote({ ...note, title: data.updates.title });
      }
    }
  }, [user, editor, note]);

  useEffect(() => {
    if (id) {
      fetchNote();
      socketService.joinNote(id);

      // Listen for real-time updates
      socketService.onNoteUpdated(handleNoteUpdate);
      socketService.onActiveUsers(handleActiveUsers);
      socketService.onUserJoined(handleUserJoined);
      socketService.onUserLeft(handleUserLeft);

      return () => {
        socketService.leaveNote(id);
        socketService.offNoteUpdated();
        socketService.offActiveUsers();
        socketService.offUserJoined();
        socketService.offUserLeft();
      };
    }
  }, [id, fetchNote, handleNoteUpdate]);

  useEffect(() => {
    if (note && editor && !editor.isFocused) {
      editor.commands.setContent(note.content);
    }
  }, [note, editor]);

  const handleActiveUsers = (data: any) => {
    setActiveUsers(data.activeUsers);
  };

  const handleUserJoined = (data: any) => {
    setActiveUsers(data.activeUsers);
  };

  const handleUserLeft = (data: any) => {
    setActiveUsers(data.activeUsers);
  };

  const handleTitleChange = async (newTitle: string) => {
    if (!note || !id) return;

    setNote({ ...note, title: newTitle });

    try {
      await noteService.updateNote(id, { title: newTitle });
      socketService.sendNoteUpdate(id, { title: newTitle });
    } catch (error) {
      console.error("Error updating title:", error);
    }
  };

  const handleContentChange = async (content: string) => {
    if (!note || !id) return;

    const updates: UpdateNoteData = { content };

    try {
      setSaving(true);
      await noteService.updateNote(id, updates);
      socketService.sendNoteUpdate(id, updates);
      setNote({ ...note, content });
    } catch (error) {
      console.error("Error updating content:", error);
    } finally {
      setTimeout(() => setSaving(false), 500);
    }
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagInput.trim() || !note || !id) return;

    const newTags = [...note.tags, tagInput.trim()];
    setNote({ ...note, tags: newTags });
    setTagInput("");

    noteService.updateNote(id, { tags: newTags }).catch(console.error);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!note || !id) return;

    const newTags = note.tags.filter((tag) => tag !== tagToRemove);
    setNote({ ...note, tags: newTags });

    noteService.updateNote(id, { tags: newTags }).catch(console.error);
  };

  const canEdit = () => {
    if (!note || !user) return false;
    if (note.owner._id === user._id) return true;

    const collaborator = note.collaborators.find(
      (c) => c.user._id === user._id,
    );
    return (
      collaborator &&
      (collaborator.permission === "write" ||
        collaborator.permission === "admin")
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!note) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              ← Back to Dashboard
            </button>

            <div className="flex items-center gap-4">
              {saving && (
                <span className="text-sm text-gray-500">Saving...</span>
              )}

              {activeUsers.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {activeUsers.length} active users
                  </span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              )}

              <button
                onClick={() => setShowCollaboratorModal(true)}
                className="btn-secondary text-sm"
              >
                👥 Manage Collaborators ({note.collaborators.length})
              </button>
            </div>
          </div>

          <input
            type="text"
            value={note.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-3xl font-bold w-full border-none outline-none focus:ring-0 mb-4"
            placeholder="Note title"
            disabled={!canEdit()}
          />

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {note.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full flex items-center gap-2"
              >
                {tag}
                {canEdit() && (
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="text-primary-900 hover:text-red-600"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}

            {canEdit() && (
              <form onSubmit={handleAddTag} className="inline-block">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="+ Add tag"
                  className="px-3 py-1 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </form>
            )}
          </div>

          <div className="text-sm text-gray-500">
            <span>
              Owner: {note.owner.firstName} {note.owner.lastName}
            </span>
            {note.lastEditedBy && (
              <span className="ml-4">
                Last edited by: {note.lastEditedBy.username}
              </span>
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {!canEdit() && (
            <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg">
              You have read-only access to this note
            </div>
          )}

          <EditorContent editor={editor} />
        </div>
      </div>

      {showCollaboratorModal && (
        <CollaboratorModal
          note={note}
          onClose={() => setShowCollaboratorModal(false)}
          onUpdate={fetchNote}
        />
      )}
    </div>
  );
};

export default NoteEditor;
