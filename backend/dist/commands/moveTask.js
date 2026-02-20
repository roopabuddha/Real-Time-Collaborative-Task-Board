"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveTask = moveTask;
const prisma_1 = require("../db/prisma");
const conflictResolver_1 = require("../services/conflictResolver");
const orderingService_1 = require("../services/orderingService");
async function moveTask(params) {
    const { id, toColumn, prevPosition, nextPosition, incomingVersion, incomingTime } = params;
    const existing = await prisma_1.prisma.task.findUnique({ where: { id } });
    if (!existing)
        throw new Error("Task not found");
    // Conflict resolution
    if (!conflictResolver_1.ConflictResolver.resolveMoveWinner(existing, incomingVersion, incomingTime)) {
        throw new Error("Move rejected due to concurrent modification");
    }
    const newPosition = orderingService_1.OrderingService.between(prevPosition, nextPosition);
    return prisma_1.prisma.task.update({
        where: { id },
        data: {
            column: toColumn,
            position: newPosition,
            version: existing.version + 1,
            updatedAt: new Date(),
        },
    });
}
