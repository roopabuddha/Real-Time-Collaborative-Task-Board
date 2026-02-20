import { Server, Socket } from "socket.io";
import { addUser, removeUser, getUsers } from "./presence";
import { prisma } from "../db/prisma";
import { createTask } from "../commands/createTask";
import { editTask } from "../commands/editTask";
import { moveTask } from "../commands/moveTask";
import { reorderTask } from "../commands/reorderTask";

type TaskPayload = {
  id: string;
  title?: string;
  description?: string;
  version: number; // always client sends `version`
};

type MovePayload = {
  id: string;
  toColumn: "TODO" | "IN_PROGRESS" | "DONE";
  prevPosition?: number;
  nextPosition?: number;
  version: number; // client version
  timestamp: string;
};

export function registerSocketHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    // Presence
    socket.on("joinBoard", (user: { userId: string; name?: string }) => {
      addUser(socket.id, user);
      io.emit("presenceUpdate", getUsers());
    });

    // CREATE
    socket.on("createTask", async (payload: { title: string; description?: string; column: string }) => {
      try {
        const task = await createTask({
          title: payload.title,
          description: payload.description,
          column: payload.column as any,
        });
        io.emit("taskCreated", task);
      } catch (err: any) {
        socket.emit("actionRejected", { type: "create", reason: err.message });
      }
    });

    // EDIT
    socket.on("editTask", async (payload: TaskPayload) => {
      try {
        // Map client version → incomingVersion for server
        const task = await editTask({
          id: payload.id,
          title: payload.title,
          description: payload.description,
          incomingVersion: payload.version,
        });
        io.emit("taskEdited", task);
      } catch (err: any) {
        socket.emit("actionRejected", { type: "edit", id: payload.id, reason: err.message });
      }
    });

    // MOVE
    socket.on("moveTask", async (payload: MovePayload) => {
      try {
        const task = await moveTask({
          id: payload.id,
          toColumn: payload.toColumn,
          prevPosition: payload.prevPosition,
          nextPosition: payload.nextPosition,
          incomingVersion: payload.version, // map version
          incomingTime: new Date(payload.timestamp),
        });
        io.emit("taskMoved", task);
      } catch (err: any) {
        socket.emit("actionRejected", { type: "move", id: payload.id, reason: err.message });
      }
    });

    // REORDER
    socket.on(
      "reorderTask",
      async (payload: { id: string; prevTaskId?: string; nextTaskId?: string }) => {
        try {
          const task = await reorderTask(payload);
          io.emit("taskReordered", task);
        } catch (err: any) {
          socket.emit("actionRejected", { type: "reorder", id: payload.id, reason: err.message });
        }
      }
    );

    // DELETE
    socket.on("deleteTask", async (taskId: string) => {
      try {
        const deleted = await prisma.task.delete({ where: { id: taskId } });
        io.emit("taskDeleted", deleted.id);
      } catch (err: any) {
        socket.emit("actionRejected", { type: "delete", id: taskId, reason: err.message });
      }
    });

    // Disconnect
    socket.on("disconnect", () => {
      removeUser(socket.id);
      io.emit("presenceUpdate", getUsers());
      console.log("User disconnected:", socket.id);
    });
  });
}
