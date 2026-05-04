import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ImportService } from './import.service';

@ApiTags('import')
@Controller('import')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('iso')
  @ApiOperation({ summary: 'Запустить импорт из смонтированного ISO' })
  importFromISO(@Body() body: { mountPath: string }) {
    return this.importService.importFromISO(body.mountPath);
  }
}
