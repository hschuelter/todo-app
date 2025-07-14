'use client';

import { useState, useEffect } from 'react';
import AuthPage from './Pages/AuthPage';
import Dashboard from './Pages/Dashboard';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export default function App() {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false
  });

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setAuth({
          user,
          token,
          isAuthenticated: true
        });
      } catch (err) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        console.error('Failed to parse stored user data:', err);
      }
    }
  }, []);

  // Handle successful login
  const handleLogin = (user: User, token: string) => {
    // Store token and user data
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    setAuth({
      user,
      token,
      isAuthenticated: true
    });
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setAuth({
      user: null,
      token: null,
      isAuthenticated: false
    });
  };

  // Render component based on authentication state
  if (!auth.isAuthenticated) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <Dashboard 
      user={auth.user!} 
      token={auth.token!}
      onLogout={handleLogout} 
      />
    );
}