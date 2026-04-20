import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../pages/LoginPage';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// Mock AuthContext
const mockLogin = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    isLoggedIn: false,
    username: null,
    role: null,
    logout: vi.fn(),
  }),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form', () => {
    render(<LoginPage />);

    expect(screen.getByText('💱 Currency Converter')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('shows loading state while signing in', async () => {
    const user = userEvent.setup();
    mockLogin.mockImplementation(() => new Promise(() => {}));

    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText('Enter username'), 'admin');
    await user.type(screen.getByPlaceholderText('Enter password'), 'Admin@123!');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(screen.getByRole('button', { name: 'Signing in…' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Signing in…' })).toBeDisabled();
  });

  it('navigates to /convert on successful login', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce(undefined);

    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText('Enter username'), 'admin');
    await user.type(screen.getByPlaceholderText('Enter password'), 'Admin@123!');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/convert', { replace: true });
    });
  });

  it('shows error on failed login', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValueOnce(new Error('Invalid'));

    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText('Enter username'), 'wrong');
    await user.type(screen.getByPlaceholderText('Enter password'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/)).toBeInTheDocument();
    });
  });

  it('shows demo account hint', () => {
    render(<LoginPage />);
    expect(screen.getByText(/Demo accounts/)).toBeInTheDocument();
  });
});
