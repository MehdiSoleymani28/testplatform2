import { Module } from '@nestjs/common';
import { TestGeneratorController } from './test-generator.controller';
import { TestGeneratorService } from './test-generator.service';
import { ScannerAdapterService } from './scanner-adapter.service';
import { TestTemplatesService } from './test-templates.service';

@Module({
  controllers: [TestGeneratorController],
  providers: [TestGeneratorService, ScannerAdapterService, TestTemplatesService],
  exports: [TestGeneratorService]
})
export class TestGeneratorModule {}
