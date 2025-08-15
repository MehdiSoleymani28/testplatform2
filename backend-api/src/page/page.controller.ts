import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, HttpCode } from '@nestjs/common';
import { PageService } from './page.service';
import { CreatePageDto, UpdatePageDto } from './page.dto';
import { Page } from './page.entity';

@Controller('pages')
export class PageController {
  constructor(private readonly pageService: PageService) {}

  @Get()
  findAll(): Promise<Page[]> {
    return this.pageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Page | null> {
    return this.pageService.findOne(id);
  }

  @Post()
  create(@Body() createPageDto: CreatePageDto): Promise<Page> {
    return this.pageService.create(createPageDto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePageDto: UpdatePageDto): Promise<Page | null> {
    return this.pageService.update(id, updatePageDto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.pageService.remove(id);
  }
}
