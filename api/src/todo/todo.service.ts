import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from './entities/todo.entity';
import { User } from '../user/entities/user.entity';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { QueryTodoDto } from './dto/query-todo.dto';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private todoRepository: Repository<Todo>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createTodoDto: CreateTodoDto): Promise<Todo> {
    // Verify user exists
    const user = await this.userRepository.findOne({
      where: { id: createTodoDto.userId }
    });

    if (!user) {
      throw new BadRequestException(`User with ID ${createTodoDto.userId} not found`);
    }

    const todo = this.todoRepository.create(createTodoDto);
    return this.todoRepository.save(todo);
  }

  async findAll(queryDto: QueryTodoDto): Promise<Todo[]> {
    const { status, search, userId } = queryDto;
    const queryBuilder = this.todoRepository.createQueryBuilder('todo')
      .leftJoinAndSelect('todo.user', 'user');

    if (status) {
      queryBuilder.andWhere('todo.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(todo.title ILIKE :search OR todo.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (userId) {
      queryBuilder.andWhere('todo.userId = :userId', { userId });
    }

    return queryBuilder
      .orderBy('todo.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<Todo> {
    const todo = await this.todoRepository.findOne({
      where: { id },
      relations: ['user']
    });

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

  async getStats(userId?: string): Promise<any> {
    const queryBuilder = this.todoRepository.createQueryBuilder('todo');
    
    if (userId) {
      queryBuilder.where('todo.userId = :userId', { userId });
    }

    const total = await queryBuilder.getCount();
    const completed = await queryBuilder.andWhere('todo.status = :status', { status: 'completed' }).getCount();
    
    queryBuilder.andWhere('todo.status = :status', { status: 'pending' });
    const pending = await queryBuilder.getCount();
    
    queryBuilder.andWhere('todo.status = :status', { status: 'in_progress' });
    const inProgress = await queryBuilder.getCount();

    return {
      total,
      completed,
      pending,
      inProgress,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }
}