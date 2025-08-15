import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, HttpCode } from '@nestjs/common';
import { ApiEndpointService } from './api-endpoint.service';
import { CreateApiEndpointDto, UpdateApiEndpointDto } from './api-endpoint.dto';
import { ApiEndpoint } from './api-endpoint.entity';

@Controller('api-endpoints')
export class ApiEndpointController {
  constructor(private readonly apiEndpointService: ApiEndpointService) {}

  @Get()
  findAll(): Promise<ApiEndpoint[]> {
    return this.apiEndpointService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ApiEndpoint | null> {
    return this.apiEndpointService.findOne(id);
  }

  @Post()
  create(@Body() createApiEndpointDto: CreateApiEndpointDto): Promise<ApiEndpoint> {
    return this.apiEndpointService.create(createApiEndpointDto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateApiEndpointDto: UpdateApiEndpointDto): Promise<ApiEndpoint | null> {
    return this.apiEndpointService.update(id, updateApiEndpointDto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.apiEndpointService.remove(id);
  }
}
