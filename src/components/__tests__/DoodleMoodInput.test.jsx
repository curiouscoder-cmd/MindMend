import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DoodleMoodInput from '../DoodleMoodInput';

// Mock Cloud Functions
vi.mock('../../services/cloudFunctions', () => ({
  analyzeDoodle: vi.fn(() => Promise.resolve({
    mood: 'happy',
    confidence: 0.85,
    labels: ['smile', 'bright colors'],
  })),
}));

describe('DoodleMoodInput Component', () => {
  const mockOnMoodDetected = vi.fn();
  const mockOnDoodleComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders canvas for drawing', () => {
    render(
      <DoodleMoodInput
        onMoodDetected={mockOnMoodDetected}
        onDoodleComplete={mockOnDoodleComplete}
      />
    );

    const canvas = screen.getByRole('img', { name: /drawing canvas/i });
    expect(canvas).toBeInTheDocument();
  });

  it('provides drawing tools', () => {
    render(
      <DoodleMoodInput
        onMoodDetected={mockOnMoodDetected}
        onDoodleComplete={mockOnDoodleComplete}
      />
    );

    expect(screen.getByRole('button', { name: /brush/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /eraser/i })).toBeInTheDocument();
  });

  it('allows color selection', () => {
    render(
      <DoodleMoodInput
        onMoodDetected={mockOnMoodDetected}
        onDoodleComplete={mockOnDoodleComplete}
      />
    );

    const colorPicker = screen.getByLabelText(/color/i);
    expect(colorPicker).toBeInTheDocument();
  });

  it('clears canvas when clear button is clicked', () => {
    render(
      <DoodleMoodInput
        onMoodDetected={mockOnMoodDetected}
        onDoodleComplete={mockOnDoodleComplete}
      />
    );

    const clearButton = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearButton);

    // Canvas should be cleared
  });

  it('analyzes doodle when analyze button is clicked', async () => {
    const { analyzeDoodle } = await import('../../services/cloudFunctions');

    render(
      <DoodleMoodInput
        onMoodDetected={mockOnMoodDetected}
        onDoodleComplete={mockOnDoodleComplete}
      />
    );

    const analyzeButton = screen.getByRole('button', { name: /analyze/i });
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(analyzeDoodle).toHaveBeenCalled();
    });
  });

  it('displays mood analysis results', async () => {
    render(
      <DoodleMoodInput
        onMoodDetected={mockOnMoodDetected}
        onDoodleComplete={mockOnDoodleComplete}
      />
    );

    const analyzeButton = screen.getByRole('button', { name: /analyze/i });
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(screen.getByText(/happy/i)).toBeInTheDocument();
      expect(screen.getByText(/85%/i)).toBeInTheDocument();
    });
  });

  it('calls onMoodDetected with analysis results', async () => {
    render(
      <DoodleMoodInput
        onMoodDetected={mockOnMoodDetected}
        onDoodleComplete={mockOnDoodleComplete}
      />
    );

    const analyzeButton = screen.getByRole('button', { name: /analyze/i });
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(mockOnMoodDetected).toHaveBeenCalledWith(
        expect.objectContaining({
          mood: 'happy',
          confidence: 0.85,
        })
      );
    });
  });

  it('handles API errors gracefully', async () => {
    const { analyzeDoodle } = await import('../../services/cloudFunctions');
    analyzeDoodle.mockRejectedValue(new Error('Vision API error'));

    render(
      <DoodleMoodInput
        onMoodDetected={mockOnMoodDetected}
        onDoodleComplete={mockOnDoodleComplete}
      />
    );

    const analyzeButton = screen.getByRole('button', { name: /analyze/i });
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(screen.getByText(/error analyzing/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during analysis', async () => {
    const { analyzeDoodle } = await import('../../services/cloudFunctions');
    analyzeDoodle.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ mood: 'calm' }), 100))
    );

    render(
      <DoodleMoodInput
        onMoodDetected={mockOnMoodDetected}
        onDoodleComplete={mockOnDoodleComplete}
      />
    );

    const analyzeButton = screen.getByRole('button', { name: /analyze/i });
    fireEvent.click(analyzeButton);

    expect(screen.getByText(/analyzing/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText(/analyzing/i)).not.toBeInTheDocument();
    });
  });
});
