import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello() {
    return {
      message: 'Todo API is running!',
      version: '1.0.0',
      endpoints: {
        'GET /': 'This message',
        'GET /todos': 'Get all todos (with optional query params: status, priority, search)',
        'POST /todos': 'Create a new todo',
        'GET /todos/stats': 'Get todo statistics',
        'GET /todos/:id': 'Get a specific todo',
        'PATCH /todos/:id': 'Update a todo',
        'DELETE /todos/:id': 'Delete a todo',
      },
      examples: {
        'Create todo': 'POST /todos { "title": "Buy groceries", "description": "Milk, bread, eggs", "priority": "high" }',
        'Filter todos': 'GET /todos?status=pending&priority=high',
        'Search todos': 'GET /todos?search=groceries',
      }
    };
  }
}
