import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import DraggableTask from "./DraggableTask";
import CreateModal from "./CreateModal";
import { motion, AnimatePresence } from "framer-motion";
import { Task } from "../types";
import { useState } from "react";

const columnConfig: Record<string, { accent: string; label: string }> = {
  TODO: { accent: "#3b82f6", label: "To Do" },
  IN_PROGRESS: { accent: "#f59e0b", label: "In Progress" },
  DONE: { accent: "#10b981", label: "Done" },
};

export default function Column({
  id,
  title,
  tasks,
}: {
  id: string;
  title: string;
  tasks: Task[];
  color?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const [showCreate, setShowCreate] = useState(false);
  const cfg = columnConfig[id] ?? { accent: "#3b82f6", label: title };
  const accent = cfg.accent;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        whileHover={{ y: -8, scale: 1.015 }}
        style={{
          width: "min(340px, 88vw)",
          minWidth: "min(340px, 88vw)",
          flexShrink: 0,
          background: isOver
            ? `linear-gradient(145deg, #0f172a, ${accent}0c)`
            : "linear-gradient(145deg, #0f172a, #111827)",
          border: `1px solid ${isOver ? accent + "65" : "#1e293b"}`,
          borderRadius: 20,
          height: "calc(100vh - 160px)",
          minHeight: 420,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          boxShadow: isOver
            ? `0 0 0 2px ${accent}35, 0 30px 70px rgba(0,0,0,0.55), inset 0 0 40px ${accent}08`
            : "0 10px 40px rgba(0,0,0,0.4)",
          backdropFilter: "blur(12px)",
          transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <motion.div
          animate={{
            opacity: isOver ? 0.95 : 0.6,
            scaleX: isOver ? 1.06 : 1,
          }}
          transition={{ duration: 0.5 }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, transparent, ${accent}90, transparent)`,
            boxShadow: `0 0 20px ${accent}70`,
            zIndex: 10,
          }}
        />

        <div
          style={{
            padding: "20px 18px 14px",
            borderBottom: `1px solid ${isOver ? accent + "30" : "#1e293b"}`,
            flexShrink: 0,
            backdropFilter: "blur(10px)",
            background: "rgba(15, 23, 42, 0.65)",
            zIndex: 5,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <motion.div
                animate={{ scale: isOver ? [1, 1.35, 1] : 1 }}
                transition={{ repeat: isOver ? Infinity : 0, duration: 1.4 }}
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: accent,
                  boxShadow: `0 0 12px ${accent}90, inset 0 0 3px white`,
                  flexShrink: 0,
                }}
              />
              <h2
                style={{
                  fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                  fontWeight: 800,
                  fontSize: 15,
                  color: "#f1f5f9",
                  letterSpacing: "-0.02em",
                  margin: 0,
                  whiteSpace: "nowrap",
                }}
              >
                {cfg.label}
              </h2>
              <motion.span
                animate={{ scale: tasks.length > 0 ? 1 : 0.92 }}
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "2px 9px",
                  borderRadius: 20,
                  background: `${accent}20`,
                  color: accent,
                  fontFamily: "DM Sans, sans-serif",
                  flexShrink: 0,
                }}
              >
                {tasks.length}
              </motion.span>
            </div>

            <motion.button
              whileHover={{ scale: 1.18, rotate: 90 }}
              whileTap={{ scale: 0.86 }}
              transition={{ type: "spring", stiffness: 450, damping: 18 }}
              onClick={() => setShowCreate(true)}
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: "transparent",
                border: `1.5px solid ${isOver ? accent + "55" : "#1e293b"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: isOver ? accent : "#64748b",
                flexShrink: 0,
              }}
              title="Add task"
            >
              <Plus size={16} strokeWidth={2.8} />
            </motion.button>
          </div>
        </div>

        <div
          ref={setNodeRef}
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            padding: "16px 12px 0",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            scrollbarWidth: "thin",
            scrollbarColor: `${accent}40 transparent`,
          }}
        >
          <AnimatePresence initial={false}>
            <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              {tasks.map((task) => (
                <DraggableTask key={task.id} task={task} accentColor={accent} />
              ))}
            </SortableContext>
          </AnimatePresence>

          {tasks.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "60px 20px",
                gap: 14,
              }}
            >
              <motion.div
                animate={{ scale: isOver ? [1, 1.18, 1] : 1 }}
                transition={{ repeat: isOver ? Infinity : 0, duration: 1.6 }}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 18,
                  border: `2px dashed ${isOver ? accent + "75" : "#334155"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: isOver ? `${accent}0c` : "transparent",
                  boxShadow: isOver ? `0 0 20px ${accent}40` : "none",
                  transition: "all 0.35s",
                }}
              >
                <Plus size={20} color={isOver ? accent : "#475569"} />
              </motion.div>

              <motion.span
                animate={{ opacity: isOver ? 1 : 0.75, color: isOver ? accent : "#64748b" }}
                transition={{ duration: 0.3 }}
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                {isOver ? "Release to drop here" : "No tasks yet"}
              </motion.span>

              {!isOver && (
                <motion.button
                  whileHover={{ scale: 1.08, y: -3 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setShowCreate(true)}
                  style={{
                    marginTop: 16,
                    padding: "10px 24px",
                    borderRadius: 12,
                    background: `${accent}18`,
                    border: `1px solid ${accent}40`,
                    color: accent,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontFamily: "DM Sans, sans-serif",
                    boxShadow: `0 0 12px ${accent}20`,
                  }}
                >
                  <Plus size={14} />
                  Create task
                </motion.button>
              )}
            </motion.div>
          )}

          <div style={{ height: 20, flexShrink: 0 }} />
        </div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={{
            padding: "12px 16px",
            borderTop: `1px solid ${isOver ? accent + "30" : "#1e293b"}`,
            flexShrink: 0,
            background: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(16px)",
            zIndex: 5,
          }}
        >
          <motion.button
            whileHover={{ scale: 1.04, backgroundColor: `${accent}15`, borderColor: `${accent}50` }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowCreate(true)}
            style={{
              width: "100%",
              padding: "10px 16px",
              borderRadius: 12,
              background: "transparent",
              border: `1.5px dashed ${isOver ? accent + "65" : "#334155"}`,
              cursor: "pointer",
              color: isOver ? accent : "#94a3b8",
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontFamily: "DM Sans, sans-serif",
              transition: "all 0.25s",
            }}
          >
            <Plus size={14} strokeWidth={2.8} />
            Add new task
          </motion.button>
        </motion.div>
      </motion.div>

      <CreateModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        defaultColumn={id as Task["column"]}
      />
    </>
  );
}