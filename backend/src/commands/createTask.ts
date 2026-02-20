import { prisma } from "../db/prisma";
import { OrderingService } from "../services/orderingService";
import { Task } from "@prisma/client";

export async function createTask(params: {
  title: string;
  description?: string;
  column: "TODO" | "IN_PROGRESS" | "DONE";
}): Promise<Task> {
  const { title, description, column } = params;

  // Find last task in column for positioning
  const lastTask = await prisma.task.findFirst({
    where: { column },
    orderBy: { position: "desc" },
  });

  const position = lastTask
    ? OrderingService.after(lastTask.position)
    : OrderingService.firstPosition();

  return prisma.task.create({
    data: { title, description, column, position, version: 1 },
  });
}
