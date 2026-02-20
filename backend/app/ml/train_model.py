"""
ML model training script for AquaSentinel AI.
Trains a RandomForestClassifier on the waterborne disease dataset
and saves the model as model.pkl.

Usage:
    python app/ml/train_model.py
"""
import os
import sys
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
from sklearn.preprocessing import LabelEncoder
import joblib

# Resolve paths relative to project root
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "..", ".."))
DATA_PATH = os.path.join(PROJECT_ROOT, "data", "waterborne_dataset.csv")
MODEL_PATH = os.path.join(SCRIPT_DIR, "model.pkl")
ENCODER_PATH = os.path.join(SCRIPT_DIR, "label_encoder.pkl")


def train():
    """Train the RandomForest model and save artifacts."""
    print("📊 Loading dataset...")
    df = pd.read_csv(DATA_PATH)
    print(f"   Dataset shape: {df.shape}")
    print(f"   Risk distribution:\n{df['risk_label'].value_counts().to_string()}\n")

    # Features and target
    features = ["rainfall", "ph_level", "contamination", "cases_count"]
    X = df[features]
    y = df["risk_label"]

    # Encode labels
    encoder = LabelEncoder()
    y_encoded = encoder.fit_transform(y)
    print(f"   Classes: {list(encoder.classes_)}")

    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )

    # Train RandomForest
    print("\n🌲 Training RandomForest...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    print("\n📈 Classification Report:")
    print(classification_report(y_test, y_pred, target_names=encoder.classes_))

    # Feature importance
    print("🔍 Feature Importance:")
    for name, importance in zip(features, model.feature_importances_):
        print(f"   {name}: {importance:.4f}")

    # Save model and encoder
    joblib.dump(model, MODEL_PATH)
    joblib.dump(encoder, ENCODER_PATH)
    print(f"\n✅ Model saved to {MODEL_PATH}")
    print(f"✅ Encoder saved to {ENCODER_PATH}")


if __name__ == "__main__":
    train()
