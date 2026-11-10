from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

class RouteOptimizationRequest(BaseModel):
    source_bank: str = Field(description="e.g. GSB_US, EUROT_DE, PACIFIC_SG", example="GSB_US")
    destination_bank: str = Field(description="e.g. EUROT_DE, PACIFIC_SG, GSB_US", example="EUROT_DE")
    amount: float = Field(gt=0, example=50000.0)
    currency: str = Field(default="USD", example="USD")
    priority: Optional[str] = Field(default="BALANCED", description="'LOW_COST', 'FASTEST', or 'BALANCED'")
    custom_constraints: Optional[Dict[str, Any]] = None

class RouteHop(BaseModel):
    from_node: str
    to_node: str
    from_bank_name: str
    to_bank_name: str
    fixed_fee_usd: float
    fx_spread_bps: float
    fx_cost_usd: float
    total_hop_cost_usd: float
    estimated_minutes: int
    settlement_channel: str
    liquidity_available_usd: float

class EvaluatedRoute(BaseModel):
    path: List[str]
    hops: List[RouteHop]
    total_cost_usd: float
    total_estimated_minutes: int
    is_optimal: bool
    selection_reason: str

class RouteOptimizationResponse(BaseModel):
    optimal_route: EvaluatedRoute
    alternative_routes: List[EvaluatedRoute]
    solver_status: str
    decision_summary: str
    algorithm: str = "Google OR-Tools MIP / Min-Cost Multi-Commodity Flow"
    assumptions: Dict[str, Any]
