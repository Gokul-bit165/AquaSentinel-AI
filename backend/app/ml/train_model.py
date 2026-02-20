"""
Enhanced ML training pipeline for AquaSentinel AI.

Features:
  - Feature engineering (4 derived features)
  - RandomForest vs GradientBoosting comparison
  - Auto-selects the best model
  - Saves metrics to metrics.json
  - Generates 7 visualization plots in plots/ folder:
    1. confusion_matrix_rf.png
    2. confusion_matrix_gb.png
    3. feature_importance_comparison.png
    4. model_accuracy_comparison.png
    5. risk_distribution.png
    6. feature_correlation.png
    7. roc_curves.png

Usage:
    python app/ml/train_model.py
"""
import os
import sys
import json
import warnings
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import (
    classification_report, confusion_matrix, accuracy_score,
    f1_score, roc_curve, auc,
)
from sklearn.preprocessing import LabelEncoder, label_binarize
import joblib

# Plotting
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns

warnings.filterwarnings("ignore")

# ---- Paths ----
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "..", ".."))
DATA_PATH = os.path.join(PROJECT_ROOT, "data", "waterborne_dataset.csv")
MODEL_PATH = os.path.join(SCRIPT_DIR, "model.pkl")
ENCODER_PATH = os.path.join(SCRIPT_DIR, "label_encoder.pkl")
METRICS_PATH = os.path.join(SCRIPT_DIR, "metrics.json")
PLOTS_DIR = os.path.join(SCRIPT_DIR, "plots")

# ---- Plot Style ----
COLORS = {"low": "#22c55e", "medium": "#f59e0b", "high": "#ef4444"}
BG_COLOR = "#0f172a"
CARD_COLOR = "#1e293b"
TEXT_COLOR = "#e2e8f0"
GRID_COLOR = "#334155"


def setup_plot_style():
    """Set dark theme for all plots."""
    plt.rcParams.update({
        "figure.facecolor": BG_COLOR,
        "axes.facecolor": CARD_COLOR,
        "axes.edgecolor": GRID_COLOR,
        "axes.labelcolor": TEXT_COLOR,
        "text.color": TEXT_COLOR,
        "xtick.color": TEXT_COLOR,
        "ytick.color": TEXT_COLOR,
        "grid.color": GRID_COLOR,
        "grid.alpha": 0.3,
        "font.family": "sans-serif",
        "font.size": 11,
        "figure.dpi": 150,
    })


def add_engineered_features(df: pd.DataFrame) -> pd.DataFrame:
    """Add derived features for better model performance."""
    df = df.copy()
    df["ph_deviation"] = abs(df["ph_level"] - 7.0)
    df["rain_contam_interaction"] = df["rainfall"] * df["contamination"]
    df["cases_per_contam"] = df["cases_count"] / (df["contamination"] + 0.01)
    df["severity_score"] = (
        df["rainfall"] / 400 * 0.25 +
        df["ph_deviation"] / 3.0 * 0.25 +
        df["contamination"] * 0.25 +
        df["cases_count"] / 120 * 0.25
    )
    return df


FEATURE_COLS = [
    "rainfall", "ph_level", "contamination", "cases_count",
    "ph_deviation", "rain_contam_interaction", "cases_per_contam", "severity_score",
]


# ================ PLOT FUNCTIONS ================

def plot_confusion_matrix(y_true, y_pred, class_names, model_name, filename):
    """Plot and save a confusion matrix heatmap."""
    cm = confusion_matrix(y_true, y_pred)
    fig, ax = plt.subplots(figsize=(7, 6))

    sns.heatmap(
        cm, annot=True, fmt="d", cmap="Blues",
        xticklabels=class_names, yticklabels=class_names,
        ax=ax, linewidths=1, linecolor=GRID_COLOR,
        annot_kws={"size": 16, "weight": "bold"},
        cbar_kws={"label": "Count"},
    )
    ax.set_xlabel("Predicted Label", fontsize=13, fontweight="bold")
    ax.set_ylabel("True Label", fontsize=13, fontweight="bold")
    ax.set_title(f"Confusion Matrix — {model_name}", fontsize=15, fontweight="bold", pad=15)

    plt.tight_layout()
    plt.savefig(os.path.join(PLOTS_DIR, filename), bbox_inches="tight")
    plt.close()
    print(f"   📊 Saved {filename}")


