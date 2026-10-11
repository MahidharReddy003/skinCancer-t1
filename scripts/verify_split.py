"""Read-only checks on the dataset splits and class-order consistency.

Run from the project root:  python scripts/verify_split.py
Does not import torch or load the model.
"""
import ast
import sys
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
LABEL_MAP = {"nv": 0, "mel": 1, "bkl": 2, "bcc": 3, "akiec": 4, "vasc": 5, "df": 6}
failures = []


def check(cond: bool, msg: str) -> None:
    print(("[OK]   " if cond else "[FAIL] ") + msg)
    if not cond:
        failures.append(msg)


splits = {s: pd.read_csv(ROOT / "dataset" / "splits" / f"{s}.csv") for s in ("train", "val", "test")}
for s, d in splits.items():
    print(f"{s}: {len(d)} rows, {d['lesion_id'].nunique()} lesions")

pairs = [("train", "val"), ("train", "test"), ("val", "test")]
for a, b in pairs:
    n = len(set(splits[a]["lesion_id"]) & set(splits[b]["lesion_id"]))
    check(n == 0, f"lesion_id overlap {a} & {b}: {n}")
for a, b in pairs:
    n = len(set(splits[a]["image_id"]) & set(splits[b]["image_id"]))
    check(n == 0, f"image_id overlap {a} & {b}: {n}")

check(sum(len(d) for d in splits.values()) == 10015, "total rows == 10015 (HAM10000)")

for s, d in splits.items():
    mapped = d["dx"].map(LABEL_MAP)
    check(mapped.notna().all() and (mapped == d["label"]).all(),
          f"{s}: label column matches dx via label_map")

# class order in api.py, read via AST (no import, no model load)
tree = ast.parse((ROOT / "src" / "api.py").read_text(encoding="utf-8"))
api_names = None
for node in ast.walk(tree):
    if isinstance(node, ast.Assign) and any(getattr(t, "id", "") == "CLASS_NAMES" for t in node.targets):
        api_names = ast.literal_eval(node.value)
expected = [k for k, _ in sorted(LABEL_MAP.items(), key=lambda kv: kv[1])]
check(api_names == expected, f"api.py CLASS_NAMES == label_map order ({api_names})")

print("\nScope: this verifies lesion-level separation only. HAM10000 has no patient ID, "
      "so patient-level separation is NOT verified and must not be claimed.")
sys.exit(1 if failures else 0)
