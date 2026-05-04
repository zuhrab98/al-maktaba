import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Request } from 'express';
import { NotesService } from './notes.service';

@ApiTags('notes')
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  @ApiOperation({ summary: 'Все заметки сессии' })
  findAll(@Req() req: Request) {
    return this.notesService.findAll(this.getSessionId(req));
  }

  @Post()
  @ApiOperation({ summary: 'Создать или обновить заметку' })
  upsert(
    @Req() req: Request,
    @Body() body: { bookId: number; pageId: number; content: string },
  ) {
    return this.notesService.upsert(this.getSessionId(req), body.bookId, body.pageId, body.content);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить заметку' })
  delete(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    return this.notesService.delete(this.getSessionId(req), id);
  }

  private getSessionId(req: Request): string {
    return (req.cookies?.['session_id'] as string) ?? req.ip ?? 'anonymous';
  }
}
