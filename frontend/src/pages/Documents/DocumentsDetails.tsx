// pages/Documents/DocumentDetailPage.tsx
import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, FileText, Clock, BookOpen, BrainCircuit, Loader, AlertCircle, Download, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import documentService from '../../services/documentService'
import Spinner from '../../components/ui/Spinner'
import Tabs from '../../components/ui/Tab'
import PageHeader from '../../components/ui/PageHeader'
import AiAction from '../../components/document-details/AiAction'
import ChatInterface from '../../components/document-details/ChatInterface'

interface Document {
  _id: string;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  status: 'processing' | 'ready' | 'failed';
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  extractedText?: string;
  chunks?: Array<{
    content: string;
    pageNumber: number;
    chunkIndex: number;
    _id: string;
  }>;
  numPages?: number;
  numFlashcardSets?: number;
  numQuizzes?: number;
}

const DocumentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState('content')

  // Fetch document details using React Query
  const {
    data: response,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['document', id],
    queryFn: async () => {
      const response = await documentService.getDocumentById(id!)
      return response
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  const document = response?.data

  // Helper function to get the full PDF URL
  const getPdfUrl = (): string | null => {
    if (!document?.filePath) return null

    const filePath = document.filePath
    console.log(filePath, 'filePath')

    // If it's already a full URL, return it
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath
    }

    // Otherwise, construct the full URL
    const baseUrl = import.meta.env.VITE_API_URL
    return `${baseUrl}${filePath.startsWith('/') ? '' : '/'}${filePath}`
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (!bytes) return '0 KB'
    const sizes: string[] = ['B', 'KB', 'MB', 'GB']
    const i: number = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  // Format date
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Unknown date'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Handle download
  const handleDownload = () => {
    const pdfUrl = getPdfUrl()
    if (pdfUrl) {
      window.open(pdfUrl, '_blank')
    } else {
      toast.error('PDF not available for download')
    }
  }

  // Render content tab with PDF viewer
  const renderContentTab = () => {
    if (document?.status === 'processing') {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
          <p className="text-gray-600">Processing document...</p>
          <p className="text-sm text-gray-400 mt-2">This may take a few moments</p>
        </div>
      )
    }

    if (document?.status === 'failed') {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-gray-600">Failed to process document</p>
          <p className="text-sm text-red-500 mt-2">{document.errorMessage}</p>
        </div>
      )
    }

    const pdfUrl = getPdfUrl()

    if (!pdfUrl) {
      return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Document Viewer</span>
            </div>
          </div>
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">PDF preview not available</p>
            <button
              onClick={handleDownload}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
            >
              <Download size={16} />
              Download PDF
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Document Viewer Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Document Viewer</span>
              <span className="text-xs text-gray-400 ml-2">{document?.fileName}</span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ExternalLink size={14} />
                Open in new tab
              </a>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                <Download size={14} />
                Download
              </button>
            </div>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="p-0">
          <iframe
            src={`${pdfUrl}#toolbar=0&navpanes=0`}
            title={document?.title}
            className="w-full h-[calc(100vh-400px)] min-h-150 rounded-b-xl"
            style={{
              border: 'none',
              backgroundColor: '#f9fafb'
            }}
          />
        </div>
      </div>
    )
  }


  // Render flashcards tab
  const renderFlashcardsTab = () => {
    const hasFlashcards = (document?.numFlashcardSets || 0) > 0

    if (hasFlashcards) {
      return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-medium text-gray-700">Flashcards</span>
              </div>
              <button
                onClick={() => window.location.href = `/documents/${id}/flashcards`}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 text-sm font-medium"
              >
                View All ({document?.numFlashcardSets})
              </button>
            </div>
          </div>
          <div className="p-8 text-center">
            <BookOpen className="w-16 h-16 text-emerald-100 mx-auto mb-4" />
            <p className="text-gray-600">You have {document?.numFlashcardSets} flashcard set(s) for this document</p>
            <button
              onClick={() => window.location.href = `/documents/${id}/flashcards`}
              className="mt-4 inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
            >
              Study Now
              <ArrowLeft size={14} className="rotate-180" />
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium text-gray-700">Flashcards</span>
            </div>
            <button
              onClick={() => window.location.href = `/documents/${id}/flashcards/create`}
              disabled={document?.status !== 'ready'}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create New
            </button>
          </div>
        </div>
        <div className="p-8 text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Flashcards Yet</h3>
          <p className="text-gray-500 mb-6">Create flashcards to help you study this document</p>
          <button
            onClick={() => window.location.href = `/documents/${id}/flashcards/create`}
            disabled={document?.status !== 'ready'}
            className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Flashcards
          </button>
        </div>
      </div>
    )
  }

  // Render quizzes tab
  const renderQuizzesTab = () => {
    const hasQuizzes = (document?.numQuizzes || 0) > 0

    if (hasQuizzes) {
      return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Quizzes</span>
              </div>
              <button
                onClick={() => window.location.href = `/documents/${id}/quizzes`}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm font-medium"
              >
                View All ({document?.numQuizzes})
              </button>
            </div>
          </div>
          <div className="p-8 text-center">
            <BrainCircuit className="w-16 h-16 text-purple-100 mx-auto mb-4" />
            <p className="text-gray-600">You have {document?.numQuizzes} quiz(zes) for this document</p>
            <button
              onClick={() => window.location.href = `/documents/${id}/quiz`}
              className="mt-4 inline-flex items-center gap-2 text-purple-600 hover:text-purple-700"
            >
              Take a Quiz
              <ArrowLeft size={14} className="rotate-180" />
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Quizzes</span>
            </div>
            <button
              onClick={() => window.location.href = `/documents/${id}/quiz/create`}
              disabled={document?.status !== 'ready'}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate Quiz
            </button>
          </div>
        </div>
        <div className="p-8 text-center">
          <BrainCircuit className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Quizzes Available</h3>
          <p className="text-gray-500 mb-6">Generate an AI-powered quiz based on this document</p>
          <button
            onClick={() => window.location.href = `/documents/${id}/quiz/create`}
            disabled={document?.status !== 'ready'}
            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate Quiz
          </button>
        </div>
      </div>
    )
  }

  // Define tabs
  const tabs = [
    {
      name: 'content',
      label: 'Content',
      content: renderContentTab()
    },
    {
      name: 'chat',
      label: 'Chat',
      content: ChatInterface()
    },
    {
      name: 'flashcards',
      label: 'Flashcards',
      content: renderFlashcardsTab()
    },
    {
      name: 'quizzes',
      label: 'Quizzes',
      content: renderQuizzesTab()
    },
    {
      name: 'ai-actions',
      label: 'AI Actions',
      content: AiAction()
    }
  ]

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
      <div className="text-center p-8">
        <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Failed to load document</h3>
        <p className="text-gray-500 mb-4">{(error as Error)?.message || 'Something went wrong'}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
        >
          Try Again
        </button>
        <Link to="/documents" className="ml-3 inline-block px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
          Back to Documents
        </Link>
      </div>
    )
  }

  // Document not found
  if (!document) {
    return (
      <div className="text-center p-8">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Document not found</h3>
        <Link to="/documents" className="mt-4 inline-block text-emerald-600 hover:text-emerald-700">
          Back to Documents
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/documents"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600 mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Documents
        </Link>

        {/* Page Header */}
        <PageHeader
          title={document.title}
          subtitle={`Uploaded ${formatDate(document.createdAt)} • ${formatFileSize(document.fileSize)}`}
        />

        {/* Document Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <FileText size={14} />
              <span className="text-xs font-medium">File Name</span>
            </div>
            <p className="text-sm text-gray-900 truncate">{document.fileName}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Clock size={14} />
              <span className="text-xs font-medium">Last Updated</span>
            </div>
            <p className="text-sm text-gray-900">{formatDate(document.updatedAt)}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <div className={`w-2 h-2 rounded-full ${document.status === 'ready' ? 'bg-emerald-500' : document.status === 'processing' ? 'bg-yellow-500' : 'bg-red-500'}`} />
              <span className="text-xs font-medium">Status</span>
            </div>
            <p className="text-sm text-gray-900 capitalize">{document.status}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <FileText size={14} />
              <span className="text-xs font-medium">Content Chunks</span>
            </div>
            <p className="text-sm text-gray-900">{document.chunks?.length || 0} chunks</p>
          </div>
        </div>

        {/* Tabs Component */}
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
    </div>
  )
}

export default DocumentDetailPage