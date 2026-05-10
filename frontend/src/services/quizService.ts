/* eslint-disable @typescript-eslint/no-explicit-any */

// quizService.ts
import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

// Types for Quiz
export interface QuizQuestion {
  id: string;
  text: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'fill-blank';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points?: number;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  documentId: string;
  questions: QuizQuestion[];
  totalQuestions: number;
  totalPoints: number;
  timeLimit?: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: string;
  updatedAt: string;
  attempts?: number;
  passingScore?: number;
}

export interface GetQuizzesResponse {
  success: boolean;
  data: Quiz[];
  total?: number;
  message?: string;
}

export interface GetQuizByIdResponse {
  success: boolean;
  data: Quiz;
  message?: string;
}

// Types for Quiz Submission
export interface QuizAnswer {
  questionId: string;
  answer: string | string[];
  timeSpent?: number; // in seconds
}

export interface SubmitQuizRequest {
  answers: QuizAnswer[];
  startedAt?: string;
  completedAt?: string;
}

export interface QuestionResult {
  questionId: string;
  isCorrect: boolean;
  userAnswer: string | string[];
  correctAnswer: string | string[];
  pointsEarned: number;
  pointsPossible: number;
  explanation?: string;
}

export interface SubmitQuizResponse {
  success: boolean;
  data: {
    quizId: string;
    score: number;
    percentage: number;
    totalPoints: number;
    earnedPoints: number;
    questionResults: QuestionResult[];
    passed: boolean;
    feedback?: string;
  };
  message?: string;
}

// Types for Quiz Results
export interface QuizResult {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  percentage: number;
  totalPoints: number;
  earnedPoints: number;
  passed: boolean;
  completedAt: string;
  timeSpent?: number;
  answers: QuizAnswer[];
  questionResults: QuestionResult[];
}

export interface GetQuizResultsResponse {
  success: boolean;
  data: QuizResult | QuizResult[];
  message?: string;
}

export interface DeleteQuizResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Service functions
const getQuizzesForDocument = async (documentId: string): Promise<GetQuizzesResponse> => {
  try {
    const response = await axiosInstance.get(API_PATHS.QUIZZES.GET_QUIZZES_FOR_DOC(documentId));
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to fetch quizzes' };
  }
};

const getQuizById = async (quizId: string): Promise<GetQuizByIdResponse> => {
  try {
    const response = await axiosInstance.get(API_PATHS.QUIZZES.GET_QUIZ_BY_ID(quizId));
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to fetch quiz' };
  }
};

const submitQuiz = async (quizId: string, answers: QuizAnswer[]): Promise<SubmitQuizResponse> => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.QUIZZES.SUBMIT_QUIZ(quizId),
      { answers }
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to submit quiz' };
  }
};

const getQuizResults = async (quizId: string): Promise<GetQuizResultsResponse> => {
  try {
    const response = await axiosInstance.get(API_PATHS.QUIZZES.GET_QUIZ_RESULTS(quizId));
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to fetch quiz results' };
  }
};

const deleteQuiz = async (quizId: string): Promise<DeleteQuizResponse> => {
  try {
    const response = await axiosInstance.delete(API_PATHS.QUIZZES.DELETE_QUIZ(quizId));
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to delete quiz' };
  }
};

// Optional: Additional quiz-related functions
const retakeQuiz = async (quizId: string): Promise<GetQuizByIdResponse> => {
  try {
    const response = await axiosInstance.post(API_PATHS.QUIZZES.RETAKE_QUIZ(quizId));
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to retake quiz' };
  }
};

const getQuizAnalytics = async (quizId: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(API_PATHS.QUIZZES.GET_QUIZ_ANALYTICS(quizId));
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to fetch quiz analytics' };
  }
};

const getAllQuizAttempts = async (quizId: string): Promise<GetQuizResultsResponse> => {
  try {
    const response = await axiosInstance.get(API_PATHS.QUIZZES.GET_ALL_ATTEMPTS(quizId));
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to fetch quiz attempts' };
  }
};

export interface QuizService {
  getQuizzesForDocument: typeof getQuizzesForDocument;
  getQuizById: typeof getQuizById;
  submitQuiz: typeof submitQuiz;
  getQuizResults: typeof getQuizResults;
  deleteQuiz: typeof deleteQuiz;
  retakeQuiz?: typeof retakeQuiz;
  getQuizAnalytics?: typeof getQuizAnalytics;
  getAllQuizAttempts?: typeof getAllQuizAttempts;
}

const quizService: QuizService = {
  getQuizzesForDocument,
  getQuizById,
  submitQuiz,
  getQuizResults,
  deleteQuiz,
  retakeQuiz,
  getQuizAnalytics,
  getAllQuizAttempts,
};

export default quizService;