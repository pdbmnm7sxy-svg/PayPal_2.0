#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BLOCKCHAIN_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "=== Stopping Crossbridge Hyperledger Fabric Network ==="
cd "${BLOCKCHAIN_DIR}"

if command -v docker-compose &> /dev/null; then
  COMPOSE_CMD="docker-compose"
else
  COMPOSE_CMD="docker compose"
fi

${COMPOSE_CMD} -f docker-compose-fabric.yml down -v --remove-orphans
echo "=== Fabric Network stopped and cleaned ==="
