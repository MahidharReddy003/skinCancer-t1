import { useEffect, useRef, useState } from "react";
import { API_BASE_URL, ApiError, predict, type PredictResponse } from "../services/api";
import { Button, Card, Disclaimer, ErrorNotice, Spinner } from "../components/ui";
import { ImageViewer } from "../features/analysis/ImageViewer";
import { Results } from "../features/analysis/Results";
import { isValidPrediction, validateFile } from "../features/analysis/validate";
import "../styles/analysis.css";

export default function Analyze() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ data: PredictResponse; at: Date } | null>(null);
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);

  const choose = (f: File | undefined) => {
    if (!f || busy) return;
    const problem = validateFile(f);
    if (problem) { setError(problem); return; }
    setFile(f); setUrl(URL.createObjectURL(f)); setDims(null); setResult(null); setError(null);
  };
  const remove = () => {
    setFile(null); setUrl(null); setDims(null); setResult(null); setError(null);
    if (input.current) input.current.value = "";
  };
  const analyze = async () => {
    if (!file || busy) return;
    setBusy(true); setError(null); setResult(null);
    try {
      const data = await predict(file);
      if (!isValidPrediction(data)) throw new ApiError("The server sent a response this app doesn't recognise.");
      setResult({ data, at: new Date() });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="analyze">
      <div className="stack">
        <input
          ref={input} id="file-input" className="sr-only" type="file" accept="image/jpeg,image/png,image/webp"
          tabIndex={file ? -1 : 0}
          onChange={(e) => { choose(e.target.files?.[0]); e.target.value = ""; }}
        />
        {file && url ? (
          <>
            <ImageViewer key={url} src={url} alt={`Preview of ${file.name}`} onDims={setDims} />
            <p className="muted num" style={{ margin: 0 }}>{file.name} · {(file.size / 1048576).toFixed(2)} MB{dims ? ` · ${dims.w} × ${dims.h} px` : ""}</p>
            <div className="row">
              <Button onClick={() => void analyze()} disabled={busy}>{error && !result ? "Try again" : "Analyze image"}</Button>
              <Button variant="ghost" onClick={() => input.current?.click()} disabled={busy}>Replace</Button>
              <Button variant="ghost" onClick={remove} disabled={busy}>Remove</Button>
            </div>
          </>
        ) : (
          <label
            htmlFor="file-input" className={`drop${over ? " over" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setOver(true); }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => { e.preventDefault(); setOver(false); choose(e.dataTransfer.files[0]); }}
          >
            <strong>Drop a dermoscopic image here, or choose a file</strong>
            <span className="muted">JPEG, PNG or WebP, up to 10 MB</span>
          </label>
        )}
        <p className="muted" style={{ margin: 0 }}>Your image is sent to the API at <span className="num">{API_BASE_URL}</span> for analysis. This app doesn't save the image or the result.</p>
      </div>

      <div className="stack" aria-live="polite">
        {error && <ErrorNotice>{error}</ErrorNotice>}
        {busy && <Card><Spinner label="Uploading and analyzing" /></Card>}
        {result && file && <Results data={result.data} at={result.at} fileName={file.name} fileSize={file.size} dims={dims} />}
        {!busy && !result && !error && <Card><h2>Results appear here</h2><p className="muted">Choose an image, then select Analyze image to see the model's probability for each class.</p></Card>}
        <Disclaimer />
      </div>
    </div>
  );
}
