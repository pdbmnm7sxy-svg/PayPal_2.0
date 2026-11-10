# Crossbridge AI: Hackathon Video Demo Script & Shot List

**Target Duration:** 2 minutes 45 seconds (Under 3 minutes)  
**Track:** Open Innovation (PS-01)  
**Team:** Team ERROR (Chirantan Samuel Chetan, Ashish Singh)  
**Target Device:** Desktop Browser (Google Chrome / Brave, 1920x1080 resolution)

---

## Pre-Recording Checklist
1. Ensure all services are running:
   - Backend API: `http://localhost:4000` (PostgreSQL connected and seeded)
   - AI Microservice: `http://localhost:8000` (LightGBM model loaded)
   - Frontend UI: `http://localhost:3000`
2. Open browser at `http://localhost:3000` in fullscreen mode.
3. Verify that the prototype disclaimer banner is clearly visible at the top of the viewport.
4. Have a second browser tab ready with `http://localhost:3000/transfers/new` to test live transfer creation.

---

## Video Timeline & Shot List

```
+---------------------------------------------------------------------------------------+
|  0:00 - 0:25  | Scene 1: Problem & System Overview (Dashboard & AG Grid)              |
|  0:25 - 1:00  | Scene 2: AI Risk Screening & Benchmarking (LightGBM + Sanctions)       |
|  1:00 - 1:35  | Scene 3: Intelligent Liquidity Routing (Google OR-Tools)              |
|  1:35 - 2:10  | Scene 4: Real PayPal Sandbox Checkout & Funding Execution             |
|  2:10 - 2:35  | Scene 5: Simulated Interbank Settlement & Hyperledger Fabric Audit    |
|  2:35 - 2:45  | Scene 6: Conclusion & Architecture Recap                              |
+---------------------------------------------------------------------------------------+
```

---

### Scene 1: Problem & System Overview
**Timestamp:** `0:00 - 0:25` (25 seconds)  
**Visual:** 
- Full screen capture of `http://localhost:3000/`.
- Mouse cursor points to the amber **Prototype Disclaimer Banner** explaining simulated banking.
- Cursor hovers over summary metric cards (Total Volume, Pending Clearing, Fraud Holds, Fabric Blocks).
- Cursor navigates and sorts the **AG Grid Community** transaction table by Status, Amount, and Timestamp.
- Quick filter search bar demonstration (filtering by "EUR" or "APPROVED").

**Spoken Voiceover:**
> *"Hello! We are Team ERROR, and this is Crossbridge AI — an intelligent cross-border settlement and funding orchestrator built for financial institutions. Traditional international transfers take days, suffer from opaque correspondent fees, and leave audit blind spots. Crossbridge bridges real digital payment funding with pre-clearing machine learning risk analysis, multi-hop route optimization, and an immutable permissioned ledger audit trail. Please note that this is a working prototype: interbank settlement, FX, and KYC/AML screening are simulated, while digital funding integrates real PayPal Sandbox checkout."*

---

### Scene 2: AI Risk Screening & Benchmarking
**Timestamp:** `0:25 - 1:00` (35 seconds)  
**Visual:**
- Navigate to `http://localhost:3000/transfers/new`.
- Select Sender Institution: `Global Settlement Bank (GSB_US)` and Beneficiary: `EuroTransact AG (EUROT_DE)`.
- Enter Amount: `75,000.00 USD`.
- Click on the **Synthetic Benchmark Fixture** cards:
  - First click: `LEGIT_CLEAN` -> Shows Fraud Probability `0.02%`, Risk Decision `APPROVED`.
  - Second click: `HIGH_RISK_FRAUD` -> Shows Fraud Probability `98.6%`, Risk Decision `REJECTED`, highlighting latent PCA features `V14` and `V17`.
  - Reset back to `LEGIT_CLEAN` to proceed.
- Show automated Compliance Screening: Sanctions List Clean, PEP Cleared, Wire Limit Approved.

**Spoken Voiceover:**
> *"When creating an institutional transfer, Crossbridge AI performs instantaneous dual-layer risk evaluation before any funds move. For fraud anomaly detection, our Python FastAPI microservice runs a pinned LightGBM classifier from Hugging Face trained on anonymized PCA vectors. Because raw wire parameters should never be conflated with credit card PCA latent spaces, we provide benchmark fixtures: selecting a high-risk vector triggers an immediate hold, while our clean benchmark evaluates to a safe 0.02% fraud probability alongside our rule-based sanctions and KYC compliance screening."*

