import Board from "../board/Board";
import PresenceBar from "../board/PresenceBar";
import OfflineBanner from "../board/OfflineBanner";
import DndErrorBoundary from "../board/DndErrorBoundary";
import { useSocketStore } from "../store/socketStore";
import { useEffect, useState } from "react";

export default function App() {
  const { connect } = useSocketStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("kb_user");
    const user = stored
      ? JSON.parse(stored)
      : {
          userId: `user-${Math.random().toString(36).slice(2, 8)}`,
          name: `User ${Math.floor(Math.random() * 1000)}`,
        };
    localStorage.setItem("kb_user", JSON.stringify(user));
    connect(user);
    requestAnimationFrame(() => setMounted(true));
  }, [connect]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseDot {
          0%,100% { box-shadow: 0 0 0 0   rgba(0,201,141,0.7); }
          60%      { box-shadow: 0 0 0 5px rgba(0,201,141,0);   }
        }
        @keyframes slideRule {
          from { transform: scaleX(0); transform-origin: left; }
          to   { transform: scaleX(1); transform-origin: left; }
        }

        .page-in  { animation: ${mounted ? "fadeIn 0.45s cubic-bezier(0.22,1,0.36,1) 0.05s both" : "none"}; }
        .board-in { animation: ${mounted ? "fadeIn 0.5s  cubic-bezier(0.22,1,0.36,1) 0.14s both" : "none"}; }
        .rule-in  { animation: ${mounted ? "slideRule 0.65s cubic-bezier(0.22,1,0.36,1) 0.2s both" : "none"}; }
        .dot-pulse { animation: pulseDot 2s ease-in-out infinite; }

        body { font-family: 'Outfit', sans-serif; }
      `}</style>

      <div style={{
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        background: "#060912",
        backgroundImage:
          "radial-gradient(ellipse 60% 35% at 0% 0%, rgba(59,110,248,0.07) 0%, transparent 60%)",
        fontFamily: "'Outfit', sans-serif",
      }}>

        {/* ── Presence / Offline (zero height when not needed) ── */}
        <PresenceBar />
        <OfflineBanner />

        {/* ── Single unified header ── */}
        <header
          className="page-in"
          style={{
            flexShrink: 0,
            borderBottom: "1px solid #0d1828",
            background: "rgba(6,9,18,0.85)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            padding: "0 20px",
          }}
        >
          <div style={{
            maxWidth: 1100,
            margin: "0 auto",
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}>

            {/* ── Left: logo + title + subtitle ── */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* Icon mark */}
              <div style={{
                width: 32, height: 32,
                borderRadius: 9,
                background: "linear-gradient(145deg, #1a3580 0%, #3b6ef8 60%, #6d8efa 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 2px 16px rgba(59,110,248,0.28)",
              }}>
                <svg width="15" height="13" viewBox="0 0 15 13" fill="none">
                  <rect x="0"  y="0" width="3.5" height="13" rx="1.5" fill="white" opacity="0.95"/>
                  <rect x="5.5" y="0" width="3.5" height="9"  rx="1.5" fill="white" opacity="0.6"/>
                  <rect x="11" y="0" width="3.5" height="5.5" rx="1.5" fill="white" opacity="0.35"/>
                </svg>
              </div>

              {/* Text */}
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#dde6ff",
                    letterSpacing: "-0.025em",
                  }}>
                    TaskBoard
                  </span>
                  <span style={{ fontSize: 13, color: "#1a2a42", fontWeight: 400 }}>/</span>
                  <span style={{ fontSize: 12, color: "#2a3f5f", fontWeight: 500 }}>
                    workspace
                  </span>
                </div>
                <div style={{
                  fontSize: 11,
                  color: "#1e2d45",
                  fontWeight: 400,
                  marginTop: 1,
                  letterSpacing: "0.01em",
                }}>
                  3 columns · drag to move · real-time sync
                </div>
              </div>
            </div>

            {/* ── Right: status indicators ── */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Live badge */}
              <div style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "4px 10px",
                borderRadius: 6,
                background: "rgba(0,201,141,0.06)",
                border: "1px solid rgba(0,201,141,0.15)",
              }}>
                <span className="dot-pulse" style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: "#00c98d",
                  display: "inline-block",
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: "#00c98d", letterSpacing: "0.02em" }}>
                  LIVE
                </span>
              </div>

              {/* Conflict-safe badge */}
              <div style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "4px 10px",
                borderRadius: 6,
                background: "rgba(245,166,35,0.05)",
                border: "1px solid rgba(245,166,35,0.12)",
              }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M5 1l1.1 2.4H9L6.8 5l.9 2.8L5 6.5 2.3 7.8 3.2 5 1 3.4h2.9z"
                    stroke="#f5a623" strokeWidth="1.1" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#f5a623", letterSpacing: "0.02em" }}>
                  SAFE
                </span>
              </div>
            </div>
          </div>

          {/* Gradient rule — animated on mount */}
          <div style={{ height: 1, overflow: "hidden", position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, background: "#0a1120" }} />
            <div className="rule-in" style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(90deg, #3b6ef8 0%, rgba(139,92,246,0.5) 50%, transparent 100%)",
              opacity: 0.55,
            }} />
          </div>
        </header>

        {/* ── Board fills remaining height ── */}
        <main
          className="board-in"
          style={{
            flex: 1,
            minHeight: 0,          // critical: lets flex child shrink below content size
            overflow: "hidden",
            maxWidth: 1100,
            margin: "0 auto",
            width: "100%",
          }}
        >
          <DndErrorBoundary>
            <Board />
          </DndErrorBoundary>
        </main>
      </div>
    </>
  );
}