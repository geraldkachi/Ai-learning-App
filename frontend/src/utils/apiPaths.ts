// apiPaths.ts

export const BASE_URL: string = "http://localhost:8000";

export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    GET_PROFILE: "/api/auth/profile",
    UPDATE_PROFILE: "/api/auth/profile",
    CHANGE_PASSWORD: "/api/auth/change-password"
  },

  DOCUMENTS: {
    UPLOAD: "/api/documents/upload",
    GET_DOCUMENTS: "/api/documents",
    GET_DOCUMENT_BY_ID: (id: string | number): string => `/api/documents/${id}`,
    UPDATE_DOCUMENT: (id: string | number): string => `/api/documents/${id}`,
    DELETE_DOCUMENT: (id: string | number): string => `/api/documents/${id}`,
    SHARE_DOCUMENT: (id: string | number): string => `/api/documents/${id}/share`,
    GET_ANALYTICS: (id: string | number): string => `/api/documents/${id}/analytics`,
  },

  AI: {
    GENERATE_FLASHCARDS: "/api/ai/generate-flashcards",
    GENERAL_QUIZ: "/api/ai/generate-quiz",
    GENERATE_QUIZ: "/api/ai/generate-quiz",
    GENERATE_SUMMARY: "/api/ai/generate-summary",
    CHAT: "/api/ai/chat",
    EXPLAIN_CONCEPT: "/api/ai/explain-concept",
    GET_CHAT_HISTORY: (documentId: string | number): string => `/api/ai/chat-history/${documentId}`,
  },

  FLASHCARDS: {
    GET_ALL_FLASHCARD_SETS: "/api/flashcards",
    GET_FLASHCARDS_FOR_DOC: (documentId: string | number): string => `/api/flashcards/${documentId}`,
    REVIEW_FLASHCARD: (cardId: string | number): string => `/api/flashcards/${cardId}/review`,
    TOGGLE_STAR: (cardId: string | number): string => `/api/flashcards/${cardId}/star`,
    DELETE_FLASHCARD_SET: (id: string | number): string => `/api/flashcards/${id}`,
  },

  QUIZZES: {
    GET_QUIZZES_FOR_DOC: (documentId: string | number): string => `/api/quizzes/${documentId}`,
    GET_QUIZ_BY_ID: (id: string | number): string => `/api/quizzes/quiz/${id}`,
    SUBMIT_QUIZ: (id: string | number): string => `/api/quizzes/${id}/submit`,
    GET_QUIZ_RESULTS: (id: string | number): string => `/api/quizzes/${id}/results`,
    DELETE_QUIZ: (id: string | number): string => `/api/quizzes/${id}`,
    RETAKE_QUIZ: (id: string | number): string => `/api/quizzes/${id}/retake`,
    GET_QUIZ_ANALYTICS: (id: string | number): string => `/api/quizzes/${id}/analytics`,
    GET_ALL_ATTEMPTS: (id: string | number): string => `/api/quizzes/${id}/attempts`,
  },

  PROGRESS: {
    GET_DASHBOARD: "/api/progress/dashboard",
  }
} as const;

// Type exports for better type safety
export type ApiPaths = typeof API_PATHS;
export type AuthPaths = typeof API_PATHS.AUTH;
export type DocumentPaths = typeof API_PATHS.DOCUMENTS;
export type AiPaths = typeof API_PATHS.AI;
export type FlashcardPaths = typeof API_PATHS.FLASHCARDS;
export type QuizPaths = typeof API_PATHS.QUIZZES;
export type ProgressPaths = typeof API_PATHS.PROGRESS;