---

### Scene 3: Intelligent Route Optimization
**Timestamp:** `1:00 - 1:35` (35 seconds)  
**Visual:**
- Scroll down to the **Optimized Routing Engine** card on the transfer page.
- Switch to the dedicated `/routing` interactive visualizer page.
- Show the visual flow: `GSB_US -> CORR_NY -> EUROT_DE`.
- Point to the metrics calculated by Google OR-Tools:
  - Total Fee: `$18.50`
  - FX Spread: `12 bps`
  - Liquidity Reserves: `Verified (> $50,000 required)`
  - Estimated Settlement Window: `45 minutes`
- Click the "Create Institutional Transfer" button.

**Spoken Voiceover:**
> *"Next, how does the payment move? Instead of static correspondent routing, Crossbridge uses Google OR-Tools to solve a Mixed-Integer Linear Programming minimum-cost flow problem in real time. It evaluates real-time node liquidity, correspondent hops, FX spread basis points, and central bank cutoff windows to guarantee the cheapest and fastest viable corridor. Here, OR-Tools selected a 2-hop route via our New York correspondent node, saving 34 basis points compared to legacy manual correspondent routes."*

---

### Scene 4: Real PayPal Sandbox Checkout & Funding Execution
**Timestamp:** `1:35 - 2:10` (35 seconds)  
**Visual:**
- System redirects to the Transfer Detail view (`/` dashboard with drawer opened).
- Payment status transitions to `PAYPAL_PENDING`.
- Click the rendered official **PayPal Checkout** button.
- The real PayPal Sandbox modal launches.
- Authenticate with sandbox personal buyer credentials, click "Complete Purchase".
- Show the backend handling: Server creates order (`POST /v2/checkout/orders`), captures payment (`POST /v2/checkout/orders/{id}/capture`), and attaches PayPal Order ID and Capture ID to the transfer record.
- Show live WebSocket broadcast: status badge turns green (`PAYPAL_CAPTURED`).
- Note: Briefly highlight that if sandbox keys are left empty, an explicit "Simulated Funding" fallback mode is available for offline judging.

**Spoken Voiceover:**
> *"Now the institutional client funds the transaction. Using the official PayPal JavaScript SDK connected to our NestJS server-side Orders v2 REST endpoints, the client authorizes payment securely in the PayPal Sandbox modal. Notice that client secrets never touch the browser. Once captured, the transaction is cryptographically confirmed and ready for ledger recording and interbank settlement."*

---

### Scene 5: Simulated Interbank Settlement & Fabric Ledger
**Timestamp:** `2:10 - 2:35` (25 seconds)  
**Visual:**
- Click "Execute Interbank Settlement" in the action drawer.
- Status updates in real-time to `SETTLED`.
- Show generated settlement reference (`FEDWIRE-REF-...` / `TARGET2-REF-...`).
- Navigate to `http://localhost:3000/ledger`.
- Show the **Hyperledger Fabric Block Explorer** table:
  - Displays Block Number, Block Hash, Previous Hash, Organization MSP (`Org1MSP`), and Timestamp.
  - Expand the payload view showing the immutable state transition audit entry without storing sensitive PII or credentials.

**Spoken Voiceover:**
> *"With funding confirmed, our settlement engine simulates bilateral reserve debits and credits across the institutions and assigns central bank RTGS tracking references. Concurrently, every state transition — from draft, risk clearance, PayPal capture, to final settlement — is committed to our Hyperledger Fabric permissioned ledger. This guarantees a tamper-evident audit trail for regulators and internal auditors across all participating member banks."*

---

### Scene 6: Conclusion & Architecture Recap
**Timestamp:** `2:35 - 2:45` (10 seconds)  
**Visual:**
- Return to main operations dashboard showing the newly settled transfer seamlessly rendered in the AG Grid table.
- Display closing slide with Team ERROR metadata and GitHub repository URL.

**Spoken Voiceover:**
> *"Crossbridge AI demonstrates how modern digital checkout, AI risk analysis, constraint optimization, and permissioned distributed ledgers can transform cross-border financial infrastructure. Thank you!"*
