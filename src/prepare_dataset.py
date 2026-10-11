import os
import pandas as pd
from sklearn.model_selection import GroupShuffleSplit

# =========================
# Paths
# =========================

CSV_PATH = "dataset/HAM10000_metadata.csv"

IMAGE_DIR_1 = "dataset/HAM10000_images_part_1"
IMAGE_DIR_2 = "dataset/HAM10000_images_part_2"


# =========================
# Load metadata
# =========================

df = pd.read_csv(CSV_PATH)

print("Original dataset:", len(df))


# =========================
# Find image files
# =========================

image_paths = {}

for folder in [IMAGE_DIR_1, IMAGE_DIR_2]:

    for filename in os.listdir(folder):

        if filename.lower().endswith(".jpg"):

            image_id = filename.replace(".jpg", "")

            image_paths[image_id] = os.path.join(
                folder,
                filename
            )


# =========================
# Match images
# =========================

df["image_path"] = df["image_id"].map(image_paths)

df = df.dropna(
    subset=["image_path"]
).reset_index(drop=True)

print("Usable images:", len(df))


# =========================
# Label mapping
# =========================

label_map = {
    "nv": 0,
    "mel": 1,
    "bkl": 2,
    "bcc": 3,
    "akiec": 4,
    "vasc": 5,
    "df": 6
}

df["label"] = df["dx"].map(label_map)


# =========================
# GROUP SPLIT
# =========================

# Group using lesion_id
groups = df["lesion_id"]


# 80% Train+Validation
# 20% Test

gss = GroupShuffleSplit(
    n_splits=1,
    test_size=0.20,
    random_state=42
)

train_val_idx, test_idx = next(
    gss.split(
        df,
        groups=groups
    )
)

train_val = df.iloc[train_val_idx].copy()
test = df.iloc[test_idx].copy()


# =========================
# 80% Train
# 20% Validation
# =========================

gss2 = GroupShuffleSplit(
    n_splits=1,
    test_size=0.20,
    random_state=42
)

train_idx, val_idx = next(
    gss2.split(
        train_val,
        groups=train_val["lesion_id"]
    )
)

train = train_val.iloc[train_idx].copy()
val = train_val.iloc[val_idx].copy()


# =========================
# Results
# =========================

print("\n=========================")
print("DATASET SPLIT")
print("=========================")

print("Training:", len(train))
print("Validation:", len(val))
print("Testing:", len(test))

print("\nTraining classes:")
print(train["dx"].value_counts())

print("\nValidation classes:")
print(val["dx"].value_counts())

print("\nTesting classes:")
print(test["dx"].value_counts())


# =========================
# Verify no lesion overlap
# =========================

train_lesions = set(train["lesion_id"])
val_lesions = set(val["lesion_id"])
test_lesions = set(test["lesion_id"])

print("\n=========================")
print("LESION OVERLAP CHECK")
print("=========================")

print(
    "Train ∩ Validation:",
    len(train_lesions & val_lesions)
)

print(
    "Train ∩ Test:",
    len(train_lesions & test_lesions)
)

print(
    "Validation ∩ Test:",
    len(val_lesions & test_lesions)
)


# =========================
# Save
# =========================

os.makedirs(
    "dataset/splits",
    exist_ok=True
)

train.to_csv(
    "dataset/splits/train.csv",
    index=False
)

val.to_csv(
    "dataset/splits/val.csv",
    index=False
)

test.to_csv(
    "dataset/splits/test.csv",
    index=False
)

print("\nCSV files saved successfully.")