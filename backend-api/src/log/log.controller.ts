import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, HttpCode } from '@nestjs/common';
import { LogService } from './log.service';
import { CreateLogDto, UpdateLogDto } from './log.dto';
import { Log } from './log.entity';

@Controller('logs')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Get()
  findAll(): Promise<Log[]> {
    return this.logService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Log | null> {
    return this.logService.findOne(id);
  }

  @Post()
  create(@Body() createLogDto: CreateLogDto): Promise<Log> {
    return this.logService.create(createLogDto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateLogDto: UpdateLogDto): Promise<Log | null> {
    return this.logService.update(id, updateLogDto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.logService.remove(id);
  }
}
