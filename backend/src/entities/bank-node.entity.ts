import {
  Entity,
  PrimaryColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

@Entity('bank_nodes')
export class BankNode {
  @PrimaryColumn()
  code: string;

  @Column()
  name: string;

  @Column()
  country: string;

  @Column({ default: 'USD' })
  currency: string;

  @Column('decimal', { precision: 16, scale: 2 })
  liquidityBalance: number;

  @Column('decimal', { precision: 16, scale: 2 })
  initialLiquidity: number;

  @Column('decimal', { precision: 16, scale: 2, default: 0 })
  totalSettledVolume: number;

  @Column({ default: 0 })
  activeTransfersCount: number;

  @Column({ default: 'ACTIVE' })
  status: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
