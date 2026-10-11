import os
import torch
import numpy as np
import pandas as pd
import torch.nn as nn

from torch.utils.data import DataLoader
from sklearn.utils.class_weight import compute_class_weight
from sklearn.metrics import accuracy_score, f1_score

from dataset import SkinCancerDataset, train_transforms, val_transforms
from model import create_model


# ==================================================
# Configuration
# ==================================================

BATCH_SIZE = 16
EPOCHS = 5
LEARNING_RATE = 0.0001

NUM_CLASSES = 7

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

print("Using device:", DEVICE)


# ==================================================
# Load datasets
# ==================================================

train_dataset = SkinCancerDataset(
    "dataset/splits/train.csv",
    transform=train_transforms
)

val_dataset = SkinCancerDataset(
    "dataset/splits/val.csv",
    transform=val_transforms
)


# ==================================================
# DataLoaders
# ==================================================

train_loader = DataLoader(
    train_dataset,
    batch_size=BATCH_SIZE,
    shuffle=True,
    num_workers=0
)

val_loader = DataLoader(
    val_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=0
)


print("Training images:", len(train_dataset))
print("Validation images:", len(val_dataset))


# ==================================================
# Calculate class weights
# ==================================================

train_df = pd.read_csv(
    "dataset/splits/train.csv"
)

class_weights = compute_class_weight(
    class_weight="balanced",
    classes=np.arange(NUM_CLASSES),
    y=train_df["label"].values
)

class_weights = torch.tensor(
    class_weights,
    dtype=torch.float32
).to(DEVICE)

print("\nClass weights:")
print(class_weights)


# ==================================================
# Model
# ==================================================

model = create_model()

model = model.to(DEVICE)


# ==================================================
# Loss function
# ==================================================

criterion = nn.CrossEntropyLoss(
    weight=class_weights
)


# ==================================================
# Optimizer
# ==================================================

optimizer = torch.optim.AdamW(
    model.parameters(),
    lr=LEARNING_RATE
)


# ==================================================
# Training
# ==================================================

best_val_f1 = 0.0

os.makedirs(
    "models",
    exist_ok=True
)


for epoch in range(EPOCHS):

    # ------------------------------
    # Training
    # ------------------------------

    model.train()

    train_loss = 0.0
    train_predictions = []
    train_labels = []

    for images, labels in train_loader:

        images = images.to(DEVICE)
        labels = labels.to(DEVICE)

        optimizer.zero_grad()

        outputs = model(images)

        loss = criterion(
            outputs,
            labels
        )

        loss.backward()

        optimizer.step()

        train_loss += loss.item()

        predictions = torch.argmax(
            outputs,
            dim=1
        )

        train_predictions.extend(
            predictions.cpu().numpy()
        )

        train_labels.extend(
            labels.cpu().numpy()
        )


    # ------------------------------
    # Training metrics
    # ------------------------------

    train_accuracy = accuracy_score(
        train_labels,
        train_predictions
    )

    train_f1 = f1_score(
        train_labels,
        train_predictions,
        average="macro"
    )


    # ------------------------------
    # Validation
    # ------------------------------

    model.eval()

    val_loss = 0.0
    val_predictions = []
    val_labels = []

    with torch.no_grad():

        for images, labels in val_loader:

            images = images.to(DEVICE)
            labels = labels.to(DEVICE)

            outputs = model(images)

            loss = criterion(
                outputs,
                labels
            )

            val_loss += loss.item()

            predictions = torch.argmax(
                outputs,
                dim=1
            )

            val_predictions.extend(
                predictions.cpu().numpy()
            )

            val_labels.extend(
                labels.cpu().numpy()
            )


    # ------------------------------
    # Validation metrics
    # ------------------------------

    val_accuracy = accuracy_score(
        val_labels,
        val_predictions
    )

    val_f1 = f1_score(
        val_labels,
        val_predictions,
        average="macro"
    )


    # ------------------------------
    # Print results
    # ------------------------------

    print(
        f"\nEpoch [{epoch + 1}/{EPOCHS}]"
    )

    print(
        f"Train Loss: {train_loss / len(train_loader):.4f}"
    )

    print(
        f"Train Accuracy: {train_accuracy:.4f}"
    )

    print(
        f"Train F1: {train_f1:.4f}"
    )

    print(
        f"Val Loss: {val_loss / len(val_loader):.4f}"
    )

    print(
        f"Val Accuracy: {val_accuracy:.4f}"
    )

    print(
        f"Val F1: {val_f1:.4f}"
    )


    # ------------------------------
    # Save best model
    # ------------------------------

    if val_f1 > best_val_f1:

        best_val_f1 = val_f1

        torch.save(
            model.state_dict(),
            "models/best_model.pth"
        )

        print(
            "✓ Best model saved!"
        )


print("\nTraining completed.")

print(
    f"Best validation F1: {best_val_f1:.4f}"
)