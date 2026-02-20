"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSocketHandlers = registerSocketHandlers;
const presence_1 = require("./presence");
function registerSocketHandlers(io) {
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);
        // Track user presence
        socket.on("joinBoard", (user) => {
            (0, presence_1.addUser)(socket.id, user);
            io.emit("presenceUpdate", (0, presence_1.getUsers)());
        });
        // Task updates via sockets
        socket.on("taskEdited", async (task) => {
            io.emit("taskEdited", task); // broadcast to others
        });
        socket.on("taskMoved", async (task) => {
            io.emit("taskMoved", task);
        });
        socket.on("taskReordered", async (task) => {
            io.emit("taskReordered", task);
        });
        socket.on("taskDeleted", (taskId) => {
            io.emit("taskDeleted", taskId);
        });
        socket.on("disconnect", () => {
            (0, presence_1.removeUser)(socket.id);
            io.emit("presenceUpdate", (0, presence_1.getUsers)());
            console.log("User disconnected:", socket.id);
        });
    });
}
