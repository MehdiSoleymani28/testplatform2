import { Controller, Get, Post, Put, Delete, Param, Body, Query, ParseIntPipe, HttpCode } from '@nestjs/common';
import { SettingService } from './setting.service';
import { CreateSettingDto, UpdateSettingDto } from './setting.dto';
import { Setting } from './setting.entity';

@Controller('settings')
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Get()
  findAll(@Query('projectId') projectId?: number): Promise<Setting[]> {
    return this.settingService.findAll(projectId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Setting | null> {
    return this.settingService.findOne(id);
  }

  @Post()
  create(@Body() createSettingDto: CreateSettingDto): Promise<Setting> {
    return this.settingService.create(createSettingDto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateSettingDto: UpdateSettingDto): Promise<Setting | null> {
    return this.settingService.update(id, updateSettingDto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.settingService.remove(id);
  }
}
