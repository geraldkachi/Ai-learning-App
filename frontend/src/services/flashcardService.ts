/* eslint-disable @typescript-eslint/no-explicit-any */
// flashcardService.ts

import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

// Type definitions
export interface Flashcard {
  id: string | number;
  front: string;
  back: string;
  documentId: string | number;
  isStarred?: boolean;
  reviewCount?: number;
  lastReviewed?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FlashcardSet {
  id: string | number;
  name: string;
  documentId: string | number;
  cards: Flashcard[];
  cardCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReviewFlashcardData {
  cardIndex: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  rating?: number;
  [key: string]: any;
}

export interface FlashcardResponse {
  success: boolean;
  data?: Flashcard | Flashcard[] | FlashcardSet | FlashcardSet[];
  message?: string;
}

export interface ReviewResponse {
  success: boolean;
  data?: {
    nextReviewDate?: string;
    reviewCount?: number;
    mastered?: boolean;
  };
  message?: string;
}

export interface ToggleStarResponse {
  success: boolean;
  data?: Flashcard;
  message?: string;
}

export interface DeleteResponse {
  success: boolean;
  message?: string;
}

// Error response type
export interface ApiError {
  message: string;
  status?: number;
  [key: string]: any;
}

const getAllFlashcardSets = async (): Promise<FlashcardResponse> => {
  try {
    const response = await axiosInstance.get(API_PATHS.FLASHCARDS.GET_ALL_FLASHCARD_SETS);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to fetch flashcard sets' };
  }
};

const getFlashcardsForDocument = async (documentId: string | number): Promise<FlashcardResponse> => {
  try {
    const response = await axiosInstance.get(API_PATHS.FLASHCARDS.GET_FLASHCARDS_FOR_DOC(documentId));
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to fetch flashcards' };
  }
};

const reviewFlashcard = async (
  cardId: string | number,
  cardIndex?: number
): Promise<ReviewResponse> => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.FLASHCARDS.REVIEW_FLASHCARD(cardId),
      { cardIndex }
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to review flashcard' };
  }
};

const toggleStar = async (cardId: string | number): Promise<ToggleStarResponse> => {
  try {
    const response = await axiosInstance.post(API_PATHS.FLASHCARDS.TOGGLE_STAR(cardId));
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to star flashcard' };
  }
};

const deleteFlashcardSet = async (id: string | number): Promise<DeleteResponse> => {
  try {
    const response = await axiosInstance.delete(API_PATHS.FLASHCARDS.DELETE_FLASHCARD_SET(id));
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to delete flashcards' };
  }
};
// Delete a single flashcard from a set
const deleteFlashcard = async (setId: string | number, cardId: string | number): Promise<DeleteResponse> => {
  try {
    const response = await axiosInstance.delete(`/api/flashcards/${setId}/cards/${cardId}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to delete flashcard' };
  }
};

// Get a single flashcard set by ID
const getFlashcardSetById = async (setId: string | number): Promise<FlashcardResponse> => {
  try {
    const response = await axiosInstance.get(`/api/flashcards/set/${setId}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to fetch flashcard set' };
  }
};

// Update a flashcard
const updateFlashcard = async (
  cardId: string | number,
  updates: { front?: string; back?: string; isStarred?: boolean }
): Promise<FlashcardResponse> => {
  try {
    const response = await axiosInstance.put(`/api/flashcards/card/${cardId}`, updates);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to update flashcard' };
  }
};

const flashcardService = {
  getAllFlashcardSets,
  getFlashcardsForDocument,
  reviewFlashcard,
  toggleStar,
  deleteFlashcardSet,
  deleteFlashcard,
  getFlashcardSetById,
  updateFlashcard
};

export default flashcardService;