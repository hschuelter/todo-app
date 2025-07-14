import React from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onAddTodo: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onAddTodo }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">My To Dos</h1>
        <p className="text-gray-600">Welcome back, {user.name}!</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onAddTodo}
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
  );
};

export default Header;