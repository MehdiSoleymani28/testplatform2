import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ScanUrlDto {
  @ApiProperty()
  @IsString()
  url: string;
}

export class ScanResultElement {
  @ApiProperty()
  type: string;

  @ApiPropertyOptional()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  class?: string;

  @ApiPropertyOptional()
  @IsOptional()
  text?: string;

  @ApiPropertyOptional()
  actionability?: {
    isVisible: boolean;
    isClickable: boolean;
  };
}

export class ScanResult {
  @ApiProperty()
  url: string;

  @ApiProperty({ type: [ScanResultElement] })
  elements: ScanResultElement[];
}
