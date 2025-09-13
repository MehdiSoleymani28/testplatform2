import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, HttpCode } from '@nestjs/common';
import { TestService } from './test.service';
import { CreateTestDto, UpdateTestDto, BulkCreateTestsDto } from './test.dto';
import { Test } from './test.entity';

@Controller('tests')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Get()
  findAll(): Promise<Test[]> {
    return this.testService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Test | null> {
    return this.testService.findOne(id);
  }

  @Get('project/:projectId')
  findByProject(@Param('projectId', ParseIntPipe) projectId: number): Promise<Test[]> {
    return this.testService.findByProject(projectId);
  }

  @Post()
  create(@Body() createTestDto: CreateTestDto): Promise<Test> {
    return this.testService.create(createTestDto);
  }

  @Post('bulk')
  createBulk(@Body() dto: BulkCreateTestsDto): Promise<Test[]> {
    return this.testService.createBulk(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateTestDto: UpdateTestDto): Promise<Test | null> {
    return this.testService.update(id, updateTestDto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.testService.remove(id);
  }
}
