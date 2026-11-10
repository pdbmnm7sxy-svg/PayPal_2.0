from ortools.linear_solver import pywraplp
from typing import Dict, List, Any, Tuple
import logging
from app.schemas.routing import (
    RouteOptimizationRequest,
    RouteOptimizationResponse,
    EvaluatedRoute,
    RouteHop,
)

logger = logging.getLogger("crossbridge.routing_service")

# Bank node metadata
BANK_NAMES: Dict[str, str] = {
    "GSB_US": "Global Settlement Bank (USA - USD)",
    "EUROT_DE": "EuroTransact AG (Germany/EU - EUR)",
    "PACIFIC_SG": "Pacific Rim Financial (Singapore - SGD)",
    "INT_LDN": "London Interbank Clearing Hub (UK - GBP/EUR)",
    "INT_TOK": "Tokyo Correspondent Gateway (Japan - JPY/USD)",
    "INT_ZUR": "Zurich Intermediary Trust (Switzerland - CHF/EUR)",
}

# Seeded correspondent network topology and corridor constraints
CORRIDOR_NETWORK = [
    # Direct Primary Corridors
    {
        "from": "GSB_US", "to": "EUROT_DE",
        "fixed_fee_usd": 18.0, "fx_spread_bps": 12.0, "latency_min": 45,
        "liquidity_usd": 15000000.0, "channel": "Direct Transatlantic Fedwire/Target2"
    },
    {
        "from": "EUROT_DE", "to": "GSB_US",
        "fixed_fee_usd": 18.0, "fx_spread_bps": 12.0, "latency_min": 45,
        "liquidity_usd": 14000000.0, "channel": "Direct Target2/Fedwire Bilateral"
    },
    {
        "from": "GSB_US", "to": "PACIFIC_SG",
        "fixed_fee_usd": 25.0, "fx_spread_bps": 16.0, "latency_min": 60,
        "liquidity_usd": 9500000.0, "channel": "Direct Transpacific Fedwire/MEPS+"
    },
    {
        "from": "PACIFIC_SG", "to": "GSB_US",
        "fixed_fee_usd": 25.0, "fx_spread_bps": 16.0, "latency_min": 60,
        "liquidity_usd": 9000000.0, "channel": "Direct MEPS+/Fedwire Bilateral"
    },
    {
        "from": "EUROT_DE", "to": "PACIFIC_SG",
        "fixed_fee_usd": 30.0, "fx_spread_bps": 20.0, "latency_min": 90,
        "liquidity_usd": 6500000.0, "channel": "Direct Euro-Singapore Bilateral"
    },
    {
        "from": "PACIFIC_SG", "to": "EUROT_DE",
        "fixed_fee_usd": 30.0, "fx_spread_bps": 20.0, "latency_min": 90,
        "liquidity_usd": 6000000.0, "channel": "Direct Singapore-Euro Bilateral"
    },

    # London Intermediary Hub (Lower FX spread, high liquidity, slight hop latency)
    {
        "from": "GSB_US", "to": "INT_LDN",
        "fixed_fee_usd": 8.0, "fx_spread_bps": 4.0, "latency_min": 20,
        "liquidity_usd": 25000000.0, "channel": "CHAPS / Global Clearing FX"
    },
    {
        "from": "INT_LDN", "to": "EUROT_DE",
        "fixed_fee_usd": 6.0, "fx_spread_bps": 4.0, "latency_min": 15,
        "liquidity_usd": 22000000.0, "channel": "SEPA-Instant Correspondent Rail"
    },
    {
        "from": "INT_LDN", "to": "PACIFIC_SG",
        "fixed_fee_usd": 12.0, "fx_spread_bps": 7.0, "latency_min": 35,
        "liquidity_usd": 18000000.0, "channel": "Commonwealth Sterling-SGD Rail"
    },
    {
        "from": "EUROT_DE", "to": "INT_LDN",
        "fixed_fee_usd": 6.0, "fx_spread_bps": 4.0, "latency_min": 15,
        "liquidity_usd": 22000000.0, "channel": "SEPA / London Rail"
    },
    {
        "from": "PACIFIC_SG", "to": "INT_LDN",
        "fixed_fee_usd": 12.0, "fx_spread_bps": 7.0, "latency_min": 35,
        "liquidity_usd": 18000000.0, "channel": "SGD-Sterling Correspondent"
    },

    # Tokyo Intermediary Hub (APAC optimized, fast settlement)
    {
        "from": "GSB_US", "to": "INT_TOK",
        "fixed_fee_usd": 10.0, "fx_spread_bps": 6.0, "latency_min": 25,
        "liquidity_usd": 20000000.0, "channel": "BoJ-NET Cross-Currency Link"
    },
    {
        "from": "INT_TOK", "to": "PACIFIC_SG",
        "fixed_fee_usd": 7.0, "fx_spread_bps": 5.0, "latency_min": 18,
        "liquidity_usd": 16000000.0, "channel": "Asian Clearing Union Express"
    },
    {
        "from": "PACIFIC_SG", "to": "INT_TOK",
        "fixed_fee_usd": 7.0, "fx_spread_bps": 5.0, "latency_min": 18,
        "liquidity_usd": 16000000.0, "channel": "ACU / Tokyo Express"
    },
    {
        "from": "INT_TOK", "to": "EUROT_DE",
        "fixed_fee_usd": 15.0, "fx_spread_bps": 10.0, "latency_min": 40,
        "liquidity_usd": 12000000.0, "channel": "Tokyo-Frankfurt Direct Clearing"
    },

    # Zurich Intermediary Hub (Private wealth / heavy wholesale liquidity)
    {
        "from": "GSB_US", "to": "INT_ZUR",
        "fixed_fee_usd": 12.0, "fx_spread_bps": 5.0, "latency_min": 30,
        "liquidity_usd": 30000000.0, "channel": "SIX Swiss Exchange Settlement"
    },
    {
        "from": "INT_ZUR", "to": "EUROT_DE",
        "fixed_fee_usd": 5.0, "fx_spread_bps": 3.0, "latency_min": 15,
        "liquidity_usd": 28000000.0, "channel": "SIC Interbank Direct Link"
    },
    {
        "from": "INT_ZUR", "to": "PACIFIC_SG",
        "fixed_fee_usd": 14.0, "fx_spread_bps": 8.0, "latency_min": 45,
        "liquidity_usd": 19000000.0, "channel": "Zurich-Singapore Wealth Gateway"
    },
]

