# Project Description: Transnational

**Hackathon Problem Statement Code:** PS-01  
**Track:** Open Innovation  
**Product Title:** Transnational (Intelligent Institutional Cross-Border Settlement & Funding Orchestrator)  
**Team Name:** Team ERROR  
**Team Members:**  
- **Chirantan Samuel Chetan** (Team Lead)  
- **Ashish Singh** (Full-Stack & Blockchain Engineer)  

---

## 1. Executive Summary & Problem Statement

Cross-border interbank transfers traditionally move through an antiquated patchwork of correspondent banking networks (such as legacy SWIFT MT103 serial messages). This architecture suffers from several critical inefficiencies:

1. **Opaque Fees & Cascading FX Spreads:** Transfers traverse multiple intermediary clearing institutions, each charging unpredictable correspondent processing fees and applying opaque foreign exchange markups.
2. **Settlement Delays & Liquidity Fragmentation:** Due to differing time zones, operational settlement cutoffs (RTGS/Fedwire/Target2), and trapped collateral buffers (Nostro/Vostro accounts), cross-border transfers often take 24 to 72 hours to achieve finality.
3. **Disjointed Risk & Compliance Friction:** Traditional risk analysis is performed retroactively or siloed within individual banks, leading to high false-positive compliance halts and delayed payments.
4. **Audit Vulnerability & Settlement Reconciliation Gaps:** Disparate ledger systems require manual bilateral reconciliations, making auditing cumbersome and increasing operational dispute resolution overhead.

---

## 2. The Solution: Transnational

**Transnational** is an institutional cross-border payments orchestrator that bridges modern digital checkout funding with intelligent multi-agent routing, real-time ML risk screening, and an immutable permissioned ledger audit trail.

```
+-----------------------------------------------------------------------------------------+
|                                     Transnational                                       |
|                                                                                         |
|  [Institutional Transfer] ---> [AI Fraud Model]  ---> [Google OR-Tools]                 |
|                                (29-PCA LightGBM)      (Multi-hop Graph)                 |
|                                       |                      |                          |
|                                       v                      v                          |
|  [Simulated Interbank]   <--- [PayPal Sandbox]   ---> [Hyperledger Fabric]              |
|  (RTGS / MEPS / Target2)      (Funding Gateway)       (Immutable Audit Chain)           |
+-----------------------------------------------------------------------------------------+
```

### Key Technical Pillars

1. **PayPal Sandbox Digital Funding Gateway:**  
   Simulates institutional client funding via PayPal's official Orders v2 REST API (server-side creation and capture using the PayPal JavaScript SDK). Demonstrates funding liquidity for the prototype while keeping API secrets securely on the backend server.
   
2. **Machine Learning Credit Card Fraud Scoring (Hugging Face):**  
   Integrates the pre-trained LightGBM classification pipeline (`bolewara/credit-card-fraud-detector`, ULB machine learning benchmark) to compute non-linear anomaly fraud probabilities over anonymized transaction vectors (`V1`..`V28` + `Amount`).

3. **Multi-Constraint Route Optimization (Google OR-Tools):**  
   Employs Google OR-Tools Mixed-Integer Linear Programming (MILP) / Min-Cost Flow solver across seeded correspondent nodes (`GSB_US`, `EUROT_DE`, `PACIFIC_SG`, `CORR_NY`, `CORR_LDN`, `CORR_HK`) to find the global cost-minimal path balancing liquidity reserves, transfer fees, FX spread bps, and settlement cut-off windows.

4. **Permissioned Ledger Audit Trail (Hyperledger Fabric):**  
   Records cryptographically verifiable state-transition audit entries on an enterprise blockchain network. Tracks pseudonymous payment hashes, authorization events, routing commits, and reconciliation statuses without exposing confidential PII or raw payment credentials.

5. **Live Operations Dashboard (Next.js 14 & AG Grid Community):**  
   Provides compliance officers and treasury managers with real-time visibility into active payment corridors, real-time WebSocket state changes, and interactive AG Grid tables featuring multi-column sorting, quick filtering, and paginated audit exploration.

---

## 3. Prototype Scope & Transparency Notice

> **IMPORTANT NOTICE:**  
> **Transnational is an experimental hackathon prototype.**  
> - **Bank Settlement, FX, Liquidity, and Movement:** All interbank liquidity adjustments, foreign exchange conversions, central bank RTGS references, and bilateral ledger movements are simulated within software data structures for demonstration purposes.  
> - **PayPal Funding Role:** PayPal Sandbox checkout demonstrates digital liquidity funding into the platform orchestrator; it does **not** perform, settle, or replace underlying interbank central bank settlement.  
> - **KYC/AML Compliance:** The built-in sanctions, PEP, and FATF compliance screening logic is a clearly labeled, rule-based prototype demonstration and must **not** be used as a production regulatory compliance engine.  
> - **ML Model Scope:** The Hugging Face fraud detector is trained exclusively on anonymized credit card benchmark PCA coordinates (`V1`..`V28` + `Amount`) and serves as an anomaly benchmark; it is **not** a calibrated model for international wire fraud.

---

## 4. Software Architecture

- **Frontend:** Next.js 14 App Router, TypeScript, Tailwind CSS, Lucide Icons, AG Grid Community, Socket.IO Client, `@paypal/react-paypal-js`.
- **Backend API & Orchestrator:** NestJS 10, TypeORM, Socket.IO Gateway, Axios, `@paypal/checkout-server-sdk` / direct REST Orders v2.
- **AI & Optimization Microservice:** Python 3.11, FastAPI, LightGBM, Scikit-learn, Google OR-Tools (`ortools.linear_solver.pywraplp`), NumPy.
- **Ledger & Persistence:** PostgreSQL 15, Hyperledger Fabric v2.5 (Go chaincode, Raft orderer, 3 peer organizations: Org1-GSB, Org2-EuroTransact, Org3-PacificRim).
- **Deployment & Orchestration:** Docker Compose multi-stage containerization.
