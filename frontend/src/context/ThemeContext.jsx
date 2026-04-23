import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeCtx = createContext(null);

export const THEMES = [
  { id: "neon",   name: "Neon",   swatch: ["#ff2e9a","#a98cff","#07000f","#ff2e9a"] },
  { id: "ghost",  name: "Ghost",  swatch: ["#f2f2f2","#8c8c93","#141417","#f2f2f2"] },
  { id: "brutal", name: "Brutal", swatch: ["#ffee00","#bfbfbf","#000000","#ffee00"] },
  { id: "paper",  name: "Paper",  swatch: ["#d4a574","#b39b78","#1e1b15","#d4a574"] },
  { id: "sunset", name: "Sunset", swatch: ["#ff8e53","#f5a98a","#1c0f14","#ff8e53"] },
];

function load(k, fb) {
  try { return JSON.parse(localStorage.getItem("stk-" + k)) ?? fb; } catch { return fb; }
}
function save(k, v) { try { localStorage.setItem("stk-" + k, JSON.stringify(v)); } catch {} }

export function ThemeProvider({ children }) {
  const [theme, setTheme]   = useState(() => load("theme", "neon"));
  const [mode, setMode]     = useState(() => load("mode", "dark"));
  const [density, setDensity] = useState(() => load("density", "cozy"));
  const [chrome, setChrome] = useState(() => load("chrome", "balanced"));

  useEffect(() => {
    save("theme", theme);
    save("mode", mode);
    save("density", density);
    save("chrome", chrome);
    const r = document.documentElement;
    r.setAttribute("data-theme", theme);
    r.setAttribute("data-mode", mode);
    r.setAttribute("data-density", density);
    r.setAttribute("data-chrome", chrome);
  }, [theme, mode, density, chrome]);

  return (
    <ThemeCtx.Provider value={{ theme, setTheme, mode, setMode, density, setDensity, chrome, setChrome, THEMES }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeCtx);
}
