// Types mirror the real FastAPI responses in src/api.py. Do not add fields that the API does not return.
export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") || "http://127.0.0.1:8000";

export interface HealthResponse { status: string; model_loaded: boolean; device: string }
export interface RankedPrediction { class: string; description: string; probability: number }
export interface PredictResponse {
  filename: string | null;
  predicted_class: string;
  description: string;
  confidence: number;
  probabilities: Record<string, number>;
  ranked_predictions: RankedPrediction[];
  model: string;
  disclaimer: string;
}

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) { super(message); this.status = status; }
}

async function request<T>(path: string, init: RequestInit = {}, timeoutMs = 15000): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, { ...init, signal: ctrl.signal });
    if (!res.ok) {
      let detail = `Request failed (${res.status}).`;
      try { const body = await res.json(); if (typeof body?.detail === "string") detail = body.detail; } catch { /* non-JSON error body */ }
      throw new ApiError(detail, res.status);
    }
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof DOMException && err.name === "AbortError") throw new ApiError("The server took too long to respond.");
    throw new ApiError(`Cannot reach the API at ${API_BASE_URL}. Is the backend running?`);
  } finally {
    clearTimeout(timer);
  }
}

export const getHealth = () => request<HealthResponse>("/health", {}, 5000);

// Wired up in the analysis phase; the backend expects a multipart field named "file".
export function predict(file: File): Promise<PredictResponse> {
  const body = new FormData();
  body.append("file", file);
  return request<PredictResponse>("/predict", { method: "POST", body }, 60000);
}
