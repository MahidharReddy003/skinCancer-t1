import type { ReactNode } from "react";
import { Link } from "react-router-dom";

const ICONS: Record<string, ReactNode> = {
  menu: <path d="M3 12h18M3 6h18M3 18h18" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />,
  home: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10" />,
  image: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></>,
  chart: <path d="M18 20V10M12 20V4M6 20v-6" />,
  activity: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
  info: <><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></>,
};

export function Icon({ name, size = 20 }: { name: keyof typeof ICONS; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {ICONS[name]}
    </svg>
  );
}

interface ButtonProps { children: ReactNode; to?: string; variant?: "primary" | "ghost"; onClick?: () => void; disabled?: boolean }
export function Button({ children, to, variant = "primary", onClick, disabled }: ButtonProps) {
  const cls = `btn btn-${variant}`;
  return to ? <Link to={to} className={cls}>{children}</Link> : <button type="button" className={cls} onClick={onClick} disabled={disabled}>{children}</button>;
}

export const Card = ({ children }: { children: ReactNode }) => <div className="card">{children}</div>;
export const Badge = ({ children, tone = "violet" }: { children: ReactNode; tone?: "violet" | "teal" | "coral" | "yellow" | "sky" }) => <span className={`badge ${tone}`}>{children}</span>;
export const Spinner = ({ label = "Loading" }: { label?: string }) => <span role="status" className="row"><span className="spinner" aria-hidden="true" /><span className="muted">{label}…</span></span>;

export function EmptyState({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return <div className="empty"><h2>{title}</h2><p className="muted">{children}</p>{action}</div>;
}

export const ErrorNotice = ({ children }: { children: ReactNode }) => <div className="notice error" role="alert">{children}</div>;

export function Disclaimer() {
  return (
    <aside className="notice" aria-label="Medical disclaimer">
      <strong>Experimental research tool, not a medical device.</strong> Predictions cannot diagnose or rule out skin cancer and have not been clinically validated. See a qualified healthcare professional about any lesion that concerns you or is changing.
    </aside>
  );
}
