import { IsOptional, IsEnum, IsString, IsUUID } from 'class-validator';
import { TodoStatus } from '../entities/todo.entity';

export class QueryTodoDto {
  @IsOptional()
  @IsEnum(TodoStatus)
  status?: TodoStatus;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;
}