import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/app/App';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock AuthPage and Dashboard components
jest.mock('../src/app/AuthPage', () => {
  return function MockAuthPage({ onLogin }: { onLogin: (user: any, token: string) => void }) {
    return (
      <div data-testid="auth-page">
        <button 
          onClick={() => onLogin({ id: '1', email: 'test@example.com', name: 'Test User' }, 'mock-token')}
          data-testid="mock-login"
        >
          Login
        </button>
      </div>
    );
  };
});

jest.mock('../src/app/Dashboard', () => {
  return function MockDashboard({ user, onLogout }: { user: any, onLogout: () => void }) {
    return (
      <div data-testid="dashboard">
        <span data-testid="user-name">{user.name}</span>
        <button onClick={onLogout} data-testid="logout-btn">Logout</button>
      </div>
    );
  };
});

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders AuthPage when user is not authenticated', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    
    render(<App />);
    
    expect(screen.getByTestId('auth-page')).toBeInTheDocument();
    expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument();
  });

  test('renders Dashboard when user is authenticated with valid localStorage data', async () => {
    mockLocalStorage.getItem.mockImplementation((key: string) => {
      if (key === 'authToken') return 'mock-token';
      if (key === 'user') return JSON.stringify({ id: '1', email: 'test@example.com', name: 'Test User' });
      return null;
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
    });
  });

  test('handles login flow correctly', async () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    const user = userEvent.setup();
    
    render(<App />);
    
    // Initially shows auth page
    expect(screen.getByTestId('auth-page')).toBeInTheDocument();
    
    // Click login button
    await user.click(screen.getByTestId('mock-login'));
    
    // Should now show dashboard
    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
    });
    
    // Verify localStorage was called
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('authToken', 'mock-token');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify({ id: '1', email: 'test@example.com', name: 'Test User' }));
  });

  test('handles logout flow correctly', async () => {
    mockLocalStorage.getItem.mockImplementation((key: string) => {
      if (key === 'authToken') return 'mock-token';
      if (key === 'user') return JSON.stringify({ id: '1', email: 'test@example.com', name: 'Test User' });
      return null;
    });

    const user = userEvent.setup();
    
    render(<App />);
    
    // Wait for dashboard to render
    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });
    
    // Click logout
    await user.click(screen.getByTestId('logout-btn'));
    
    // Should show auth page again
    expect(screen.getByTestId('auth-page')).toBeInTheDocument();
    expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument();
    
    // Verify localStorage was cleared
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('authToken');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
  });

  test('handles corrupted localStorage data gracefully', () => {
    mockLocalStorage.getItem.mockImplementation((key: string) => {
      if (key === 'authToken') return 'mock-token';
      if (key === 'user') return 'invalid-json';
      return null;
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<App />);

    // Should show auth page due to corrupted data
    expect(screen.getByTestId('auth-page')).toBeInTheDocument();
    expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument();
    
    // Should clear corrupted data
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('authToken');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
    
    consoleSpy.mockRestore();
  });
});
