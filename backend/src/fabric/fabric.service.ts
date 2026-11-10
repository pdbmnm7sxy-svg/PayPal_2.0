import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { AuditLog } from '../entities/audit-log.entity';
import { Payment } from '../entities/payment.entity';

export interface FabricBlock {
  blockNumber: number;
  blockHash: string;
  prevBlockHash: string;
  channel: string;
  txId: string;
  timestamp: string;
  mspId: string;
  action: string;
  paymentId: string;
  paymentReference: string;
  payloadHash: string;
  details: Record<string, any>;
  signature: string;
}

@Injectable()
export class FabricService {
  private readonly logger = new Logger(FabricService.name);
  private chain: FabricBlock[] = [];
  private lastBlockHash: string =
    '0000000000000000000000000000000000000000000000000000000000000000';
  private blockCounter: number = 0;
  private isFabricLive: boolean = false;

  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepo: Repository<AuditLog>,
    private configService: ConfigService,
  ) {
    this.initGenesisBlock();
  }

  private initGenesisBlock() {
    const genesisTime = '2026-11-09T00:00:00Z';
    const genesisHash = crypto
      .createHash('sha256')
      .update(`GENESIS_BLOCK_CROSSBRIDGE_THREE_BANKS_${genesisTime}`)
      .digest('hex');

    const genesisBlock: FabricBlock = {
      blockNumber: 0,
      blockHash: genesisHash,
      prevBlockHash:
        '0000000000000000000000000000000000000000000000000000000000000000',
      channel: 'crossbridge-channel',
      txId: 'TX-FABRIC-GENESIS-INIT',
      timestamp: genesisTime,
      mspId: 'OrdererMSP',
      action: 'INIT_CONSORTIUM',
      paymentId: 'SYSTEM',
      paymentReference: 'GENESIS',
      payloadHash: genesisHash,
      details: {
        network: 'Crossbridge Fabric Consortium',
        organizations: ['Org1MSP (GSB_US)', 'Org2MSP (EUROT_DE)', 'Org3MSP (PACIFIC_SG)'],
        chaincode: 'crossbridge-chaincode@1.0.0',
        orderer: 'orderer.crossbridge.net:7050',
      },
      signature: crypto
        .createHmac('sha256', 'fabric-orderer-root-key')
        .update(genesisHash)
        .digest('hex'),
    };

    this.chain.push(genesisBlock);
    this.lastBlockHash = genesisHash;
    this.blockCounter = 1;
    this.logger.log(`Fabric Ledger Genesis Block initialized: ${genesisHash.substring(0, 16)}...`);
  }

  /**
   * Commits a state transition to the permissioned audit ledger
   */
  async appendStateTransition(params: {
    payment: Payment;
    action: string;
    previousState: string;
    newState: string;
    actorOrg: string;
    details: Record<string, any>;
  }): Promise<{ txId: string; blockHash: string; blockNumber: number }> {
    const txId = `FABRIC-TX-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
    const timestamp = new Date().toISOString();
    const blockNumber = this.blockCounter++;

    // Compute deterministic business payload hash (strictly pseudonymous metadata, NO secrets or card numbers)
    const sanitizedPayload = {
      id: params.payment.id,
      ref: params.payment.reference,
      senderBank: params.payment.senderBank,
      receiverBank: params.payment.receiverBank,
      amount: params.payment.amount,
      currency: params.payment.currency,
      newState: params.newState,
      timestamp,
    };

    const payloadHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(sanitizedPayload))
      .digest('hex');

    // Chained Block Hash calculation: SHA256(prevHash + blockNumber + txId + payloadHash)
    const blockHash = crypto
      .createHash('sha256')
      .update(
        `${this.lastBlockHash}:${blockNumber}:${txId}:${payloadHash}:${params.action}`,
      )
      .digest('hex');

    const signature = crypto
      .createHmac('sha256', params.actorOrg)
      .update(blockHash)
      .digest('hex');

    const block: FabricBlock = {
      blockNumber,
      blockHash,
      prevBlockHash: this.lastBlockHash,
      channel: 'crossbridge-channel',
      txId,
      timestamp,
      mspId: params.actorOrg,
      action: params.action,
      paymentId: params.payment.id,
      paymentReference: params.payment.reference,
      payloadHash,
      details: params.details,
      signature,
    };

    this.chain.push(block);
    this.lastBlockHash = blockHash;

    // Persist into PostgreSQL Audit Log table
    try {
      const auditLog = this.auditLogRepo.create({
        paymentId: params.payment.id,
        paymentReference: params.payment.reference,
        previousState: params.previousState,
        newState: params.newState,
        actor: params.actorOrg,
        action: params.action,
        blockHash,
        blockNumber,
        detailsJson: JSON.stringify(params.details),
      });
      await this.auditLogRepo.save(auditLog);
    } catch (e) {
      this.logger.error(`Failed to persist audit log into database: ${e.message}`);
    }

    this.logger.log(
      `Fabric Ledger Commit [Block #${blockNumber}] Action=${params.action} Tx=${txId} Hash=${blockHash.substring(0, 12)}...`,
    );

    return { txId, blockHash, blockNumber };
  }

  getBlocks(limit: number = 50): FabricBlock[] {
    return this.chain.slice(-limit).reverse();
  }

  getPaymentBlocks(paymentId: string): FabricBlock[] {
    return this.chain.filter(
      (b) => b.paymentId === paymentId || b.paymentReference === paymentId,
    );
  }

  getNetworkStatus() {
    return {
      connected: true,
      fabricClusterMode: this.isFabricLive ? 'DOCKER_PEER_CONNECTED' : 'LOCAL_CRYPTOGRAPHIC_LEDGER',
      channel: 'crossbridge-channel',
      chaincode: 'crossbridge-chaincode@1.0.0',
      totalBlocks: this.chain.length,
      currentBlockHash: this.lastBlockHash,
      peers: [
        { name: 'peer0.org1.crossbridge.net', org: 'Org1MSP', bank: 'Global Settlement Bank (GSB_US)' },
        { name: 'peer0.org2.crossbridge.net', org: 'Org2MSP', bank: 'EuroTransact AG (EUROT_DE)' },
        { name: 'peer0.org3.crossbridge.net', org: 'Org3MSP', bank: 'Pacific Rim Financial (PACIFIC_SG)' },
      ],
      orderer: 'orderer.crossbridge.net:7050 (Raft)',
    };
  }
}
