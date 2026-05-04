import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Request } from 'express';
import { BookmarksService } from './bookmarks.service';

@ApiTags('bookmarks')
@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Get()
  @ApiOperation({ summary: 'Все закладки сессии' })
  findAll(@Req() req: Request) {
    return this.bookmarksService.findAll(this.getSessionId(req));
  }

  @Post('toggle')
  @ApiOperation({ summary: 'Добавить/убрать закладку' })
  toggle(
    @Req() req: Request,
    @Body() body: { bookId: number; pageId: number },
  ) {
    return this.bookmarksService.toggle(this.getSessionId(req), body.bookId, body.pageId);
  }

  private getSessionId(req: Request): string {
    return (req.cookies?.['session_id'] as string) ?? req.ip ?? 'anonymous';
  }
}
