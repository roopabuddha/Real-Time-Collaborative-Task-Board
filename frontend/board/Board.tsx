import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useTaskStore } from "../store/taskStore";
import Column from "./Column";
import { Task } from "../types";
import DraggableTask from "./DraggableTask";

const columns = ["TODO", "IN_PROGRESS", "DONE"] as const;
type ColumnId = (typeof columns)[number];

const columnTitles: Record<ColumnId, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

export default function Board() {
  const { tasks, setTasks, moveOrReorderTask } = useTaskStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor)
  );

  const groupedTasks = useMemo(() => {
    const groups: Record<ColumnId, Task[]> = { TODO: [], IN_PROGRESS: [], DONE: [] };
    tasks.forEach((t) => {
      if (t.column in groups) groups[t.column as ColumnId].push(t);
    });
    Object.values(groups).forEach((g) => g.sort((a, b) => a.position - b.position));
    return groups;
  }, [tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTask(tasks.find((t) => t.id === event.active.id) ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) { setActiveTask(null); return; }

    const task = tasks.find((t) => t.id === active.id);
    if (!task) { setActiveTask(null); return; }

    let overColumn: ColumnId = over.id as ColumnId;
    let overTaskId: string | null = null;

    if (!columns.includes(overColumn)) {
      const overTask = tasks.find((t) => t.id === over.id);
      if (overTask) { overColumn = overTask.column as ColumnId; overTaskId = over.id as string; }
      else overColumn = task.column as ColumnId;
    }

    moveOrReorderTask(active.id as string, overTaskId, overColumn);
    setActiveTask(null);
  };

  useEffect(() => {
    const apiUrl =
      (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_URL) ||
      "http://localhost:4000";
    fetch(`${apiUrl}/api/tasks`)
      .then((r) => { if (!r.ok) throw new Error("Failed"); return r.json(); })
      .then(setTasks)
      .catch(console.error);
  }, [setTasks]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div style={{
        display: "flex",
        gap: 12,
        padding: "16px 20px 20px",
        /* Fill exact parent height so columns reach the bottom */
        height: "100%",
        alignItems: "stretch",   // columns all same height
        overflowX: "auto",
        overflowY: "hidden",
        WebkitOverflowScrolling: "touch",
        scrollSnapType: "x mandatory",
      }}>
        {columns.map((col) => (
          <Column
            key={col}
            id={col}
            title={columnTitles[col]}
            tasks={groupedTasks[col]}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTask && <DraggableTask task={activeTask} isOverlay accentColor="#4f7fff" />}
      </DragOverlay>
    </DndContext>
  );
}