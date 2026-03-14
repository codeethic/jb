import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import LoginPage from './page';

// Mock next/navigation
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

// Mock auth context
const mockLogin = jest.fn();
let mockUser: any = null;
jest.mock('@/lib/auth-context', () => ({
  useAuth: () => ({ user: mockUser, login: mockLogin }),
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = null;
  });

  it('should render login form', () => {
    render(<LoginPage />);
    expect(screen.getByText('Sign in to FeatureBoard')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('should redirect to dashboard if already logged in', () => {
    mockUser = { id: '1', name: 'Test', role: 'admin' };
    render(<LoginPage />);
    expect(mockReplace).toHaveBeenCalledWith('/dashboard');
  });

  it('should show error on failed login', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ data: null, error: 'Invalid credentials' }),
    });

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('should call login and redirect on success', async () => {
    const mockResponse = {
      data: {
        accessToken: 'jwt-token',
        user: { id: '1', email: 'test@test.com', name: 'Test', role: 'chef', restaurantId: 'r1', active: true },
      },
      error: null,
    };
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('jwt-token', mockResponse.data.user);
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should show network error on fetch failure', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(screen.getByText('Network error. Please try again.')).toBeInTheDocument();
    });
  });

  it('should show loading state while submitting', async () => {
    let resolvePromise: (value: any) => void;
    const fetchPromise = new Promise((resolve) => { resolvePromise = resolve; });
    mockFetch.mockReturnValue(fetchPromise);

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(screen.getByRole('button', { name: 'Signing in...' })).toBeDisabled();

    // Resolve to avoid hanging and act() warning
    await act(async () => {
      resolvePromise!({ ok: true, json: () => Promise.resolve({ data: { accessToken: 'x', user: {} }, error: null }) });
    });
  });
});
