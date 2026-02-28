import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsDateString,
  IsArray,
} from 'class-validator';
import { ItemType, ItemStatus } from '@prisma/client';

export class CreateItemDto {
  @ApiProperty({ example: 'Blue Backpack' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Blue Jansport backpack with laptop inside and red zipper',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'Electronics' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ enum: ItemType })
  @IsEnum(ItemType)
  type: ItemType;

  @ApiProperty({ example: 'Library' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ example: 'Main Building', required: false })
  @IsOptional()
  @IsString()
  building?: string;

  @ApiProperty({ example: '2nd Floor', required: false })
  @IsOptional()
  @IsString()
  floor?: string;

  @ApiProperty({ example: '2024-02-21T10:00:00Z' })
  @IsDateString()
  dateLostFound: string;

  @ApiProperty({ required: false })
  @IsOptional()
  // Bug #14 fix: @IsUrl() was too strict — @IsString() allows paths and relative URLs
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    type: [String],
    required: false,
    example: ['blue', 'laptop', 'jansport'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateItemDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  building?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  floor?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dateLostFound?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  // Bug #14 fix: @IsUrl() was too strict
  @IsString()
  imageUrl?: string;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class ItemFilterDto {
  @ApiProperty({ enum: ItemType, required: false })
  @IsOptional()
  @IsEnum(ItemType)
  type?: ItemType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ enum: ItemStatus, required: false })
  @IsOptional()
  // Bug #15 fix: validate that status is a valid ItemStatus enum value
  @IsEnum(ItemStatus)
  status?: ItemStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  page?: number;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  limit?: number;
}
