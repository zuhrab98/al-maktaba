import { Controller, Get, Post, Body, Param, ParseIntPipe, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Request } from 'express';
import { HistoryService } from './history.service';

@ApiTags('history')
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  @ApiOperation({ summary: 'История чтения сессии' })
  findAll(@Req() req: Request) {
    return this.historyService.findAll(this.getSessionId(req));
  }

  @Post()
  @ApiOperation({ summary: 'Обновить прогресс чтения' })
  upsert(
    @Req() req: Request,
    @Body() body: { bookId: number; pageId: number; progress: number },
  ) {
    return this.historyService.upsert(this.getSessionId(req), body.bookId, body.pageId, body.progress);
  }

  @Get('books/:bookId')
  @ApiOperation({ summary: 'Прогресс чтения конкретной книги' })
  getProgress(@Req() req: Request, @Param('bookId', ParseIntPipe) bookId: number) {
    return this.historyService.getBookProgress(this.getSessionId(req), bookId);
  }

  private getSessionId(req: Request): string {
    return (req.cookies?.['session_id'] as string) ?? req.ip ?? 'anonymous';
  }
}
