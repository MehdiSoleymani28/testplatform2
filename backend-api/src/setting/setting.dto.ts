import { IsObject, ValidateNested, IsOptional, IsInt, IsString, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SettingItemDto {
  @ApiProperty()
  @IsString()
  key: string;

  @ApiProperty()
  @IsString()
  value: string;
}

export class SystemSettingsDto {
  @ApiProperty({ type: [SettingItemDto], isArray: true })
  @ValidateNested({ each: true })
  @Type(() => SettingItemDto)
  @IsArray()
  settings: SettingItemDto[];
}

export class CreateSettingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  projectId?: number | null;

  @ApiProperty()
  @IsString()
  key: string;

  @ApiProperty()
  @IsString()
  value: string;
}

export class UpdateSettingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  key?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  value?: string;
}
