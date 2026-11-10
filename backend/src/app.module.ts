import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { AuditLog } from './entities/audit-log.entity';
import { BankNode } from './entities/bank-node.entity';
import { PaymentsService } from './payments/payments.service';
import { PaymentsController } from './payments/payments.controller';
import { PaypalService } from './paypal/paypal.service';
import { FabricService } from './fabric/fabric.service';
import { SettlementService } from './settlement/settlement.service';
import { AiClientService } from './ai-client/ai-client.service';
import { EventsGateway } from './events/events.gateway';
import { SeedService } from './seed/seed.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbType = config.get<string>('DATABASE_TYPE') || 'postgres';
        if (dbType === 'sqlite') {
          return {
            type: 'sqlite',
            database: config.get<string>('DATABASE_PATH') || 'crossbridge.db',
            entities: [Payment, AuditLog, BankNode],
            synchronize: true,
          };
        }

        return {
          type: 'postgres',
          host: config.get<string>('DATABASE_HOST') || 'localhost',
          port: config.get<number>('DATABASE_PORT') || 5432,
          username: config.get<string>('DATABASE_USER') || 'crossbridge',
          password: config.get<string>('DATABASE_PASSWORD') || 'crossbridge_secret',
          database: config.get<string>('DATABASE_NAME') || 'crossbridge_ledger',
          entities: [Payment, AuditLog, BankNode],
          synchronize: true,
          retryAttempts: 5,
          retryDelay: 3000,
        };
      },
    }),
    TypeOrmModule.forFeature([Payment, AuditLog, BankNode]),
  ],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    PaypalService,
    FabricService,
    SettlementService,
    AiClientService,
    EventsGateway,
    SeedService,
  ],
})
export class AppModule {}
