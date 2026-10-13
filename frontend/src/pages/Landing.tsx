import { Badge, Button } from "../components/ui";
import { metrics } from "../data/metrics";

export default function Landing() {
  return (
    <div className="page">
      <section className="hero">
        <div>
          <Badge tone="yellow">Work in progress</Badge>
          <h1 style={{ marginTop: "var(--s4)" }}>See skin images through a new lens.</h1>
          <p className="muted">An interactive research workspace for exploring how an EfficientNet-B0 model classifies dermoscopic images into seven HAM10000 categories. Built for learning, not for diagnosis.</p>
          <div className="row">
            <Button to="/app">Open workspace</Button>
            <Button to="/model-performance" variant="ghost">Understand the model</Button>
          </div>
        </div>
        <div className="lens" aria-hidden="true">
          <svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" fill="none" stroke="#7957F5" strokeWidth="6" /><circle cx="60" cy="60" r="30" fill="none" stroke="#20BFA9" strokeWidth="4" strokeDasharray="6 8" /><circle cx="60" cy="60" r="9" fill="#FF786B" /></svg>
        </div>
      </section>
      <section aria-labelledby="t" className="stack">
        <h2 id="t">Measured on a held-out test set</h2>
        <div className="grid">
          <div className="card"><div className="stat num">{(metrics.accuracy * 100).toFixed(2)}%</div>Test accuracy</div>
          <div className="card"><div className="stat num">{metrics.macro_f1.toFixed(4)}</div>Macro F1</div>
          <div className="card"><div className="stat num">{metrics.test_samples.toLocaleString()}</div>Test images</div>
        </div>
        <p className="muted">Accuracy is flattered by class imbalance, so macro F1 and per-class results matter more.</p>
      </section>
    </div>
  );
}

