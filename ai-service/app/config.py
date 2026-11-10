import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

MODEL_PATH = os.getenv("MODEL_PATH", str(BASE_DIR / "model" / "fraud_model.joblib"))
FEATURE_NAMES_PATH = os.getenv("FEATURE_NAMES_PATH", str(BASE_DIR / "model" / "feature_names.npy"))

PINNED_HF_REPO = "bolewara/credit-card-fraud-detector"
PINNED_HF_REVISION = "20b4630d5b3bfbe1f46a91af620fa389f23a07a8"
MODEL_FILENAME = "fraud_model.joblib"
MODEL_FEATURE_COUNT = 29

# Decision thresholds
FRAUD_THRESHOLD_LOW = float(os.getenv("FRAUD_THRESHOLD_LOW", "0.25"))
FRAUD_THRESHOLD_HIGH = float(os.getenv("FRAUD_THRESHOLD_HIGH", "0.70"))
