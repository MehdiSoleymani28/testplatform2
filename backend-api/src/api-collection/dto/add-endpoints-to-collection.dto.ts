import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional } from 'class-validator';

export class AddEndpointsToCollectionDto {
  @ApiProperty({ type: [Number] })
  @IsArray()
  @IsOptional()
  endpointIds?: number[];
}
