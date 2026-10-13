import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL, getHealth, type HealthResponse } from "../services/api";
import { Badge, Button, Card, EmptyState, ErrorNotice, Spinner, Disclaimer } from "../components/ui";

export function Overview() {
  return (
    <div className="stack">
      <EmptyState title="Analyze your first image" action={<Button to="/app/analyze">Analyze an image</Button>}>
        Upload a dermoscopic image to see the model's probability for each of the seven classes. Results aren't saved yet, because history arrives in a later build.
      </EmptyState>
      <Disclaimer />
    </div>
  );
}

type Health = { kind: "loading" } | { kind: "ok"; data: HealthResponse } | { kind: "error"; message: string };

export function SystemStatus() {
  const [state, setState] = useState<Health>({ kind: "loading" });
  const check = useCallback(() => {
    setState({ kind: "loading" });
    getHealth().then((data) => setState({ kind: "ok", data }), (e: Error) => setState({ kind: "error", message: e.message }));
  }, []);
  useEffect(() => { check(); }, [check]);

  return (
    <div className="stack">
      <Card>
        <h2>Backend API</h2>
        <p className="muted num">{API_BASE_URL}</p>
        {state.kind === "loading" && <Spinner label="Checking API" />}
        {state.kind === "ok" && (
          <div className="stack">
            <div className="row"><Badge tone="teal">{state.data.status}</Badge><span>Device: <strong>{state.data.device}</strong></span></div>
            <p className="muted">The health endpoint returns a fixed "model loaded" value, so a healthy response confirms the service is running rather than testing a prediction.</p>
          </div>
        )}
        {state.kind === "error" && <ErrorNotice>{state.message}</ErrorNotice>}
        <div className="row" style={{ marginTop: "var(--s4)" }}><Button variant="ghost" onClick={check} disabled={state.kind === "loading"}>Check again</Button></div>
      </Card>
    </div>
  );
}

export function NotFound() {
  return (
    <div className="page">
      <EmptyState title="Page not found" action={<Link className="btn btn-primary" to="/">Back to home</Link>}>
        That address doesn't exist in this app.
      </EmptyState>
    </div>
  );
}
