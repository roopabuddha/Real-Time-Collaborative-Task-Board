import { prisma } from "../db/prisma";
import { OrderingService } from "../services/orderingService";
import { Task } from "@prisma/client";

export async function reorderTask(params: {
  id: string;
  prevTaskId?: string;
  nextTaskId?: string;
}): Promise<Task> {
  const { id, prevTaskId, nextTaskId } = params;

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) throw new Error("Task not found");

  // Fetch positions of neighboring tasks
  const prevTask = prevTaskId ? await prisma.task.findUnique({ where: { id: prevTaskId } }) : undefined;
  const nextTask = nextTaskId ? await prisma.task.findUnique({ where: { id: nextTaskId } }) : undefined;

  const newPosition = OrderingService.between(prevTask?.position, nextTask?.position);

  return prisma.task.update({
    where: { id },
    data: { position: newPosition, version: task.version + 1, updatedAt: new Date() },
  });
}
