import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { BooksService } from './books.service';

@ApiTags('books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  @ApiOperation({ summary: 'Список книг с пагинацией, фильтром и сортировкой' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'categoryId', required: false, type: Number })
  @ApiQuery({ name: 'sort', required: false, enum: ['name', 'death', 'pages'] })
  @ApiQuery({ name: 'q', required: false })
  findAll(
    @Query('limit') limit = 30,
    @Query('offset') offset = 0,
    @Query('categoryId') categoryId?: number,
    @Query('sort') sort: 'name' | 'death' | 'pages' = 'name',
    @Query('q') q?: string,
  ) {
    return this.booksService.findAll(+limit, +offset, categoryId ? +categoryId : undefined, sort, q);
  }

  @Get('search')
  @ApiOperation({ summary: 'Поиск книг по названию' })
  @ApiQuery({ name: 'q', required: true })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  search(
    @Query('q') query: string,
    @Query('limit') limit = 20,
    @Query('offset') offset = 0,
  ) {
    return this.booksService.search(query, +limit, +offset);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Книга по ID с авторами и категорией' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.findOne(id);
  }

  @Get(':id/titles')
  @ApiOperation({ summary: 'Оглавление книги' })
  findTitles(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.findTitles(id);
  }
}
