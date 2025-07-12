import {
  Controller,
  Get,
  Post,
  Body,
  Put, 
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { QueryTodoDto } from './dto/query-todo.dto';
import { TodoStatus } from './entities/todo.entity';

@Controller('todos')
@UseGuards(AuthGuard('jwt'))
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTodoDto: CreateTodoDto, @Request() req) {
    return this.todoService.create(createTodoDto, req.user.id);
  }

  @Get()
  findAll(@Query() queryDto: QueryTodoDto, @Request() req) {
    return this.todoService.findAll(queryDto, req.user.id);
  }

  @Get('stats')
  getStats(@Request() req) {
    return this.todoService.getStats(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.todoService.findOne(id, req.user.id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto, @Request() req) {
    return this.todoService.update(id, updateTodoDto, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Request() req) {
    return this.todoService.remove(id, req.user.id);
  }
}