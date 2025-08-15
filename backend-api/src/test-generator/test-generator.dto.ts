import { ScanResultElement } from '../scanner/scanner.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class GenerateTestsDto {
  @ApiProperty({ type: [ScanResultElement] })
  @IsArray()
  elements: ScanResultElement[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  framework?: string = 'playwright';
  
  @ApiPropertyOptional({ description: 'Optional requirements/user story to guide test generation' })
  @IsOptional()
  @IsString()
  requirements?: string;
}

export class GenerateTestsResult {
  @ApiProperty({ type: [String] })
  tests: string[];
}
