import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CBTExercise from '../CBTExercise';

// Mock firestoreService
vi.mock('../../services/firestoreService', () => ({
  saveExerciseCompletion: vi.fn(() => Promise.resolve('session-123')),
}));

describe('CBTExercise Component', () => {
  const mockMood = {
    id: 'anxious',
    label: 'Anxious',
    color: 'yellow',
  };

  const mockOnComplete = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders exercise interface', () => {
    render(
      <CBTExercise
        mood={mockMood}
        onComplete={mockOnComplete}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText(/CBT Exercise/i)).toBeInTheDocument();
  });

  it('displays mood-specific exercise content', () => {
    render(
      <CBTExercise
        mood={mockMood}
        onComplete={mockOnComplete}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText(/anxious/i)).toBeInTheDocument();
  });

  it('shows exercise steps', () => {
    render(
      <CBTExercise
        mood={mockMood}
        onComplete={mockOnComplete}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText(/Step 1/i)).toBeInTheDocument();
  });

  it('allows user to input responses', () => {
    render(
      <CBTExercise
        mood={mockMood}
        onComplete={mockOnComplete}
        onBack={mockOnBack}
      />
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'My thoughts' } });

    expect(textarea.value).toBe('My thoughts');
  });

  it('validates user input before proceeding', () => {
    render(
      <CBTExercise
        mood={mockMood}
        onComplete={mockOnComplete}
        onBack={mockOnBack}
      />
    );

    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    expect(screen.getByText(/Please complete/i)).toBeInTheDocument();
  });

  it('progresses through exercise steps', async () => {
    render(
      <CBTExercise
        mood={mockMood}
        onComplete={mockOnComplete}
        onBack={mockOnBack}
      />
    );

    const textarea = screen.getByRole('textbox');
    const nextButton = screen.getByRole('button', { name: /next/i });

    // Complete step 1
    fireEvent.change(textarea, { target: { value: 'Step 1 response' } });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText(/Step 2/i)).toBeInTheDocument();
    });
  });

  it('calls onComplete when exercise is finished', async () => {
    render(
      <CBTExercise
        mood={mockMood}
        onComplete={mockOnComplete}
        onBack={mockOnBack}
      />
    );

    // Complete all steps (simplified)
    const completeButton = screen.getByRole('button', { name: /complete/i });
    fireEvent.click(completeButton);

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });

  it('awards points on completion', async () => {
    render(
      <CBTExercise
        mood={mockMood}
        onComplete={mockOnComplete}
        onBack={mockOnBack}
      />
    );

    const completeButton = screen.getByRole('button', { name: /complete/i });
    fireEvent.click(completeButton);

    await waitFor(() => {
      expect(screen.getByText(/\+10 points/i)).toBeInTheDocument();
    });
  });

  it('saves exercise completion to Firestore', async () => {
    const { saveExerciseCompletion } = await import('../../services/firestoreService');

    render(
      <CBTExercise
        mood={mockMood}
        onComplete={mockOnComplete}
        onBack={mockOnBack}
      />
    );

    const completeButton = screen.getByRole('button', { name: /complete/i });
    fireEvent.click(completeButton);

    await waitFor(() => {
      expect(saveExerciseCompletion).toHaveBeenCalled();
    });
  });

  it('allows user to go back', () => {
    render(
      <CBTExercise
        mood={mockMood}
        onComplete={mockOnComplete}
        onBack={mockOnBack}
      />
    );

    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalled();
  });

  it('tracks exercise progress', () => {
    render(
      <CBTExercise
        mood={mockMood}
        onComplete={mockOnComplete}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText(/Progress: 0%/i)).toBeInTheDocument();
  });
});
