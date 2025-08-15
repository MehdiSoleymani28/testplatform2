import { IsInt, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLogDto {
  @ApiProperty()
  @IsInt()
  testId: number;

  @ApiProperty()
  @IsString()
  output: string;

  @ApiProperty()
  @IsString()
  status: string;
}

export class UpdateLogDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  output?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;
}
