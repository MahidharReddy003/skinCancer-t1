import { describe, expect, it } from "vitest";
import { MAX_BYTES, isValidPrediction, validateFile } from "./validate";

// Builds a File with a chosen reported size without allocating that many bytes.
const file = (type: string, size: number) => {
  const f = new File([new Uint8Array(4)], "x", { type });
  Object.defineProperty(f, "size", { value: size });
  return f;
};

const good = {
  filename: "a.jpg", predicted_class: "nv", description: "Melanocytic nevi", confidence: 0.9,
  probabilities: { nv: 0.9, mel: 0.1 }, model: "EfficientNet-B0", disclaimer: "d",
  ranked_predictions: [{ class: "nv", description: "Melanocytic nevi", probability: 0.9 }],
};

describe("validateFile", () => {
  it.each(["image/jpeg", "image/png", "image/webp"])("accepts %s", (t) => expect(validateFile(file(t, 1000))).toBeNull());
  it("rejects unsupported types", () => expect(validateFile(file("image/gif", 1000))).toMatch(/JPEG, PNG or WebP/));
  it("rejects empty files", () => expect(validateFile(file("image/png", 0))).toMatch(/empty/));
  it("accepts exactly 10 MB", () => expect(validateFile(file("image/png", MAX_BYTES))).toBeNull());
  it("rejects files over 10 MB", () => expect(validateFile(file("image/png", MAX_BYTES + 1))).toMatch(/10 MB/));
});

describe("isValidPrediction", () => {
  it("accepts a well-formed response", () => expect(isValidPrediction(good)).toBe(true));
  it("rejects null and non-objects", () => { expect(isValidPrediction(null)).toBe(false); expect(isValidPrediction("x")).toBe(false); });
  it("rejects a missing probabilities field", () => expect(isValidPrediction({ ...good, probabilities: undefined })).toBe(false));
  it("rejects an empty ranking", () => expect(isValidPrediction({ ...good, ranked_predictions: [] })).toBe(false));
  it("rejects non-numeric probabilities", () =>
    expect(isValidPrediction({ ...good, ranked_predictions: [{ class: "nv", description: "d", probability: "high" }] })).toBe(false));
});
