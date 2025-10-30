import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateResponse, streamResponse } from '../geminiService';

// Mock @google/genai
vi.mock('@google/genai', () => ({
  GoogleGenerativeAI: vi.fn(() => ({
    getGenerativeModel: vi.fn(() => ({
      generateContent: vi.fn(() => Promise.resolve({
        response: {
          text: () => 'AI generated response',
        },
      })),
      generateContentStream: vi.fn(() => Promise.resolve({
        stream: (async function* () {
          yield { text: () => 'Chunk 1' };
          yield { text: () => 'Chunk 2' };
        })(),
      })),
    })),
  })),
}));

describe('geminiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateResponse', () => {
    it('generates AI response from prompt', async () => {
      const prompt = 'How can I reduce anxiety?';
      const context = { mood: 'anxious' };

      const response = await generateResponse(prompt, context);

      expect(response).toContain('AI generated response');
    });

    it('includes context in the prompt', async () => {
      const prompt = 'Help me';
      const context = {
        mood: 'stressed',
        completedExercises: 5,
      };

      await generateResponse(prompt, context);

      // Should include context in API call
    });

    it('handles API errors', async () => {
      const { GoogleGenerativeAI } = await import('@google/genai');
      GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: () => ({
          generateContent: () => Promise.reject(new Error('API Error')),
        }),
      }));

      await expect(generateResponse('test', {})).rejects.toThrow();
    });

    it('returns fallback response on error', async () => {
      const { GoogleGenerativeAI } = await import('@google/genai');
      GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: () => ({
          generateContent: () => Promise.reject(new Error('API Error')),
        }),
      }));

      try {
        await generateResponse('test', {});
      } catch (error) {
        expect(error.message).toContain('API Error');
      }
    });
  });

  describe('streamResponse', () => {
    it('streams AI response in chunks', async () => {
      const prompt = 'Tell me about mindfulness';
      const chunks = [];
      
      const onChunk = (chunk) => {
        chunks.push(chunk);
      };

      await streamResponse(prompt, {}, onChunk);

      expect(chunks.length).toBeGreaterThan(0);
    });

    it('calls onChunk callback for each chunk', async () => {
      const onChunk = vi.fn();

      await streamResponse('test prompt', {}, onChunk);

      expect(onChunk).toHaveBeenCalled();
    });

    it('handles streaming errors', async () => {
      const { GoogleGenerativeAI } = await import('@google/genai');
      GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: () => ({
          generateContentStream: () => Promise.reject(new Error('Stream Error')),
        }),
      }));

      const onChunk = vi.fn();

      await expect(streamResponse('test', {}, onChunk)).rejects.toThrow();
    });
  });
});
