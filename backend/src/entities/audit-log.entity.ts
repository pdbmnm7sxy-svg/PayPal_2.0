import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  paymentId: string;

  @Column({ nullable: true })
  paymentReference: string;

  @Column()
  previousState: string;

  @Column()
  newState: string;

  @Column({ default: 'SYSTEM' })
  actor: string;

  @Column()
  action: string;

  @Column({ nullable: true })
  blockHash: string;

  @Column({ default: 0 })
  blockNumber: number;

  @Column({ type: 'text', nullable: true })
  detailsJson: string;

  @CreateDateColumn()
  timestamp: Date;
}
