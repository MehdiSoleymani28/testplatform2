import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiCollectionService } from './api-collection.service';
import { CreateApiCollectionDto } from './dto/create-api-collection.dto';
import { UpdateApiCollectionDto } from './dto/update-api-collection.dto';
import { AddEndpointsToCollectionDto } from './dto/add-endpoints-to-collection.dto';
import { ImportOpenApiDto } from './dto/import-openapi.dto';

// Note: additional routes added: manage endpoints within a collection and run collection batch

@Controller('api-collections')
export class ApiCollectionController {
  constructor(private readonly service: ApiCollectionService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateApiCollectionDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateApiCollectionDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Get(':id/endpoints')
  listEndpoints(@Param('id', ParseIntPipe) id: number) {
    const c = this.service.findOne(id);
    return c.then(col => (col ? col.endpoints || [] : []));
  }

  @Post(':id/endpoints')
  addEndpoints(@Param('id', ParseIntPipe) id: number, @Body() dto: AddEndpointsToCollectionDto) {
    return this.service.addEndpointsToCollection(id, dto.endpointIds || []);
  }

  @Delete(':id/endpoints')
  removeEndpoints(@Param('id', ParseIntPipe) id: number, @Body() dto: AddEndpointsToCollectionDto) {
    return this.service.removeEndpointsFromCollection(id, dto.endpointIds || []);
  }

  @Post(':id/run')
  runCollection(@Param('id', ParseIntPipe) id: number, @Body() body: { onlySavedTests?: boolean } = {}) {
    return this.service.runCollection(id, body.onlySavedTests === true);
  }

  @Post('import-openapi')
  async importOpenApi(@Body() dto: ImportOpenApiDto) {
    return this.service.importOpenApi(dto);
  }
}
