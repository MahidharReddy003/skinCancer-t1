import { useEffect, useState } from "react";

type Theme = "light" | "dark";
const KEY = "dv-theme";

function initial(): Theme {
  try { const s = localStorage.getItem(KEY); if (s === "light" || s === "dark") return s; } catch { /* storage unavailable */ }
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(initial);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem(KEY, theme); } catch { /* storage unavailable */ }
  }, [theme]);
  return { theme, toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")) };
}
