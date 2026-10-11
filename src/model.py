import torch
import torch.nn as nn
from torchvision.models import efficientnet_b0, EfficientNet_B0_Weights


NUM_CLASSES = 7


def create_model():

    # Load pretrained EfficientNet-B0
    weights = EfficientNet_B0_Weights.DEFAULT

    model = efficientnet_b0(
        weights=weights
    )

    # Replace final classification layer
    in_features = model.classifier[1].in_features

    model.classifier[1] = nn.Linear(
        in_features,
        NUM_CLASSES
    )

    return model


if __name__ == "__main__":

    model = create_model()

    print(model)

    # Test with dummy image
    x = torch.randn(
        1, 3, 224, 224
    )

    output = model(x)

    print("\nOutput shape:", output.shape)