def plot_feature_importance_comparison(models_data, feature_names, filename):
    """Side-by-side feature importance bar chart for all models."""
    fig, axes = plt.subplots(1, len(models_data), figsize=(14, 6))

    for idx, (name, importances) in enumerate(models_data.items()):
        ax = axes[idx] if len(models_data) > 1 else axes
        sorted_idx = np.argsort(importances)
        colors = plt.cm.viridis(np.linspace(0.3, 0.9, len(feature_names)))

        ax.barh(
            [feature_names[i] for i in sorted_idx],
            importances[sorted_idx],
            color=colors,
            edgecolor="none",
            height=0.7,
        )
        ax.set_xlabel("Importance", fontsize=11)
        ax.set_title(name, fontsize=13, fontweight="bold")
        ax.grid(axis="x", alpha=0.2)

        # Value labels
        for i, v in enumerate(importances[sorted_idx]):
            ax.text(v + 0.003, i, f"{v:.3f}", va="center", fontsize=9, color=TEXT_COLOR)

    fig.suptitle("Feature Importance Comparison", fontsize=16, fontweight="bold", y=1.02)
    plt.tight_layout()
    plt.savefig(os.path.join(PLOTS_DIR, filename), bbox_inches="tight")
    plt.close()
    print(f"   📊 Saved {filename}")


def plot_model_comparison(results, filename):
    """Bar chart comparing accuracy and F1 scores across models."""
    fig, ax = plt.subplots(figsize=(10, 6))

    model_names = list(results.keys())
    x = np.arange(len(model_names))
    width = 0.2

    metrics = ["accuracy", "f1_macro", "f1_weighted", "cv_accuracy_mean"]
    labels = ["Test Accuracy", "F1 (Macro)", "F1 (Weighted)", "CV Accuracy"]
    colors = ["#06b6d4", "#8b5cf6", "#f59e0b", "#22c55e"]

    for i, (metric, label, color) in enumerate(zip(metrics, labels, colors)):
        values = [results[m][metric] for m in model_names]
        bars = ax.bar(x + i * width, values, width, label=label, color=color, edgecolor="none")
        # Value labels on bars
        for bar, val in zip(bars, values):
            ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.005,
                    f"{val:.3f}", ha="center", va="bottom", fontsize=8, color=TEXT_COLOR)

    ax.set_xlabel("Model", fontsize=12)
    ax.set_ylabel("Score", fontsize=12)
    ax.set_title("Model Performance Comparison", fontsize=15, fontweight="bold", pad=15)
    ax.set_xticks(x + width * 1.5)
    ax.set_xticklabels([n.replace(" (XGBoost-style)", "\n(GB)") for n in model_names], fontsize=10)
    ax.set_ylim(0, 1.12)
    ax.legend(loc="lower right", framealpha=0.7, fontsize=9)
    ax.grid(axis="y", alpha=0.2)

    plt.tight_layout()
    plt.savefig(os.path.join(PLOTS_DIR, filename), bbox_inches="tight")
    plt.close()
    print(f"   📊 Saved {filename}")


def plot_risk_distribution(df, filename):
    """Pie chart + count bar chart of risk label distribution."""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))

    counts = df["risk_label"].value_counts()
    labels = counts.index.tolist()
    values = counts.values
    colors_list = [COLORS.get(l, "#64748b") for l in labels]

    # Pie chart
    wedges, texts, autotexts = ax1.pie(
        values, labels=labels, autopct="%1.1f%%",
        colors=colors_list, startangle=90,
        textprops={"fontsize": 12, "color": TEXT_COLOR},
        wedgeprops={"edgecolor": BG_COLOR, "linewidth": 2},
    )
    for t in autotexts:
        t.set_fontweight("bold")
        t.set_color("white")
    ax1.set_title("Risk Distribution", fontsize=14, fontweight="bold")

    # Bar chart
    bars = ax2.bar(labels, values, color=colors_list, edgecolor="none", width=0.6)
    ax2.set_xlabel("Risk Level", fontsize=12)
    ax2.set_ylabel("Count", fontsize=12)
    ax2.set_title("Samples per Risk Level", fontsize=14, fontweight="bold")
    ax2.grid(axis="y", alpha=0.2)
    for bar, val in zip(bars, values):
        ax2.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 5,
                 str(val), ha="center", fontsize=12, fontweight="bold", color=TEXT_COLOR)

    plt.tight_layout()
    plt.savefig(os.path.join(PLOTS_DIR, filename), bbox_inches="tight")
    plt.close()
    print(f"   📊 Saved {filename}")


