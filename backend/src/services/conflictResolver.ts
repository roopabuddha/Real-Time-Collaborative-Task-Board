import { Task } from "@prisma/client";

export class ConflictResolver {
  static mergeEdit(existing: Task, incoming: Partial<Task>): Partial<Task> {
    return {
      title: incoming.title ?? existing.title,
      description: incoming.description ?? existing.description,
    };
  }

  static resolveMoveWinner(existing: Task, incomingVersion: number, incomingTime: Date): boolean {
    if (incomingVersion < existing.version) return false;
    if (incomingVersion === existing.version) {
      return incomingTime.getTime() > existing.updatedAt.getTime();
    }
    return true;
  }
}
