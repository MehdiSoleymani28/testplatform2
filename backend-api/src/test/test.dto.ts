import { IsString, IsOptional, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string = 'generated';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  framework?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  script?: string;

  @ApiProperty()
  @IsInt()
  projectId: number;
}

export class UpdateTestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  framework?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  script?: string;
}
