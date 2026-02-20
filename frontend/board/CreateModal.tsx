import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useTaskStore } from "../store/taskStore";
import toast from "react-hot-toast";
import { Task } from "../types";

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultColumn?: Task["column"];
}

const columnOptions = [
  { value: "TODO", label: "To Do", color: "#3b6ef8" },
  { value: "IN_PROGRESS", label: "In Progress", color: "#f59e0b" },
  { value: "DONE", label: "Done", color: "#10b981" },
] as const;

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

export default function CreateModal({ isOpen, onClose, defaultColumn = "TODO" }: CreateModalProps) {
  const { addTask } = useTaskStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [column, setColumn] = useState<Task["column"]>(defaultColumn);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDescription("");
      setColumn(defaultColumn);
      setSubmitting(false);
    }
  }, [isOpen, defaultColumn]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const trimmedTitle = title.trim();
    if (!trimmedTitle) { toast.error("Title is required"); return; }
    setSubmitting(true);
    addTask(trimmedTitle, description.trim() || null, column);
    onClose();
  };

  const selectedColumn = columnOptions.find(c => c.value === column);

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
                <h2 style={{
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: 700,
                  fontSize: 16,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                  margin: 0,
                }}>
                  New Task
                </h2>
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
                    Title <span style={{ color: '#f43f5e' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="What needs to be done?"
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
                    rows={3}
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
                    Column
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {columnOptions.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setColumn(opt.value)}
                        style={{
                          flex: 1,
                          padding: '8px 10px',
                          borderRadius: 8,
                          border: `1px solid ${column === opt.value ? opt.color + '60' : 'var(--border)'}`,
                          background: column === opt.value ? `${opt.color}14` : 'var(--bg-secondary)',
                          color: column === opt.value ? opt.color : 'var(--text-secondary)',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontFamily: 'DM Sans, sans-serif',
                          transition: 'all 150ms',
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
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
                    disabled={submitting}
                    style={{
                      flex: 2,
                      padding: '10px 16px',
                      borderRadius: 10,
                      border: 'none',
                      background: submitting ? '#1e2d45' : (selectedColumn?.color || '#3b6ef8'),
                      color: submitting ? 'var(--text-muted)' : '#fff',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      fontFamily: 'Syne, sans-serif',
                      letterSpacing: '-0.01em',
                      opacity: submitting ? 0.6 : 1,
                      boxShadow: submitting ? 'none' : `0 4px 16px ${(selectedColumn?.color || '#3b6ef8')}40`,
                    }}
                  >
                    {submitting ? 'Creating…' : 'Create Task'}
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