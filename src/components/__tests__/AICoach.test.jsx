import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AICoach from '../AICoach';
import * as geminiService from '../../services/geminiService';

// Mock geminiService
vi.mock('../../services/geminiService', () => ({
  generateResponse: vi.fn(),
  streamResponse: vi.fn(),
}));

// Mock firestoreService
vi.mock('../../services/firestoreService', () => ({
  saveChatMessage: vi.fn(),
  getChatHistory: vi.fn(() => Promise.resolve([])),
}));

describe('AICoach Component', () => {
  const mockUserProgress = {
    completedExercises: 5,
    calmPoints: 100,
    streak: 3,
  };

  const mockMoodHistory = ['happy', 'calm', 'anxious'];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders chat interface with welcome message', () => {
    render(
      <AICoach
        userProgress={mockUserProgress}
        moodHistory={mockMoodHistory}
        currentMood="calm"
      />
    );

    expect(screen.getByText(/Chat with Mira/i)).toBeInTheDocument();
  });

  it('displays user input field', () => {
    render(
      <AICoach
        userProgress={mockUserProgress}
        moodHistory={mockMoodHistory}
        currentMood="calm"
      />
    );

    const input = screen.getByPlaceholderText(/Type your message/i);
    expect(input).toBeInTheDocument();
  });

  it('sends message when send button is clicked', async () => {
    geminiService.generateResponse.mockResolvedValue({
      response: 'I understand how you feel.',
    });

    render(
      <AICoach
        userProgress={mockUserProgress}
        moodHistory={mockMoodHistory}
        currentMood="calm"
      />
    );

    const input = screen.getByPlaceholderText(/Type your message/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'I feel stressed' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(geminiService.generateResponse).toHaveBeenCalledWith(
        expect.stringContaining('I feel stressed'),
        expect.any(Object)
      );
    });
  });

  it('displays AI response after sending message', async () => {
    geminiService.generateResponse.mockResolvedValue({
      response: 'I understand how you feel. Let\'s try a breathing exercise.',
    });

    render(
      <AICoach
        userProgress={mockUserProgress}
        moodHistory={mockMoodHistory}
        currentMood="calm"
      />
    );

    const input = screen.getByPlaceholderText(/Type your message/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'I need help' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/I understand how you feel/i)).toBeInTheDocument();
    });
  });

  it('shows typing indicator while waiting for response', async () => {
    geminiService.generateResponse.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ response: 'Hello' }), 100))
    );

    render(
      <AICoach
        userProgress={mockUserProgress}
        moodHistory={mockMoodHistory}
        currentMood="calm"
      />
    );

    const input = screen.getByPlaceholderText(/Type your message/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(sendButton);

    expect(screen.getByText(/typing/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText(/typing/i)).not.toBeInTheDocument();
    });
  });

  it('handles voice input button click', () => {
    render(
      <AICoach
        userProgress={mockUserProgress}
        moodHistory={mockMoodHistory}
        currentMood="calm"
      />
    );

    const voiceButton = screen.getByRole('button', { name: /voice/i });
    expect(voiceButton).toBeInTheDocument();
    
    fireEvent.click(voiceButton);
    // Voice input modal should open
  });

  it('displays mood context in chat', () => {
    render(
      <AICoach
        userProgress={mockUserProgress}
        moodHistory={mockMoodHistory}
        currentMood="anxious"
      />
    );

    expect(screen.getByText(/Current mood: anxious/i)).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    geminiService.generateResponse.mockRejectedValue(new Error('API Error'));

    render(
      <AICoach
        userProgress={mockUserProgress}
        moodHistory={mockMoodHistory}
        currentMood="calm"
      />
    );

    const input = screen.getByPlaceholderText(/Type your message/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('clears input after sending message', async () => {
    geminiService.generateResponse.mockResolvedValue({
      response: 'Response',
    });

    render(
      <AICoach
        userProgress={mockUserProgress}
        moodHistory={mockMoodHistory}
        currentMood="calm"
      />
    );

    const input = screen.getByPlaceholderText(/Type your message/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'Test' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('saves chat history to Firestore', async () => {
    const { saveChatMessage } = await import('../../services/firestoreService');
    geminiService.generateResponse.mockResolvedValue({
      response: 'AI response',
    });

    render(
      <AICoach
        userProgress={mockUserProgress}
        moodHistory={mockMoodHistory}
        currentMood="calm"
      />
    );

    const input = screen.getByPlaceholderText(/Type your message/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'User message' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(saveChatMessage).toHaveBeenCalled();
    });
  });
});
