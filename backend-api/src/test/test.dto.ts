import { IsString, IsOptional, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTestDto {
  @ApiProperty()
  @IsString()
  framework: string;

  @ApiProperty()
  @IsString()
  script: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string = 'generated';

  @ApiProperty()
  @IsInt()
  projectId: number;
}

export class UpdateTestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  framework?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  script?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;
}
