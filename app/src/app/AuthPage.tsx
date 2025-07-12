'use client';

import { useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthPageProps {
  onLogin: (user: User, token: string) => void;
}

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const API_BASE_URL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const handleAuth = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      const endpoint = isLoginMode ? '/auth/login' : '/auth/register';
      const body = isLoginMode 
        ? { email, password }
        : { email, password, name };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Authentication failed');
      }

      const data = await response.json();
      
      // Log the successful login data for tests only
      // console.log('Login successful:', data);
      onLogin(data.user, data.accessToken);
      
      // Clear form
      setEmail('');
      setPassword('');
      setName('');
      
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAuth(e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isLoginMode ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-600">
            {isLoginMode ? 'Sign in to your account' : 'Sign up to get started'}
          </p>
        </div>

        <div className="space-y-6">
          {!isLoginMode && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={handleKeyPress}
                required={!isLoginMode}
                className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your name"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              required
              className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              required
              className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
            />
          </div>

          {authError && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {authError}
            </div>
          )}

          <button
            type="submit"
            disabled={authLoading}
            onClick={handleAuth}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {authLoading ? 'Please wait...' : (isLoginMode ? 'Sign In' : 'Sign Up')}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setAuthError('');
              }}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {isLoginMode ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}