import type { PredictResponse } from "../../services/api";
import { Badge, Button, Card } from "../../components/ui";
import { downloadReport } from "./report";

const pct = (p: number) => `${(p * 100).toFixed(2)}%`;

interface Props { data: PredictResponse; at: Date; fileName: string; fileSize: number; dims: { w: number; h: number } | null }

export function Results({ data, at, fileName, fileSize, dims }: Props) {
  return (
    <div className="stack">
      <Card>
        <p className="muted" style={{ marginBottom: "var(--s2)" }}>Highest model probability</p>
        <h2 style={{ fontSize: "var(--fs-xl)" }}>{data.predicted_class} <span className="muted">{data.description}</span></h2>
        <div className="stat num">{pct(data.confidence)}</div>
        <p className="muted" style={{ marginTop: "var(--s3)" }}>This is a classifier output, not calibrated clinical certainty. It cannot confirm or rule out any condition.</p>
      </Card>

      <Card>
        <h2>All classes</h2>
        <ol className="probs">
          {data.ranked_predictions.map((p, i) => (
            <li key={p.class} className="prob">
              <span><strong>{p.class}</strong> <span className="muted">{p.description}</span> {i === 0 && <Badge>Highest</Badge>}</span>
              <span className={`pbar${i === 0 ? " top" : ""}`} aria-hidden="true"><span style={{ width: `${p.probability * 100}%` }} /></span>
              <span className="num">{pct(p.probability)}</span>
            </li>
          ))}
        </ol>
      </Card>

      <Card>
        <h2>Details</h2>
        <dl className="meta">
          <dt>File</dt><dd>{data.filename ?? fileName}</dd>
          <dt>Analyzed</dt><dd>{at.toLocaleString()} <span className="muted">(your device's clock)</span></dd>
          <dt>Model</dt><dd>{data.model}</dd>
          <dt>Image</dt><dd className="num">{dims ? `${dims.w} × ${dims.h} px, ` : ""}{(fileSize / 1048576).toFixed(2)} MB</dd>
        </dl>
        <details>
          <summary>Technical details</summary>
          <div className="table-wrap">
            <table>
              <thead><tr><th scope="col">Class</th><th scope="col" className="n">Raw probability</th></tr></thead>
              <tbody>{data.ranked_predictions.map((p) => <tr key={p.class}><th scope="row">{p.class}</th><td className="n">{p.probability.toFixed(6)}</td></tr>)}</tbody>
            </table>
          </div>
        </details>
        <div className="row" style={{ marginTop: "var(--s4)" }}>
          <Button variant="ghost" onClick={() => downloadReport(data, at, fileName)}>Download report</Button>
        </div>
      </Card>
    </div>
  );
}
