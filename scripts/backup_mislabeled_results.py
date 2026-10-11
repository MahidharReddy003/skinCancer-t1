"""Back up the ORIGINAL (mislabeled) evaluation artifacts before they are regenerated.

Safe to re-run: if a backup already exists it is verified, never overwritten.
Exit code 0 = backup present and verified; non-zero = stop and investigate.
"""
import hashlib
import json
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RESULTS = ROOT / "results"
BACKUP = RESULTS / "_backup_mislabeled"
FILES = ["classification_report.txt", "confusion_matrix.png"]


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def main() -> int:
    manifest_path = BACKUP / "MANIFEST.json"

    if manifest_path.exists():
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        ok = True
        for name in FILES:
            b = BACKUP / name
            if not b.exists() or sha256(b) != manifest["files"].get(name):
                print(f"[FAIL] Existing backup is missing or altered: {name}")
                ok = False
        if ok:
            print("[OK] Backup already exists and its hashes verify. Nothing overwritten.")
            return 0
        return 1

    missing = [n for n in FILES if not (RESULTS / n).exists()]
    if missing:
        print(f"[FAIL] Nothing to back up, missing: {missing}")
        return 1

    BACKUP.mkdir(parents=True, exist_ok=False)
    files = {}
    for name in FILES:
        shutil.copy2(RESULTS / name, BACKUP / name)
        files[name] = sha256(BACKUP / name)
        if files[name] != sha256(RESULTS / name):
            print(f"[FAIL] Copy verification failed for {name}")
            return 1

    manifest_path.write_text(
        json.dumps(
            {
                "note": "Original artifacts. Class names were attached in alphabetical "
                        "order while labels follow label_map order, so per-class names are WRONG.",
                "files": files,
            },
            indent=2,
        ),
        encoding="utf-8",
    )
    print(f"[OK] Backed up to {BACKUP}")
    for n, h in files.items():
        print(f"     {n}  sha256={h}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
