'use client';

import TodoItem from '../components/Todo/TodoItem'
import TodoStats from '../components/Todo/TodoStats';
import AddTodoModal from '../components/Todo/AddTodoModal';
import Header from '../components/Layout/Header';
import { useTodos } from '../hooks/useTodos';
import { useAddTodoModal } from '../hooks/useAddTodoModal';

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
  const {
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
    formatDate,
    isOverdue,
    getDueDateColor,
  } = useTodos({ user, token, onLogout });

  const {
    isOpen: isAddTodoModalOpen,
    todoTitle,
    todoDescription,
    todoDueDate,
    isSubmitting,
    setTodoTitle,
    setTodoDescription,
    setTodoDueDate,
    openModal: openAddTodoModal,
    closeModal: closeAddTodoModal,
    handleSubmit: handleAddTodoSubmit,
  } = useAddTodoModal({ onAddTodo: addTodo });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          
          <Header
            user={user}
            onLogout={onLogout}
            onAddTodo={openAddTodoModal}
          />

          <AddTodoModal
            isOpen={isAddTodoModalOpen}
            onClose={closeAddTodoModal}
            onSubmit={handleAddTodoSubmit}
            todoTitle={todoTitle}
            setTodoTitle={setTodoTitle}
            todoDescription={todoDescription}
            setTodoDescription={setTodoDescription}
            todoDueDate={todoDueDate}
            setTodoDueDate={setTodoDueDate}
            isSubmitting={isSubmitting}
          />

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <div className="flex justify-between items-center">
                <span>{error}</span>
                <button
                  onClick={clearError}
                  className="text-red-700 hover:text-red-900 ml-4"
                >
                  ×
                </button>
              </div>
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
                  {todos.map((todo) => (
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