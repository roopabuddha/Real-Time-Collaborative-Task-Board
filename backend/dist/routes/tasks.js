"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../db/prisma");
const createTask_1 = require("../commands/createTask");
const editTask_1 = require("../commands/editTask");
const moveTask_1 = require("../commands/moveTask");
const reorderTask_1 = require("../commands/reorderTask");
const server_1 = require("../server");
const router = (0, express_1.Router)();
const validColumns = ["TODO", "IN_PROGRESS", "DONE"];
// -------------------- CREATE TASK --------------------
router.post("/", async (req, res) => {
    try {
        const { title, description, column } = req.body;
        if (!title || !column)
            return res.status(400).json({ error: "title and column required" });
        if (!validColumns.includes(column))
            return res.status(400).json({ error: "Invalid column" });
        const task = await (0, createTask_1.createTask)({ title, description, column });
        server_1.io.emit("taskCreated", task); // Broadcast to all clients
        res.json(task);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create task" });
    }
});
// -------------------- EDIT TASK --------------------
router.put("/edit/:id", async (req, res) => {
    try {
        const { title, description, version } = req.body;
        if (!version)
            return res.status(400).json({ error: "version required for edit" });
        const task = await (0, editTask_1.editTask)({
            id: req.params.id,
            title,
            description,
            incomingVersion: version,
        });
        server_1.io.emit("taskEdited", task);
        res.json(task);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message || "Failed to edit task" });
    }
});
// -------------------- MOVE TASK --------------------
router.put("/move/:id", async (req, res) => {
    try {
        const { toColumn, prevPosition, nextPosition, version, timestamp } = req.body;
        if (!toColumn || version === undefined || !timestamp)
            return res.status(400).json({ error: "toColumn, version, and timestamp required" });
        const task = await (0, moveTask_1.moveTask)({
            id: req.params.id,
            toColumn,
            prevPosition,
            nextPosition,
            incomingVersion: version,
            incomingTime: new Date(timestamp),
        });
        server_1.io.emit("taskMoved", task);
        res.json(task);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message || "Failed to move task" });
    }
});
// -------------------- REORDER TASK --------------------
router.put("/reorder/:id", async (req, res) => {
    try {
        const { prevTaskId, nextTaskId } = req.body;
        const task = await (0, reorderTask_1.reorderTask)({
            id: req.params.id,
            prevTaskId,
            nextTaskId,
        });
        server_1.io.emit("taskReordered", task);
        res.json(task);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message || "Failed to reorder task" });
    }
});
// -------------------- DELETE TASK --------------------
router.delete("/:id", async (req, res) => {
    try {
        const task = await prisma_1.prisma.task.delete({ where: { id: req.params.id } });
        server_1.io.emit("taskDeleted", task.id);
        res.json({ message: "Task deleted" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete task" });
    }
});
// -------------------- GET ALL TASKS --------------------
router.get("/", async (_req, res) => {
    try {
        const tasks = await prisma_1.prisma.task.findMany({
            orderBy: [{ column: "asc" }, { position: "asc" }],
        });
        res.json(tasks);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch tasks" });
    }
});
exports.default = router;
