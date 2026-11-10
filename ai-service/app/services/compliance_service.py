from typing import List
from app.schemas.compliance import (
    ComplianceScreenRequest,
    ComplianceScreenResponse,
    ComplianceRuleMatch,
)

# Synthetic demo-only sanctions & watchlists
DEMO_SANCTIONED_NAMES = [
    "NORTH STAR TRADING LTD",
    "PETROCASPIAN HOLDINGS",
    "VASILY MALYSHEV",
    "TEST SANCTIONED ENTITY",
    "BLACK SEA CAPITAL",
]

DEMO_PEP_NAMES = [
    "SENATOR JOHNATHAN DOE",
    "MINISTER ELENA ROSTOVA",
    "AMBASSADOR KWAME OSEI",
    "TEST PEP OFFICIAL",
]

FATF_HIGH_RISK_JURISDICTIONS = {
    "KP": "Democratic People's Republic of Korea (DPRK)",
    "IR": "Iran",
    "MM": "Myanmar",
    "SY": "Syria",
}

FATF_INCREASED_MONITORING = {
    "BG": "Bulgaria",
    "BF": "Burkina Faso",
    "CM": "Cameroon",
    "CD": "Democratic Republic of the Congo",
    "HT": "Haiti",
    "JM": "Jamaica",
    "KE": "Kenya",
    "ML": "Mali",
    "MZ": "Mozambique",
    "NA": "Namibia",
    "NG": "Nigeria",
    "PH": "Philippines",
    "SN": "Senegal",
    "ZA": "South Africa",
    "SS": "South Sudan",
    "TZ": "Tanzania",
    "VN": "Vietnam",
    "YE": "Yemen",
}

def screen_compliance(req: ComplianceScreenRequest) -> ComplianceScreenResponse:
    matches: List[ComplianceRuleMatch] = []
    base_risk = 0.05

    sender_upper = req.sender_name.strip().upper()
    receiver_upper = req.receiver_name.strip().upper()

    # Rule 1: Sanctions List Screening
    for s_name in DEMO_SANCTIONED_NAMES:
        if s_name in sender_upper or s_name in receiver_upper:
            matches.append(ComplianceRuleMatch(
                rule_id="AML-SANCTIONS-001",
                rule_name="Simulated OFAC / UN Sanctions Watchlist Match",
                severity="BLOCK",
                description=f"Entity name matched simulated sanctions entry '{s_name}'.",
                matched_value=s_name
            ))
            base_risk += 0.85

    # Rule 2: PEP Screening
    for pep_name in DEMO_PEP_NAMES:
        if pep_name in sender_upper or pep_name in receiver_upper:
            matches.append(ComplianceRuleMatch(
                rule_id="AML-PEP-002",
                rule_name="Politically Exposed Person (PEP) Identification",
                severity="WARNING",
                description=f"Party identified as simulated Politically Exposed Person: '{pep_name}'. Requires enhanced institutional due diligence.",
                matched_value=pep_name
            ))
            base_risk += 0.35

    # Rule 3: High-Risk Jurisdictions
    sender_country = req.sender_country.strip().upper()
    receiver_country = req.receiver_country.strip().upper()

    if sender_country in FATF_HIGH_RISK_JURISDICTIONS:
        matches.append(ComplianceRuleMatch(
            rule_id="AML-GEO-003A",
            rule_name="FATF High-Risk Origin Jurisdiction",
            severity="BLOCK",
            description=f"Sender country {sender_country} ({FATF_HIGH_RISK_JURISDICTIONS[sender_country]}) is classified as Call for Action by FATF.",
            matched_value=sender_country
        ))
        base_risk += 0.80

    if receiver_country in FATF_HIGH_RISK_JURISDICTIONS:
        matches.append(ComplianceRuleMatch(
            rule_id="AML-GEO-003B",
            rule_name="FATF High-Risk Destination Jurisdiction",
            severity="BLOCK",
            description=f"Destination country {receiver_country} ({FATF_HIGH_RISK_JURISDICTIONS[receiver_country]}) is classified as Call for Action by FATF.",
            matched_value=receiver_country
        ))
        base_risk += 0.80

    if sender_country in FATF_INCREASED_MONITORING or receiver_country in FATF_INCREASED_MONITORING:
        c = sender_country if sender_country in FATF_INCREASED_MONITORING else receiver_country
        matches.append(ComplianceRuleMatch(
            rule_id="AML-GEO-004",
            rule_name="FATF Increased Monitoring Jurisdiction",
            severity="WARNING",
            description=f"Jurisdiction {c} is under FATF increased monitoring (Grey List). Secondary verification required.",
            matched_value=c
        ))
        base_risk += 0.20

    # Rule 4: High-Value Wholesale Wire Threshold
    if req.amount >= 250000.0:
        matches.append(ComplianceRuleMatch(
            rule_id="AML-WIRE-005",
            rule_name="Wholesale Wire Large Value Threshold (> $250k)",
            severity="INFO",
            description=f"Transfer amount {req.currency} {req.amount:,.2f} exceeds standard institutional straight-through limit. Requires dual-officer authorization.",
            matched_value=f"{req.currency} {req.amount:,.2f}"
        ))
        base_risk += 0.15

    # Calculate final status
    has_block = any(m.severity == "BLOCK" for m in matches)
    has_warning = any(m.severity == "WARNING" for m in matches)
    final_risk = min(1.0, round(base_risk, 3))

    if has_block:
        status = "REJECTED"
        passed = False
        audit_notes = "Automated compliance screening BLOCKED the transaction due to critical watch-list or high-risk jurisdiction triggers."
    elif has_warning:
        status = "FLAGGED_FOR_REVIEW"
        passed = True  # Can proceed to review
        audit_notes = "Transaction passed screening with WARNING flags. Institutional compliance officer review recommended."
    else:
        status = "CLEARED"
        passed = True
        audit_notes = "Transaction cleared all simulated automated AML/KYC and sanctions checks."

    return ComplianceScreenResponse(
        passed=passed,
        status=status,
        risk_score=final_risk,
        matches=matches,
        sanctions_screened=True,
        pep_screened=True,
        jurisdiction_screened=True,
        velocity_screened=True,
        audit_notes=audit_notes,
        prototype_disclosure="Demo-only compliance simulation. Rules, watchlists, and scores are synthetic benchmark demonstrations."
    )
