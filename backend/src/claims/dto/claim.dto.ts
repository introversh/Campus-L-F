import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateClaimDto {
  @ApiProperty({ example: 'item-uuid' })
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @ApiProperty({ example: 'match-uuid', required: false })
  @IsOptional()
  @IsString()
  matchId?: string;

  @ApiProperty({ example: 'I lost this backpack in the library on Monday...' })
  @IsString()
  @IsNotEmpty()
  description: string;
}

export class ReviewClaimDto {
  @ApiProperty({ required: false, example: 'Identity verified successfully' })
  @IsOptional()
  @IsString()
  adminNote?: string;
}
