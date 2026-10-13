import { describe, expect, it } from "vitest";
import type { PredictResponse } from "../../services/api";
import { buildReport } from "./report";

const classes = ["nv", "mel", "bkl", "bcc", "akiec", "vasc", "df"];
const data: PredictResponse = {
  filename: null,
  predicted_class: "nv",
  description: "Melanocytic nevi",
  confidence: 0.5,
  probabilities: Object.fromEntries(classes.map((c) => [c, c === "nv" ? 0.5 : 0.5 / 6])),
  ranked_predictions: classes.map((c) => ({ class: c, description: `desc-${c}`, probability: c === "nv" ? 0.5 : 0.5 / 6 })),
  model: "EfficientNet-B0",
  disclaimer: "Educational prediction only.",
};
const at = new Date("2026-01-02T03:04:05.000Z");

describe("buildReport", () => {
  const text = buildReport(data, at, "local.jpg");
  it("falls back to the local file name when the API sends none", () => expect(text).toContain("File: local.jpg"));
  it("records the browser timestamp", () => expect(text).toContain("2026-01-02T03:04:05.000Z"));
  it("lists all seven classes", () => classes.forEach((c) => expect(text).toContain(`desc-${c}`)));
  it("includes the headline result and both disclaimers", () => {
    expect(text).toContain("nv (Melanocytic nevi)");
    expect(text).toContain("50.00%");
    expect(text).toContain("not calibrated clinical certainty");
    expect(text).toContain("Educational prediction only.");
  });
  it("prefers the API filename when present", () => expect(buildReport({ ...data, filename: "api.jpg" }, at, "local.jpg")).toContain("File: api.jpg"));
});
