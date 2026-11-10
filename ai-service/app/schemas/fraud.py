from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any

class FraudScoreRequest(BaseModel):
    # Features can be given as a dictionary of name->float or a list of 29 floats
    features: Optional[Dict[str, float]] = Field(
        default=None,
        description="Dictionary containing all 29 features: V1..V28 and Amount"
    )
    feature_vector: Optional[List[float]] = Field(
        default=None,
        description="Array of 29 float values in exact order: V1..V28, Amount"
    )
    benchmark_fixture_key: Optional[str] = Field(
        default=None,
        description="Optional key to select synthetic benchmark fixture ('LEGIT_CLEAN', 'SUSPICIOUS_VELOCITY', 'HIGH_RISK_FRAUD')"
    )
    transfer_amount: Optional[float] = Field(
        default=None,
        description="Transfer amount to override 'Amount' feature"
    )

class FraudScoreResponse(BaseModel):
    fraud_probability: float
    legitimate_probability: float
    prediction: int = Field(description="0 = Legitimate, 1 = Fraudulent")
    decision: str = Field(description="'APPROVE', 'MANUAL_REVIEW', or 'REJECT'")
    risk_level: str = Field(description="'LOW', 'MEDIUM', or 'HIGH'")
    thresholds_applied: Dict[str, float]
    top_contributing_features: List[Dict[str, Any]]
    model_provenance: Dict[str, str]
    prototype_disclosure: str
