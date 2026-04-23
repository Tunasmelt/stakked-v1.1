import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "var(--accent)",
              animation: `blink 1s step-end ${i * 0.2}s infinite`
            }} />
          ))}
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
