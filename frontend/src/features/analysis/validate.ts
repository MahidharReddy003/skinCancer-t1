import type { PredictResponse } from "../../services/api";

// Mirrors the limits enforced by POST /predict in src/api.py. The server remains authoritative.
export const MAX_BYTES = 10 * 1024 * 1024;
export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) return "Use a JPEG, PNG or WebP image.";
  if (file.size === 0) return "This file is empty. Choose a different image.";
  if (file.size > MAX_BYTES) return `This image is ${(file.size / 1048576).toFixed(1)} MB. The limit is 10 MB.`;
  return null;
}

// Guards against a malformed or unexpected response before it is rendered.
export function isValidPrediction(x: unknown): x is PredictResponse {
  const r = x as Partial<PredictResponse> | null;
  return (
    !!r && typeof r.predicted_class === "string" && typeof r.description === "string" &&
    typeof r.confidence === "number" && typeof r.model === "string" && typeof r.disclaimer === "string" &&
    !!r.probabilities && typeof r.probabilities === "object" &&
    Array.isArray(r.ranked_predictions) && r.ranked_predictions.length > 0 &&
    r.ranked_predictions.every((p) => typeof p.class === "string" && typeof p.description === "string" && typeof p.probability === "number")
  );
}
