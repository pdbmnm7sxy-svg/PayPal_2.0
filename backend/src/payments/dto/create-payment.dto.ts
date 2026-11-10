import { IsNotEmpty, IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsString()
  senderName: string;

  @IsNotEmpty()
  @IsString()
  senderBank: string; // 'GSB_US' | 'EUROT_DE' | 'PACIFIC_SG'

  @IsOptional()
  @IsString()
  senderCountry?: string;

  @IsNotEmpty()
  @IsString()
  receiverName: string;

  @IsNotEmpty()
  @IsString()
  receiverBank: string; // 'GSB_US' | 'EUROT_DE' | 'PACIFIC_SG'

  @IsOptional()
  @IsString()
  receiverCountry?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount: number;

  @IsNotEmpty()
  @IsString()
  currency: string; // USD, EUR, SGD

  @IsNotEmpty()
  @IsString()
  targetCurrency: string;

  @IsOptional()
  @IsString()
  benchmarkFixtureKey?: string; // 'LEGIT_CLEAN' | 'SUSPICIOUS_VELOCITY' | 'HIGH_RISK_FRAUD'

  @IsOptional()
  @IsString()
  routingPriority?: string; // 'BALANCED' | 'LOW_COST' | 'FASTEST'
}
