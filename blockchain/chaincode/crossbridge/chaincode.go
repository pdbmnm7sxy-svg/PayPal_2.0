package main

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// SmartContract provides functions for managing Crossbridge payment lifecycle on Fabric
type SmartContract struct {
	contractapi.Contract
}

// PaymentState defines the deterministic states of an interbank transfer
type PaymentState string

const (
	StateDraft              PaymentState = "DRAFT"
	StateRiskChecked        PaymentState = "RISK_CHECKED"
	StateRiskHeld           PaymentState = "RISK_HELD"
	StateFundingCreated     PaymentState = "FUNDING_ORDER_CREATED"
	StateFundingCaptured    PaymentState = "FUNDING_CAPTURED"
	StateLedgerCommitted    PaymentState = "LEDGER_COMMITTED"
	StateRouteCommitted     PaymentState = "ROUTE_COMMITTED"
	StateSettlementPending  PaymentState = "SETTLEMENT_PENDING"
	StateSettled            PaymentState = "SETTLED"
	StateSettlementFailed   PaymentState = "SETTLEMENT_FAILED"
	StateReconciled         PaymentState = "RECONCILED"
)

// StateEvent records each state transition audit entry
type StateEvent struct {
	TxID          string `json:"txId"`
	PreviousState string `json:"previousState"`
	NewState      string `json:"newState"`
	Timestamp     string `json:"timestamp"`
	ActorOrg      string `json:"actorOrg"`
	AuditDetails  string `json:"auditDetails"`
}

// PaymentRecord represents the permissioned ledger state for a cross-border payment
type PaymentRecord struct {
	ID                string       `json:"id"`
	SenderBank        string       `json:"senderBank"`
	ReceiverBank      string       `json:"receiverBank"`
	Amount            float64      `json:"amount"`
	Currency          string       `json:"currency"`
	CurrentState      PaymentState `json:"currentState"`
	FraudScore        float64      `json:"fraudScore"`
	RiskDecision      string       `json:"riskDecision"`
	ComplianceStatus  string       `json:"complianceStatus"`
	PayPalOrderId     string       `json:"paypalOrderId"`
	PayPalCaptureId   string       `json:"paypalCaptureId"`
	OptimalRoute      []string     `json:"optimalRoute"`
	EstimatedCostUSD  float64      `json:"estimatedCostUSD"`
	EstimatedMinutes  int          `json:"estimatedMinutes"`
	SettlementTxRef   string       `json:"settlementTxRef"`
	PayloadHash       string       `json:"payloadHash"`
	CreatedAt         string       `json:"createdAt"`
	UpdatedAt         string       `json:"updatedAt"`
	EventHistory      []StateEvent `json:"eventHistory"`
}

// HistoryQueryResult structure for returning transaction history
type HistoryQueryResult struct {
	TxId      string         `json:"txId"`
	Timestamp string         `json:"timestamp"`
	IsDelete  bool           `json:"isDelete"`
	Record    *PaymentRecord `json:"record"`
}

