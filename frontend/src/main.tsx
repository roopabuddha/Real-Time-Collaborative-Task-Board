import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import App from "./App";
import ErrorBoundary from "./ErrorBoundary";
import "./index.css";

const rootElement = document.getElementById("root");

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <ErrorBoundary>
        <App />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: "12px",
              background: "#111827",
              color: "#f0f4ff",
              border: "1px solid #1e2d45",
              padding: "12px 16px",
              fontSize: "13px",
              fontFamily: "DM Sans, sans-serif",
              boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
              maxWidth: "360px",
            },
            success: {
              style: { background: "#052e20", border: "1px solid #065f46", color: "#6ee7b7" },
              iconTheme: { primary: "#10b981", secondary: "#052e20" },
            },
            error: {
              style: { background: "#2d0a0a", border: "1px solid #7f1d1d", color: "#fca5a5" },
              iconTheme: { primary: "#f43f5e", secondary: "#2d0a0a" },
            },
          }}
        />
      </ErrorBoundary>
  );
} else {
  console.error("Root element not found");
}