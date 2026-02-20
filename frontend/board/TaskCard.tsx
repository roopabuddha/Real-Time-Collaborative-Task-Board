import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Edit2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTaskStore } from "../store/taskStore";
import EditModal from "./EditModal";
import { Task } from "../types";
import { useState } from "react";

export default function DraggableTask({ task, isOverlay = false }: { task: Task; isOverlay?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const { deleteTask } = useTaskStore();
  const [showEdit, setShowEdit] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <>
      <motion.div
        ref={setNodeRef}
        style={style}
        {...attributes}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.02 }}
        className={`group bg-slate-800 border border-slate-700 hover:border-slate-500 rounded-3xl p-5 shadow-xl ${isOverlay ? "shadow-2xl scale-105" : ""}`}
      >
        <div className="flex items-start gap-3">
          <button {...listeners} className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="w-4 h-4 text-slate-500" />
          </button>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-white line-clamp-2">{task.title}</h3>
            <p className="text-sm text-slate-400 line-clamp-3 mt-2">{task.description || "No description"}</p>
          </div>
        </div>

        <div className="flex gap-2 mt-6 opacity-0 group-hover:opacity-100 transition-all">
          <button onClick={() => setShowEdit(true)} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-2xl hover:bg-slate-700 text-slate-400 hover:text-white">
            <Edit2 className="w-4 h-4" /> Edit
          </button>
          <button onClick={() => deleteTask(task.id)} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-2xl hover:bg-red-950/50 text-slate-400 hover:text-red-400">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </motion.div>

      <EditModal task={task} isOpen={showEdit} onClose={() => setShowEdit(false)} />
    </>
  );
}