// InitLedger seeds initial payment records representing historical interbank transactions
func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	initialPayments := []PaymentRecord{
		{
			ID:               "TX-2026-USD-EUR-001",
			SenderBank:       "GSB_US",
			ReceiverBank:     "EUROT_DE",
			Amount:           75000.0,
			Currency:         "USD",
			CurrentState:     StateReconciled,
			FraudScore:       0.00012,
			RiskDecision:     "APPROVE",
			ComplianceStatus: "CLEARED",
			PayPalOrderId:    "ORD-SANDBOX-87421",
			PayPalCaptureId:  "CAP-SANDBOX-99120",
			OptimalRoute:     []string{"GSB_US", "INT_LDN", "EUROT_DE"},
			EstimatedCostUSD: 14.50,
			EstimatedMinutes: 35,
			SettlementTxRef:  "SETTLE-SEPA-8849102",
			PayloadHash:      computeHash("TX-2026-USD-EUR-001:75000:GSB_US:EUROT_DE"),
			CreatedAt:        "2026-11-09T10:15:00Z",
			UpdatedAt:        "2026-11-09T10:50:00Z",
			EventHistory: []StateEvent{
				{
					TxID:          "GENESIS-TX-001",
					PreviousState: string(StateDraft),
					NewState:      string(StateReconciled),
					Timestamp:     "2026-11-09T10:50:00Z",
					ActorOrg:      "Org1MSP",
					AuditDetails:  "Initial seeded reconciled bilateral settlement.",
				},
			},
		},
		{
			ID:               "TX-2026-EUR-SGD-002",
			SenderBank:       "EUROT_DE",
			ReceiverBank:     "PACIFIC_SG",
			Amount:           120000.0,
			Currency:         "EUR",
			CurrentState:     StateSettled,
			FraudScore:       0.00045,
			RiskDecision:     "APPROVE",
			ComplianceStatus: "CLEARED",
			PayPalOrderId:    "ORD-SANDBOX-33819",
			PayPalCaptureId:  "CAP-SANDBOX-44102",
			OptimalRoute:     []string{"EUROT_DE", "INT_LDN", "PACIFIC_SG"},
			EstimatedCostUSD: 24.20,
			EstimatedMinutes: 50,
			SettlementTxRef:  "SETTLE-MEPS-7712391",
			PayloadHash:      computeHash("TX-2026-EUR-SGD-002:120000:EUROT_DE:PACIFIC_SG"),
			CreatedAt:        "2026-11-10T08:30:00Z",
			UpdatedAt:        "2026-11-10T09:20:00Z",
			EventHistory: []StateEvent{
				{
					TxID:          "GENESIS-TX-002",
					PreviousState: string(StateDraft),
					NewState:      string(StateSettled),
					Timestamp:     "2026-11-10T09:20:00Z",
					ActorOrg:      "Org2MSP",
					AuditDetails:  "Direct bilateral corridor settlement.",
				},
			},
		},
	}

	for _, payment := range initialPayments {
		paymentJSON, err := json.Marshal(payment)
		if err != nil {
			return err
		}
		err = ctx.GetStub().PutState(payment.ID, paymentJSON)
		if err != nil {
			return fmt.Errorf("failed to put payment to world state: %v", err)
		}
	}

	return nil
}

// CreatePaymentRecord initializes a draft payment on the ledger
func (s *SmartContract) CreatePaymentRecord(
	ctx contractapi.TransactionContextInterface,
	id string,
	senderBank string,
	receiverBank string,
	amount float64,
	currency string,
	payloadHash string,
) error {
	exists, err := s.PaymentExists(ctx, id)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("payment record %s already exists", id)
	}

	txTime, err := ctx.GetStub().GetTxTimestamp()
	timestampStr := time.Now().UTC().Format(time.RFC3339)
	if err == nil && txTime != nil {
		timestampStr = time.Unix(txTime.Seconds, int64(txTime.Nanos)).UTC().Format(time.RFC3339)
	}

	creator, _ := ctx.GetClientIdentity().GetMSPID()
	if creator == "" {
		creator = "Org1MSP"
	}

	txID := ctx.GetStub().GetTxID()

	payment := PaymentRecord{
		ID:               id,
		SenderBank:       senderBank,
		ReceiverBank:     receiverBank,
		Amount:           amount,
		Currency:         currency,
		CurrentState:     StateDraft,
		PayloadHash:      payloadHash,
		CreatedAt:        timestampStr,
		UpdatedAt:        timestampStr,
		OptimalRoute:     []string{},
		EventHistory: []StateEvent{
			{
				TxID:          txID,
				PreviousState: "NONE",
				NewState:      string(StateDraft),
				Timestamp:     timestampStr,
				ActorOrg:      creator,
				AuditDetails:  "Payment initiated in draft state on Fabric ledger.",
			},
		},
	}

	paymentJSON, err := json.Marshal(payment)
	if err != nil {
		return err
	}

	// Emit Fabric event
	ctx.GetStub().SetEvent("PaymentCreated", paymentJSON)

	return ctx.GetStub().PutState(id, paymentJSON)
}

// RecordRiskScreening records ML fraud evaluation and compliance screening
func (s *SmartContract) RecordRiskScreening(
	ctx contractapi.TransactionContextInterface,
	id string,
	fraudScore float64,
	complianceStatus string,
	riskDecision string,
) error {
	payment, err := s.QueryPayment(ctx, id)
	if err != nil {
		return err
	}

	txID := ctx.GetStub().GetTxID()
	timestampStr := time.Now().UTC().Format(time.RFC3339)
	creator, _ := ctx.GetClientIdentity().GetMSPID()
	if creator == "" {
		creator = "Org1MSP"
	}

	prevState := payment.CurrentState
	newState := StateRiskChecked
	if riskDecision == "REJECT" || complianceStatus == "REJECTED" {
		newState = StateRiskHeld
	}

	payment.FraudScore = fraudScore
	payment.ComplianceStatus = complianceStatus
	payment.RiskDecision = riskDecision
	payment.CurrentState = newState
	payment.UpdatedAt = timestampStr

	payment.EventHistory = append(payment.EventHistory, StateEvent{
		TxID:          txID,
		PreviousState: string(prevState),
		NewState:      string(newState),
		Timestamp:     timestampStr,
		ActorOrg:      creator,
		AuditDetails:  fmt.Sprintf("Risk assessed: FraudScore=%.5f, Decision=%s, Compliance=%s", fraudScore, riskDecision, complianceStatus),
	})

	paymentJSON, err := json.Marshal(payment)
	if err != nil {
		return err
	}

	ctx.GetStub().SetEvent("RiskScreened", paymentJSON)
	return ctx.GetStub().PutState(id, paymentJSON)
}

