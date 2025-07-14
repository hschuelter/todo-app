'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

import TodoItem from '../Components/Todo/TodoItem'
import TodoStats from '../Components/Todo/TodoStats';
import AddTodoModal from '../Components/Todo/AddTodoModal';
import Header from '../Components/Layout/Header';

interface Todo {
  id: number;
  title: string;
  description: string;
  status: string;
  userId: number;
  dueDate?: string;
  isOpen?: boolean;
}

interface User {
  id: string;
  email: string;
  name: string;
}

interface TodoAppProps {
  user: User;
  token: string;
  onLogout: () => void;
}

export default function TodoApp({ user, token, onLogout }: TodoAppProps) {
  const [isAddTodoModalOpen, setIsAddTodoModalOpen] = useState(false);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todoTitle, setTodoTitle] = useState<string>('');
  const [todoDescription, setTodoDescription] = useState<string>('');
  const [todoDueDate, setTodoDueDate] = useState<string>(''); // Added due date state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const API_BASE_URL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  // Helper function to get auth headers
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  // Helper function to format date for display
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC'
    });
  };

  // Helper function to check if todo is overdue
  const isOverdue = (dueDate: string, status: string): boolean => {
    if (!dueDate || status === 'completed') return false;
    return new Date(dueDate) < new Date();
  };

  // Helper function to get due date color
  const getDueDateColor = (dueDate: string, status: string): string => {
    if (!dueDate || status === 'completed') return 'text-gray-500';
    if (isOverdue(dueDate, status)) return 'text-red-500';
    
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) return 'text-orange-500';
    if (diffDays <= 3) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Fetch todos on component mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/todos`, {
        headers: getAuthHeaders(),
      });
      setTodos(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        onLogout();
        return;
      }
      setError('Failed to load todos');
      console.error('Error fetching todos:', err);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (e: React.FormEvent<HTMLFormElement> | React.MouseEvent): Promise<void> => {
    e.preventDefault();
    if (!todoTitle.trim()) return;

    try {
      const response = await axios.post(`${API_BASE_URL}/todos`, {
        title: todoTitle,
        description: todoDescription,
        status: "pending",
        userId: user.id,
        dueDate: todoDueDate || null // Include due date in API call
      }, {
        headers: getAuthHeaders(),
      });

      setTodos([...todos, response.data]);
      setTodoTitle('');
      setTodoDescription('');
      setTodoDueDate(''); // Reset due date
      setIsAddTodoModalOpen(false);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        onLogout();
        return;
      }
      setError('Failed to add todo');
      console.error('Error adding todo:', err);
    }
  };

  const toggleTodo = async (id: number, status: string): Promise<void> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/todos/${id}`, {
        status: status === "completed" ? "pending" : "completed",
      }, {
        headers: getAuthHeaders(),
      });

      setTodos(todos.map(todo => 
        todo.id === id ? response.data : todo
      ));
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        onLogout();
        return;
      }
      setError('Failed to update todo');
      console.error('Error updating todo:', err);
    }
  };

  const deleteTodo = async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/todos/${id}`, {
        headers: getAuthHeaders(),
      });

      setTodos(todos.filter(todo => todo.id !== id));
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        onLogout();
        return;
      }
      setError('Failed to delete todo');
      console.error('Error deleting todo:', err);
    }
  };

  const openTodo = (id: number): void => {
    setTodos(prevTodos => 
      prevTodos.map(todo => 
        todo.id === id 
          ? { ...todo, isOpen: !todo.isOpen }
          : todo
      )
    );
  };

  const saveTodo = async (id: number): Promise<void> => {
    const currentTodo = todos.find(t => t.id === id);
    if (!currentTodo) return;

    try {
      const response = await axios.put(`${API_BASE_URL}/todos/${id}`, {
        title: currentTodo.title,
        description: currentTodo.description,
        status: currentTodo.status,
        dueDate: currentTodo.dueDate || null // Include due date in save
      }, {
        headers: getAuthHeaders(),
      });

      setTodos(todos.map(todo => 
        todo.id === id ? response.data : todo
      ));
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        onLogout();
        return;
      }
      setError('Failed to update todo');
      console.error('Error updating todo:', err);
    }
  };

  const updateTodoTitle = (todo: Todo, title: string) => {
    setTodos(todos.map(t => t.id === todo.id ? { ...t, title } : t));
  };
  
  const updateTodoDescription = (todo: Todo, description: string) => {
    setTodos(todos.map(t => t.id === todo.id ? { ...t, description } : t));
  };

  const updateTodoDueDate = (todo: Todo, dueDate: string) => {
    setTodos(todos.map(t => t.id === todo.id ? { ...t, dueDate } : t));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          
          <Header
            user={user}
            onLogout={onLogout}
            onAddTodo={() => setIsAddTodoModalOpen(true)}
          />

          <AddTodoModal
            isOpen={isAddTodoModalOpen}
            onClose={() => setIsAddTodoModalOpen(false)}
            onSubmit={addTodo}
            todoTitle={todoTitle}
            setTodoTitle={setTodoTitle}
            todoDescription={todoDescription}
            setTodoDescription={setTodoDescription}
            todoDueDate={todoDueDate}
            setTodoDueDate={setTodoDueDate}
          />

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading todos...</p>
            </div>
          ) : (
            <>
              {/* Todo List */}
              {todos.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-white">
                  <p>No todos yet. Add one above!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {todos.map((todo: Todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onToggle={toggleTodo}
                      onUpdateTitle={updateTodoTitle}
                      onUpdateDescription={updateTodoDescription}
                      onUpdateDueDate={updateTodoDueDate}
                      onDelete={deleteTodo}
                      onSave={saveTodo}
                      onToggleOpen={openTodo}
                      isOverdue={isOverdue}
                      formatDate={formatDate}
                      getDueDateColor={getDueDateColor}
                    />
                  ))}
                </div>
              )}

              {/* Todo Stats */}
              {todos.length > 0 && (
                <TodoStats 
                  todos={todos} 
                  isOverdue={isOverdue} 
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}