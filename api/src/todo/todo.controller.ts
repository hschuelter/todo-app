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
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { QueryTodoDto } from './dto/query-todo.dto';
import { TodoStatus } from './entities/todo.entity';

@ApiTags('Todos')
@ApiBearerAuth()
@Controller('todos')
@UseGuards(AuthGuard('jwt'))
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new todo',
    description: 'Creates a new todo item for the authenticated user. The userId will be automatically set from the JWT token.',
  })
  @ApiBody({
    type: CreateTodoDto,
    description: 'Todo data to create. Note: userId should match the authenticated user.',
    examples: {
      basic: {
        summary: 'Basic todo',
        value: {
          title: 'Buy groceries',
          description: 'Need to buy milk, bread, and eggs',
          userId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
        }
      }
    }
  })
  @ApiCreatedResponse({
    description: 'Todo successfully created',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or validation errors',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  create(@Body() createTodoDto: CreateTodoDto, @Request() req) {
    return this.todoService.create(createTodoDto, req.user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all todos',
    description: 'Retrieves all todos for the authenticated user with optional filtering by status and search text',
  })
  @ApiOkResponse({
    description: 'List of todos retrieved successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  findAll(@Query() queryDto: QueryTodoDto, @Request() req) {
    return this.todoService.findAll(queryDto, req.user.id);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get todo statistics',
    description: 'Retrieves statistics about todos for the authenticated user',
  })
  @ApiOkResponse({
    description: 'Todo statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', description: 'Total number of todos' },
        completed: { type: 'number', description: 'Number of completed todos' },
        pending: { type: 'number', description: 'Number of pending todos' },
        inProgress: { type: 'number', description: 'Number of in-progress todos' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  getStats(@Request() req) {
    return this.todoService.getStats(req.user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a specific todo',
    description: 'Retrieves a specific todo by ID for the authenticated user',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Todo ID (UUID format)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiOkResponse({
    description: 'Todo retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        title: { type: 'string' },
        description: { type: 'string' },
        status: { type: 'string', enum: Object.values(TodoStatus) },
        dueDate: { type: 'string', format: 'date-time' },
        userId: { type: 'string', format: 'uuid' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  @ApiNotFoundResponse({
    description: 'Todo not found',
  })
  findOne(@Param('id') id: string, @Request() req) {
    return this.todoService.findOne(id, req.user.id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a todo',
    description: 'Updates a specific todo by ID for the authenticated user. Only provided fields will be updated.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Todo ID (UUID format)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiBody({
    type: UpdateTodoDto,
    description: 'Todo fields to update. All fields are optional.',
  })
  @ApiOkResponse({
    description: 'Todo updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        title: { type: 'string' },
        description: { type: 'string' },
        status: { type: 'string', enum: Object.values(TodoStatus) },
        dueDate: { type: 'string', format: 'date-time' },
        userId: { type: 'string', format: 'uuid' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or validation errors',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  @ApiNotFoundResponse({
    description: 'Todo not found',
  })
  update(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto, @Request() req) {
    return this.todoService.update(id, updateTodoDto, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a todo',
    description: 'Deletes a specific todo by ID for the authenticated user',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Todo ID (UUID format)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiNoContentResponse({
    description: 'Todo deleted successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  @ApiNotFoundResponse({
    description: 'Todo not found',
  })
  remove(@Param('id') id: string, @Request() req) {
    return this.todoService.remove(id, req.user.id);
  }
}