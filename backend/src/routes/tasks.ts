import { Router } from "express";
import { prisma } from "../db/prisma";
import { createTask } from "../commands/createTask";
import { editTask } from "../commands/editTask";
import { moveTask } from "../commands/moveTask";
import { reorderTask } from "../commands/reorderTask";
import { io } from "../server";

const router = Router();

const validColumns = ["TODO", "IN_PROGRESS", "DONE"] as const;
type ColumnType = typeof validColumns[number];

// -------------------- CREATE TASK --------------------
router.post("/", async (req, res) => {
  try {
    const { title, description, column } = req.body;
    if (!title || !column) return res.status(400).json({ error: "title and column required" });
    if (!validColumns.includes(column)) return res.status(400).json({ error: "Invalid column" });

    const task = await createTask({ title, description, column });

    io.emit("taskCreated", task); // Broadcast to all clients
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create task" });
  }
});

// -------------------- EDIT TASK --------------------
router.put("/edit/:id", async (req, res) => {
  try {
    const { title, description, version } = req.body;
    if (!version) return res.status(400).json({ error: "version required for edit" });

    const task = await editTask({
      id: req.params.id,
      title,
      description,
      incomingVersion: version,
    });

    io.emit("taskEdited", task);
    res.json(task);
  } catch (err: any) {
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

    const task = await moveTask({
      id: req.params.id,
      toColumn,
      prevPosition,
      nextPosition,
      incomingVersion: version,
      incomingTime: new Date(timestamp),
    });

    io.emit("taskMoved", task);
    res.json(task);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Failed to move task" });
  }
});

// -------------------- REORDER TASK --------------------
router.put("/reorder/:id", async (req, res) => {
  try {
    const { prevTaskId, nextTaskId } = req.body;

    const task = await reorderTask({
      id: req.params.id,
      prevTaskId,
      nextTaskId,
    });

    io.emit("taskReordered", task);
    res.json(task);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Failed to reorder task" });
  }
});

// -------------------- DELETE TASK --------------------
router.delete("/:id", async (req, res) => {
  try {
    const task = await prisma.task.delete({ where: { id: req.params.id } });
    io.emit("taskDeleted", task.id);
    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

// -------------------- GET ALL TASKS --------------------
router.get("/", async (_req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: [{ column: "asc" }, { position: "asc" }],
    });
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

export default router;
