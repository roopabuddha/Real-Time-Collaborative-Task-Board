"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSocketHandlers = registerSocketHandlers;
const presence_1 = require("./presence");
const prisma_1 = require("../db/prisma");
const createTask_1 = require("../commands/createTask");
const editTask_1 = require("../commands/editTask");
const moveTask_1 = require("../commands/moveTask");
const reorderTask_1 = require("../commands/reorderTask");
function registerSocketHandlers(io) {
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);
        // Presence
        socket.on("joinBoard", (user) => {
            (0, presence_1.addUser)(socket.id, user);
            io.emit("presenceUpdate", (0, presence_1.getUsers)());
        });
        // CREATE
        socket.on("createTask", async (payload) => {
            try {
                const task = await (0, createTask_1.createTask)({
                    title: payload.title,
                    description: payload.description,
                    column: payload.column,
                });
                io.emit("taskCreated", task);
            }
            catch (err) {
                socket.emit("actionRejected", { type: "create", reason: err.message });
            }
        });
        // EDIT
        socket.on("editTask", async (payload) => {
            try {
                // Map client version → incomingVersion for server
                const task = await (0, editTask_1.editTask)({
                    id: payload.id,
                    title: payload.title,
                    description: payload.description,
                    incomingVersion: payload.version,
                });
                io.emit("taskEdited", task);
            }
            catch (err) {
                socket.emit("actionRejected", { type: "edit", id: payload.id, reason: err.message });
            }
        });
        // MOVE
        socket.on("moveTask", async (payload) => {
            try {
                const task = await (0, moveTask_1.moveTask)({
                    id: payload.id,
                    toColumn: payload.toColumn,
                    prevPosition: payload.prevPosition,
                    nextPosition: payload.nextPosition,
                    incomingVersion: payload.version, // map version
                    incomingTime: new Date(payload.timestamp),
                });
                io.emit("taskMoved", task);
            }
            catch (err) {
                socket.emit("actionRejected", { type: "move", id: payload.id, reason: err.message });
            }
        });
        // REORDER
        socket.on("reorderTask", async (payload) => {
            try {
                const task = await (0, reorderTask_1.reorderTask)(payload);
                io.emit("taskReordered", task);
            }
            catch (err) {
                socket.emit("actionRejected", { type: "reorder", id: payload.id, reason: err.message });
            }
        });
        // DELETE
        socket.on("deleteTask", async (taskId) => {
            try {
                const deleted = await prisma_1.prisma.task.delete({ where: { id: taskId } });
                io.emit("taskDeleted", deleted.id);
            }
            catch (err) {
                socket.emit("actionRejected", { type: "delete", id: taskId, reason: err.message });
            }
        });
        // Disconnect
        socket.on("disconnect", () => {
            (0, presence_1.removeUser)(socket.id);
            io.emit("presenceUpdate", (0, presence_1.getUsers)());
            console.log("User disconnected:", socket.id);
        });
    });
}
