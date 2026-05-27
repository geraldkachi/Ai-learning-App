/* eslint-disable @typescript-eslint/no-explicit-any */

// aiService.ts
import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

// Types for Flashcards
export interface FlashcardOptions {
  numberOfCards?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  focusAreas?: string[];
  [key: string]: any;
}

export interface Flashcard {
  id: string;
  term: string;
  definition: string;
  example?: string;
  documentId: string;
}

export interface GenerateFlashcardsResponse {
  success: boolean;
  data: Flashcard[];
  message?: string;
}

// Types for Quiz
export interface QuizOptions {
  numberOfQuestions?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  questionTypes?: ('multiple-choice' | 'true-false' | 'short-answer')[];
  focusAreas?: string[];
  [key: string]: any;
}

export interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
  createdAt: string;
}

export interface GenerateQuizResponse {
  success: boolean;
  data: Quiz;
  message?: string;
}

// Types for Summary
export interface Summary {
  id: string;
  content: string;
  keyPoints: string[];
  documentId: string;
  createdAt: string;
}

export interface GenerateSummaryResponse {
  success: boolean;
  data: Summary;
  message?: string;
}

// Types for Chat - Updated to match backend schema
export interface ChatMessage {
  _id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  relevantChunks?: number[];
}

export interface ChatHistory {
  _id: string;
  userId: string;
  documentId: string;
  messages: ChatMessage[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetChatHistoryResponse {
  success: boolean;
  data: ChatMessage[];
  message: string;
  statusCode: number;
}

export interface ChatResponse {
  success: boolean;
  data: {
    question: string;
    answer: string;
    relevantChunks: number[];
    chatHistoryId: string;
  };
  message: string;
  statusCode: number;
}

// Types for Explain Concept
export interface ConceptExplanation {
  concept: string;
  explanation: string;
  examples?: string[];
  relatedConcepts?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface ExplainConceptResponse {
  success: boolean;
  data: ConceptExplanation;
  message?: string;
}

// Service functions
const generateFlashcards = async (
  documentId: string, 
  options: FlashcardOptions = {}
): Promise<GenerateFlashcardsResponse> => {
  try {
    const response = await axiosInstance.post(API_PATHS.AI.GENERATE_FLASHCARDS, {    
      documentId,
      ...options
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to generate flashcards' };
  }
};

const generateQuiz = async (
  documentId: string, 
  options: QuizOptions = {}
): Promise<GenerateQuizResponse> => {
  try {
    const response = await axiosInstance.post(API_PATHS.AI.GENERATE_QUIZ, {
      documentId,
      ...options
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to generate quiz' };
  }
};

const generateSummary = async (documentId: string): Promise<GenerateSummaryResponse> => {
  try {
    const response = await axiosInstance.post(API_PATHS.AI.GENERATE_SUMMARY, {
      documentId
    });
    return response.data || response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to generate summary' };
  }
};

const chat = async (documentId: string, message: string): Promise<ChatResponse> => {
  try {
    const response = await axiosInstance.post(API_PATHS.AI.CHAT, {
      documentId,
      question: message  // Note: backend expects 'question', not 'message'
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to send chat message' };
  }
};

const explainConcept = async (documentId: string, concept: string): Promise<ExplainConceptResponse> => {
  try {
    const response = await axiosInstance.post(API_PATHS.AI.EXPLAIN_CONCEPT, {
      documentId,
      concept
    });
    return response.data || response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to explain concept' };
  }
};

const getChatHistory = async (documentId: string): Promise<GetChatHistoryResponse> => {
  try {
    const response = await axiosInstance.get(`${API_PATHS.AI.GET_CHAT_HISTORY(documentId)}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to get chat history' };
  }
};

export interface AIService {
  generateFlashcards: typeof generateFlashcards;
  generateQuiz: typeof generateQuiz;
  generateSummary: typeof generateSummary;
  chat: typeof chat;
  explainConcept: typeof explainConcept;
  getChatHistory: typeof getChatHistory;
}

const aiService: AIService = {
  generateFlashcards,
  generateQuiz,
  generateSummary,
  chat,
  explainConcept,
  getChatHistory,
};

export default aiService;