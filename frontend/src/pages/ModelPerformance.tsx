import { Badge, Card } from "../components/ui";
import { CLASS_LABELS, metrics } from "../data/metrics";

const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
const SMALL = 50;

function Bar({ value }: { value: number }) {
  return <><span className="bar" aria-hidden="true"><span style={{ width: `${value * 100}%` }} /></span>{pct(value)}</>;
}

export default function ModelPerformance() {
  const order = metrics.class_order;
  const nv = metrics.per_class["nv"].support;
  return (
    <div className="page stack">
      <h1>Model performance</h1>
      <p className="muted">Results for the EfficientNet-B0 model on {metrics.test_samples.toLocaleString()} held-out HAM10000 test images, read from <code>results/metrics.json</code>.</p>
      <div className="grid">
        <Card><div className="stat num">{(metrics.accuracy * 100).toFixed(2)}%</div>Test accuracy</Card>
        <Card><div className="stat num">{metrics.macro_f1.toFixed(4)}</div>Macro F1</Card>
        <Card><div className="stat num">{metrics.test_samples.toLocaleString()}</div>Test images</Card>
      </div>

      <Card>
        <h2>Per-class results</h2>
        <div className="table-wrap">
          <table>
            <caption className="muted" style={{ textAlign: "left", paddingBottom: "var(--s3)" }}>Precision, recall and F1 for each class, with test-set support.</caption>
            <thead><tr><th scope="col">Class</th><th scope="col">Precision</th><th scope="col">Recall</th><th scope="col" className="n">F1</th><th scope="col" className="n">Support</th></tr></thead>
            <tbody>
              {order.map((c) => {
                const m = metrics.per_class[c];
                return (
                  <tr key={c}>
                    <th scope="row" title={CLASS_LABELS[c]}>{c} <span className="muted">{CLASS_LABELS[c]}</span></th>
                    <td><Bar value={m.precision} /></td><td><Bar value={m.recall} /></td>
                    <td className="n">{m.f1.toFixed(2)}</td>
                    <td className="n">{m.support} {m.support < SMALL && <Badge tone="coral">Small sample</Badge>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h2>Confusion matrix</h2>
        <p className="muted">Rows are the actual class, columns the predicted class; cells show image counts. Shading shows each cell as a share of its row, so small classes stay readable.</p>
        <div className="table-wrap">
          <table className="cm">
            <caption className="muted" style={{ paddingBottom: "var(--s3)" }}>Actual class (rows) by predicted class (columns)</caption>
            <thead><tr><td />{order.map((c) => <th key={c} scope="col">{c}</th>)}</tr></thead>
            <tbody>
              {metrics.confusion_matrix.map((row, i) => {
                const total = row.reduce((a, b) => a + b, 0) || 1;
                return (
                  <tr key={order[i]}>
                    <th scope="row">{order[i]}</th>
                    {row.map((v, j) => (
                      <td key={j} className="num" style={{ background: `color-mix(in srgb, var(--violet) ${Math.round((v / total) * 55)}%, transparent)` }}>{v}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h2>How to read these numbers</h2>
        <ul className="stack">
          <li><strong>Imbalanced classes.</strong> Nevi are {nv} of {metrics.test_samples.toLocaleString()} test images ({pct(nv / metrics.test_samples)}), so accuracy alone is misleading.</li>
          <li><strong>Small samples.</strong> Dermatofibroma ({metrics.per_class["df"].support}) and vascular lesions ({metrics.per_class["vasc"].support}) have very few test images, so their metrics are noisy.</li>
          <li><strong>Lesion-level split.</strong> Images of the same lesion never appear in both training and test data. HAM10000 has no patient IDs here, so patient-level separation is not verified.</li>
          <li><strong>Not clinical evidence.</strong> Probabilities are classifier outputs, not calibrated clinical certainty.</li>
        </ul>
      </Card>
    </div>
  );
}
