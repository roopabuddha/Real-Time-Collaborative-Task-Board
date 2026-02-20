"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editTask = editTask;
const prisma_1 = require("../db/prisma");
const conflictResolver_1 = require("../services/conflictResolver");
async function editTask(params) {
    const { id, title, description, incomingVersion } = params;
    const existing = await prisma_1.prisma.task.findUnique({ where: { id } });
    if (!existing)
        return null;
    // Check version for concurrent updates
    if (!conflictResolver_1.ConflictResolver.resolveMoveWinner(existing, incomingVersion, new Date())) {
        throw new Error("Edit rejected due to concurrent modification");
    }
    const dataToUpdate = conflictResolver_1.ConflictResolver.mergeEdit(existing, { title, description });
    // Increment version
    return prisma_1.prisma.task.update({
        where: { id },
        data: { ...dataToUpdate, version: existing.version + 1 },
    });
}
