from typing import Dict, List, Any

# 29 features: V1..V28 and Amount
FEATURE_NAMES = [f"V{i}" for i in range(1, 29)] + ["Amount"]

BENCHMARK_FIXTURES: Dict[str, Dict[str, Any]] = {
    "LEGIT_CLEAN": {
        "title": "Low-Risk Interbank Settlement",
        "category": "BENCHMARK_LEGITIMATE",
        "description": "Standard institutional correspondent transfer vector with balanced PCA components reflecting typical bilateral traffic.",
        "expected_risk": "LOW",
        "features": {
            "V1": -0.42, "V2": 0.15, "V3": 0.88, "V4": 0.12, "V5": -0.31,
            "V6": 0.45, "V7": 0.22, "V8": 0.08, "V9": 0.31, "V10": -0.18,
            "V11": -0.25, "V12": 0.35, "V13": -0.11, "V14": 0.28, "V15": 0.42,
            "V16": -0.19, "V17": 0.14, "V18": -0.05, "V19": 0.21, "V20": -0.08,
            "V21": 0.02, "V22": 0.11, "V23": -0.04, "V24": 0.08, "V25": 0.15,
            "V26": -0.09, "V27": 0.04, "V28": -0.02, "Amount": 12500.0
        }
    },
    "SUSPICIOUS_VELOCITY": {
        "title": "Borderline / Elevated Velocity Anomaly",
        "category": "BENCHMARK_ELEVATED_RISK",
        "description": "Corridor traffic with moderate PCA skew on risk-sensitive latent components (V4, V11, V12) triggering manual risk inspection.",
        "expected_risk": "MEDIUM",
        "features": {
            "V1": -1.85, "V2": 1.45, "V3": -1.20, "V4": 2.65, "V5": -1.15,
            "V6": -0.45, "V7": -1.60, "V8": 0.95, "V9": -1.40, "V10": -2.10,
            "V11": 2.30, "V12": -2.85, "V13": 0.45, "V14": -3.20, "V15": 0.10,
            "V16": -1.45, "V17": -1.90, "V18": -0.65, "V19": 0.85, "V20": 0.40,
            "V21": 0.38, "V22": -0.20, "V23": 0.15, "V24": -0.35, "V25": -0.10,
            "V26": 0.32, "V27": 0.28, "V28": 0.12, "Amount": 68000.0
        }
    },
    "HIGH_RISK_FRAUD": {
        "title": "High-Risk Synthetic Fraud Vector",
        "category": "BENCHMARK_HIGH_RISK",
        "description": "Extreme negative PCA deviations in primary discriminator components (V10, V12, V14, V17) matching classic synthetic fraudulent transaction clusters.",
        "expected_risk": "HIGH",
        "features": {
            "V1": -4.85, "V2": 3.75, "V3": -6.10, "V4": 5.20, "V5": -3.85,
            "V6": -1.95, "V7": -5.40, "V8": 2.45, "V9": -3.65, "V10": -6.80,
            "V11": 4.90, "V12": -7.95, "V13": 0.15, "V14": -9.85, "V15": -0.65,
            "V16": -4.95, "V17": -6.85, "V18": -2.80, "V19": 1.65, "V20": 0.88,
            "V21": 0.95, "V22": 0.15, "V23": -0.45, "V24": 0.25, "V25": 0.35,
            "V26": 0.45, "V27": 0.95, "V28": 0.35, "Amount": 245000.0
        }
    }
}

def get_fixture_vector(key: str, amount_override: float = None) -> List[float]:
    fixture = BENCHMARK_FIXTURES.get(key, BENCHMARK_FIXTURES["LEGIT_CLEAN"])
    vector = [float(fixture["features"][f"V{i}"]) for i in range(1, 29)]
    amt = amount_override if amount_override is not None else float(fixture["features"]["Amount"])
    vector.append(amt)
    return vector
