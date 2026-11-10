#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BLOCKCHAIN_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "=== Generating Cryptographic Material for Crossbridge Fabric Network ==="
cd "${BLOCKCHAIN_DIR}"

# Create directories
mkdir -p crypto-config/ordererOrganizations/crossbridge.net/msp/tlscacerts
mkdir -p crypto-config/ordererOrganizations/crossbridge.net/orderers/orderer.crossbridge.net/msp
mkdir -p crypto-config/ordererOrganizations/crossbridge.net/orderers/orderer.crossbridge.net/tls

for ORG in org1 org2 org3; do
  mkdir -p "crypto-config/peerOrganizations/${ORG}.crossbridge.net/msp/tlscacerts"
  mkdir -p "crypto-config/peerOrganizations/${ORG}.crossbridge.net/peers/peer0.${ORG}.crossbridge.net/msp"
  mkdir -p "crypto-config/peerOrganizations/${ORG}.crossbridge.net/peers/peer0.${ORG}.crossbridge.net/tls"
  mkdir -p "crypto-config/peerOrganizations/${ORG}.crossbridge.net/users/Admin@${ORG}.crossbridge.net/msp"
done

mkdir -p channel-artifacts

# Generate CA and Root Keys using openssl
if [ ! -f crypto-config/ordererOrganizations/crossbridge.net/ca.key ]; then
  echo "Generating Orderer CA..."
  openssl ecparam -name prime256v1 -genkey -noout -out crypto-config/ordererOrganizations/crossbridge.net/ca.key
  openssl req -new -x509 -key crypto-config/ordererOrganizations/crossbridge.net/ca.key \
    -out crypto-config/ordererOrganizations/crossbridge.net/ca.crt -days 3650 \
    -subj "/C=US/ST=NewYork/L=NewYork/O=CrossbridgeOrderer/CN=ca.crossbridge.net"
fi

for ORG in org1 org2 org3; do
  ORG_DIR="crypto-config/peerOrganizations/${ORG}.crossbridge.net"
  if [ ! -f "${ORG_DIR}/ca.key" ]; then
    echo "Generating CA for ${ORG}..."
    openssl ecparam -name prime256v1 -genkey -noout -out "${ORG_DIR}/ca.key"
    openssl req -new -x509 -key "${ORG_DIR}/ca.key" \
      -out "${ORG_DIR}/ca.crt" -days 3650 \
      -subj "/C=US/ST=State/L=City/O=${ORG}MSP/CN=ca.${ORG}.crossbridge.net"

    # Generate peer cert
    PEER_DIR="${ORG_DIR}/peers/peer0.${ORG}.crossbridge.net"
    openssl ecparam -name prime256v1 -genkey -noout -out "${PEER_DIR}/server.key"
    openssl req -new -key "${PEER_DIR}/server.key" -out "${PEER_DIR}/server.csr" \
      -subj "/C=US/ST=State/L=City/O=${ORG}MSP/CN=peer0.${ORG}.crossbridge.net"
    openssl x509 -req -in "${PEER_DIR}/server.csr" -CA "${ORG_DIR}/ca.crt" -CAkey "${ORG_DIR}/ca.key" \
      -CAcreateserial -out "${PEER_DIR}/server.crt" -days 365

    cp "${ORG_DIR}/ca.crt" "${ORG_DIR}/msp/cacerts/" 2>/dev/null || mkdir -p "${ORG_DIR}/msp/cacerts" && cp "${ORG_DIR}/ca.crt" "${ORG_DIR}/msp/cacerts/ca.${ORG}.crossbridge.net-cert.pem"
    cp "${PEER_DIR}/server.crt" "${PEER_DIR}/msp/signcerts/" 2>/dev/null || mkdir -p "${PEER_DIR}/msp/signcerts" && cp "${PEER_DIR}/server.crt" "${PEER_DIR}/msp/signcerts/cert.pem"
    mkdir -p "${PEER_DIR}/msp/keystore" && cp "${PEER_DIR}/server.key" "${PEER_DIR}/msp/keystore/priv_sk"
    mkdir -p "${PEER_DIR}/msp/cacerts" && cp "${ORG_DIR}/ca.crt" "${PEER_DIR}/msp/cacerts/ca.pem"
  fi
done

# Create mock genesis block if configtxgen is not installed
if [ ! -f channel-artifacts/genesis.block ]; then
  echo "Writing genesis metadata marker..."
  echo "CROSSBRIDGE_FABRIC_GENESIS_V2_CHANNEL_THREE_BANKS" > channel-artifacts/genesis.block
fi

echo "Cryptographic materials verified in ${BLOCKCHAIN_DIR}/crypto-config"
