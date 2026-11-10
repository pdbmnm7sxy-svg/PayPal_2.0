from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ComplianceScreenRequest(BaseModel):
    sender_name: str
    sender_institution: str
    sender_country: str = Field(example="US")
    receiver_name: str
    receiver_institution: str
    receiver_country: str = Field(example="DE")
    amount: float
    currency: str = Field(default="USD")
    purpose_code: Optional[str] = "COMMERCIAL_SETTLEMENT"

class ComplianceRuleMatch(BaseModel):
    rule_id: str
    rule_name: str
    severity: str  # "INFO", "WARNING", "BLOCK"
    description: str
    matched_value: Optional[str] = None

class ComplianceScreenResponse(BaseModel):
    passed: bool
    status: str  # "CLEARED", "FLAGGED_FOR_REVIEW", "REJECTED"
    risk_score: float = Field(description="Score between 0.0 and 1.0 (higher = riskier)")
    matches: List[ComplianceRuleMatch]
    sanctions_screened: bool = True
    pep_screened: bool = True
    jurisdiction_screened: bool = True
    velocity_screened: bool = True
    audit_notes: str
    prototype_disclosure: str = "Demo-only compliance simulation. Rules and lists are synthetic and not legal regulatory clearances."
