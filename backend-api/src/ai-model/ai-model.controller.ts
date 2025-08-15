import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, HttpCode } from '@nestjs/common';
import { AiModelService } from './ai-model.service';
import { CreateAiModelDto, UpdateAiModelDto } from './ai-model.dto';
import { AiModel } from './ai-model.entity';

@Controller('ai-models')
export class AiModelController {
  constructor(private readonly aiModelService: AiModelService) {}

  @Get()
  findAll(): Promise<AiModel[]> {
    return this.aiModelService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<AiModel | null> {
    return this.aiModelService.findOne(id);
  }

  @Post()
  create(@Body() createAiModelDto: CreateAiModelDto): Promise<AiModel> {
    return this.aiModelService.create(createAiModelDto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateAiModelDto: UpdateAiModelDto): Promise<AiModel | null> {
    return this.aiModelService.update(id, updateAiModelDto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.aiModelService.remove(id);
  }
}
