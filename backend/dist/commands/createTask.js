"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTask = createTask;
const prisma_1 = require("../db/prisma");
const orderingService_1 = require("../services/orderingService");
async function createTask(params) {
    const { title, description, column } = params;
    // Find last task in column for positioning
    const lastTask = await prisma_1.prisma.task.findFirst({
        where: { column },
        orderBy: { position: "desc" },
    });
    const position = lastTask
        ? orderingService_1.OrderingService.after(lastTask.position)
        : orderingService_1.OrderingService.firstPosition();
    return prisma_1.prisma.task.create({
        data: { title, description, column, position, version: 1 },
    });
}
