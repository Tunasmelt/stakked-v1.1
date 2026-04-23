import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import "./App.css";

const Landing     = lazy(() => import("./pages/Landing"));
const Auth        = lazy(() => import("./pages/Auth"));
const Workspace   = lazy(() => import("./pages/Workspace"));
const Editor      = lazy(() => import("./pages/Editor"));
const Gallery     = lazy(() => import("./pages/Gallery"));
const Published   = lazy(() => import("./pages/PublishedPage"));
const Marketplace = lazy(() => import("./pages/Marketplace"));

function Loader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-mute)", letterSpacing: "0.14em" }}>
        STAKKED · LOADING
        <span style={{ animation: "blink 1s step-end infinite", marginLeft: 2 }}>_</span>
      </span>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/"          element={<Landing />} />
              <Route path="/login"     element={<Auth mode="login" />} />
              <Route path="/register"  element={<Auth mode="register" />} />
              <Route path="/gallery"   element={<Gallery />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/p/:username/:slug" element={<Published />} />
              <Route path="/workspace" element={<ProtectedRoute><Workspace /></ProtectedRoute>} />
              <Route path="/editor/:id?"    element={<ProtectedRoute><Editor /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
