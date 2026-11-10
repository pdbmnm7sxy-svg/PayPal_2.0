import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

from app.model.model_loader import load_fraud_model, get_model_info
from app.schemas.fraud import FraudScoreRequest, FraudScoreResponse
from app.schemas.compliance import ComplianceScreenRequest, ComplianceScreenResponse
from app.schemas.routing import RouteOptimizationRequest, RouteOptimizationResponse
from app.services.fraud_service import score_fraud
from app.services.compliance_service import screen_compliance
from app.services.routing_service import optimize_route
from app.services.benchmark_fixtures import BENCHMARK_FIXTURES

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("crossbridge.main")

app = FastAPI(
    title="Transnational - Intelligence & Optimization Engine",
    description=(
        "Microservice for Scikit-learn/LightGBM credit card fraud scoring, "
        "synthetic KYC/AML compliance screening, and Google OR-Tools interbank route optimization."
    ),
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    try:
        load_fraud_model()
        logger.info("Pinned fraud model and schema successfully loaded on startup.")
    except Exception as e:
        logger.warning(f"Model will be loaded on demand: {e}")

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "crossbridge-ai-engine",
        "version": "1.0.0",
        "model_loaded": True
    }

@app.get("/api/model/info")
def model_info():
    """Returns metadata about the pinned Hugging Face fraud model and schema."""
    try:
        return get_model_info()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/benchmark/fixtures")
def benchmark_fixtures():
    """Returns available pre-computed synthetic benchmark test fixtures."""
    return {
        "fixtures": BENCHMARK_FIXTURES,
        "disclosure": (
            "These synthetic feature vectors represent simulated transactions mapped to the 29-feature "
            "PCA schema of the ULB benchmark model. They allow deterministic testing of Low, Medium, and "
            "High-risk inference states without exposing private cardholder data."
        )
    }

@app.post("/api/fraud/score", response_model=FraudScoreResponse)
def evaluate_fraud(request: FraudScoreRequest):
    """
    Evaluates fraud risk using the pinned Hugging Face LightGBM model.
    Expects 29 features: V1..V28 (PCA) and Amount.
    """
    try:
        return score_fraud(request)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Fraud scoring error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Inference failure: {str(e)}")

@app.post("/api/compliance/screen", response_model=ComplianceScreenResponse)
def evaluate_compliance(request: ComplianceScreenRequest):
    """
    Performs clearly labeled demo-only KYC, sanctions (OFAC/UN), and AML screening.
    """
    try:
        return screen_compliance(request)
    except Exception as e:
        logger.error(f"Compliance screening error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/routing/optimize", response_model=RouteOptimizationResponse)
def evaluate_route(request: RouteOptimizationRequest):
    """
    Computes the optimal settlement path between financial institutions using Google OR-Tools.
    """
    try:
        return optimize_route(request)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Route optimization error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

class ComprehensivePreScreenRequest(BaseModel):
    sender_name: str
    sender_institution: str
    sender_country: str
    receiver_name: str
    receiver_institution: str
    receiver_country: str
    amount: float
    currency: str = "USD"
    benchmark_fixture_key: Optional[str] = "LEGIT_CLEAN"
    routing_priority: Optional[str] = "BALANCED"

class ComprehensivePreScreenResponse(BaseModel):
    fraud_evaluation: FraudScoreResponse
    compliance_evaluation: ComplianceScreenResponse
    routing_evaluation: RouteOptimizationResponse
    composite_decision: str
    can_proceed_to_funding: bool
    summary: str

@app.post("/api/pipeline/pre-screen", response_model=ComprehensivePreScreenResponse)
def comprehensive_pre_screen(request: ComprehensivePreScreenRequest):
    """
    Unified evaluation executing Fraud scoring, Compliance screening, and OR-Tools Routing in one atomic pipeline step.
    """
    try:
        # 1. Fraud score
        fraud_req = FraudScoreRequest(
            benchmark_fixture_key=request.benchmark_fixture_key,
            transfer_amount=request.amount
        )
        fraud_res = score_fraud(fraud_req)

        # 2. Compliance check
        comp_req = ComplianceScreenRequest(
            sender_name=request.sender_name,
            sender_institution=request.sender_institution,
            sender_country=request.sender_country,
            receiver_name=request.receiver_name,
            receiver_institution=request.receiver_institution,
            receiver_country=request.receiver_country,
            amount=request.amount,
            currency=request.currency
        )
        comp_res = screen_compliance(comp_req)

        # 3. Route optimization
        route_req = RouteOptimizationRequest(
            source_bank=request.sender_institution,
            destination_bank=request.receiver_institution,
            amount=request.amount,
            currency=request.currency,
            priority=request.routing_priority or "BALANCED"
        )
        route_res = optimize_route(route_req)

        # Composite decision
        can_proceed = True
        composite = "APPROVED"

        if not comp_res.passed or fraud_res.decision == "REJECT":
            composite = "REJECTED"
            can_proceed = False
        elif fraud_res.decision == "MANUAL_REVIEW" or comp_res.status == "FLAGGED_FOR_REVIEW":
            composite = "FLAGGED_FOR_REVIEW"
            can_proceed = True  # Can still proceed with human acknowledgment
        else:
            composite = "APPROVED"
            can_proceed = True

        summary = (
            f"Pre-Screening Complete: Fraud Risk is {fraud_res.risk_level} (Score: {fraud_res.fraud_probability:.4f}), "
            f"Compliance status is {comp_res.status}, and OR-Tools selected route "
            f"'{' -> '.join(route_res.optimal_route.path)}' with ${route_res.optimal_route.total_cost_usd:,.2f} estimated friction."
        )

        return ComprehensivePreScreenResponse(
            fraud_evaluation=fraud_res,
            compliance_evaluation=comp_res,
            routing_evaluation=route_res,
            composite_decision=composite,
            can_proceed_to_funding=can_proceed,
            summary=summary
        )
    except Exception as e:
        logger.error(f"Pre-screen pipeline error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
