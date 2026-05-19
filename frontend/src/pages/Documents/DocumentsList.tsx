// pages/Documents/DocumentListPage.tsx
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  FileText, 
  Plus, 
  Search, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Spinner from '../../components/ui/Spinner'
import DocumentCard from '../../components/documents/DocumentCard'
import documentService from '../../services/documentService'
import UploadDocumentModal from '../../components/documents/UploadDocumentModal'

// ============================================
// Type Definitions
// ============================================

export interface Document {
  _id: string;
  userId: string;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  summary: string | null;
  status: 'ready' | 'processing' | 'failed' | 'draft';
  errorMessage: string | null;
  updateDate: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  numFlashcardSets: number;
  numQuizzes: number;
  description?: string;
}

export interface DocumentsResponse {
  success: boolean;
  data: {
    documents: Document[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface Stats {
  total: number;
  ready: number;
  processing: number;
  failed: number;
}

// Type guard to check if response is an array
const isDocumentArray = (response: unknown): response is Document[] => {
  return Array.isArray(response);
}

// Type guard to check if response has data with documents
const hasDataWithDocuments = (response: unknown): response is { data: { documents: Document[] } } => {
  return (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    typeof (response as any).data === 'object' &&
    (response as any).data !== null &&
    'documents' in (response as any).data
  );
}

// Type guard to check if response has documents directly
const hasDocuments = (response: unknown): response is { documents: Document[] } => {
  return (
    typeof response === 'object' &&
    response !== null &&
    'documents' in response
  );
}

// Type guard to check if response has data array
const hasDataArray = (response: unknown): response is { data: Document[] } => {
  return (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    Array.isArray((response as any).data)
  );
}

// ============================================
// Component
// ============================================

const DocumentListPage: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false)

  // Fetch documents
  const { 
    data: documents, 
    isLoading, 
    error, 
    refetch 
  } = useQuery<Document[]>({
    queryKey: ['documents'],
    queryFn: async () => {
      const response = await documentService.getDocuments()
      
      // Handle different response structures
      if (isDocumentArray(response)) {
        return response
      } else if (hasDataWithDocuments(response)) {
        return response.data.documents
      } else if (hasDocuments(response)) {
        return response.documents
      } else if (hasDataArray(response)) {
        return response.data
      }
      
      return []
    },
    staleTime: 5 * 60 * 1000,
  })

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: async (documentId: string) => {
      return await documentService.deleteDocument(documentId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      toast.success('Document deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete document')
    }
  })

  const handleDelete = async (documentId: string): Promise<void> => {
    try {
      await deleteMutation.mutateAsync(documentId)
    } catch (error) {
      // Error is already handled by mutation onError
      console.error('Delete failed:', error)
    }
  }

  // Filter and search documents
  const filteredDocuments: Document[] = documents?.filter((doc: Document) => {
    const matchesSearch = doc.title?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || doc.status === filterStatus
    return matchesSearch && matchesFilter
  }) || []

  // Get statistics
  const stats: Stats = {
    total: documents?.length || 0,
    ready: documents?.filter((d: Document) => d.status === 'ready').length || 0,
    processing: documents?.filter((d: Document) => d.status === 'processing').length || 0,
    failed: documents?.filter((d: Document) => d.status === 'failed').length || 0
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <FileText className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load documents</h3>
          <p className="text-gray-500 mb-4">{(error as Error).message}</p>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
                  My Documents
                </h1>
                <p className="text-gray-500 text-sm">
                  Manage and organize your learning materials
                </p>
              </div>
              
              <button 
                onClick={() => setIsUploadModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors shadow-sm cursor-pointer"
              >
                <Plus size={18} />
                Upload Document
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          {documents && documents.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {/* Total Documents */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">TOTALS</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <FileText className="w-6 h-6 text-gray-500" />
                  </div>
                </div>
              </div>
              
              {/* Ready Documents */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">READY</p>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.ready}</p>
                  </div>
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                  </div>
                </div>
              </div>
              
              {/* Processing Documents */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">PROCESSING</p>
                    <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.processing}</p>
                  </div>
                  <div className="p-2 bg-yellow-50 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-500" />
                  </div>
                </div>
              </div>
              
              {/* Failed Documents */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">FAILED</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">{stats.failed}</p>
                  </div>
                  <div className="p-2 bg-red-50 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white transition-all"
              />
            </div>
          </div>

          {/* Documents Grid */}
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                {searchTerm 
                  ? `No documents matching "${searchTerm}" were found` 
                  : 'Upload your first document to get started with AI-powered learning'}
              </p>
              {!searchTerm && (
                <button 
                  onClick={() => setIsUploadModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"
                >
                  <Plus size={18} />
                  Upload Document
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.map((doc: Document) => (
                <DocumentCard
                  key={doc._id}
                  document={doc}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </>
  )
}

export default DocumentListPage