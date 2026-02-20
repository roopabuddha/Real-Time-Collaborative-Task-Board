import { create } from "zustand";
import { socket } from "../websocket/socket";
import { flushQueue, getQueueLength, loadPersistedQueue } from "./offlineQueue";
import { useTaskStore } from "./taskStore";
import { Task } from "../types";
import toast from "react-hot-toast";

interface SocketState {
  connected: boolean;
  users: any[];
  queuedCount: number;
  connect: (user: any) => void;
  refreshQueueCount: () => void;
}

export const useSocketStore = create<SocketState>((set) => ({
  connected: false,
  users: [],
  queuedCount: 0,

  refreshQueueCount: () => set({ queuedCount: getQueueLength() }),

  connect: (user) => {
    // Guard: only register listeners once (safe across HMR and StrictMode)
    if (socket.hasListeners("taskCreated")) {
      socket.connect();
      return;
    }

    loadPersistedQueue();

    // ── Task events ──────────────────────────────────────────────
    socket.on("taskCreated", (task: Task) => {
      useTaskStore.getState().handleServerCreated(task);
    });

    socket.on("taskEdited", (task: Task) => {
      useTaskStore.getState().handleServerUpdated(task);
    });

    socket.on("taskMoved", (data: unknown) => {
      const isWrapped = typeof data === "object" && data !== null && "task" in data;
      const task: Task = isWrapped ? (data as { task: Task }).task : (data as Task);
      const loser = isWrapped ? !!( data as { loser?: boolean }).loser : false;
      useTaskStore.getState().handleServerUpdated(task);
      if (loser) {
        toast.error("Your move was overridden by another user.", { duration: 4000, icon: "⚡" });
      }
    });

    socket.on("taskReordered", (task: Task) => {
      useTaskStore.getState().handleServerUpdated(task);
    });

    socket.on("taskDeleted", (id: string) => {
      useTaskStore.getState().handleServerDeleted(id);
    });

    socket.on("conflictNotice", (msg: { message: string }) => {
      toast(msg.message, { icon: "⚡", duration: 5000 });
    });

    socket.on("presenceUpdate", (users: any[]) => {
      set({ users });
    });

    // ── Connection lifecycle ─────────────────────────────────────
    socket.on("connect", () => {
      set({ connected: true, queuedCount: 0 });
      socket.emit("joinBoard", user);

      // Replay queued offline actions
      const pendingCount = getQueueLength();
      flushQueue((action) => socket.emit(action.type, action.payload));

      // Re-fetch after server has had time to process queued actions.
      // Delay scales with queue depth: 400ms base + 150ms per action (cap 2.5s)
      const refetchDelay = pendingCount > 0 ? Math.min(400 + pendingCount * 150, 2500) : 400;
      const apiUrl =
        (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_URL) ||
        "http://localhost:4000";

      setTimeout(() => {
        fetch(`${apiUrl}/api/tasks`)
          .then((r) => r.json())
          .then((tasks) => useTaskStore.getState().setTasks(tasks))
          .catch(() => {});
      }, refetchDelay);

      toast.success("Connected", { duration: 2000 });
    });

    socket.on("disconnect", () => {
      set({ connected: false, queuedCount: getQueueLength() });
      toast.error("Offline — actions will queue", { duration: 3000 });
    });

    socket.connect();
  },
}));