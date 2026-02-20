import { prisma } from "../db/prisma";
import { ConflictResolver } from "../services/conflictResolver";
import { Task } from "@prisma/client";

export async function editTask(params: {
  id: string;
  title?: string;
  description?: string;
  incomingVersion: number;
}): Promise<Task | null> {
  const { id, title, description, incomingVersion } = params;

  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) return null;

  // Check version for concurrent updates
  if (!ConflictResolver.resolveMoveWinner(existing, incomingVersion, new Date())) {
    throw new Error("Edit rejected due to concurrent modification");
  }

  const dataToUpdate = ConflictResolver.mergeEdit(existing, { title, description });

  // Increment version
  return prisma.task.update({
    where: { id },
    data: { ...dataToUpdate, version: existing.version + 1 },
  });
}