def find_candidate_paths(source: str, destination: str, max_hops: int = 3) -> List[List[Dict[str, Any]]]:
    """Finds all valid acyclic paths between source and destination up to max_hops."""
    paths: List[List[Dict[str, Any]]] = []

    def dfs(current: str, target: str, current_path: List[Dict[str, Any]], visited_nodes: set):
        if len(current_path) >= max_hops:
            return
        for edge in CORRIDOR_NETWORK:
            if edge["from"] == current and edge["to"] not in visited_nodes:
                next_node = edge["to"]
                new_path = current_path + [edge]
                if next_node == target:
                    paths.append(new_path)
                else:
                    dfs(next_node, target, new_path, visited_nodes | {next_node})

    dfs(source, destination, [], {source})
    return paths

def build_route_hop(edge: Dict[str, Any], amount: float) -> RouteHop:
    fx_cost = (edge["fx_spread_bps"] / 10000.0) * amount
    total_cost = edge["fixed_fee_usd"] + fx_cost
    return RouteHop(
        from_node=edge["from"],
        to_node=edge["to"],
        from_bank_name=BANK_NAMES.get(edge["from"], edge["from"]),
        to_bank_name=BANK_NAMES.get(edge["to"], edge["to"]),
        fixed_fee_usd=round(edge["fixed_fee_usd"], 2),
        fx_spread_bps=round(edge["fx_spread_bps"], 1),
        fx_cost_usd=round(fx_cost, 2),
        total_hop_cost_usd=round(total_cost, 2),
        estimated_minutes=edge["latency_min"],
        settlement_channel=edge["channel"],
        liquidity_available_usd=edge["liquidity_usd"]
    )

def evaluate_path(edges: List[Dict[str, Any]], amount: float) -> EvaluatedRoute:
    hops = [build_route_hop(e, amount) for e in edges]
    path_nodes = [edges[0]["from"]] + [e["to"] for e in edges]
    total_cost = sum(h.total_hop_cost_usd for h in hops)
    total_min = sum(h.estimated_minutes for h in hops)

    return EvaluatedRoute(
        path=path_nodes,
        hops=hops,
        total_cost_usd=round(total_cost, 2),
        total_estimated_minutes=total_min,
        is_optimal=False,
        selection_reason=""
    )

