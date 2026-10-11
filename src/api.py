
import io
import os

import torch
from PIL import Image, UnidentifiedImageError
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from torchvision import transforms

from src.model import create_model

# --------------------------------------------------
# Paths and configuration
# --------------------------------------------------

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(ROOT_DIR, "models", "best_model.pth")

IMAGE_SIZE = 224
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

CLASS_NAMES = [
    "nv", "mel", "bkl", "bcc", "akiec", "vasc", "df"
]

CLASS_DESCRIPTIONS = {
    "nv": "Melanocytic nevi",
    "mel": "Melanoma",
    "bkl": "Benign keratosis-like lesions",
    "bcc": "Basal cell carcinoma",
    "akiec": "Actinic keratoses and intraepithelial carcinoma",
    "vasc": "Vascular lesions",
    "df": "Dermatofibroma",
}

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


# --------------------------------------------------
# Image preprocessing: must match evaluation
# --------------------------------------------------

preprocess = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# --------------------------------------------------
# Load model once when API starts
# --------------------------------------------------

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model weights not found: {MODEL_PATH}")

model = create_model()

state_dict = torch.load(MODEL_PATH, map_location=device)
model.load_state_dict(state_dict)

model = model.to(device)
model.eval()


# --------------------------------------------------
# FastAPI application
# --------------------------------------------------

app = FastAPI(
    title="Skin Lesion Classification API",
    description=(
        "Educational image-classification API using "
        "EfficientNet-B0 trained on HAM10000."
    ),
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Skin Lesion Classification API",
        "status": "running",
        "device": str(device),
        "classes": CLASS_NAMES,
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model_loaded": True,
        "device": str(device),
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if file.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(
            status_code=415,
            detail="Upload a JPEG, PNG, or WebP image."
        )

    contents = await file.read(MAX_FILE_SIZE + 1)

    if not contents:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Image must be 10 MB or smaller."
        )

    try:
        with Image.open(io.BytesIO(contents)) as original:
            original.verify()

        with Image.open(io.BytesIO(contents)) as original:
            image = original.convert("RGB")

    except (UnidentifiedImageError, OSError, ValueError):
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is not a valid image."
        )

    input_tensor = preprocess(image).unsqueeze(0).to(device)

    with torch.inference_mode():
        logits = model(input_tensor)
        probabilities = torch.softmax(logits, dim=1)[0]

    predicted_index = int(torch.argmax(probabilities).item())
    predicted_class = CLASS_NAMES[predicted_index]

    all_probabilities = {
        CLASS_NAMES[i]: round(float(probabilities[i].item()), 6)
        for i in range(len(CLASS_NAMES))
    }

    ranked_predictions = sorted(
        [
            {
                "class": name,
                "description": CLASS_DESCRIPTIONS[name],
                "probability": probability,
            }
            for name, probability in all_probabilities.items()
        ],
        key=lambda item: item["probability"],
        reverse=True,
    )

    return {
        "filename": file.filename,
        "predicted_class": predicted_class,
        "description": CLASS_DESCRIPTIONS[predicted_class],
        "confidence": all_probabilities[predicted_class],
        "probabilities": all_probabilities,
        "ranked_predictions": ranked_predictions,
        "model": "EfficientNet-B0",
        "disclaimer": (
            "Educational prediction only. This model is not clinically "
            "validated and cannot diagnose or rule out skin cancer. "
            "Consult a qualified dermatologist for medical assessment."
        ),
    }
