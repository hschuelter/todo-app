import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoService } from './todo.service';
import { TodoController } from './todo.controller';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';
import { Todo } from './entities/todo.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Todo, User]),
    RabbitmqModule
  ],
  controllers: [TodoController],
  providers: [TodoService],
})
export class TodoModule {}