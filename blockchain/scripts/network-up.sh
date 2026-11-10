#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BLOCKCHAIN_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "=== Starting Crossbridge Hyperledger Fabric Network ==="
"${SCRIPT_DIR}/generate-certs.sh"

cd "${BLOCKCHAIN_DIR}"

if command -v docker-compose &> /dev/null; then
  COMPOSE_CMD="docker-compose"
else
  COMPOSE_CMD="docker compose"
fi

${COMPOSE_CMD} -f docker-compose-fabric.yml up -d

echo "=== Crossbridge Fabric Network is running! ==="
echo "Orderer: 7050"
echo "Org1 Peer (Bank A - GSB_US): 7051"
echo "Org2 Peer (Bank B - EUROT_DE): 8051"
echo "Org3 Peer (Bank C - PACIFIC_SG): 9051"
echo "CA Server: 7054"
