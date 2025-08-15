import { PartialType } from '@nestjs/swagger';
import { CreateApiCollectionDto } from './create-api-collection.dto';

export class UpdateApiCollectionDto extends PartialType(CreateApiCollectionDto) {}
