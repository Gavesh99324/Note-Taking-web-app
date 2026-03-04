import React, { useState } from "react";
import { Note } from "../types";
import { noteService } from "../services/noteService";
import { useAuth } from "../contexts/AuthContext";

interface CollaboratorModalProps {
  note: Note;
  onClose: () => void;
  onUpdate: () => void;
}

const CollaboratorModal: React.FC<CollaboratorModalProps> = ({
  note,
  onClose,
  onUpdate,
}) => {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<"read" | "write" | "admin">(
    "read",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isOwner = note.owner._id === user?._id;

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await noteService.addCollaborator(note._id, { email, permission });
      setEmail("");
      setPermission("read");
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add collaborator");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    if (!window.confirm("Are you sure you want to remove this collaborator?"))
      return;

    try {
      await noteService.removeCollaborator(note._id, collaboratorId);
      onUpdate();
    } catch (err) {
      console.error("Error removing collaborator:", err);
    }
  };

  const handleUpdatePermission = async (
    collaboratorId: string,
    newPermission: "read" | "write" | "admin",
  ) => {
    try {
      await noteService.updateCollaboratorPermission(
        note._id,
        collaboratorId,
        newPermission,
      );
      onUpdate();
    } catch (err) {
      console.error("Error updating permission:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Manage Collaborators</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Add Collaborator Form */}
        {(isOwner ||
          note.collaborators.find(
            (c) => c.user._id === user?._id && c.permission === "admin",
          )) && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Add Collaborator</h3>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleAddCollaborator} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="collaborator@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Permission Level
                </label>
                <select
                  value={permission}
                  onChange={(e) =>
                    setPermission(e.target.value as "read" | "write" | "admin")
                  }
                  className="input-field"
                >
                  <option value="read">Read Only</option>
                  <option value="write">Can Edit</option>
                  <option value="admin">
                    Admin (Can manage collaborators)
                  </option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? "Adding..." : "Add Collaborator"}
              </button>
            </form>
          </div>
        )}

        {/* Current Collaborators */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Current Collaborators</h3>

          {/* Owner */}
          <div className="mb-4 p-4 bg-primary-50 border border-primary-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  {note.owner.firstName} {note.owner.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  @{note.owner.username} • {note.owner.email}
                </p>
              </div>
              <span className="px-3 py-1 bg-primary-600 text-white text-sm rounded-full">
                Owner
              </span>
            </div>
          </div>

          {/* Collaborators List */}
          {note.collaborators.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No collaborators yet
            </p>
          ) : (
            <div className="space-y-3">
              {note.collaborators.map((collaborator) => (
                <div
                  key={collaborator.user._id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {collaborator.user.firstName}{" "}
                        {collaborator.user.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        @{collaborator.user.username} •{" "}
                        {collaborator.user.email}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Added{" "}
                        {new Date(collaborator.addedAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {isOwner ||
                      note.collaborators.find(
                        (c) =>
                          c.user._id === user?._id && c.permission === "admin",
                      ) ? (
                        <>
                          <select
                            value={collaborator.permission}
                            onChange={(e) =>
                              handleUpdatePermission(
                                collaborator.user._id,
                                e.target.value as "read" | "write" | "admin",
                              )
                            }
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="read">Read</option>
                            <option value="write">Write</option>
                            <option value="admin">Admin</option>
                          </select>

                          <button
                            onClick={() =>
                              handleRemoveCollaborator(collaborator.user._id)
                            }
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </>
                      ) : (
                        <span
                          className={`px-3 py-1 text-sm rounded-full ${
                            collaborator.permission === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : collaborator.permission === "write"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {collaborator.permission}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollaboratorModal;
