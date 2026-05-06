import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PagesService } from './pages.service';

@ApiTags('pages')
@Controller('books/:bookId/pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get()
  @ApiOperation({ summary: 'Страницы книги с пагинацией' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  findByBook(
    @Param('bookId', ParseIntPipe) bookId: number,
    @Query('limit') limit = 1,
    @Query('offset') offset = 0,
  ) {
    return this.pagesService.findByBook(bookId, +limit, +offset);
  }

  @Get('toc')
  @ApiOperation({ summary: 'Оглавление книги — все заголовки с номерами страниц' })
  getToc(@Param('bookId', ParseIntPipe) bookId: number) {
    return this.pagesService.getToc(bookId);
  }

  @Get('page-numbers')
  @ApiOperation({ summary: 'Список всех физических номеров страниц книги' })
  getPageNumbers(@Param('bookId', ParseIntPipe) bookId: number) {
    return this.pagesService.getPageNumbers(bookId);
  }

  @Get('toc-tree')
  @ApiOperation({ summary: 'Иерархическое оглавление книги' })
  getTocTree(@Param('bookId', ParseIntPipe) bookId: number) {
    return this.pagesService.getTocTree(bookId);
  }

  @Get(':shamelaId')
  @ApiOperation({ summary: 'Конкретная страница по Shamela ID' })
  findOne(
    @Param('bookId', ParseIntPipe) bookId: number,
    @Param('shamelaId', ParseIntPipe) shamelaId: number,
  ) {
    return this.pagesService.findOne(bookId, shamelaId);
  }
}
