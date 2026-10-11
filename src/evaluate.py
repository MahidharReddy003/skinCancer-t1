import hashlib
import json
import os
import sys
from datetime import datetime, timezone

import numpy as np
import pandas as pd
import torch
import matplotlib.pyplot as plt
import seaborn as sns

from torch.utils.data import DataLoader
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    classification_report,
    confusion_matrix
)

from dataset import SkinCancerDataset, val_transforms
from model import create_model

# Project paths
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEST_CSV = os.path.join(ROOT_DIR, "dataset", "splits", "test.csv")
MODEL_PATH = os.path.join(ROOT_DIR, "models", "best_model.pth")
RESULTS_DIR = os.path.join(ROOT_DIR, "results")

os.makedirs(RESULTS_DIR, exist_ok=True)

# Class order MUST match prepare_dataset.py label_map and api.py CLASS_NAMES:
# nv=0, mel=1, bkl=2, bcc=3, akiec=4, vasc=5, df=6
LABELS = [0, 1, 2, 3, 4, 5, 6]
class_names = ["nv", "mel", "bkl", "bcc", "akiec", "vasc", "df"]
assert len(LABELS) == len(class_names)

# Previously reported headline values, used only as a sanity check.
EXPECTED_ACCURACY = 0.7327
EXPECTED_MACRO_F1 = 0.6365
EXPECTED_SUPPORT = 2024
TOLERANCE = 0.002

# Device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Using device:", device)

# Load test dataset
test_dataset = SkinCancerDataset(
    csv_file=TEST_CSV,
    transform=val_transforms
)

test_loader = DataLoader(
    test_dataset,
    batch_size=16,
    shuffle=False,
    num_workers=0
)

print("Test images:", len(test_dataset))

# Load trained model
model = create_model()
checkpoint = torch.load(MODEL_PATH, map_location=device)
model.load_state_dict(checkpoint)
model = model.to(device)
model.eval()

# Evaluate without training
all_labels = []
all_predictions = []

with torch.no_grad():
    for images, labels in test_loader:
        images = images.to(device)
        outputs = model(images)
        predictions = torch.argmax(outputs, dim=1)

        all_labels.extend(labels.numpy().tolist())
        all_predictions.extend(predictions.cpu().numpy().tolist())

# Metrics
accuracy = accuracy_score(all_labels, all_predictions)
macro_f1 = f1_score(
    all_labels,
    all_predictions,
    labels=LABELS,
    average="macro",
    zero_division=0
)

print("\n========== TEST RESULTS ==========")
print(f"Test Accuracy: {accuracy:.4f} ({accuracy * 100:.2f}%)")
print(f"Test Macro F1: {macro_f1:.4f}")

print("\nClassification Report:")
report = classification_report(
    all_labels,
    all_predictions,
    labels=LABELS,
    target_names=class_names,
    zero_division=0
)
print(report)

report_dict = classification_report(
    all_labels,
    all_predictions,
    labels=LABELS,
    target_names=class_names,
    zero_division=0,
    output_dict=True
)

cm = confusion_matrix(
    all_labels,
    all_predictions,
    labels=LABELS
)

# ------------------------------------------------------------------
# Sanity checks BEFORE overwriting any artifact
# ------------------------------------------------------------------
problems = []

if len(all_labels) != EXPECTED_SUPPORT:
    problems.append(f"Test support {len(all_labels)} != {EXPECTED_SUPPORT}")
if abs(accuracy - EXPECTED_ACCURACY) > TOLERANCE:
    problems.append(f"Accuracy {accuracy:.4f} differs from expected {EXPECTED_ACCURACY}")
if abs(macro_f1 - EXPECTED_MACRO_F1) > TOLERANCE:
    problems.append(f"Macro F1 {macro_f1:.4f} differs from expected {EXPECTED_MACRO_F1}")

csv_counts = (
    pd.read_csv(TEST_CSV)["label"].value_counts().reindex(LABELS).fillna(0).astype(int).tolist()
)
report_support = [int(report_dict[n]["support"]) for n in class_names]
if csv_counts != report_support:
    problems.append(f"Per-class support {report_support} != test.csv label counts {csv_counts}")
if int(cm.sum()) != len(all_labels):
    problems.append("Confusion matrix total != number of test samples")

if problems:
    print("\nSANITY CHECK FAILED. No artifacts were overwritten.")
    for p in problems:
        print(" -", p)
    sys.exit(1)

print("\nSanity checks passed.")


def sha256_of(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


# Save report
with open(
    os.path.join(RESULTS_DIR, "classification_report.txt"),
    "w",
    encoding="utf-8"
) as f:
    f.write(f"Test Accuracy: {accuracy:.4f}\n")
    f.write(f"Test Macro F1: {macro_f1:.4f}\n\n")
    f.write(report)

# Confusion matrix
plt.figure(figsize=(9, 7))
sns.heatmap(
    cm,
    annot=True,
    fmt="d",
    cmap="Blues",
    xticklabels=class_names,
    yticklabels=class_names
)
plt.xlabel("Predicted Class")
plt.ylabel("Actual Class")
plt.title("Skin Lesion Classification - Test Confusion Matrix")
plt.tight_layout()

plt.savefig(
    os.path.join(RESULTS_DIR, "confusion_matrix.png"),
    dpi=300
)
plt.close()

# Machine-readable metrics for the web application
metrics = {
    "generated_at_utc": datetime.now(timezone.utc).isoformat(),
    "model": "EfficientNet-B0",
    "weights_file": os.path.basename(MODEL_PATH),
    "weights_sha256": sha256_of(MODEL_PATH),
    "device": str(device),
    "test_csv": "dataset/splits/test.csv",
    "test_samples": len(all_labels),
    "class_order": class_names,
    "label_indices": LABELS,
    "accuracy": float(accuracy),
    "macro_f1": float(macro_f1),
    "per_class": {
        n: {
            "precision": float(report_dict[n]["precision"]),
            "recall": float(report_dict[n]["recall"]),
            "f1": float(report_dict[n]["f1-score"]),
            "support": int(report_dict[n]["support"]),
        }
        for n in class_names
    },
    "macro_avg": {
        "precision": float(report_dict["macro avg"]["precision"]),
        "recall": float(report_dict["macro avg"]["recall"]),
        "f1": float(report_dict["macro avg"]["f1-score"]),
    },
    "weighted_avg": {
        "precision": float(report_dict["weighted avg"]["precision"]),
        "recall": float(report_dict["weighted avg"]["recall"]),
        "f1": float(report_dict["weighted avg"]["f1-score"]),
    },
    # Rows = actual class, columns = predicted class, both in class_order
    "confusion_matrix": cm.tolist(),
}

with open(
    os.path.join(RESULTS_DIR, "metrics.json"),
    "w",
    encoding="utf-8"
) as f:
    json.dump(metrics, f, indent=2)

print("\nResults saved in:", RESULTS_DIR)
