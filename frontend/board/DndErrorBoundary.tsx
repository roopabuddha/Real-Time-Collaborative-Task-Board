import React, { Component, ReactNode } from "react";

interface State { hasError: boolean; error?: Error; shake: boolean }

export default class DndErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false, shake: false };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error, shake: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[DnD Error Boundary]", error, info);
    // Stop shake after animation completes
    setTimeout(() => this.setState({ shake: false }), 600);
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          <style>{`
            @keyframes eb-in {
              from { opacity: 0; transform: scale(0.92) translateY(16px); }
              to   { opacity: 1; transform: scale(1) translateY(0); }
            }
            @keyframes eb-shake {
              0%,100% { transform: translateX(0); }
              15%     { transform: translateX(-8px) rotate(-1deg); }
              30%     { transform: translateX(8px) rotate(1deg); }
              45%     { transform: translateX(-6px); }
              60%     { transform: translateX(6px); }
              75%     { transform: translateX(-3px); }
              90%     { transform: translateX(3px); }
            }
            @keyframes eb-pulse-ring {
              0%   { transform: scale(0.85); opacity: 0.7; }
              70%  { transform: scale(1.3); opacity: 0; }
              100% { transform: scale(1.3); opacity: 0; }
            }
            @keyframes eb-icon-bounce {
              0%,100% { transform: translateY(0); }
              40%     { transform: translateY(-6px); }
              60%     { transform: translateY(-3px); }
            }
            @keyframes eb-btn-glow {
              0%,100% { box-shadow: 0 0 0 0 rgba(59,110,248,0); }
              50%     { box-shadow: 0 0 0 6px rgba(59,110,248,0.15); }
            }
            .eb-card {
              animation: eb-in 0.45s cubic-bezier(0.22,1,0.36,1) forwards,
                         eb-shake 0.55s cubic-bezier(0.36,0.07,0.19,0.97) 0.1s;
            }
            .eb-icon { animation: eb-icon-bounce 1.8s ease-in-out 0.6s infinite; }
            .eb-ring {
              position: absolute; inset: -4px;
              border-radius: 50%;
              border: 2px solid rgba(244,63,94,0.4);
              animation: eb-pulse-ring 1.8s ease-out 0.6s infinite;
            }
            .eb-btn { animation: eb-btn-glow 2s ease-in-out 1s infinite; }
            .eb-btn:hover { transform: translateY(-1px) scale(1.03) !important; }
            .eb-btn:active { transform: translateY(0) scale(0.98) !important; }
          `}</style>

          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
            padding: 32,
          }}>
            <div
              className="eb-card"
              style={{
                maxWidth: 420,
                width: "100%",
                background: "linear-gradient(145deg, #111827, #0d1220)",
                border: "1px solid rgba(244,63,94,0.25)",
                borderRadius: 24,
                padding: "40px 32px 32px",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Background glow */}
              <div style={{
                position: "absolute",
                top: -60, left: "50%",
                transform: "translateX(-50%)",
                width: 200, height: 200,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(244,63,94,0.08) 0%, transparent 70%)",
                pointerEvents: "none",
              }} />

              {/* Icon with pulse ring */}
              <div style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 24,
              }}>
                <div className="eb-ring" />
                <div
                  className="eb-icon"
                  style={{
                    width: 56, height: 56,
                    borderRadius: 16,
                    background: "rgba(244,63,94,0.1)",
                    border: "1px solid rgba(244,63,94,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 26,
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  ⚠️
                </div>
              </div>

              {/* Title */}
              <h3 style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 800,
                fontSize: 18,
                color: "#f0f4ff",
                letterSpacing: "-0.02em",
                margin: "0 0 8px",
              }}>
                Board crashed
              </h3>

              {/* Subtitle */}
              <p style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: 13,
                color: "#8496b0",
                margin: "0 0 12px",
                lineHeight: 1.5,
              }}>
                Drag-and-drop encountered a problem.
              </p>

              {/* Error message chip */}
              {this.state.error?.message && (
                <div style={{
                  display: "inline-block",
                  padding: "5px 12px",
                  borderRadius: 20,
                  background: "rgba(244,63,94,0.08)",
                  border: "1px solid rgba(244,63,94,0.18)",
                  marginBottom: 28,
                }}>
                  <code style={{
                    fontSize: 11,
                    color: "#f87171",
                    fontFamily: "monospace",
                    wordBreak: "break-all",
                  }}>
                    {this.state.error.message}
                  </code>
                </div>
              )}

              {/* Divider */}
              <div style={{
                height: 1,
                background: "linear-gradient(90deg, transparent, #1e2d45, transparent)",
                margin: "0 0 24px",
              }} />

              {/* Try again button */}
              <button
                className="eb-btn"
                onClick={() => this.setState({ hasError: false, error: undefined, shake: false })}
                style={{
                  padding: "11px 28px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #3b6ef8, #2456d8)",
                  border: "none",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "Syne, sans-serif",
                  letterSpacing: "-0.01em",
                  transition: "transform 150ms, box-shadow 150ms",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 16 }}>↺</span>
                Try again
              </button>

              <p style={{
                marginTop: 16,
                fontSize: 11,
                color: "#4a5a72",
                fontFamily: "DM Sans, sans-serif",
              }}>
                Or refresh the page if the problem persists.
              </p>
            </div>
          </div>
        </>
      );
    }

    return this.props.children;
  }
}