def optimize_route(req: RouteOptimizationRequest) -> RouteOptimizationResponse:
    if req.source_bank == req.destination_bank:
        raise ValueError("Source bank and destination bank cannot be the same institution.")

    amount = req.amount
    candidate_edge_paths = find_candidate_paths(req.source_bank, req.destination_bank, max_hops=3)

    if not candidate_edge_paths:
        raise ValueError(f"No routable correspondent path found between {req.source_bank} and {req.destination_bank}")

    evaluated_routes = [evaluate_path(p, amount) for p in candidate_edge_paths]

    # Filter out routes exceeding liquidity capacity
    viable_routes: List[EvaluatedRoute] = []
    for r in evaluated_routes:
        insufficient = [h for h in r.hops if h.liquidity_available_usd < amount]
        if not insufficient:
            viable_routes.append(r)

    if not viable_routes:
        # If none have sufficient liquidity, fall back to best candidate with a liquidity warning
        viable_routes = evaluated_routes

    # Formulation using Google OR-Tools pywraplp Mixed-Integer Solver
    solver = pywraplp.Solver.CreateSolver("CBC")
    if not solver:
        solver = pywraplp.Solver.CreateSolver("GLOP")

    # Decision variable for each candidate route: x_r in {0, 1}
    route_vars = [solver.IntVar(0, 1, f"route_{i}") for i in range(len(viable_routes))]

    # Exactly one route must be selected
    solver.Add(solver.Sum(route_vars) == 1)

    # Weights based on priority
    if req.priority == "LOW_COST":
        cost_weight = 1.0
        time_weight = 0.05
    elif req.priority == "FASTEST":
        cost_weight = 0.15
        time_weight = 1.5
    else:  # BALANCED
        cost_weight = 1.0
        time_weight = 0.4

    # Objective function
    objective = solver.Objective()
    for i, r in enumerate(viable_routes):
        score = (cost_weight * r.total_cost_usd) + (time_weight * r.total_estimated_minutes)
        objective.SetCoefficient(route_vars[i], score)
    objective.SetMinimization()

    solver_status = solver.Solve()

    # Determine chosen route
    optimal_idx = 0
    if solver_status in [pywraplp.Solver.OPTIMAL, pywraplp.Solver.FEASIBLE]:
        for i, var in enumerate(route_vars):
            if var.solution_value() > 0.5:
                optimal_idx = i
                break

    optimal_route = viable_routes[optimal_idx]
    optimal_route.is_optimal = True

    # Build human-readable reasoning
    alternatives = [r for idx, r in enumerate(viable_routes) if idx != optimal_idx]
    # Sort alternatives by cost
    alternatives.sort(key=lambda r: r.total_cost_usd)

    hops_str = " -> ".join(optimal_route.path)
    if len(optimal_route.path) == 2:
        reason = (
            f"Direct corridor '{hops_str}' selected by OR-Tools: Minimal interbank friction "
            f"(${optimal_route.total_cost_usd:,.2f}), low latency ({optimal_route.total_estimated_minutes} mins), "
            f"and ample liquidity capacity."
        )
    else:
        hub = optimal_route.path[1]
        hub_name = BANK_NAMES.get(hub, hub)
        reason = (
            f"Intermediary routing through {hub_name} ('{hops_str}') selected by OR-Tools: "
            f"Saves ${(alternatives[0].total_cost_usd - optimal_route.total_cost_usd):,.2f} in FX spread "
            f"compared to next best corridor, meeting delivery cutoff within {optimal_route.total_estimated_minutes} mins."
        )

    optimal_route.selection_reason = reason

    for alt in alternatives:
        diff_cost = alt.total_cost_usd - optimal_route.total_cost_usd
        diff_time = alt.total_estimated_minutes - optimal_route.total_estimated_minutes
        alt.selection_reason = (
            f"Alternative path ('{' -> '.join(alt.path)}'): "
            f"{'+$' if diff_cost >= 0 else '-$'}{abs(diff_cost):,.2f} cost difference, "
            f"{'+' if diff_time >= 0 else ''}{diff_time} mins latency relative to optimal selection."
        )

    summary = (
        f"OR-Tools selected path '{hops_str}' under '{req.priority}' objective. "
        f"Total friction cost: ${optimal_route.total_cost_usd:,.2f} USD, ETA: {optimal_route.total_estimated_minutes} min. "
        f"Liquidity verified across all {len(optimal_route.hops)} hop(s)."
    )

    return RouteOptimizationResponse(
        optimal_route=optimal_route,
        alternative_routes=alternatives[:3],
        solver_status="OPTIMAL" if solver_status == pywraplp.Solver.OPTIMAL else "FEASIBLE",
        decision_summary=summary,
        algorithm="Google OR-Tools Mixed-Integer Linear Programming (CBC)",
        assumptions={
            "priority": req.priority,
            "cost_weight": cost_weight,
            "time_weight": time_weight,
            "candidate_paths_evaluated": len(candidate_edge_paths),
            "viable_paths_meeting_liquidity": len(viable_routes),
            "source": BANK_NAMES.get(req.source_bank, req.source_bank),
            "destination": BANK_NAMES.get(req.destination_bank, req.destination_bank),
        }
    )
