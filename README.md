# Transnational

> **Intelligent Cross-Border Interbank Settlement & Digital Funding Orchestrator**

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Track](https://img.shields.io/badge/Track-Open%20Innovation-purple.svg)]()
[![Problem Statement](https://img.shields.io/badge/Code-PS--01-green.svg)]()
[![Team](https://img.shields.io/badge/Team-ERROR-orange.svg)]()

---

## 1. Project Information & Metadata

- **Product Name:** Transnational
- **Problem Statement Code:** `PS-01`
- **Track:** Open Innovation
- **Team Name:** `Team ERROR`
- **Team Members:**
  - **Chirantan Samuel Chetan** (Team Lead)
  - **Ashish Singh** (Full-Stack & Distributed Systems Engineer)

---

## 2. Executive Summary & Problem

Cross-border interbank transfers currently rely on legacy correspondent banking networks (such as traditional SWIFT MT103 serial messages). This results in:
1. **Opaque Fees and Cascading FX Spreads:** Transfers traverse multiple clearing intermediaries, each taking unpredictable cuts.
2. **Settlement Delays:** Transfers take 24–72 hours to achieve finality due to disparate time zones and batch settlement cutoffs.
3. **Disjointed Risk & Compliance:** Risk checks are performed retroactively in isolated silos, causing high false-positive rates and delayed liquidity.
4. **Audit Vulnerability:** Bilateral reconciliations are performed manually across fragmented core banking systems.

**Transnational** solves this by providing a unified orchestrator that couples **real PayPal Sandbox digital funding** with **pre-clearing machine learning risk analysis**, **Google OR-Tools multi-hop route optimization**, **simulated central bank RTGS settlement**, and an **immutable Hyperledger Fabric permissioned ledger audit trail**.

---

## 3. Prototype Scope & Transparency Notice

> [!IMPORTANT]
> **Prototype Demonstration Notice:**
> - **Simulated Banking:** All interbank settlement, Nostro/Vostro liquidity adjustments, foreign exchange conversions, and central bank RTGS references (Fedwire, Target2, MEPS) are **simulated software demonstrations**.
> - **PayPal Funding Role:** PayPal Sandbox checkout demonstrates digital liquidity funding into the platform orchestrator; it **does not** perform or prove interbank central bank settlement.
> - **Compliance Screening:** Sanctions, PEP, and FATF checks are rule-based prototype demonstrations and must **not** be used for production regulatory compliance.
> - **ML Fraud Model:** The model is trained on anonymized credit card benchmark PCA coordinates (`V1`..`V28` + `Amount`) from 2013; it is an anomaly score demonstration, not a calibrated wholesale international wire fraud model.

---

## 4. Architecture

```
                                  +--------------------------------------------------+
                                  |                 Next.js 14 UI                    |
                                  |   (AG Grid Community, PayPal JS SDK, Socket.IO)  |
                                  +--------------------------------------------------+
                                                      |             ^
                                        REST (Port 4000)     WebSocket (Port 4000)
                                                      v             |
+------------------------------------------------------------------------------------+
|                                  NestJS Orchestrator API                           |
|  - Transfer Workflow Engine           - Real PayPal Orders v2 Client (Sandbox)     |
|  - Simulated Settlement Service       - Hyperledger Fabric & Audit Trail Client    |
|  - TypeORM Data Persistence           - Socket.IO Real-Time Gateway                |
+------------------------------------------------------------------------------------+
           |                                  |                             |
           v                                  v                             v
+-----------------------+         +-----------------------+     +--------------------+
|   PostgreSQL 15 DB    |         |   Python AI Service   |     | Hyperledger Fabric |
| (Transfers, Audit,    |         |  (Port 8000, FastAPI) |     | (v2.5 Raft Network)|
|  Bank Node Liquidity) |         | - LightGBM Fraud Model|     | - 3 Peer Orgs      |
+-----------------------+         | - Google OR-Tools MIP |     | - Go Chaincode     |
                                  | - Demo KYC/AML Rules  |     +--------------------+
                                  +-----------------------+
```

---

## 5. Technology Stack

| Technology | Role in Transnational |
| :--- | :--- |
| **Next.js 14 & TypeScript** | Client-side dashboard, transfer initiation wizard, and operations monitoring. |
| **AG Grid Community** | Primary operations grid for institutional transfers with multi-column sorting, filtering, and pagination. |
| **NestJS 10 & TypeScript** | High-performance backend orchestrator coordinating payments, PayPal API, and ledger state transitions. |
| **Python 3.11 & FastAPI** | Dedicated high-throughput microservice serving ML inference and mathematical optimization algorithms. |
| **Hugging Face Model** | `bolewara/credit-card-fraud-detector` (LightGBM classifier) computing non-linear anomaly fraud scores. |
| **Google OR-Tools** | Mixed-Integer Linear Programming (MILP) solver optimizing multi-hop routing corridors. |
| **PostgreSQL 15** | Relational persistence for transactions, audit metadata, and simulated bank node liquidity balances. |
| **Hyperledger Fabric v2.5** | Permissioned distributed ledger executing Go chaincode for immutable state transition auditing. |
| **Docker & Docker Compose** | Multi-container reproducible local startup orchestrating database, AI service, API, and frontend. |

---

## 6. Quick Start (Docker Compose)

### Prerequisites
- [Docker](https://www.docker.com/) (version 24.0+)
- [Docker Compose](https://docs.docker.com/compose/) (version 2.20+)

### 1. Clone & Configure Environment
```bash
git clone https://github.com/<YOUR_GITHUB_USERNAME>/transnational.git
cd transnational

# Copy environment configuration template
cp .env.example .env
```
*(Optional)* Add your PayPal Developer Sandbox client credentials to `.env`. If left blank, Transnational runs in **Simulated Demo Funding Mode** with a clearly labeled UI banner.

### 2. Start Full Stack
```bash
docker compose up --build -d
```

### 3. Verify Health & Access UI
Open your browser to:
- **Operations Dashboard:** `http://localhost:3000`
- **Activity Feed & Records:** `http://localhost:3000/activity`
- **New Transfer Flow:** `http://localhost:3000/transfers/new`
- **Member Institutions:** `http://localhost:3000/institutions`
- **Backend API & Swagger:** `http://localhost:4000/api/payments/stats`
- **AI Microservice Health:** `http://localhost:8000/health`
- **AI Model & Benchmark Info:** `http://localhost:8000/api/model/info`

---

## 7. Local Bare-Metal Development (Without Docker)

If developing individual services locally:

### 1. AI Service (Python FastAPI)
```bash
cd ai-service
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Backend Orchestrator (NestJS)
```bash
cd backend
npm install
npm run build
npm run start:dev
```

### 3. Frontend Dashboard (Next.js)
```bash
cd frontend
npm install
npm run dev
```

---

## 8. PayPal Sandbox Integration Guide

Transnational integrates PayPal Sandbox using server-side **Orders v2 REST APIs** via the official `@paypal/react-paypal-js` client SDK:

1. **Obtain Sandbox Credentials:**
   - Log in to the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications/sandbox).
   - Under *Apps & Credentials*, copy your **Client ID** and **Secret**.
2. **Configure Backend Environment:**
   ```env
   PAYPAL_CLIENT_ID=AeXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   PAYPAL_CLIENT_SECRET=ELXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   PAYPAL_API_BASE=https://api-m.sandbox.paypal.com
   ```
3. **Security Guarantee:**
   - `PAYPAL_CLIENT_SECRET` is read **only** by the NestJS backend and never sent to the browser.
   - Orders are initiated via `POST /api/payments/:id/paypal/create-order` and captured via `POST /api/payments/:id/paypal/capture-order`.
4. **Unconfigured Fallback:**
   - When credentials are not provided, the UI clearly displays an amber **"PayPal Sandbox Not Configured"** banner and allows testing via an explicitly labeled **"Execute Demo Funding"** button so offline judges can test the full lifecycle.

---

## 9. Hyperledger Fabric Setup Guide

The `blockchain/` directory contains an enterprise Fabric network with 3 simulated bank organizations:
- `Org1MSP` - Global Settlement Bank (GSB_US)
- `Org2MSP` - EuroTransact AG (EUROT_DE)
- `Org3MSP` - Pacific Rim Financial (PACIFIC_SG)

### Starting the Fabric Network
```bash
cd blockchain

# Generate cryptographic certificates for the 3 banks
./generate-certs.sh

# Spin up Orderer and Peer containers
./network-up.sh
```

### Tamper-Evident Ledger Fallback
When running in lightweight Docker Compose or environments without native Fabric binaries installed, the NestJS backend utilizes a **cryptographically linked SHA-256 block-hash ledger** (`backend/src/fabric/fabric.service.ts`). Every payment state transition computes `Hash_i = SHA256(BlockNum || PrevHash || Timestamp || Payload)` and persists it to PostgreSQL, ensuring that audit trails remain verifiable regardless of local container resources.

---

## 10. Sample End-to-End Demo Flow

Follow this flow to test all system components:

1. **Initiate Transfer:** Navigate to `http://localhost:3000/transfers/new`.
2. **Select Institutions & Amount:** Select `GSB_US` to `EUROT_DE` for `$75,000.00`.
3. **AI Risk Benchmarking:** Click the benchmark fixture cards (`LEGIT_CLEAN`, `SUSPICIOUS_VELOCITY`, `HIGH_RISK_FRAUD`) to observe real-time inference from the Hugging Face LightGBM model. Select `LEGIT_CLEAN` to proceed.
4. **Review OR-Tools Route:** Inspect the calculated multi-hop corridor, fee breakdown, and FX spread.
5. **Create Payment:** Click *Confirm & Initiate Transfer*. The payment is persisted in PostgreSQL with state `RISK_SCREENED`.
6. **Fund with PayPal:** Open the transfer drawer and click the **PayPal Checkout** button (or Demo Funding). Once captured, status transitions to `PAYPAL_CAPTURED` and commits an audit entry to the ledger.
7. **Execute Interbank Settlement:** Click *Execute Interbank Settlement*. The system debits/credits the simulated bank liquidity pools, generates a central bank tracking reference (`FEDWIRE-REF-...`), and transitions status to `SETTLED`.
8. **Explore Ledger:** Navigate to `http://localhost:3000/ledger` to inspect the verifiable block transactions.

---

## 11. AI Model Attribution & Details

- **Hugging Face Model:** [`bolewara/credit-card-fraud-detector`](https://huggingface.co/bolewara/credit-card-fraud-detector)
- **Pinned Git Commit:** `20b4630d5b3bfbe1f46a91af620fa389f23a07a8`
- **Artifact:** `fraud_model.joblib` (SHA-256: `e878a09759ae9c69d8a13c697733c5c4aa6b400fff97bc2a62d458401172fe4c`)
- **Schema (`feature_names.npy`):** Exactly 29 input features (`V1`..`V28` PCA coordinates + `Amount`).
- See [AI_TOOL_DISCLOSURE.md](./AI_TOOL_DISCLOSURE.md) for full mathematical formulation, dependency pins, and known limitations.

---

## 12. Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| `LightGBM OpenMP library error` on macOS | Missing `@rpath/libomp.dylib` on host macOS | Run the AI service using Docker Compose: `docker compose up ai-service`. |
| Port 5432 or 4000 already in use | Existing Postgres or Node process on host | Change the host port in `docker-compose.yml` (e.g., `5433:5432`) or stop host services. |
| PayPal button shows "Demo Simulated Mode" | `PAYPAL_CLIENT_ID` not populated in `.env` | Add valid sandbox credentials to `.env` or continue testing using simulated funding. |
| AG Grid does not show rows | Backend API unreachable or database unseeded | Check `http://localhost:4000/api/payments`. NestJS automatically seeds sample data on boot. |

---

## 13. License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details. Third-party components and models remain under their respective licenses.
