import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useTaskStore } from "../store/taskStore";
import toast from "react-hot-toast";
import { Task } from "../types";

interface EditModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  padding: '10px 14px',
  fontSize: 14,
  color: 'var(--text-primary)',
  fontFamily: 'DM Sans, sans-serif',
  outline: 'none',
  boxSizing: 'border-box',
};

export default function EditModal({ task, isOpen, onClose }: EditModalProps) {
  const { updateTask } = useTaskStore();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error("Title is required"); return; }
    const trimmedDescription = description.trim();
    updateTask(task.id, {
      title: title.trim(),
      description: trimmedDescription || null,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: 50,
            }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 51,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
              pointerEvents: 'none',
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-hover)',
                borderRadius: 20,
                width: '100%',
                maxWidth: 480,
                overflow: 'hidden',
                boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)',
                pointerEvents: 'all',
              }}
            >
              {/* Header */}
              <div style={{
                padding: '18px 20px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div>
                  <h2 style={{
                    fontFamily: 'Syne, sans-serif',
                    fontWeight: 700,
                    fontSize: 16,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.02em',
                    margin: 0,
                  }}>
                    Edit Task
                  </h2>
                  <p style={{
                    margin: '2px 0 0',
                    fontSize: 12,
                    color: 'var(--text-muted)',
                    fontFamily: 'DM Sans, sans-serif',
                  }}>
                    v{task.version} · {task.column.replace('_', ' ')}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-muted)',
                  }}
                >
                  <X size={14} strokeWidth={2.5} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    fontFamily: 'DM Sans, sans-serif',
                    marginBottom: 8,
                  }}>
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    autoFocus
                    required
                    onFocus={() => setFocusedField('title')}
                    onBlur={() => setFocusedField(null)}
                    style={{
                      ...inputStyle,
                      borderColor: focusedField === 'title' ? '#3b6ef8' : 'var(--border)',
                      boxShadow: focusedField === 'title' ? '0 0 0 3px rgba(59,110,248,0.12)' : 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    fontFamily: 'DM Sans, sans-serif',
                    marginBottom: 8,
                  }}>
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Add more context..."
                    onFocus={() => setFocusedField('desc')}
                    onBlur={() => setFocusedField(null)}
                    style={{
                      ...inputStyle,
                      resize: 'none',
                      borderColor: focusedField === 'desc' ? '#3b6ef8' : 'var(--border)',
                      boxShadow: focusedField === 'desc' ? '0 0 0 3px rgba(59,110,248,0.12)' : 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
                  <button
                    type="button"
                    onClick={onClose}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      borderRadius: 10,
                      border: '1px solid var(--border)',
                      background: 'transparent',
                      color: 'var(--text-secondary)',
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: 'pointer',
                      fontFamily: 'DM Sans, sans-serif',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 2,
                      padding: '10px 16px',
                      borderRadius: 10,
                      border: 'none',
                      background: '#3b6ef8',
                      color: '#fff',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'Syne, sans-serif',
                      letterSpacing: '-0.01em',
                      boxShadow: '0 4px 16px rgba(59,110,248,0.35)',
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}