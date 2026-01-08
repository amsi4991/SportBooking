import { IsNumber, IsEnum, IsString, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateWalletDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsEnum(['add', 'subtract', 'set'])
  operation: 'add' | 'subtract' | 'set';

  @IsOptional()
  @IsString()
  description?: string;
}
