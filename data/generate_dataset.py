"""
Dataset generator for AquaSentinel AI.
Generates 1000+ realistic synthetic rows with intentional overlap in
boundary regions to prevent overfitting and create a realistic ML challenge.

Usage:
    python data/generate_dataset.py
"""
import csv
import random
import math
import os

random.seed(42)
OUTPUT_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "waterborne_dataset.csv")

# ---- Core distribution profiles ----
PROFILES = {
    "low": {
        "rainfall": (10, 100),
        "ph_level": (6.5, 7.6),
        "contamination": (0.01, 0.18),
        "cases_count": (0, 12),
    },
    "medium": {
        "rainfall": (90, 230),
        "ph_level": (5.6, 6.8),
        "contamination": (0.15, 0.58),
        "cases_count": (8, 45),
    },
    "high": {
        "rainfall": (200, 420),
        "ph_level": (3.8, 5.9),
        "contamination": (0.50, 1.0),
        "cases_count": (35, 130),
    },
}

# ---- Boundary / ambiguous profiles (cause realistic overlap) ----
BOUNDARY_PROFILES = {
    "low": {  # Low that looks medium-ish
        "rainfall": (80, 130),
        "ph_level": (6.3, 6.8),
        "contamination": (0.10, 0.25),
        "cases_count": (5, 18),
    },
    "medium": {  # Medium that looks high-ish or low-ish
        "rainfall": (180, 260),
        "ph_level": (5.5, 6.2),
        "contamination": (0.40, 0.65),
        "cases_count": (30, 55),
    },
    "high": {  # High that looks medium-ish
        "rainfall": (190, 280),
        "ph_level": (5.3, 6.0),
        "contamination": (0.45, 0.70),
        "cases_count": (30, 60),
    },
}

LOCATIONS = [
    "Mumbai", "Delhi", "Chennai", "Kolkata", "Bangalore",
    "Hyderabad", "Ahmedabad", "Pune", "Jaipur", "Lucknow",
    "Patna", "Bhopal", "Surat", "Nagpur", "Varanasi",
    "Kanpur", "Indore", "Vizag", "Coimbatore", "Kochi",
    "Guwahati", "Ranchi", "Dehradun", "Shimla", "Thiruvananthapuram",
]

# How many rows per category
CORE_PER_LABEL = 250       # 250 × 3 = 750 core rows
BOUNDARY_PER_LABEL = 100   # 100 × 3 = 300 boundary rows → ~1050 total


def rand_float(lo, hi, precision=2):
    return round(random.uniform(lo, hi), precision)


def add_noise(value, noise_pct=0.15):
    """Add Gaussian noise to a value."""
    noise = random.gauss(0, abs(value) * noise_pct)
    return value + noise


def generate_row(profile, label):
    """Generate a single row with noise applied."""
    rainfall = max(0, add_noise(rand_float(*profile["rainfall"]), 0.12))
    ph = max(3.0, min(8.5, add_noise(rand_float(*profile["ph_level"]), 0.06)))
    contam = max(0.0, min(1.0, add_noise(rand_float(*profile["contamination"]), 0.15)))
    cases = max(0, int(add_noise(random.uniform(*profile["cases_count"]), 0.18)))

    return {
        "rainfall": round(rainfall, 2),
        "ph_level": round(ph, 2),
        "contamination": round(contam, 3),
        "cases_count": cases,
        "location": random.choice(LOCATIONS),
        "risk_label": label,
    }


def generate():
    rows = []

    # Core rows (clean signal)
    for label, profile in PROFILES.items():
        for _ in range(CORE_PER_LABEL):
            rows.append(generate_row(profile, label))

    # Boundary rows (intentional overlap — the hard cases)
    for label, profile in BOUNDARY_PROFILES.items():
        for _ in range(BOUNDARY_PER_LABEL):
            rows.append(generate_row(profile, label))

    # Shuffle
    random.shuffle(rows)

    # Write CSV
    fieldnames = ["rainfall", "ph_level", "contamination", "cases_count", "location", "risk_label"]
    with open(OUTPUT_PATH, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    # Stats
    counts = {}
    for r in rows:
        counts[r["risk_label"]] = counts.get(r["risk_label"], 0) + 1

    print(f"✅ Generated {len(rows)} rows → {OUTPUT_PATH}")
    print(f"   Distribution: {counts}")
    print(f"   Includes {BOUNDARY_PER_LABEL * 3} boundary/overlap cases for realistic challenge")


if __name__ == "__main__":
    generate()
