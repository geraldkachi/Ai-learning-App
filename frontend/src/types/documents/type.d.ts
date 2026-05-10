// types/document.types.ts
export interface Document {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  content?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  summary?: string;
  status: 'processing' | 'completed' | 'failed';
  tags?: string[];
  category?: string;
  wordCount?: number;
  lastAccessed?: string;
}

export interface DocumentUploadOptions {
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
}

export type DocumentStatus = 'processing' | 'completed' | 'failed';
export type DocumentFileType = 'pdf' | 'docx' | 'txt' | 'md' | 'html';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}