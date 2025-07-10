import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Todo } from './entities/todo.entity';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { QueryTodoDto } from './dto/query-todo.dto';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private todoRepository: Repository<Todo>,
  ) {}

  async create(createTodoDto: CreateTodoDto): Promise<Todo> {
    const todo = this.todoRepository.create(createTodoDto);
    return this.todoRepository.save(todo);
  }

  async findAll(queryDto: QueryTodoDto): Promise<Todo[]> {
    const { status, search } = queryDto;
    const queryBuilder = this.todoRepository.createQueryBuilder('todo');

    if (status) {
      queryBuilder.andWhere('todo.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(todo.title ILIKE :search OR todo.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    return queryBuilder
      .orderBy('todo.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<Todo> {
    const todo = await this.todoRepository.findOne({ where: { id } });
    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }
    return todo;
  }

  async update(id: string, updateTodoDto: UpdateTodoDto): Promise<Todo> {
    const todo = await this.findOne(id);
    Object.assign(todo, updateTodoDto);
    return this.todoRepository.save(todo);
  }

  async remove(id: string): Promise<void> {
    const todo = await this.findOne(id);
    await this.todoRepository.remove(todo);
  }

//   async getStats(): Promise<any> {
//     const total = await this.todoRepository.count();
//     const completed = await this.todoRepository.count({ where: { status: 'completed' } });
//     const pending = await this.todoRepository.count({ where: { status: 'pending' } });
//     const inProgress = await this.todoRepository.count({ where: { status: 'in_progress' } });

//     return {
//       total,
//       completed,
//       pending,
//       inProgress,
//       completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
//     };
//   }
}