import { IsString, IsOptional, IsInt, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateApiEndpointDto {
  @ApiProperty()
  @IsString()
  method: string;

  @ApiProperty()
  @IsString()
  @IsUrl({ require_tld: false })
  url: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  group?: string;

  @ApiPropertyOptional({ description: 'Requirements or user story for this API endpoint', type: 'string' })
  @IsOptional()
  @IsString()
  requirements?: string;

  @ApiProperty()
  @IsInt()
  projectId: number;
}

export class UpdateApiEndpointDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  method?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsUrl({ require_tld: false })
  url?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  group?: string;

  @ApiPropertyOptional({ description: 'Requirements or user story for this API endpoint', type: 'string' })
  @IsOptional()
  @IsString()
  requirements?: string;
}
