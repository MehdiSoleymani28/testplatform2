import { Controller, Get, Post, Put, Delete, Param, Body, HttpCode, ParseIntPipe } from '@nestjs/common';
import { SavedTestService } from './saved-test.service';
import { CreateSavedTestDto, UpdateSavedTestDto } from './saved-test.dto';
import { SavedTest } from './saved-test.entity';
// ...existing imports...

@Controller('saved-tests')
export class SavedTestController {
  constructor(private readonly savedTestService: SavedTestService) {}

  @Get()
  findAll(): Promise<SavedTest[]> {
    return this.savedTestService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<SavedTest | null> {
    return this.savedTestService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateSavedTestDto): Promise<SavedTest> {
    return this.savedTestService.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSavedTestDto): Promise<SavedTest | null> {
    return this.savedTestService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.savedTestService.remove(id);
  }

  @Post(':id/execute')
  async execute(@Param('id', ParseIntPipe) id: number) {
    const saved = await this.savedTestService.findOne(id);
    if (!saved) return { error: 'Not found' };

    if (saved.type === 'api' && saved.apiDetails) {
      // lazy require to avoid top-level dependency issues
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const fetch = require('node-fetch');
      const res = await fetch(saved.apiDetails.url, {
        method: saved.apiDetails.method,
        headers: saved.apiDetails.headers,
        body: saved.apiDetails.body,
      });
      const text = await res.text();
      return { status: res.status, body: text };
    }

    if (saved.type === 'ui' && saved.uiCommands) {
      const { chromium } = await import('playwright');
      const browser = await chromium.launch();
      const page = await browser.newPage();
  const results: any[] = [];
      for (const cmd of saved.uiCommands) {
        if (cmd.action === 'goto' && typeof cmd.value === 'string') await page.goto(cmd.value);
        if (cmd.action === 'click' && typeof cmd.selector === 'string') await page.click(cmd.selector);
        if (cmd.action === 'type' && typeof cmd.selector === 'string') await page.fill(cmd.selector, cmd.value || '');
        if (cmd.action === 'assertVisible' && typeof cmd.selector === 'string') {
          const visible = await page.isVisible(cmd.selector);
          results.push({ cmd, visible });
        }
      }
      await browser.close();
      return { results };
    }

    return { error: 'No executable content' };
  }
}
