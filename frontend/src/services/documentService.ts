/* eslint-disable @typescript-eslint/no-explicit-any */
// documentService.ts
import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

// Types for Document
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
}

export interface GetDocumentsResponse {
  success: boolean;
  data: Document[];
  total?: number;
  message?: string;
}

export interface UploadDocumentResponse {
  success: boolean;
  data: Document;
  message?: string;
}

export interface DeleteDocumentResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface GetDocumentByIdResponse {
  success: boolean;
  data: Document;
  message?: string;
}

// Service functions
const getDocuments = async (): Promise<GetDocumentsResponse> => {
  try {
    const response = await axiosInstance.get(API_PATHS.DOCUMENTS.GET_DOCUMENTS);
    return response.data?.data || response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to fetch documents' };
  }
};

const uploadDocument = async (formData: FormData): Promise<UploadDocumentResponse> => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.DOCUMENTS.UPLOAD, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to upload document' };
  }
};

const deleteDocument = async (id: string): Promise<DeleteDocumentResponse> => {
  try {
    const response = await axiosInstance.delete(API_PATHS.DOCUMENTS.DELETE_DOCUMENT(id));
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to delete document' };
  }
};

const getDocumentById = async (id: string): Promise<GetDocumentByIdResponse> => {
  try {
    const response = await axiosInstance.get(API_PATHS.DOCUMENTS.GET_DOCUMENT_BY_ID(id));
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to fetch document details' };
  }
};

// Optional: Additional document-related functions
const updateDocument = async (id: string, data: Partial<Document>): Promise<GetDocumentByIdResponse> => {
  try {
    const response = await axiosInstance.put(API_PATHS.DOCUMENTS.UPDATE_DOCUMENT(id), data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to update document' };
  }
};

const shareDocument = async (id: string, userIds: string[]): Promise<any> => {
  try {
    const response = await axiosInstance.post(API_PATHS.DOCUMENTS.SHARE_DOCUMENT(id), { userIds });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to share document' };
  }
};

const getDocumentAnalytics = async (id: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(API_PATHS.DOCUMENTS.GET_ANALYTICS(id));
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to fetch document analytics' };
  }
};

export interface DocumentService {
  getDocuments: typeof getDocuments;
  uploadDocument: typeof uploadDocument;
  deleteDocument: typeof deleteDocument;
  getDocumentById: typeof getDocumentById;
  updateDocument?: typeof updateDocument;
  shareDocument?: typeof shareDocument;
  getDocumentAnalytics?: typeof getDocumentAnalytics;
}

const documentService: DocumentService = {
  getDocuments,
  uploadDocument,
  deleteDocument,
  getDocumentById,
  updateDocument,
  shareDocument,
  getDocumentAnalytics,
};

export default documentService;