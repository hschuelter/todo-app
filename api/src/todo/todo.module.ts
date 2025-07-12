import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoService } from './todo.service';
import { TodoController } from './todo.controller';
import { Todo } from './entities/todo.entity';
import { User } from '../user/entities/user.entity';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    TypeOrmModule.forFeature([Todo, User]),
    CacheModule.register(),
    RabbitmqModule
  ],
  controllers: [TodoController],
  providers: [TodoService],
})
export class TodoModule {}