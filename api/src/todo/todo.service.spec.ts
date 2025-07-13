import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { NotFoundException, BadRequestException } from '@nestjs/common';

import { TodoService } from './todo.service';
import { Todo, TodoStatus } from './entities/todo.entity';
import { User } from '../user/entities/user.entity';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { QueryTodoDto } from './dto/query-todo.dto';

describe('TodoService', () => {
  let service: TodoService;
  let todoRepository: Repository<Todo>;
  let userRepository: Repository<User>;
  let cacheManager: Cache;
  let rabbitmqService: RabbitmqService;

  // Mock data
  const mockUser: User = {
    id: 'user-123',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashed-password',
    todos: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTodo: Todo = {
    id: 'todo-123',
    title: 'Test Todo',
    description: 'Test Description',
    status: TodoStatus.PENDING,
    dueDate: new Date('2024-12-31'),
    userId: 'user-123',
    user: mockUser,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        {
          provide: getRepositoryToken(Todo),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            merge: jest.fn(),
            remove: jest.fn(),
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
        {
          provide: RabbitmqService,
          useValue: {
            sendTodoCreatedNotification: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TodoService>(TodoService);
    todoRepository = module.get<Repository<Todo>>(getRepositoryToken(Todo));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    cacheManager = module.get<Cache>(CACHE_MANAGER);
    rabbitmqService = module.get<RabbitmqService>(RabbitmqService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new todo successfully', async () => {
      // Arrange
      const createTodoDto: CreateTodoDto = {
        title: 'New Todo',
        description: 'New Description',
        status: TodoStatus.PENDING,
        userId: 'user-123',
      };

      const createdTodo: Todo = {
        ...mockTodo,
        title: createTodoDto.title,
        description: createTodoDto.description,
        status: createTodoDto.status || TodoStatus.PENDING,
        userId: createTodoDto.userId,
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(todoRepository, 'create').mockReturnValue(createdTodo);
      jest.spyOn(todoRepository, 'save').mockResolvedValue(createdTodo);
      jest.spyOn(cacheManager, 'del').mockResolvedValue(true);
      jest.spyOn(rabbitmqService, 'sendTodoCreatedNotification').mockResolvedValue(undefined);

      // Act
      const result = await service.create(createTodoDto, 'user-123');

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-123' }
      });
      expect(todoRepository.create).toHaveBeenCalledWith({
        ...createTodoDto,
        userId: 'user-123'
      });
      expect(todoRepository.save).toHaveBeenCalledWith(createdTodo);
      expect(rabbitmqService.sendTodoCreatedNotification).toHaveBeenCalledWith({
        id: createdTodo.id,
        title: createdTodo.title,
        description: createdTodo.description,
        userId: createdTodo.userId,
        createdAt: createdTodo.createdAt,
      });
      expect(result).toEqual(createdTodo);
    });

    it('should throw BadRequestException when user not found', async () => {
      // Arrange
      const createTodoDto: CreateTodoDto = {
        title: 'New Todo',
        description: 'New Description',
        status: TodoStatus.PENDING,
        userId: 'nonexistent-user',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(createTodoDto, 'nonexistent-user'))
        .rejects
        .toThrow(new BadRequestException('User with ID nonexistent-user not found'));

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'nonexistent-user' }
      });
      expect(todoRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return todos from cache if available', async () => {
      // Arrange
      const queryDto: QueryTodoDto = { status: TodoStatus.PENDING };
      const cachedTodos = [mockTodo];
      
      jest.spyOn(cacheManager, 'get').mockResolvedValue(cachedTodos);

      // Act
      const result = await service.findAll(queryDto, 'user-123');

      // Assert
      expect(cacheManager.get).toHaveBeenCalledWith('todo:findAll:user-123:pending:');
      expect(result).toEqual(cachedTodos);
      expect(todoRepository.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('should fetch todos from database and cache them when cache is empty', async () => {
      // Arrange
      const queryDto: QueryTodoDto = { status: TodoStatus.PENDING, search: 'test' };
      const todos = [mockTodo];
      
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      jest.spyOn(cacheManager, 'set').mockResolvedValue(undefined);
      mockQueryBuilder.getMany.mockResolvedValue(todos);

      // Act
      const result = await service.findAll(queryDto, 'user-123');

      // Assert
      expect(cacheManager.get).toHaveBeenCalledWith('todo:findAll:user-123:pending:test');
      expect(todoRepository.createQueryBuilder).toHaveBeenCalledWith('todo');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('todo.user', 'user');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('todo.userId = :userId', { userId: 'user-123' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('todo.status = :status', { status: 'pending' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(todo.title ILIKE :search OR todo.description ILIKE :search)',
        { search: '%test%' }
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('todo.createdAt', 'DESC');
      expect(cacheManager.set).toHaveBeenCalledWith('todo:findAll:user-123:pending:test', todos, 300000);
      expect(result).toEqual(todos);
    });
  });

  describe('findOne', () => {
    it('should return a todo when found', async () => {
      // Arrange
      jest.spyOn(todoRepository, 'findOne').mockResolvedValue(mockTodo);

      // Act
      const result = await service.findOne('todo-123', 'user-123');

      // Assert
      expect(todoRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'todo-123', userId: 'user-123' },
        relations: ['user']
      });
      expect(result).toEqual(mockTodo);
    });

    it('should throw NotFoundException when todo not found', async () => {
      // Arrange
      jest.spyOn(todoRepository, 'findOne').mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne('nonexistent-todo', 'user-123'))
        .rejects
        .toThrow(new NotFoundException('Todo with ID nonexistent-todo not found'));

      expect(todoRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'nonexistent-todo', userId: 'user-123' },
        relations: ['user']
      });
    });
  });

  describe('update', () => {
    it('should update a todo successfully', async () => {
      // Arrange
      const updateTodoDto: UpdateTodoDto = {
        title: 'Updated Todo',
        status: TodoStatus.COMPLETED,
      };

      const updatedTodo: Todo = { 
        ...mockTodo, 
        title: updateTodoDto.title!,
        status: updateTodoDto.status!
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockTodo);
      jest.spyOn(todoRepository, 'merge').mockReturnValue(updatedTodo);
      jest.spyOn(todoRepository, 'save').mockResolvedValue(updatedTodo);
      jest.spyOn(cacheManager, 'del').mockResolvedValue(true);

      // Act
      const result = await service.update('todo-123', updateTodoDto, 'user-123');

      // Assert
      expect(service.findOne).toHaveBeenCalledWith('todo-123', 'user-123');
      expect(todoRepository.merge).toHaveBeenCalledWith(mockTodo, updateTodoDto);
      expect(todoRepository.save).toHaveBeenCalledWith(updatedTodo);
      expect(result).toEqual(updatedTodo);
    });

    it('should throw NotFoundException when todo to update is not found', async () => {
      // Arrange
      const updateTodoDto: UpdateTodoDto = { title: 'Updated Todo' };

      jest.spyOn(service, 'findOne').mockRejectedValue(
        new NotFoundException('Todo with ID nonexistent-todo not found')
      );

      // Act & Assert
      await expect(service.update('nonexistent-todo', updateTodoDto, 'user-123'))
        .rejects
        .toThrow(new NotFoundException('Todo with ID nonexistent-todo not found'));

      expect(service.findOne).toHaveBeenCalledWith('nonexistent-todo', 'user-123');
      expect(todoRepository.merge).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a todo successfully', async () => {
      // Arrange
      jest.spyOn(service, 'findOne').mockResolvedValue(mockTodo);
      jest.spyOn(todoRepository, 'remove').mockResolvedValue(mockTodo);
      jest.spyOn(cacheManager, 'del').mockResolvedValue(true);

      // Act
      await service.remove('todo-123', 'user-123');

      // Assert
      expect(service.findOne).toHaveBeenCalledWith('todo-123', 'user-123');
      expect(todoRepository.remove).toHaveBeenCalledWith(mockTodo);
    });

    it('should throw NotFoundException when todo to remove is not found', async () => {
      // Arrange
      jest.spyOn(service, 'findOne').mockRejectedValue(
        new NotFoundException('Todo with ID nonexistent-todo not found')
      );

      // Act & Assert
      await expect(service.remove('nonexistent-todo', 'user-123'))
        .rejects
        .toThrow(new NotFoundException('Todo with ID nonexistent-todo not found'));

      expect(service.findOne).toHaveBeenCalledWith('nonexistent-todo', 'user-123');
      expect(todoRepository.remove).not.toHaveBeenCalled();
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', async () => {
      // Arrange
      const mockCounts = {
        total: 10,
        completed: 6,
        pending: 3,
        inProgress: 1,
      };

      // Mock different query builders for each status
      mockQueryBuilder.getCount
        .mockResolvedValueOnce(mockCounts.total)      // total count
        .mockResolvedValueOnce(mockCounts.completed)  // completed count
        .mockResolvedValueOnce(mockCounts.pending)    // pending count
        .mockResolvedValueOnce(mockCounts.inProgress); // in progress count

      // Act
      const result = await service.getStats('user-123');

      // Assert
      expect(result).toEqual({
        total: 10,
        completed: 6,
        pending: 3,
        inProgress: 1,
        completionRate: 60, // (6/10) * 100
      });

      expect(todoRepository.createQueryBuilder).toHaveBeenCalledTimes(4);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('todo.userId = :userId', { userId: 'user-123' });
    });

    it('should return 0 completion rate when no todos exist', async () => {
      // Arrange
      mockQueryBuilder.getCount.mockResolvedValue(0);

      // Act
      const result = await service.getStats('user-123');

      // Assert
      expect(result).toEqual({
        total: 0,
        completed: 0,
        pending: 0,
        inProgress: 0,
        completionRate: 0,
      });
    });
  });
});