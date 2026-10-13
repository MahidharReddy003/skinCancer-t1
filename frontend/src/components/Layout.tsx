import { useEffect, useState } from "react";
import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
import { Badge, Disclaimer, Icon } from "./ui";
import { useTheme } from "../hooks/useTheme";

function Brand() {
  return (
    <Link to="/" className="brand" aria-label="DermaVision AI home">
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="9" fill="#7957F5" /><circle cx="16" cy="16" r="7" fill="none" stroke="#fff" strokeWidth="2.5" /><circle cx="16" cy="16" r="2.5" fill="#20BFA9" /></svg>
      DermaVision AI
    </Link>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  return <button type="button" className="icon-btn" onClick={toggle} aria-label={`Switch to ${next} theme`}><Icon name={theme === "dark" ? "sun" : "moon"} /></button>;
}

export function PublicLayout() {
  return (
    <>
      <a href="#main" className="skip">Skip to content</a>
      <header className="topbar">
        <Brand />
        <div className="grow" />
        <nav aria-label="Main">
          <NavLink to="/model-performance">Model performance</NavLink>
          <NavLink to="/app">Workspace</NavLink>
        </nav>
        <ThemeToggle />
      </header>
      <main id="main"><Outlet /></main>
      <footer className="page"><Disclaimer /></footer>
    </>
  );
}

const TITLES: Record<string, string> = { "/app": "Overview", "/app/analyze": "Analyze image", "/app/system-status": "System status" };

export function AppShell() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="shell">
      <a href="#main" className="skip">Skip to content</a>
      <div className={`scrim${open ? " open" : ""}`} onClick={() => setOpen(false)} aria-hidden="true" />
      <aside id="sidebar" className={`sidebar${open ? " open" : ""}`} aria-label="Workspace navigation">
        <div style={{ padding: "0 var(--s4) var(--s4)" }}><Brand /></div>
        <NavLink to="/app" end><Icon name="home" />Overview</NavLink>
        <NavLink to="/app/analyze"><Icon name="image" />Analyze</NavLink>
        <span className="soon" aria-disabled="true"><Icon name="activity" />History<Badge tone="yellow">Soon</Badge></span>
        <NavLink to="/model-performance"><Icon name="chart" />Model performance</NavLink>
        <NavLink to="/app/system-status"><Icon name="info" />System status</NavLink>
      </aside>
      <div>
        <header className="topbar">
          <button type="button" className="icon-btn menu-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="sidebar" aria-label={open ? "Close menu" : "Open menu"}><Icon name={open ? "x" : "menu"} /></button>
          <h1 className="grow" style={{ margin: 0, fontSize: "var(--fs-lg)" }}>{TITLES[pathname] ?? "Workspace"}</h1>
          <ThemeToggle />
        </header>
        <main id="main" className="page"><Outlet /></main>
      </div>
    </div>
  );
}