// RecordFundingCapture records verified PayPal Sandbox checkout funding
func (s *SmartContract) RecordFundingCapture(
	ctx contractapi.TransactionContextInterface,
	id string,
	paypalOrderId string,
	paypalCaptureId string,
) error {
	payment, err := s.QueryPayment(ctx, id)
	if err != nil {
		return err
	}

	txID := ctx.GetStub().GetTxID()
	timestampStr := time.Now().UTC().Format(time.RFC3339)
	creator, _ := ctx.GetClientIdentity().GetMSPID()
	if creator == "" {
		creator = "Org1MSP"
	}

	prevState := payment.CurrentState
	payment.PayPalOrderId = paypalOrderId
	payment.PayPalCaptureId = paypalCaptureId
	payment.CurrentState = StateFundingCaptured
	payment.UpdatedAt = timestampStr

	payment.EventHistory = append(payment.EventHistory, StateEvent{
		TxID:          txID,
		PreviousState: string(prevState),
		NewState:      string(StateFundingCaptured),
		Timestamp:     timestampStr,
		ActorOrg:      creator,
		AuditDetails:  fmt.Sprintf("Funding captured via PayPal Sandbox: OrderID=%s, CaptureID=%s", paypalOrderId, paypalCaptureId),
	})

	paymentJSON, err := json.Marshal(payment)
	if err != nil {
		return err
	}

	ctx.GetStub().SetEvent("FundingCaptured", paymentJSON)
	return ctx.GetStub().PutState(id, paymentJSON)
}

// CommitRoute records Google OR-Tools selected settlement path
func (s *SmartContract) CommitRoute(
	ctx contractapi.TransactionContextInterface,
	id string,
	routeJSON string,
	estimatedCostUSD float64,
	estimatedMinutes int,
) error {
	payment, err := s.QueryPayment(ctx, id)
	if err != nil {
		return err
	}

	var route []string
	if err := json.Unmarshal([]byte(routeJSON), &route); err != nil {
		route = []string{payment.SenderBank, payment.ReceiverBank}
	}

	txID := ctx.GetStub().GetTxID()
	timestampStr := time.Now().UTC().Format(time.RFC3339)
	creator, _ := ctx.GetClientIdentity().GetMSPID()
	if creator == "" {
		creator = "Org1MSP"
	}

	prevState := payment.CurrentState
	payment.OptimalRoute = route
	payment.EstimatedCostUSD = estimatedCostUSD
	payment.EstimatedMinutes = estimatedMinutes
	payment.CurrentState = StateRouteCommitted
	payment.UpdatedAt = timestampStr

	payment.EventHistory = append(payment.EventHistory, StateEvent{
		TxID:          txID,
		PreviousState: string(prevState),
		NewState:      string(StateRouteCommitted),
		Timestamp:     timestampStr,
		ActorOrg:      creator,
		AuditDetails:  fmt.Sprintf("Optimal route committed: %v (Cost: $%.2f, ETA: %d min)", route, estimatedCostUSD, estimatedMinutes),
	})

	paymentJSON, err := json.Marshal(payment)
	if err != nil {
		return err
	}

	ctx.GetStub().SetEvent("RouteCommitted", paymentJSON)
	return ctx.GetStub().PutState(id, paymentJSON)
}

