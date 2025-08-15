import { Controller, Post, Body } from '@nestjs/common';
import { ScannerService } from './scanner.service';
import { ScanUrlDto, ScanResult } from './scanner.dto';

@Controller('scanner')
export class ScannerController {
  constructor(private readonly scannerService: ScannerService) {}

  @Post('scan')
  scan(@Body() scanUrlDto: ScanUrlDto): Promise<ScanResult> {
    return this.scannerService.scanUrl(scanUrlDto);
  }
}
