'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Todo {
  id: number;
  title: string;
  description: string;
  status: string;
  userId: number;
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
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const API_BASE_URL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  // Helper function to get auth headers
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

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
        userId: user.id
      }, {
        headers: getAuthHeaders(),
      });

      setTodos([...todos, response.data]);
      setTodoTitle('');
      setTodoDescription('');
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          
          {/* Header with user info and logout */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">My To Dos</h1>
              <p className="text-gray-600">Welcome back, {user.name}!</p>
              {/* <p className="text-gray-600">Welcome back, {user.name}!</p> */}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAddTodoModalOpen(true)}
                className="w-10 h-10 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
                title="Add new todo"
              > 
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button
                onClick={onLogout}
                className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
              >
                Logout
              </button>
            </div>
          </div>
          
          {/* Add Todo Modal */}
          {isAddTodoModalOpen && (
            <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Add New Todo</h2>
                  <button
                    onClick={() => setIsAddTodoModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={todoTitle}
                      onChange={(e) => setTodoTitle(e.target.value)}
                      placeholder="Type a title..."
                      className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea 
                      id="description"
                      value={todoDescription}
                      onChange={(e) => setTodoDescription(e.target.value)}
                      placeholder="Type a description for your task..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsAddTodoModalOpen(false)}
                      className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      onClick={addTodo}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                    <div
                      key={todo.id}
                      className="flex flex-col gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors shadow-md"
                    >
                      <div className='flex items-center gap-3'> 
                        <input
                          type="checkbox"
                          checked={todo.status === "completed"}
                          onChange={() => toggleTodo(todo.id, todo.status)}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          value={todo.title}
                          onChange={(e) => updateTodoTitle(todo, e.target.value)}
                          className={`flex-1 bg-transparent border-none outline-none text-lg font-medium ${
                            todo.status === "completed"
                              ? 'line-through text-gray-500'
                              : 'text-gray-800'
                          } focus:bg-white focus:border focus:border-blue-200 focus:rounded px-2 py-1 transition-colors`}
                          placeholder="Todo title..."
                        />
                        
                        <button
                          onClick={() => openTodo(todo.id)}
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
                            onChange={(e) => updateTodoDescription(todo, e.target.value)}
                            className={`w-full bg-transparent border-none outline-none resize-none min-h-[60px] ${
                              todo.status === "completed"
                                ? 'line-through text-gray-500'
                                : 'text-gray-600'
                            } focus:bg-white focus:border focus:border-blue-200 focus:rounded px-2 py-1 transition-colors`}
                            placeholder="Add a description..."
                          />
                          
                          <div className="flex justify-between items-center">
                            <button
                              onClick={() => deleteTodo(todo.id)}
                              className="px-3 py-2 bg-red-600 text-white hover:bg-red-700 rounded transition-colors text-sm"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                            <button
                              onClick={() => saveTodo(todo.id)}
                              className="px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded transition-colors text-sm"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Todo Stats */}
              {todos.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Total: {todos.length}</span>
                    <span>
                      Completed: {todos.filter(todo => todo.status === "completed").length}
                    </span>
                    <span>
                      Remaining: {todos.filter(todo => todo.status === "pending").length}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}