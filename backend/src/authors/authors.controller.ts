import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuthorsService } from './authors.service';

@ApiTags('authors')
@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Get()
  @ApiOperation({ summary: 'Список авторов с пагинацией' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  findAll(
    @Query('limit') limit = 50,
    @Query('offset') offset = 0,
  ) {
    return this.authorsService.findAll(+limit, +offset);
  }

  @Get('search')
  @ApiOperation({ summary: 'Поиск авторов по имени' })
  @ApiQuery({ name: 'q', required: true, type: String })
  search(@Query('q') query: string) {
    return this.authorsService.search(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Автор по ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.authorsService.findOne(id);
  }

  @Get(':id/books')
  @ApiOperation({ summary: 'Книги автора' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  findBooks(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit') limit = 20,
    @Query('offset') offset = 0,
  ) {
    return this.authorsService.findBooksByAuthor(id, +limit, +offset);
  }
}
