import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import Dashboard from '../src/app/Dashboard';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Dashboard Component', () => {
  const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
  const mockToken = 'mock-token';
  const mockOnLogout = jest.fn();

  const mockTodos = [
    {
      id: 1,
      title: 'Test Todo 1',
      description: 'Description 1',
      status: 'pending',
      userId: 1,
      dueDate: '2025-07-15'
    },
    {
      id: 2,
      title: 'Test Todo 2',
      description: 'Description 2',
      status: 'completed',
      userId: 1,
      dueDate: '2025-07-10'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';
  });

  test('renders dashboard with user welcome message', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockTodos });

    render(<Dashboard user={mockUser} token={mockToken} onLogout={mockOnLogout} />);
    
    expect(screen.getByText('My To Dos')).toBeInTheDocument();
    expect(screen.getByText('Welcome back, Test User!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
  });

  test('fetches and displays todos on mount', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockTodos });

    render(<Dashboard user={mockUser} token={mockToken} onLogout={mockOnLogout} />);
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:3000/todos', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        }
      });
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Todo 1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Todo 2')).toBeInTheDocument();
    });
  });

  test('opens and closes add todo modal', async () => {
    const user = userEvent.setup();
    mockedAxios.get.mockResolvedValueOnce({ data: [] });

    render(<Dashboard user={mockUser} token={mockToken} onLogout={mockOnLogout} />);
    
    // Open modal
    await user.click(screen.getByTitle('Add new todo'));
    expect(screen.getByText('Add New Todo')).toBeInTheDocument();
    
    // Close modal
    await user.click(screen.getByText('×'));
    expect(screen.queryByText('Add New Todo')).not.toBeInTheDocument();
  });

  test('adds new todo successfully', async () => {
    const user = userEvent.setup();
    const newTodo = {
      id: 3,
      title: 'New Todo',
      description: 'New Description',
      status: 'pending',
      userId: 1,
      dueDate: '2025-07-20'
    };

    mockedAxios.get.mockResolvedValueOnce({ data: [] });
    mockedAxios.post.mockResolvedValueOnce({ data: newTodo });

    render(<Dashboard user={mockUser} token={mockToken} onLogout={mockOnLogout} />);
    
    // Open modal
    await user.click(screen.getByTitle('Add new todo'));
    
    // Fill form
    await user.type(screen.getByLabelText('Title'), 'New Todo');
    await user.type(screen.getByLabelText('Description'), 'New Description');
    await user.type(screen.getByLabelText('Due Date (Optional)'), '2025-07-20');
    
    // Submit
    await user.click(screen.getByRole('button', { name: 'Add' }));
    
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3000/todos',
        {
          title: 'New Todo',
          description: 'New Description',
          status: 'pending',
          userId: '1',
          dueDate: '2025-07-20'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token'
          }
        }
      );
    });
  });

  test('toggles todo completion status', async () => {
    const user = userEvent.setup();
    mockedAxios.get.mockResolvedValueOnce({ data: mockTodos });
    mockedAxios.put.mockResolvedValueOnce({ 
      data: { ...mockTodos[0], status: 'completed' } 
    });

    render(<Dashboard user={mockUser} token={mockToken} onLogout={mockOnLogout} />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Todo 1')).toBeInTheDocument();
    });

    const checkbox = screen.getAllByRole('checkbox')[0];
    await user.click(checkbox);
    
    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        'http://localhost:3000/todos/1',
        { status: 'completed' },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token'
          }
        }
      );
    });
  });

  test('displays todo stats correctly', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockTodos });

    render(<Dashboard user={mockUser} token={mockToken} onLogout={mockOnLogout} />);
    
    await waitFor(() => {
      expect(screen.getByText('Total: 2')).toBeInTheDocument();
      expect(screen.getByText('Completed: 1')).toBeInTheDocument();
      expect(screen.getByText('Remaining: 1')).toBeInTheDocument();
    });
  });

  test('displays empty state when no todos', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [] });

    render(<Dashboard user={mockUser} token={mockToken} onLogout={mockOnLogout} />);
    
    await waitFor(() => {
      expect(screen.getByText('No todos yet. Add one above!')).toBeInTheDocument();
    });
  });

  test('shows loading state while fetching todos', () => {
    mockedAxios.get.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

    render(<Dashboard user={mockUser} token={mockToken} onLogout={mockOnLogout} />);
    
    expect(screen.getByText('Loading todos...')).toBeInTheDocument();
  });
});
