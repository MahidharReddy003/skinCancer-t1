import type { PredictResponse } from "../../services/api";

// Only fields returned by the API, plus a timestamp recorded by the browser.
export function buildReport(d: PredictResponse, at: Date, fileName: string): string {
  const lines = [
    "DermaVision AI - analysis report",
    "Educational use only. Not a medical diagnosis.",
    "",
    `File: ${d.filename ?? fileName}`,
    `Analyzed (browser time): ${at.toISOString()}`,
    `Model (as reported by the API): ${d.model}`,
    "",
    `Highest-probability class: ${d.predicted_class} (${d.description})`,
    `Probability: ${(d.confidence * 100).toFixed(2)}%`,
    "",
    "All class probabilities (highest first):",
    ...d.ranked_predictions.map((p) => `  ${p.class.padEnd(6)} ${(p.probability * 100).toFixed(2).padStart(6)}%  ${p.description}`),
    "",
    "Probabilities are classifier outputs, not calibrated clinical certainty.",
    d.disclaimer,
    "",
  ];
  return lines.join("\r\n");
}

export function downloadReport(d: PredictResponse, at: Date, fileName: string): void {
  const blob = new Blob([buildReport(d, at, fileName)], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `dermavision-report-${at.toISOString().replace(/[:.]/g, "-")}.txt`;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
