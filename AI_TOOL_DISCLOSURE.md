# AI & Machine Learning Tool Disclosure

**Project:** Crossbridge AI  
**Team:** Team ERROR (Chirantan Samuel Chetan, Ashish Singh)  
**Hackathon Problem Statement:** PS-01 (Open Innovation)  

---

## 1. Primary AI Model Attribution

This application integrates an open-source machine learning model hosted on the Hugging Face Hub:

- **Repository:** [`bolewara/credit-card-fraud-detector`](https://huggingface.co/bolewara/credit-card-fraud-detector)
- **Model Author:** boleware
- **Pinned Git Commit Revision:** `20b4630d5b3bfbe1f46a91af620fa389f23a07a8`
- **Model Framework:** LightGBM (`LGBMClassifier` wrapped within Scikit-learn pipeline)
- **Serialization Format:** `fraud_model.joblib`
- **Original Training Dataset:** Credit Card Fraud Detection dataset (Université Libre de Bruxelles / ULB Machine Learning Group), comprising 284,807 European credit card transactions from September 2013.

---

## 2. Artifact Verification & Inspection Report

During integration, the Hugging Face repository at commit `20b4630d5b3bfbe1f46a91af620fa389f23a07a8` was inspected to resolve documentation discrepancies:

### 2.1 File Discrepancy Note
The Hugging Face README usage snippet mentioned `fraud_model.pkl`, whereas the repository's tracked binary file was named `fraud_model.joblib`. Inspection of the repository tree confirmed that `fraud_model.joblib` is the actual serialised binary model.

### 2.2 SHA-256 Checksums
| File | Git LFS Pointer SHA-256 | Binary Payload SHA-256 | Purpose |
| :--- | :--- | :--- | :--- |
| `fraud_model.joblib` | `e878a09759ae9c69d8a13c697733c5c4aa6b400fff97bc2a62d458401172fe4c` | `e878a09759ae9c69d8a13c697733c5c4aa6b400fff97bc2a62d458401172fe4c` | Pre-trained LightGBM classification pipeline |
| `feature_names.npy` | `5c0a49eb93f7caac569b5c87ddf492352a48d1f9707c9d5e3a6b4020e1b6f036` | `5c0a49eb93f7caac569b5c87ddf492352a48d1f9707c9d5e3a6b4020e1b6f036` | Array of 29 expected input feature names |

### 2.3 Feature Schema
`feature_names.npy` defines exactly 29 input features:
```
['V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10',
 'V11', 'V12', 'V13', 'V14', 'V15', 'V16', 'V17', 'V18', 'V19', 'V20',
 'V21', 'V22', 'V23', 'V24', 'V25', 'V26', 'V27', 'V28', 'Amount']
```
Features `V1` through `V28` are principal components obtained via PCA due to confidentiality reasons in the original dataset. The 29th feature is the raw transaction `Amount`.

### 2.4 Software Environment & Dependencies
The model requires exact runtime compatibility to prevent unpickling discrepancies:
- Python: `3.11`
- `lightgbm==4.5.0`
- `scikit-learn==1.5.2`
- `joblib==1.4.2`
- `numpy==1.26.4`
- `fastapi==0.115.5`
- `pydantic==2.10.2`

---

## 3. How the Model is Integrated in Crossbridge AI

1. **Isolation in Dedicated Microservice:**  
   The model is loaded inside the FastAPI AI microservice (`ai-service/app/services/fraud_service.py`) during application startup. No user-uploaded model weights or arbitrary pickle files are ever accepted at runtime.

2. **Feature Input Separation:**  
   Ordinary cross-border transfer parameters (e.g., Sender Institution, Destination Bank, SWIFT BIC, Currency, Country Code) are **strictly isolated** and **never** passed into `V1`..`V28`.

3. **Synthetic Benchmark Fixtures:**  
   To allow users and judges to test the inference engine predictably without fabricating fraudulent card data, Crossbridge AI provides three pinned, synthetic test vectors derived from typical ULB feature distributions:
   - `LEGIT_CLEAN`: Balanced, low-variance PCA features simulating standard interbank clearing traffic (Fraud Probability < 0.05%, Decision: `APPROVED`).
   - `SUSPICIOUS_VELOCITY`: Moderate deviations in latent dimensions `V14`, `V10`, and `V12` (Fraud Probability ~ 42.8%, Decision: `FLAGGED_REVIEW`).
   - `HIGH_RISK_FRAUD`: Extreme negative excursions in `V14`, `V17`, `V12`, `V10` characteristic of synthetic identity compromise (Fraud Probability > 98%, Decision: `REJECTED`).

---

## 4. Known Model Limitations & Scope Boundaries

1. **Card Domain vs. Wholesale Interbank Wires:**  
   The model was trained on retail credit card swipe/card-not-present fraud, **not** high-value interbank wholesale correspondent settlements. Its output within Crossbridge AI functions as a **proof-of-concept anomaly risk metric**, not a certified banking AML/anti-fraud score.
2. **No KYC / AML Capabilities:**  
   The Hugging Face model contains zero knowledge of sanctions lists, politically exposed persons (PEP), or FATF jurisdictions. All KYC and AML compliance checks in Crossbridge AI are handled by a separate, clearly labeled deterministic rules engine (`compliance_service.py`).
3. **Stationarity & Concept Drift:**  
   Because the dataset is from 2013, the model does not account for modern payment fraud vectors (e.g., Authorized Push Payment / APP fraud, account takeover through passkeys).
4. **Explainability:**  
   Due to the PCA transformation, individual latent features `V1`..`V28` cannot be translated into human-readable business terms without mathematical projection back to the proprietary source schema.

---

## 5. Route Optimization: Google OR-Tools

In addition to the classification model, Crossbridge AI uses **Google OR-Tools** (`ortools.linear_solver.pywraplp` - CBC / SCIP solvers) to solve the multi-commodity minimum-cost flow problem across simulated correspondent banking routes.

- **Objective Function:**  
  $$\min \sum_{(i,j)} x_{i,j} \cdot \left( \text{BaseFee}_{i,j} + \text{Amount} \cdot \frac{\text{FXSpreadBps}_{i,j}}{10000} \right) + \lambda \cdot \text{CutoffMinutes}_{i,j}$$
- **Constraints Enforced:**
  1. Flow conservation (Source node has net flow $+1$, Sink has net flow $-1$, intermediate nodes net $0$).
  2. Liquidity reserve constraint: Flow $x_{i,j}$ permitted only if Bank $i$ has available buffer $\ge$ transfer amount.
  3. Strict single-path routing ($x_{i,j} \in \{0, 1\}$).
