import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsIn } from 'class-validator';

export class CreateSavedTestDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ enum: ['ui', 'api'] })
  @IsIn(['ui', 'api'])
  type: 'ui' | 'api';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  apiDetails?: any;

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  uiCommands?: Array<any>;
}

export class UpdateSavedTestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: ['ui', 'api'] })
  @IsOptional()
  @IsIn(['ui', 'api'])
  type?: 'ui' | 'api';

  @ApiPropertyOptional()
  @IsOptional()
  apiDetails?: any;

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  uiCommands?: Array<any>;
}
