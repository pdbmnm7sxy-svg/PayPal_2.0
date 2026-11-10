import pytest
from app.schemas.fraud import FraudScoreRequest
from app.schemas.compliance import ComplianceScreenRequest
from app.schemas.routing import RouteOptimizationRequest
from app.services.fraud_service import score_fraud
from app.services.compliance_service import screen_compliance
from app.services.routing_service import optimize_route
from app.services.benchmark_fixtures import BENCHMARK_FIXTURES

def test_clean_benchmark_fraud_score():
    req = FraudScoreRequest(benchmark_fixture_key="LEGIT_CLEAN", transfer_amount=150.0)
    res = score_fraud(req)
    assert res.fraud_probability < 0.20
    assert res.decision == "APPROVE"
    assert res.risk_level == "LOW"

def test_high_risk_benchmark_fraud_score():
    req = FraudScoreRequest(benchmark_fixture_key="HIGH_RISK_FRAUD", transfer_amount=245000.0)
    res = score_fraud(req)
    assert res.fraud_probability > 0.70
    assert res.decision == "REJECT"
    assert res.risk_level == "HIGH"

def test_sanctions_compliance_block():
    req = ComplianceScreenRequest(
        sender_name="VASILY MALYSHEV",
        sender_institution="GSB_US",
        sender_country="US",
        receiver_name="John Doe",
        receiver_institution="EUROT_DE",
        receiver_country="DE",
        amount=10000.0,
        currency="USD"
    )
    res = screen_compliance(req)
    assert not res.passed
    assert res.status == "REJECTED"
    assert any(m.severity == "BLOCK" for m in res.matches)

def test_clean_compliance_clear():
    req = ComplianceScreenRequest(
        sender_name="Acme Global Logistics LLC",
        sender_institution="GSB_US",
        sender_country="US",
        receiver_name="Bavaria Tech GmbH",
        receiver_institution="EUROT_DE",
        receiver_country="DE",
        amount=45000.0,
        currency="USD"
    )
    res = screen_compliance(req)
    assert res.passed
    assert res.status == "CLEARED"

def test_ortools_route_optimization():
    req = RouteOptimizationRequest(
        source_bank="GSB_US",
        destination_bank="EUROT_DE",
        amount=50000.0,
        currency="USD",
        priority="BALANCED"
    )
    res = optimize_route(req)
    assert res.solver_status in ["OPTIMAL", "FEASIBLE"]
    assert res.optimal_route.path[0] == "GSB_US"
    assert res.optimal_route.path[-1] == "EUROT_DE"
    assert res.optimal_route.total_cost_usd > 0
    assert len(res.optimal_route.hops) >= 1
