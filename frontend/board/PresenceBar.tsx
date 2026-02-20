import { useSocketStore } from "../store/socketStore";
import { motion, AnimatePresence } from "framer-motion";

export default function PresenceBar() {
  const { users, connected } = useSocketStore();

  const getColor = (id: string) => {
    const palettes = [
      { bg: "#3b6ef8", text: "#fff" },
      { bg: "#f59e0b", text: "#000" },
      { bg: "#10b981", text: "#fff" },
      { bg: "#f43f5e", text: "#fff" },
      { bg: "#8b5cf6", text: "#fff" },
      { bg: "#06b6d4", text: "#000" },
    ];
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
    return palettes[Math.abs(hash) % palettes.length];
  };

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: "rgba(6, 9, 18, 0.9)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
        padding: "8px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 40,
        flexWrap: "wrap",
        gap: 8,
      }}
    >
      {/* Connection status */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          className={connected ? "pulse-connected" : ""}
          style={{
            width: 8, height: 8, borderRadius: "50%",
            background: connected ? "var(--accent-emerald)" : "var(--accent-rose)",
            flexShrink: 0,
          }}
        />
        <span style={{
          fontSize: 13,
          fontWeight: 500,
          color: connected ? "var(--text-secondary)" : "#f43f5e",
          fontFamily: "DM Sans, sans-serif",
        }}>
          {connected ? "Live" : "Offline"}
        </span>
      </div>

      {/* Users presence */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{
          fontSize: 12,
          color: "var(--text-muted)",
          fontFamily: "DM Sans, sans-serif",
          whiteSpace: "nowrap",
        }}>
          {users.length} {users.length === 1 ? "viewer" : "viewers"}
        </span>

        <div style={{ display: "flex", alignItems: "center" }}>
          <AnimatePresence>
            {users.slice(0, 6).map((u: any, i: number) => {
              const color = getColor(u.userId);
              const label = (u.name || u.userId)?.[0]?.toUpperCase() ?? "?";
              return (
                <motion.div
                  key={u.userId}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ delay: i * 0.04 }}
                  title={u.name || u.userId}
                  style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: color.bg, color: color.text,
                    fontSize: 11, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "2px solid var(--bg-primary)",
                    marginLeft: i > 0 ? -8 : 0,
                    zIndex: 10 - i,
                    position: "relative",
                    cursor: "default",
                    fontFamily: "Syne, sans-serif",
                    flexShrink: 0,
                  }}
                >
                  {label}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {users.length > 6 && (
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "var(--bg-card)",
              border: "2px solid var(--bg-primary)",
              fontSize: 10, fontWeight: 600,
              color: "var(--text-muted)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginLeft: -8, zIndex: 0, position: "relative",
            }}>
              +{users.length - 6}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}