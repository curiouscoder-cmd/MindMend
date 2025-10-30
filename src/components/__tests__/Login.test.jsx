import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../Login';
import * as authService from '../../services/authService';

// Mock authService
vi.mock('../../services/authService', () => ({
  signInWithGoogle: vi.fn(),
  signInAnonymous: vi.fn(),
}));

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login component with title', () => {
    render(<Login onLogin={vi.fn()} />);
    expect(screen.getByText(/MindMend AI/i)).toBeInTheDocument();
  });

  it('shows Google sign-in button', () => {
    render(<Login onLogin={vi.fn()} />);
    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    expect(googleButton).toBeInTheDocument();
  });

  it('shows anonymous sign-in button', () => {
    render(<Login onLogin={vi.fn()} />);
    const anonButton = screen.getByRole('button', { name: /continue anonymously/i });
    expect(anonButton).toBeInTheDocument();
  });

  it('calls signInWithGoogle when Google button clicked', async () => {
    const mockUser = { uid: '123', displayName: 'Test User' };
    authService.signInWithGoogle.mockResolvedValue(mockUser);
    const onLogin = vi.fn();

    render(<Login onLogin={onLogin} />);
    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    
    fireEvent.click(googleButton);

    await waitFor(() => {
      expect(authService.signInWithGoogle).toHaveBeenCalledTimes(1);
    });
  });

  it('calls signInAnonymous when anonymous button clicked', async () => {
    const mockUser = { uid: '456', isAnonymous: true };
    authService.signInAnonymous.mockResolvedValue(mockUser);
    const onLogin = vi.fn();

    render(<Login onLogin={onLogin} />);
    const anonButton = screen.getByRole('button', { name: /continue anonymously/i });
    
    fireEvent.click(anonButton);

    await waitFor(() => {
      expect(authService.signInAnonymous).toHaveBeenCalledTimes(1);
    });
  });

  it('displays error message on sign-in failure', async () => {
    authService.signInWithGoogle.mockRejectedValue(new Error('Auth failed'));
    
    render(<Login onLogin={vi.fn()} />);
    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    
    fireEvent.click(googleButton);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during sign-in', async () => {
    authService.signInWithGoogle.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ uid: '123' }), 100))
    );

    render(<Login onLogin={vi.fn()} />);
    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    
    fireEvent.click(googleButton);

    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
  });
});