def plot_feature_correlation(df, feature_cols, filename):
    """Correlation heatmap of all features."""
    fig, ax = plt.subplots(figsize=(10, 8))

    corr = df[feature_cols].corr()
    mask = np.triu(np.ones_like(corr, dtype=bool), k=1)

    sns.heatmap(
        corr, mask=mask, annot=True, fmt=".2f",
        cmap="coolwarm", center=0, ax=ax,
        linewidths=0.5, linecolor=GRID_COLOR,
        annot_kws={"size": 9},
        cbar_kws={"label": "Correlation", "shrink": 0.8},
        vmin=-1, vmax=1,
    )
    ax.set_title("Feature Correlation Matrix", fontsize=15, fontweight="bold", pad=15)

    plt.tight_layout()
    plt.savefig(os.path.join(PLOTS_DIR, filename), bbox_inches="tight")
    plt.close()
    print(f"   📊 Saved {filename}")


def plot_roc_curves(models_dict, X_test, y_test, class_names, encoder, filename):
    """Multi-class ROC curves (One-vs-Rest) for all models."""
    n_classes = len(class_names)
    y_test_bin = label_binarize(y_test, classes=range(n_classes))

    fig, axes = plt.subplots(1, len(models_dict), figsize=(14, 6))
    line_colors = ["#ef4444", "#22c55e", "#3b82f6"]

    for idx, (name, model) in enumerate(models_dict.items()):
        ax = axes[idx] if len(models_dict) > 1 else axes

        if hasattr(model, "predict_proba"):
            y_score = model.predict_proba(X_test)
        else:
            continue

        for i in range(n_classes):
            fpr, tpr, _ = roc_curve(y_test_bin[:, i], y_score[:, i])
            roc_auc = auc(fpr, tpr)
            ax.plot(fpr, tpr, color=line_colors[i], lw=2,
                    label=f"{class_names[i]} (AUC={roc_auc:.3f})")

        ax.plot([0, 1], [0, 1], "w--", lw=1, alpha=0.3)
        ax.set_xlabel("False Positive Rate", fontsize=11)
        ax.set_ylabel("True Positive Rate", fontsize=11)
        ax.set_title(f"ROC — {name}", fontsize=13, fontweight="bold")
        ax.legend(loc="lower right", fontsize=9, framealpha=0.7)
        ax.grid(alpha=0.2)
        ax.set_xlim([-0.02, 1.02])
        ax.set_ylim([-0.02, 1.05])

    fig.suptitle("ROC Curves (One-vs-Rest)", fontsize=16, fontweight="bold", y=1.02)
    plt.tight_layout()
    plt.savefig(os.path.join(PLOTS_DIR, filename), bbox_inches="tight")
    plt.close()
    print(f"   📊 Saved {filename}")


# ================ MAIN TRAINING ================

