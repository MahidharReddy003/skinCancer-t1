import os
import pandas as pd

# Change this path if your CSV is somewhere else
csv_path = "dataset/HAM10000_metadata.csv"

# Load metadata
df = pd.read_csv(csv_path)

print("Dataset shape:")
print(df.shape)

print("\nFirst 5 rows:")
print(df.head())

print("\nColumn names:")
print(df.columns.tolist())

print("\nClass distribution:")
print(df["dx"].value_counts())

print("\nMissing values:")
print(df.isnull().sum())