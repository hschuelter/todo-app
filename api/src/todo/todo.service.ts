import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from './entities/todo.entity';
import { User } from '../user/entities/user.entity';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { QueryTodoDto } from './dto/query-todo.dto';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';
import { TodoStatus } from './entities/todo.entity';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private todoRepository: Repository<Todo>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly rabbitmqService: RabbitmqService,
  ) {}

  async create(createTodoDto: CreateTodoDto, userId: string): Promise<Todo> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new BadRequestException(`User with ID ${userId} not found`);
    }

    const todo = this.todoRepository.create({
      ...createTodoDto,
      userId: userId
    });

    var newTodo = await this.todoRepository.save(todo);
    console.log('newTodo', newTodo);

    // Send notification to RabbitMQ
    await this.rabbitmqService.sendTodoCreatedNotification({
      id: newTodo.id,
      title: newTodo.title,
      description: newTodo.description,
      userId: newTodo.userId,
      createdAt: newTodo.createdAt,
    });

    return newTodo;
  }

  async findAll(queryDto: QueryTodoDto, userId: string): Promise<Todo[]> {
    const { status, search } = queryDto;
    const queryBuilder = this.todoRepository.createQueryBuilder('todo')
      .leftJoinAndSelect('todo.user', 'user')
      .where('todo.userId = :userId', { userId }); 

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

  async findOne(id: string, userId: string): Promise<Todo> {
    const todo = await this.todoRepository.findOne({
      where: { id, userId },
      relations: ['user']
    });

    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }

    return todo;
  }

  async update(id: string, updateTodoDto: UpdateTodoDto, userId: string): Promise<Todo> {
    const todo = await this.findOne(id, userId);
    const mergedTodo = this.todoRepository.merge(todo, updateTodoDto);
    return this.todoRepository.save(mergedTodo);
  }

  async remove(id: string, userId: string): Promise<void> {
    const todo = await this.findOne(id, userId);
    await this.todoRepository.remove(todo);
  }

  async getStats(userId: string): Promise<any> {
    const queryBuilder = this.todoRepository.createQueryBuilder('todo')
      .where('todo.userId = :userId', { userId });

    const total = await queryBuilder.getCount();
    
    // Separate query builders for each status
    const completedQuery = this.todoRepository.createQueryBuilder('todo')
      .where('todo.userId = :userId', { userId })
      .andWhere('todo.status = :status', { status: 'completed' });
    const completed = await completedQuery.getCount();
    
    const pendingQuery = this.todoRepository.createQueryBuilder('todo')
      .where('todo.userId = :userId', { userId })
      .andWhere('todo.status = :status', { status: 'pending' });
    const pending = await pendingQuery.getCount();
    
    const inProgressQuery = this.todoRepository.createQueryBuilder('todo')
      .where('todo.userId = :userId', { userId })
      .andWhere('todo.status = :status', { status: 'in_progress' });
    const inProgress = await inProgressQuery.getCount();

    return {
      total,
      completed,
      pending,
      inProgress,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }
}