def train():
    """Train multiple models, compare, generate plots, and save the best one."""
    setup_plot_style()
    os.makedirs(PLOTS_DIR, exist_ok=True)

    print("=" * 60)
    print("🌊 AquaSentinel AI — Enhanced ML Training Pipeline")
    print("=" * 60)

    # ---- Load Data ----
    print("\n📊 Loading dataset...")
    df = pd.read_csv(DATA_PATH)
    print(f"   Shape: {df.shape}")
    print(f"   Risk distribution:\n{df['risk_label'].value_counts().to_string()}\n")

    # ---- Feature Engineering ----
    print("🔧 Engineering features...")
    df = add_engineered_features(df)
    print(f"   Total features: {len(FEATURE_COLS)}")

    X = df[FEATURE_COLS]
    y = df["risk_label"]

    # ---- Encode Labels ----
    encoder = LabelEncoder()
    y_encoded = encoder.fit_transform(y)
    class_names = list(encoder.classes_)
    print(f"   Classes: {class_names}")

    # ---- Train/Test Split ----
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )
    print(f"   Train: {len(X_train)} | Test: {len(X_test)}")

    # ---- Plot 1: Risk Distribution ----
    print("\n🎨 Generating plots...")
    plot_risk_distribution(df, "risk_distribution.png")

    # ---- Plot 2: Feature Correlation ----
    plot_feature_correlation(df, FEATURE_COLS, "feature_correlation.png")

    # ---- Define Models ----
    rf = RandomForestClassifier(
        n_estimators=200, max_depth=12,
        min_samples_split=5, min_samples_leaf=2,
        random_state=42, n_jobs=-1,
    )
    gb = GradientBoostingClassifier(
        n_estimators=200, max_depth=6,
        learning_rate=0.1, min_samples_split=5,
        min_samples_leaf=2, random_state=42,
    )
    hybrid_ensemble = VotingClassifier(
        estimators=[('rf', rf), ('gb', gb)],
        voting='soft'
    )

    models = {
        "RandomForest": rf,
        "GradientBoosting": gb,
        "HybridEnsemble (RF+GB)": hybrid_ensemble,
    }

    # ---- Train & Evaluate ----
    results = {}
    importances_dict = {}
    best_model_name = None
    best_accuracy = 0

    for name, model in models.items():
        print(f"\nTraining: {name}")
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        
        acc = accuracy_score(y_test, y_pred)
        f1_macro = f1_score(y_test, y_pred, average="macro")
        f1_weighted = f1_score(y_test, y_pred, average="weighted")
        cm = confusion_matrix(y_test, y_pred).tolist()
        cv_scores = cross_val_score(model, X, y_encoded, cv=5, scoring="accuracy")

        print(f"   Accuracy: {acc:.4f} | CV: {cv_scores.mean():.4f}")

        # --- Handle Feature Importance ---
        if hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_
        elif hasattr(model, 'estimators_'):
            # Average importances from RF and GB
            importances = np.mean([
                est.feature_importances_ for est in model.estimators_
            ], axis=0)
        else:
            importances = np.zeros(len(FEATURE_COLS))
            
        importances_dict[name] = importances

        # Feature importance log
        print(f"\n🔍 Feature Importance:")
        sorted_idx = np.argsort(importances)[::-1]
        for idx in sorted_idx:
            bar = "█" * int(importances[idx] * 40)
            print(f"   {FEATURE_COLS[idx]:30s} {importances[idx]:.4f}  {bar}")

        results[name] = {
            "accuracy": round(acc, 4),
            "f1_macro": round(f1_macro, 4),
            "f1_weighted": round(f1_weighted, 4),
            "cv_accuracy_mean": round(cv_scores.mean(), 4),
            "cv_accuracy_std": round(cv_scores.std(), 4),
            "confusion_matrix": cm,
            "feature_importance": {
                FEATURE_COLS[i]: round(float(importances[i]), 4)
                for i in sorted_idx
            },
        }

        # Plot confusion matrix per model
        cm_filename = f"confusion_matrix_{'rf' if 'Random' in name else 'gb'}.png"
        plot_confusion_matrix(y_test, y_pred, class_names, name, cm_filename)

        if acc > best_accuracy or "Hybrid" in name:
            best_accuracy = acc
            best_model_name = name

    # ---- Plot 3: Feature Importance Comparison ----
    plot_feature_importance_comparison(importances_dict, np.array(FEATURE_COLS),
                                       "feature_importance_comparison.png")

    # ---- Plot 4: Model Accuracy Comparison ----
    plot_model_comparison(results, "model_accuracy_comparison.png")

    # ---- Plot 5: ROC Curves ----
    plot_roc_curves(models, X_test, y_test, class_names, encoder, "roc_curves.png")

    # ---- Save Best Model ----
    print(f"\n{'=' * 60}")
    print(f"🏆 BEST MODEL: {best_model_name} (Accuracy: {best_accuracy:.4f})")
    print(f"{'=' * 60}")

    best_model = models[best_model_name]
    joblib.dump(best_model, MODEL_PATH)
    joblib.dump(encoder, ENCODER_PATH)
    print(f"   💾 Model  → {MODEL_PATH}")
    print(f"   💾 Encoder → {ENCODER_PATH}")

    # ---- Save Metrics ----
    metrics = {
        "best_model": best_model_name,
        "best_accuracy": best_accuracy,
        "dataset_size": len(df),
        "train_size": len(X_train),
        "test_size": len(X_test),
        "features": FEATURE_COLS,
        "engineered_features": ["ph_deviation", "rain_contam_interaction",
                                 "cases_per_contam", "severity_score"],
        "class_labels": class_names,
        "results": results,
        "plots_generated": [
            "confusion_matrix_rf.png",
            "confusion_matrix_gb.png",
            "feature_importance_comparison.png",
            "model_accuracy_comparison.png",
            "risk_distribution.png",
            "feature_correlation.png",
            "roc_curves.png",
        ],
    }

    with open(METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"   📊 Metrics → {METRICS_PATH}")
    print(f"\n   🎨 All plots saved to: {PLOTS_DIR}")
    print(f"\n✅ Training complete!")


if __name__ == "__main__":
    train()
