import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Pencil, Trash2 } from "lucide-react";
import { useTaskStore } from "../store/taskStore";
import EditModal from "./EditModal";
import { Task } from "../types";

interface DraggableTaskProps {
  task: Task;
  isOverlay?: boolean;
  accentColor?: string;
}

const columnColor: Record<string, string> = {
  TODO: "#4f7fff",
  IN_PROGRESS: "#f5a623",
  DONE: "#00c98d",
};

const columnLabel: Record<string, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

export default function DraggableTask({
  task,
  isOverlay = false,
  accentColor = "#4f7fff",
}: DraggableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useSortable({ id: task.id });

  const { deleteTask } = useTaskStore();
  const [showEdit, setShowEdit] = useState(false);
  const [hovered, setHovered] = useState(false);

  const col = task.column as string;
  const accent = columnColor[col] ?? accentColor;

  const outerStyle: React.CSSProperties = {
    // Use transform + will-change for GPU-accelerated smoothness
    transform: CSS.Transform.toString(transform),
    transition: isDragging
      ? "none"
      : "transform 220ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 200ms ease",
    opacity: isDragging ? 0 : 1,
    willChange: "transform",
    cursor: isDragging ? "grabbing" : "grab",
    touchAction: "none",
    userSelect: "none",
    WebkitUserSelect: "none",
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (window.confirm("Delete this task?")) deleteTask(task.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowEdit(true);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');

        @keyframes card-enter {
          0%   { opacity: 0; transform: translateY(10px) scale(0.96); }
          60%  { opacity: 1; transform: translateY(-2px) scale(1.01); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .task-card-inner {
          animation: card-enter 0.32s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          /* Smooth all visual property transitions */
          transition:
            background   220ms cubic-bezier(0.4, 0, 0.2, 1),
            border-color 220ms cubic-bezier(0.4, 0, 0.2, 1),
            box-shadow   280ms cubic-bezier(0.4, 0, 0.2, 1),
            transform    220ms cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .task-action-btn {
          transition:
            background 180ms cubic-bezier(0.4, 0, 0.2, 1),
            color       180ms cubic-bezier(0.4, 0, 0.2, 1),
            transform   180ms cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .task-action-btn:hover  { transform: scale(1.1);  }
        .task-action-btn:active { transform: scale(0.92); }
        .accent-bar {
          transition:
            height     200ms cubic-bezier(0.4, 0, 0.2, 1),
            box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1),
            opacity    200ms ease;
        }
        .grip-hint {
          transition: opacity 200ms ease;
        }
      `}</style>

      <div
        ref={setNodeRef}
        style={outerStyle}
        {...attributes}
        {...listeners}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          className="task-card-inner"
          style={{
            background: isOverlay
              ? "linear-gradient(150deg, #17253d 0%, #1c2f4a 100%)"
              : hovered
              ? "linear-gradient(150deg, #101c2e 0%, #0e1a2b 100%)"
              : "#090f1b",
            border: `1px solid ${
              isOverlay ? accent + "90"
              : hovered   ? accent + "45"
              : "#182438"
            }`,
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: isOverlay
              ? `0 28px 56px rgba(0,0,0,0.65), 0 0 0 1px ${accent}55`
              : hovered
              ? `0 10px 32px rgba(0,0,0,0.4), 0 0 0 1px ${accent}20`
              : "0 1px 6px rgba(0,0,0,0.3)",
            transform: isOverlay
              ? "rotate(2.5deg) scale(1.04)"
              : hovered
              ? "translateY(-3px)"
              : "translateY(0)",
            position: "relative",
          }}
        >
          {/* Accent bar */}
          <div
            className="accent-bar"
            style={{
              height: hovered || isOverlay ? 3 : 2,
              background: `linear-gradient(90deg, ${accent}ee, ${accent}55 60%, transparent)`,
              boxShadow: hovered || isOverlay ? `0 0 10px ${accent}70` : "none",
              opacity: hovered || isOverlay ? 1 : 0.7,
            }}
          />

          {/* Grip dots — top right, fade in on hover */}
          <div
            className="grip-hint"
            style={{
              position: "absolute",
              top: 9, right: 9,
              opacity: hovered || isOverlay ? 0.4 : 0,
              display: "grid",
              gridTemplateColumns: "repeat(2, 4px)",
              gap: 3,
              pointerEvents: "none",
            }}
          >
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{
                width: 3, height: 3,
                borderRadius: "50%",
                background: accent,
              }} />
            ))}
          </div>

          {/* Content */}
          <div style={{ padding: "11px 30px 0 12px" }}>
            {/* Title */}
            <h3 style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 600,
              fontSize: 13.5,
              color: hovered ? "#f8faff" : "#dde6f5",
              letterSpacing: "-0.01em",
              lineHeight: 1.45,
              margin: 0,
              wordBreak: "break-word",
              whiteSpace: "pre-wrap",
              transition: "color 200ms ease",
            }}>
              {task.title}
            </h3>

            {/* Description */}
            <div style={{ marginTop: 5 }}>
              {task.description ? (
                <p style={{
                  margin: 0,
                  fontSize: 12,
                  color: "#5a7099",
                  lineHeight: 1.6,
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 400,
                  wordBreak: "break-word",
                  whiteSpace: "pre-wrap",
                  transition: "color 200ms ease",
                }}>
                  {task.description}
                </p>
              ) : (
                <p style={{
                  margin: 0,
                  fontSize: 11.5,
                  color: "#1e2d45",
                  fontFamily: "'Outfit', sans-serif",
                  fontStyle: "italic",
                }}>
                  No description
                </p>
              )}
            </div>

            {/* Meta row */}
            <div style={{
              marginTop: 9,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}>
              {/* Column tag */}
              <span style={{
                fontSize: 9.5,
                fontWeight: 700,
                padding: "2px 7px",
                borderRadius: 4,
                background: `${accent}18`,
                color: accent,
                fontFamily: "'Outfit', sans-serif",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                border: `1px solid ${accent}25`,
              }}>
                {columnLabel[col] ?? col}
              </span>

              {/* Version — monospace feel */}
              {task.version > 0 && (
                <span style={{
                  fontSize: 9.5,
                  color: "#243347",
                  fontFamily: "ui-monospace, 'Cascadia Code', monospace",
                  letterSpacing: "0.04em",
                }}>
                  v{task.version}
                </span>
              )}
            </div>
          </div>

          {/* ── Action bar ── */}
          <div style={{
            display: "flex",
            borderTop: `1px solid ${hovered ? "#1e2d45" : "#111a28"}`,
            marginTop: 10,
            transition: "border-color 220ms ease",
          }}>
            <button
              className="task-action-btn"
              onPointerDown={e => e.stopPropagation()}
              onClick={handleEdit}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                padding: "8px 0",
                background: "transparent",
                border: "none",
                borderRight: "1px solid #111a28",
                cursor: "pointer",
                color: "#3d5270",
                fontSize: 11.5,
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 500,
                letterSpacing: "0.01em",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = `${accent}12`;
                (e.currentTarget as HTMLElement).style.color = accent;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
                (e.currentTarget as HTMLElement).style.color = "#3d5270";
              }}
            >
              <Pencil size={11} strokeWidth={2.5} />
              Edit
            </button>

            <button
              className="task-action-btn"
              onPointerDown={e => e.stopPropagation()}
              onClick={handleDelete}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                padding: "8px 0",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#3d5270",
                fontSize: 11.5,
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 500,
                letterSpacing: "0.01em",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.09)";
                (e.currentTarget as HTMLElement).style.color = "#ef4444";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
                (e.currentTarget as HTMLElement).style.color = "#3d5270";
              }}
            >
              <Trash2 size={11} strokeWidth={2.5} />
              Delete
            </button>
          </div>
        </div>
      </div>

      <EditModal task={task} isOpen={showEdit} onClose={() => setShowEdit(false)} />
    </>
  );
}