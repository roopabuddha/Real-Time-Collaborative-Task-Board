"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reorderTask = reorderTask;
const prisma_1 = require("../db/prisma");
const orderingService_1 = require("../services/orderingService");
async function reorderTask(params) {
    const { id, prevTaskId, nextTaskId } = params;
    const task = await prisma_1.prisma.task.findUnique({ where: { id } });
    if (!task)
        throw new Error("Task not found");
    // Fetch positions of neighboring tasks
    const prevTask = prevTaskId ? await prisma_1.prisma.task.findUnique({ where: { id: prevTaskId } }) : undefined;
    const nextTask = nextTaskId ? await prisma_1.prisma.task.findUnique({ where: { id: nextTaskId } }) : undefined;
    const newPosition = orderingService_1.OrderingService.between(prevTask?.position, nextTask?.position);
    return prisma_1.prisma.task.update({
        where: { id },
        data: { position: newPosition, version: task.version + 1, updatedAt: new Date() },
    });
}
