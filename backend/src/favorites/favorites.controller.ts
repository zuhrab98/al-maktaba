import { Controller, Get, Post, Body, Param, ParseIntPipe, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Request } from 'express';
import { FavoritesService } from './favorites.service';

@ApiTags('favorites')
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: 'Избранные книги сессии' })
  findAll(@Req() req: Request) {
    return this.favoritesService.findAll(this.getSessionId(req));
  }

  @Post('toggle')
  @ApiOperation({ summary: 'Добавить/убрать из избранного' })
  toggle(@Req() req: Request, @Body() body: { bookId: number }) {
    return this.favoritesService.toggle(this.getSessionId(req), body.bookId);
  }

  @Get('books/:bookId')
  @ApiOperation({ summary: 'Проверить — книга в избранном?' })
  isFavorited(@Req() req: Request, @Param('bookId', ParseIntPipe) bookId: number) {
    return this.favoritesService.isFavorited(this.getSessionId(req), bookId);
  }

  private getSessionId(req: Request): string {
    return (req.cookies?.['session_id'] as string) ?? req.ip ?? 'anonymous';
  }
}
