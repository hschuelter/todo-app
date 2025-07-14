import React from 'react';

interface Todo {
  id: number;
  title: string;
  description: string;
  status: string;
  userId: number;
  dueDate?: string;
  isOpen?: boolean;
}

interface TodoStatsProps {
  todos: Todo[];
  isOverdue: (dueDate: string, status: string) => boolean;
}

const TodoStats: React.FC<TodoStatsProps> = ({
  todos,
  isOverdue,
}) => {
  return (
    <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm text-gray-600">
        <span>Total: {todos.length}</span>
        <span>
            Completed: {todos.filter(todo => todo.status === "completed").length}
        </span>
        <span>
            Remaining: {todos.filter(todo => todo.status === "pending").length}
        </span>
        <span className="text-red-600">
            Overdue: {todos.filter(todo => isOverdue(todo.dueDate || '', todo.status)).length}
        </span>
        </div>
    </div>
  );
};

export default TodoStats;