// TransitionSettlement updates simulated bank settlement status
func (s *SmartContract) TransitionSettlement(
	ctx contractapi.TransactionContextInterface,
	id string,
	targetState string,
	settlementTxRef string,
) error {
	payment, err := s.QueryPayment(ctx, id)
	if err != nil {
		return err
	}

	txID := ctx.GetStub().GetTxID()
	timestampStr := time.Now().UTC().Format(time.RFC3339)
	creator, _ := ctx.GetClientIdentity().GetMSPID()
	if creator == "" {
		creator = "Org2MSP"
	}

	prevState := payment.CurrentState
	payment.CurrentState = PaymentState(targetState)
	payment.SettlementTxRef = settlementTxRef
	payment.UpdatedAt = timestampStr

	payment.EventHistory = append(payment.EventHistory, StateEvent{
		TxID:          txID,
		PreviousState: string(prevState),
		NewState:      targetState,
		Timestamp:     timestampStr,
		ActorOrg:      creator,
		AuditDetails:  fmt.Sprintf("Settlement status transitioned to %s with reference %s", targetState, settlementTxRef),
	})

	paymentJSON, err := json.Marshal(payment)
	if err != nil {
		return err
	}

	ctx.GetStub().SetEvent("SettlementStateChanged", paymentJSON)
	return ctx.GetStub().PutState(id, paymentJSON)
}

// ReconcilePayment marks the payment as fully reconciled
func (s *SmartContract) ReconcilePayment(
	ctx contractapi.TransactionContextInterface,
	id string,
	reconciliationNotes string,
) error {
	payment, err := s.QueryPayment(ctx, id)
	if err != nil {
		return err
	}

	txID := ctx.GetStub().GetTxID()
	timestampStr := time.Now().UTC().Format(time.RFC3339)
	creator, _ := ctx.GetClientIdentity().GetMSPID()
	if creator == "" {
		creator = "Org3MSP"
	}

	prevState := payment.CurrentState
	payment.CurrentState = StateReconciled
	payment.UpdatedAt = timestampStr

	payment.EventHistory = append(payment.EventHistory, StateEvent{
		TxID:          txID,
		PreviousState: string(prevState),
		NewState:      string(StateReconciled),
		Timestamp:     timestampStr,
		ActorOrg:      creator,
		AuditDetails:  fmt.Sprintf("Bilateral reconciliation confirmed. %s", reconciliationNotes),
	})

	paymentJSON, err := json.Marshal(payment)
	if err != nil {
		return err
	}

	ctx.GetStub().SetEvent("PaymentReconciled", paymentJSON)
	return ctx.GetStub().PutState(id, paymentJSON)
}

// QueryPayment returns the payment stored in the world state
func (s *SmartContract) QueryPayment(ctx contractapi.TransactionContextInterface, id string) (*PaymentRecord, error) {
	paymentJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if paymentJSON == nil {
		return nil, fmt.Errorf("payment %s does not exist", id)
	}

	var payment PaymentRecord
	err = json.Unmarshal(paymentJSON, &payment)
	if err != nil {
		return nil, err
	}

	return &payment, nil
}

// GetPaymentHistory returns the complete provenance history of state modifications
func (s *SmartContract) GetPaymentHistory(ctx contractapi.TransactionContextInterface, id string) ([]HistoryQueryResult, error) {
	resultsIterator, err := ctx.GetStub().GetHistoryForKey(id)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var records []HistoryQueryResult
	for resultsIterator.HasNext() {
		response, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var payment PaymentRecord
		if len(response.Value) > 0 {
			err = json.Unmarshal(response.Value, &payment)
			if err != nil {
				return nil, err
			}
		}

		timestamp := time.Unix(response.Timestamp.Seconds, int64(response.Timestamp.Nanos)).UTC().Format(time.RFC3339)

		records = append(records, HistoryQueryResult{
			TxId:      response.TxId,
			Timestamp: timestamp,
			IsDelete:  response.IsDelete,
			Record:    &payment,
		})
	}

	return records, nil
}

// QueryAllPayments returns all payments found in world state
func (s *SmartContract) QueryAllPayments(ctx contractapi.TransactionContextInterface) ([]*PaymentRecord, error) {
	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var payments []*PaymentRecord
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var payment PaymentRecord
		err = json.Unmarshal(queryResponse.Value, &payment)
		if err != nil {
			return nil, err
		}
		payments = append(payments, &payment)
	}

	return payments, nil
}

// PaymentExists returns true when payment with given ID exists in world state
func (s *SmartContract) PaymentExists(ctx contractapi.TransactionContextInterface, id string) (bool, error) {
	paymentJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return false, fmt.Errorf("failed to read from world state: %v", err)
	}

	return paymentJSON != nil, nil
}

func computeHash(input string) string {
	h := sha256.New()
	h.Write([]byte(input))
	return hex.EncodeToString(h.Sum(nil))
}

func main() {
	chaincode, err := contractapi.NewChaincode(&SmartContract{})
	if err != nil {
		fmt.Printf("Error creating Crossbridge chaincode: %v\n", err)
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting Crossbridge chaincode: %v\n", err)
	}
}
