import os
import pandas as pd
import matplotlib.pyplot as plt
from PIL import Image

# Paths
CSV_PATH = "dataset/HAM10000_metadata.csv"
IMAGE_DIR_1 = "dataset/HAM10000_images_part_1"
IMAGE_DIR_2 = "dataset/HAM10000_images_part_2"

# Load metadata
df = pd.read_csv(CSV_PATH)

print("Total images in metadata:", len(df))

# Create image lookup
image_paths = {}

for filename in os.listdir(IMAGE_DIR_1):
    if filename.lower().endswith(".jpg"):
        image_id = filename.replace(".jpg", "")
        image_paths[image_id] = os.path.join(IMAGE_DIR_1, filename)

for filename in os.listdir(IMAGE_DIR_2):
    if filename.lower().endswith(".jpg"):
        image_id = filename.replace(".jpg", "")
        image_paths[image_id] = os.path.join(IMAGE_DIR_2, filename)

# Match images with metadata
df["image_path"] = df["image_id"].map(image_paths)

print("Images successfully matched:", df["image_path"].notna().sum())
print("Images missing:", df["image_path"].isna().sum())

# Show class distribution
print("\nClass distribution:")
print(df["dx"].value_counts())

# Display sample images
classes = df["dx"].unique()

fig, axes = plt.subplots(2, 4, figsize=(16, 8))
axes = axes.flatten()

for i, label in enumerate(classes):
    sample = df[df["dx"] == label].iloc[0]

    image = Image.open(sample["image_path"])

    axes[i].imshow(image)
    axes[i].set_title(f"Class: {label}")
    axes[i].axis("off")

# Hide unused subplot
for i in range(len(classes), len(axes)):
    axes[i].axis("off")

plt.tight_layout()
plt.show()