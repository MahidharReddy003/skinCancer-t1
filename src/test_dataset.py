from dataset import SkinCancerDataset, train_transforms


# Load training dataset WITH transformations
dataset = SkinCancerDataset(
    "dataset/splits/train.csv",
    transform=train_transforms
)

print(
    "Number of training images:",
    len(dataset)
)

# Get one image
image, label = dataset[0]

print(
    "Image shape:",
    image.shape
)

print(
    "Label:",
    label
)

print(
    "Image type:",
    type(image)
)