import { useSocketStore } from "../store/socketStore";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Clock } from "lucide-react";

export default function OfflineBanner() {
  const { connected, queuedCount } = useSocketStore();

  return (
    <AnimatePresence>
      {!connected && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          style={{
            background: "rgba(244, 63, 94, 0.08)",
            borderBottom: "1px solid rgba(244, 63, 94, 0.2)",
            padding: "8px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            fontFamily: "DM Sans, sans-serif",
            fontSize: 13,
          }}
        >
          <WifiOff size={14} color="#f43f5e" />
          <span style={{ color: "#f43f5e", fontWeight: 500 }}>
            Offline — read-only mode.
          </span>
          {queuedCount > 0 && (
            <span style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "2px 8px",
              borderRadius: 20,
              background: "rgba(245,158,11,0.12)",
              border: "1px solid rgba(245,158,11,0.25)",
              color: "#f59e0b",
              fontSize: 12,
              fontWeight: 600,
            }}>
              <Clock size={11} />
              {queuedCount} action{queuedCount !== 1 ? "s" : ""} queued
            </span>
          )}
          <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
            Will sync on reconnect.
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}