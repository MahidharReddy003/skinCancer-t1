import { useEffect, useRef, useState } from "react";

const MAX = 8;
type Pos = { x: number; y: number };

interface Props { src: string; alt: string; onDims?: (d: { w: number; h: number }) => void }

export function ImageViewer({ src, alt, onDims }: Props) {
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState<Pos>({ x: 0, y: 0 });
  const [full, setFull] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const drag = useRef<Pos | null>(null);
  const canFull = typeof document !== "undefined" && document.fullscreenEnabled;

  useEffect(() => {
    const sync = () => setFull(document.fullscreenElement === wrap.current);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  const clamp = (s: number, p: Pos): Pos => {
    const r = stage.current?.getBoundingClientRect();
    const mx = r ? (r.width * (s - 1)) / 2 : 0;
    const my = r ? (r.height * (s - 1)) / 2 : 0;
    return { x: Math.max(-mx, Math.min(mx, p.x)), y: Math.max(-my, Math.min(my, p.y)) };
  };
  const zoom = (delta: number) => {
    const s = Math.min(MAX, Math.max(1, Math.round((scale + delta) * 100) / 100));
    setScale(s);
    setPos((p) => clamp(s, p));
  };
  const fit = () => { setScale(1); setPos({ x: 0, y: 0 }); };
  const toggleFull = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void wrap.current?.requestFullscreen().catch(() => { /* fullscreen refused */ });
  };

  const onKey = (e: React.KeyboardEvent) => {
    const step = 40;
    const moves: Record<string, Pos> = { ArrowLeft: { x: step, y: 0 }, ArrowRight: { x: -step, y: 0 }, ArrowUp: { x: 0, y: step }, ArrowDown: { x: 0, y: -step } };
    if (e.key === "+" || e.key === "=") zoom(0.5);
    else if (e.key === "-") zoom(-0.5);
    else if (e.key === "0") fit();
    else if (moves[e.key] && scale > 1) setPos((p) => clamp(scale, { x: p.x + moves[e.key].x, y: p.y + moves[e.key].y }));
    else return;
    e.preventDefault();
  };

  return (
    <div className="viewer" ref={wrap}>
      <div
        ref={stage}
        className={`stage${scale > 1 ? " pannable" : ""}`}
        tabIndex={0}
        role="group"
        aria-label="Image viewer. Plus and minus zoom, zero resets, arrow keys pan when zoomed."
        onKeyDown={onKey}
        onPointerDown={(e) => { if (scale > 1) { drag.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }; e.currentTarget.setPointerCapture(e.pointerId); } }}
        onPointerMove={(e) => { if (drag.current) setPos(clamp(scale, { x: e.clientX - drag.current.x, y: e.clientY - drag.current.y })); }}
        onPointerUp={() => { drag.current = null; }}
        onPointerCancel={() => { drag.current = null; }}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          onLoad={(e) => onDims?.({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
          style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})` }}
        />
      </div>
      <div className="tools" role="toolbar" aria-label="Image controls">
        <button type="button" className="tool" onClick={() => zoom(-0.5)} disabled={scale <= 1} aria-label="Zoom out" title="Zoom out (-)">−</button>
        <span className="num muted" aria-live="polite">{Math.round(scale * 100)}%</span>
        <button type="button" className="tool" onClick={() => zoom(0.5)} disabled={scale >= MAX} aria-label="Zoom in" title="Zoom in (+)">+</button>
        <button type="button" className="tool" onClick={fit} title="Fit to screen (0)">Fit</button>
        {canFull && <button type="button" className="tool" onClick={toggleFull}>{full ? "Exit fullscreen" : "Fullscreen"}</button>}
      </div>
    </div>
  );
}
