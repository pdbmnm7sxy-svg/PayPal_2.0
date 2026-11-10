import os
import joblib
import numpy as np
import logging
from typing import List, Tuple, Any
from app.config import (
    MODEL_PATH,
    FEATURE_NAMES_PATH,
    PINNED_HF_REPO,
    PINNED_HF_REVISION,
    MODEL_FILENAME,
    MODEL_FEATURE_COUNT,
)

logger = logging.getLogger("crossbridge.model_loader")

_model: Any = None
_feature_names: List[str] = []

def load_fraud_model() -> Tuple[Any, List[str]]:
    """
    Loads and validates the pinned Hugging Face credit-card fraud model.
    Model repo: bolewara/credit-card-fraud-detector
    Revision: 20b4630d5b3bfbe1f46a91af620fa389f23a07a8
    Artifact: fraud_model.joblib
    Schema: 29 features ['V1'..'V28', 'Amount']
    """
    global _model, _feature_names

    if _model is not None and len(_feature_names) == MODEL_FEATURE_COUNT:
        return _model, _feature_names

    if not os.path.exists(FEATURE_NAMES_PATH):
        raise FileNotFoundError(f"Feature names file missing at {FEATURE_NAMES_PATH}")

    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file missing at {MODEL_PATH}")

    logger.info(f"Loading feature names from {FEATURE_NAMES_PATH}...")
    raw_names = np.load(FEATURE_NAMES_PATH, allow_pickle=True)
    _feature_names = [str(name) for name in raw_names]

    if len(_feature_names) != MODEL_FEATURE_COUNT:
        raise ValueError(
            f"Expected {MODEL_FEATURE_COUNT} features in schema, got {len(_feature_names)}: {_feature_names}"
        )

    logger.info(f"Loading trained LightGBM fraud model from {MODEL_PATH}...")
    _model = joblib.load(MODEL_PATH)

    logger.info(
        f"Fraud model loaded successfully from pinned revision {PINNED_HF_REVISION[:8]}! "
        f"Classes: {getattr(_model, 'classes_', 'N/A')}, Features: {len(_feature_names)}"
    )

    return _model, _feature_names

def get_model_info():
    model, features = load_fraud_model()
    return {
        "repo": PINNED_HF_REPO,
        "revision": PINNED_HF_REVISION,
        "artifact_file": MODEL_FILENAME,
        "feature_count": len(features),
        "feature_names": features,
        "algorithm": type(model).__name__,
        "classes": getattr(model, "classes_", [0, 1]).tolist() if hasattr(model, "classes_") else [0, 1],
        "training_data_source": "ULB credit card fraud benchmark (284,807 transactions, PCA anonymized)",
        "intended_use": "Benchmark tabular fraud demonstration; requires PCA-transformed transaction features V1-V28 and Amount.",
        "limitations": "Prototype demonstration only. Not calibrated for production cross-border wire fraud, AML, or sanctions compliance."
    }
