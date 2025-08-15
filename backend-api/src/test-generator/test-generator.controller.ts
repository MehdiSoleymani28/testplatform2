import { Controller, Post, Body } from '@nestjs/common';
import { TestGeneratorService } from './test-generator.service';
import { GenerateTestsDto, GenerateTestsResult } from './test-generator.dto';

@Controller('test-generator')
export class TestGeneratorController {
  constructor(private readonly testGeneratorService: TestGeneratorService) {}

  @Post('generate')
  generate(@Body() dto: GenerateTestsDto): Promise<GenerateTestsResult> {
    return this.testGeneratorService.generate(dto);
  }
}
