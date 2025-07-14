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

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number, status: string) => void;
  onUpdateTitle: (todo: Todo, title: string) => void;
  onUpdateDescription: (todo: Todo, description: string) => void;
  onUpdateDueDate: (todo: Todo, dueDate: string) => void;
  onDelete: (id: number) => void;
  onSave: (id: number) => void;
  onToggleOpen: (id: number) => void;
  isOverdue: (dueDate: string, status: string) => boolean;
  formatDate: (date: string) => string;
  getDueDateColor: (dueDate: string, status: string) => string;
}

const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggle,
  onUpdateTitle,
  onUpdateDescription,
  onUpdateDueDate,
  onDelete,
  onSave,
  onToggleOpen,
  isOverdue,
  formatDate,
  getDueDateColor,
}) => {
  return (
    <div
      className={`flex flex-col gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors shadow-md ${
        isOverdue(todo.dueDate || '', todo.status) ? 'bg-red-50' : 'bg-gray-50'
      }`}
    >
      <div className='flex items-center gap-3'> 
        <input
          type="checkbox"
          checked={todo.status === "completed"}
          onChange={() => onToggle(todo.id, todo.status)}
          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
        />
        <div className="flex-1 space-y-1">
          <input
            type="text"
            value={todo.title}
            onChange={(e) => onUpdateTitle(todo, e.target.value)}
            className={`w-full bg-transparent border-none outline-none text-lg font-medium ${
              todo.status === "completed"
                ? 'line-through text-gray-500'
                : 'text-gray-800'
            } focus:bg-white focus:border focus:border-blue-200 focus:rounded px-2 py-1 transition-colors`}
            placeholder="Todo title..."
          />
          {todo.dueDate && (
            <div className={`text-sm px-2 ${getDueDateColor(todo.dueDate, todo.status)}`}>
              Due: {formatDate(todo.dueDate)}
              {isOverdue(todo.dueDate, todo.status) && (
                <span className="ml-2 text-red-600 font-medium">OVERDUE</span>
              )}
            </div>
          )}
        </div>
        
        <button
          onClick={() => onToggleOpen(todo.id)}
          className="px-1 py-1 bg-gray-200 text-gray-600 hover:bg-gray-300 rounded transition-colors"
        >
          <svg 
            className="w-4 h-4 transition-transform duration-200"
            style={{ transform: todo.isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {todo.isOpen && (
        <div className="space-y-3">
          <textarea
            value={todo.description || ''}
            onChange={(e) => onUpdateDescription(todo, e.target.value)}
            className={`w-full bg-transparent border-none outline-none resize-none min-h-[60px] ${
              todo.status === "completed"
                ? 'line-through text-gray-500'
                : 'text-gray-600'
            } focus:bg-white focus:border focus:border-blue-200 focus:rounded px-2 py-1 transition-colors`}
            placeholder="Add a description..."
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={todo.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : ''}
              onChange={(e) => onUpdateDueDate(todo, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex justify-between items-center">
            <button
              onClick={() => onDelete(todo.id)}
              className="px-3 py-2 bg-red-600 text-white hover:bg-red-700 rounded transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button
              onClick={() => onSave(todo.id)}
              className="px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded transition-colors text-sm"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoItem;