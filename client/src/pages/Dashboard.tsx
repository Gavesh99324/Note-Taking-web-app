import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { noteService } from "../services/noteService";
import { Note } from "../types";

const Dashboard: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [filter, setFilter] = useState<"all" | "pinned" | "archived">("all");

  const navigate = useNavigate();

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    filterNotes();
  }, [notes, filter, searchQuery]);

  const fetchNotes = async () => {
    try {
      const data = await noteService.getNotes();
      setNotes(data);
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterNotes = () => {
    let filtered = notes;

    if (filter === "pinned") {
      filtered = filtered.filter((note) => note.isPinned && !note.isArchived);
    } else if (filter === "archived") {
      filtered = filtered.filter((note) => note.isArchived);
    } else {
      filtered = filtered.filter((note) => !note.isArchived);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      );
    }

    setFilteredNotes(filtered);
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;

    try {
      const note = await noteService.createNote({ title: newNoteTitle });
      setNotes([note, ...notes]);
      setShowModal(false);
      setNewNoteTitle("");
      navigate(`/note/${note._id}`);
    } catch (error) {
      console.error("Error creating note:", error);
    }
  };

  const handlePinNote = async (noteId: string, isPinned: boolean) => {
    try {
      const updatedNote = await noteService.updateNote(noteId, {
        isPinned: !isPinned,
      });
      setNotes(notes.map((n) => (n._id === noteId ? updatedNote : n)));
    } catch (error) {
      console.error("Error pinning note:", error);
    }
  };

  const handleArchiveNote = async (noteId: string, isArchived: boolean) => {
    try {
      const updatedNote = await noteService.updateNote(noteId, {
        isArchived: !isArchived,
      });
      setNotes(notes.map((n) => (n._id === noteId ? updatedNote : n)));
    } catch (error) {
      console.error("Error archiving note:", error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      await noteService.deleteNote(noteId);
      setNotes(notes.filter((n) => n._id !== noteId));
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">My Notes</h1>

          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="w-full sm:w-96">
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field"
              />
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="btn-primary whitespace-nowrap"
            >
              + New Note
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "all"
                  ? "bg-primary-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              All Notes
            </button>
            <button
              onClick={() => setFilter("pinned")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "pinned"
                  ? "bg-primary-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Pinned
            </button>
            <button
              onClick={() => setFilter("archived")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "archived"
                  ? "bg-primary-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Archived
            </button>
          </div>
        </div>

        {/* Notes Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No notes found</p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary mt-4"
            >
              Create Your First Note
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <div key={note._id} className="note-card relative group">
                <div
                  onClick={() => navigate(`/note/${note._id}`)}
                  className="cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {note.title}
                    </h3>
                    {note.isPinned && (
                      <span className="text-yellow-500 text-xl">📌</span>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {note.content.replace(/<[^>]*>/g, "") || "No content"}
                  </p>

                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {note.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="text-xs text-gray-500">
                    <p>Updated {formatDate(note.updatedAt)}</p>
                    {note.collaborators.length > 0 && (
                      <p className="mt-1">
                        {note.collaborators.length} collaborators
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePinNote(note._id, note.isPinned);
                    }}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                    title={note.isPinned ? "Unpin" : "Pin"}
                  >
                    📌
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleArchiveNote(note._id, note.isArchived);
                    }}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                    title={note.isArchived ? "Unarchive" : "Archive"}
                  >
                    📁
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNote(note._id);
                    }}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-red-100"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Note Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in">
            <h2 className="text-2xl font-bold mb-4">Create New Note</h2>
            <form onSubmit={handleCreateNote}>
              <div className="mb-4">
                <label
                  htmlFor="noteTitle"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Title
                </label>
                <input
                  id="noteTitle"
                  type="text"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="input-field"
                  placeholder="Enter note title"
                  autoFocus
                  required
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setNewNoteTitle("");
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
