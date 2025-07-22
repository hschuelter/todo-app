import { useState, useEffect } from 'react';
import axios from 'axios';

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

interface UseTodosProps {
  user: User;
  token: string;
  onLogout: () => void;
}

export const useTodos = ({ user, token, onLogout }: UseTodosProps) => {
  const [todos, setTodos] = useState<Todo[]>([]);
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

  // Error handling helper
  const handleError = (err: any, defaultMessage: string) => {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      onLogout();
      return;
    }
    setError(defaultMessage);
    console.error(defaultMessage, err);
  };

  // Fetch todos on component mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async (): Promise<void> => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_BASE_URL}/todos`, {
        headers: getAuthHeaders(),
      });
      setTodos(response.data);
    } catch (err) {
      handleError(err, 'Failed to load todos');
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (title: string, description: string, dueDate: string): Promise<boolean> => {
    if (!title.trim()) return false;

    try {
      setError('');
      const response = await axios.post(`${API_BASE_URL}/todos`, {
        title,
        description,
        status: "pending",
        userId: user.id,
        dueDate: dueDate || null
      }, {
        headers: getAuthHeaders(),
      });

      setTodos(prev => [...prev, response.data]);
      return true;
    } catch (err) {
      handleError(err, 'Failed to add todo');
      return false;
    }
  };

  const toggleTodo = async (id: number, status: string): Promise<void> => {
    try {
      setError('');
      const response = await axios.put(`${API_BASE_URL}/todos/${id}`, {
        status: status === "completed" ? "pending" : "completed",
      }, {
        headers: getAuthHeaders(),
      });

      setTodos(prev => prev.map(todo => 
        todo.id === id ? response.data : todo
      ));
    } catch (err) {
      handleError(err, 'Failed to update todo');
    }
  };

  const deleteTodo = async (id: number): Promise<void> => {
    try {
      setError('');
      await axios.delete(`${API_BASE_URL}/todos/${id}`, {
        headers: getAuthHeaders(),
      });

      setTodos(prev => prev.filter(todo => todo.id !== id));
    } catch (err) {
      handleError(err, 'Failed to delete todo');
    }
  };

  const openTodo = (id: number): void => {
    setTodos(prev => 
      prev.map(todo => 
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
      setError('');
      const response = await axios.put(`${API_BASE_URL}/todos/${id}`, {
        title: currentTodo.title,
        description: currentTodo.description,
        status: currentTodo.status,
        dueDate: currentTodo.dueDate || null
      }, {
        headers: getAuthHeaders(),
      });

      setTodos(prev => prev.map(todo => 
        todo.id === id ? response.data : todo
      ));
    } catch (err) {
      handleError(err, 'Failed to update todo');
    }
  };

  const updateTodoTitle = (todo: Todo, title: string) => {
    setTodos(prev => prev.map(t => t.id === todo.id ? { ...t, title } : t));
  };
  
  const updateTodoDescription = (todo: Todo, description: string) => {
    setTodos(prev => prev.map(t => t.id === todo.id ? { ...t, description } : t));
  };

  const updateTodoDueDate = (todo: Todo, dueDate: string) => {
    setTodos(prev => prev.map(t => t.id === todo.id ? { ...t, dueDate } : t));
  };

  const clearError = () => setError('');

  return {
    todos,
    loading,
    error,
    addTodo,
    toggleTodo,
    deleteTodo,
    openTodo,
    saveTodo,
    updateTodoTitle,
    updateTodoDescription,
    updateTodoDueDate,
    clearError,
    // Helper functions
    formatDate,
    isOverdue,
    getDueDateColor,
  };
};