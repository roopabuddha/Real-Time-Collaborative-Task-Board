import { create } from "zustand";
import { Task } from "../types";
import { socket } from "../websocket/socket";
import { enqueue } from "./offlineQueue";
import toast from "react-hot-toast";

interface TaskState {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (title: string, description: string | null, column: Task["column"]) => void;
  updateTask: (id: string, updates: Partial<Omit<Task, "id" | "version" | "updatedAt">>) => void;
  deleteTask: (id: string) => void;
  moveOrReorderTask: (activeId: string, overId: string | null, overContainer: Task["column"]) => void;
  handleServerCreated: (task: Task) => void;
  handleServerUpdated: (task: Task) => void;
  handleServerDeleted: (id: string) => void;
}

// Maps tempId -> resolve function, used to match server response to optimistic task
const pendingCreates = new Map<string, string>(); // tempId -> title (for matching)

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],

  // Called once on load from REST API - source of truth, replaces everything
  setTasks: (tasks) => {
    // Clear any temp tasks that haven't been confirmed yet - 
    // server state is authoritative on load
    set({ tasks });
  },

  // ── CREATE (Optimistic) ──────────────────────────────────────
  addTask: (title, description, column) => {
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    pendingCreates.set(tempId, title);

    const optimistic: Task = {
      id: tempId,
      title,
      description,
      column,
      position: Date.now(),
      version: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((s) => ({ tasks: [...s.tasks, optimistic] }));

    const payload = { title, description, column };

    if (socket.connected) {
      // Online: emit directly, do NOT enqueue (avoid double-send on reconnect)
      socket.emit("createTask", payload);
    } else {
      // Offline: only enqueue, do NOT emit (will be sent on reconnect)
      enqueue({ type: "createTask", payload });
    }

    toast.success("Task created");
  },

  // ── UPDATE ───────────────────────────────────────────────────
  updateTask: (id, updates) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;

    const optimistic: Task = {
      ...task,
      ...updates,
      version: task.version + 1,
      updatedAt: new Date().toISOString(),
    };
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? optimistic : t)) }));

    const payload = { id, ...updates, version: task.version };

    if (socket.connected) {
      socket.emit("editTask", payload);
    } else {
      enqueue({ type: "editTask", payload });
    }
  },

  // ── DELETE ───────────────────────────────────────────────────
  deleteTask: (id) => {
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));

    if (socket.connected) {
      socket.emit("deleteTask", id);
    } else {
      enqueue({ type: "deleteTask", payload: id });
    }

    toast.success("Task deleted");
  },

  // ── MOVE / REORDER ───────────────────────────────────────────
  moveOrReorderTask: (activeId, overId, overContainer) => {
    const tasks = [...get().tasks];
    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    const activeContainer = activeTask.column;
    const activeIndex = tasks.findIndex((t) => t.id === activeId);

    if (activeContainer !== overContainer) {
      activeTask.column = overContainer;
      activeTask.position = Date.now();
      activeTask.version += 1;
      set({ tasks: [...tasks] });

      const payload = {
        id: activeId,
        toColumn: overContainer,
        version: activeTask.version - 1,
        timestamp: new Date().toISOString(),
      };

      if (socket.connected) {
        socket.emit("moveTask", payload);
      } else {
        enqueue({ type: "moveTask", payload });
      }
    } else if (overId) {
      const overIndex = tasks.findIndex((t) => t.id === overId);
      const [moved] = tasks.splice(activeIndex, 1);
      tasks.splice(overIndex, 0, moved);
      set({ tasks });

      const newIndex = tasks.findIndex((t) => t.id === activeId);
      const prevTaskId = newIndex > 0 ? tasks[newIndex - 1].id : null;
      const nextTaskId = newIndex < tasks.length - 1 ? tasks[newIndex + 1].id : null;

      const payload = { id: activeId, prevTaskId, nextTaskId };

      if (socket.connected) {
        socket.emit("reorderTask", payload);
      } else {
        enqueue({ type: "reorderTask", payload });
      }
    }
  },

  // ── SERVER RECONCILIATION ────────────────────────────────────

  handleServerCreated: (task: Task) =>
    set((s) => {
      // Check if this task ID already exists (e.g. from setTasks on refresh)
      if (s.tasks.some((t) => t.id === task.id)) {
        // Already have real task - just clean up any stale temp
        return {
          tasks: s.tasks.filter((t) => !t.id.startsWith("temp-")),
        };
      }

      // Find matching temp task to replace
      const tempEntry = [...pendingCreates.entries()].find(
        ([, title]) => title === task.title
      );

      if (tempEntry) {
        const [tempId] = tempEntry;
        pendingCreates.delete(tempId);
        // Replace the temp task with the real one
        return {
          tasks: s.tasks.map((t) => (t.id === tempId ? task : t)),
        };
      }

      // No temp found - this is another user's create, just add it
      return { tasks: [...s.tasks, task] };
    }),

  handleServerUpdated: (task: Task) =>
    set((s) => ({
      tasks: s.tasks.map((t) => {
        if (t.id !== task.id) return t;
        return task.version >= t.version ? task : t;
      }),
    })),

  handleServerDeleted: (id: string) =>
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
}));