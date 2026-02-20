"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reorderTask = reorderTask;
const prisma_1 = require("../db/prisma");
const orderingService_1 = require("../services/orderingService");
async function reorderTask(id, afterPosition, beforePosition) {
    const task = await prisma_1.prisma.task.findUnique({ where: { id } });
    if (!task)
        throw new Error("Task not found");
    const newPosition = orderingService_1.OrderingService.between(afterPosition, beforePosition);
    return prisma_1.prisma.task.update({
        where: { id },
        data: {
            position: newPosition,
            version: { increment: 1 },
        },
    });
}
