import { prisma } from "../db/prisma";
import { ConflictResolver } from "../services/conflictResolver";
import { OrderingService } from "../services/orderingService";
import { Task } from "@prisma/client";

export async function moveTask(params: {
  id: string;
  toColumn: "TODO" | "IN_PROGRESS" | "DONE";
  prevPosition?: number;
  nextPosition?: number;
  incomingVersion: number;
  incomingTime: Date;
}): Promise<Task> {
  const { id, toColumn, prevPosition, nextPosition, incomingVersion, incomingTime } = params;

  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) throw new Error("Task not found");

  // Conflict resolution
  if (!ConflictResolver.resolveMoveWinner(existing, incomingVersion, incomingTime)) {
    throw new Error("Move rejected due to concurrent modification");
  }

  const newPosition = OrderingService.between(prevPosition, nextPosition);

  return prisma.task.update({
    where: { id },
    data: {
      column: toColumn,
      position: newPosition,
      version: existing.version + 1,
      updatedAt: new Date(),
    },
  });
}
