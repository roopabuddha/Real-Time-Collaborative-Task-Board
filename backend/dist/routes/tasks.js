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
// CREATE
router.post("/", async (req, res) => {
    try {
        const { title, description, column } = req.body;
        if (!title || !column)
            return res.status(400).json({ error: "title and column required" });
        if (!validColumns.includes(column))
            return res.status(400).json({ error: "Invalid column" });
        const task = await (0, createTask_1.createTask)(title, description, column);
        server_1.io.emit("taskCreated", task); // Broadcast
        res.json(task);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to create task" });
    }
});
// EDIT
router.put("/edit/:id", async (req, res) => {
    try {
        const task = await (0, editTask_1.editTask)(req.params.id, req.body);
        server_1.io.emit("taskEdited", task);
        res.json(task);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to edit task" });
    }
});
// MOVE
router.put("/move/:id", async (req, res) => {
    try {
        const { toColumn, afterPosition, beforePosition } = req.body;
        const task = await (0, moveTask_1.moveTask)(req.params.id, toColumn, afterPosition, beforePosition);
        server_1.io.emit("taskMoved", task);
        res.json(task);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to move task" });
    }
});
// REORDER
router.put("/reorder/:id", async (req, res) => {
    try {
        const { afterPosition, beforePosition } = req.body;
        const task = await (0, reorderTask_1.reorderTask)(req.params.id, afterPosition, beforePosition);
        server_1.io.emit("taskReordered", task);
        res.json(task);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to reorder task" });
    }
});
// DELETE
router.delete("/:id", async (req, res) => {
    try {
        const task = await prisma_1.prisma.task.delete({ where: { id: req.params.id } });
        server_1.io.emit("taskDeleted", task.id);
        res.json({ message: "Task deleted" });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to delete task" });
    }
});
// GET
router.get("/", async (_req, res) => {
    const tasks = await prisma_1.prisma.task.findMany({
        orderBy: [{ column: "asc" }, { position: "asc" }],
    });
    res.json(tasks);
});
exports.default = router;
