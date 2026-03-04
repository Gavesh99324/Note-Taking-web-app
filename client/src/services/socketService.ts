import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

class SocketService {
  private socket: Socket | null = null;

  connect(token: string): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
    });

    this.socket.on("connect", () => {
      console.log("✅ Socket connected");
    });

    this.socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    this.socket.on("error", (error: any) => {
      console.error("Socket error:", error);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinNote(noteId: string): void {
    if (this.socket) {
      this.socket.emit("join-note", noteId);
    }
  }

  leaveNote(noteId: string): void {
    if (this.socket) {
      this.socket.emit("leave-note", noteId);
    }
  }

  sendNoteUpdate(noteId: string, updates: any): void {
    if (this.socket) {
      this.socket.emit("note-update", { noteId, updates });
    }
  }

  sendCursorPosition(noteId: string, position: number): void {
    if (this.socket) {
      this.socket.emit("cursor-position", { noteId, position });
    }
  }

  onNoteUpdated(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on("note-updated", callback);
    }
  }

  onUserJoined(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on("user-joined", callback);
    }
  }

  onUserLeft(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on("user-left", callback);
    }
  }

  onActiveUsers(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on("active-users", callback);
    }
  }

  onCursorUpdate(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on("cursor-update", callback);
    }
  }

  offNoteUpdated(): void {
    if (this.socket) {
      this.socket.off("note-updated");
    }
  }

  offUserJoined(): void {
    if (this.socket) {
      this.socket.off("user-joined");
    }
  }

  offUserLeft(): void {
    if (this.socket) {
      this.socket.off("user-left");
    }
  }

  offActiveUsers(): void {
    if (this.socket) {
      this.socket.off("active-users");
    }
  }

  offCursorUpdate(): void {
    if (this.socket) {
      this.socket.off("cursor-update");
    }
  }
}

export const socketService = new SocketService();
