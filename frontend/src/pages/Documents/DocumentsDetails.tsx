// pages/Documents/DocumentDetailPage.tsx
import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, FileText, Clock, BookOpen, BrainCircuit, Loader, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import documentService from '../../services/documentService'
import Spinner from '../../components/ui/Spinner'
import Tabs from '../../components/ui/Tab'
import PageHeader from '../../components/ui/PageHeader'

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
  numPages?: number;
  numFlashcardSets?: number;
  numQuizzes?: number;
}

const DocumentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('content')

  useEffect(() => {
    const fetchDocumentDetails = async () => {
      try {
        setLoading(true)
        const response = await documentService.getDocumentById(id!)
        setDocument(response.data)
      } catch (error) {
        toast.error('Failed to fetch document details.')
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchDocumentDetails()
    }
  }, [id])

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

  // Render content tab
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

    return (
      <div className="prose prose-slate max-w-none">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Document Viewer Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Document Viewer</span>
              <span className="text-xs text-gray-400 ml-auto">{document?.fileName}</span>
            </div>
          </div>
          
          {/* Document Content */}
          <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{document?.title}</h1>
            
            {document?.extractedText ? (
              <div className="text-gray-700 leading-relaxed space-y-4">
                {document.extractedText.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No content extracted yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Render flashcards tab
  const renderFlashcardsTab = () => {
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
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Quizzes</span>
            </div>
            <button
              onClick={() => window.location.href = `/documents/${id}/quiz`}
              disabled={document?.status !== 'ready'}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Take Quiz
            </button>
          </div>
        </div>
        <div className="p-8 text-center">
          <BrainCircuit className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Quizzes Available</h3>
          <p className="text-gray-500 mb-6">Test your knowledge with a quiz based on this document</p>
          <button
            onClick={() => window.location.href = `/documents/${id}/quiz`}
            disabled={document?.status !== 'ready'}
            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Take Quiz
          </button>
        </div>
      </div>
    )
  }

  // Render AI Actions tab
  const renderAIActionsTab = () => {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">AI Actions</span>
          </div>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => window.location.href = `/documents/${id}/flashcards/create`}
              disabled={document?.status !== 'ready'}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-emerald-200 hover:bg-emerald-50 transition-all disabled:opacity-50"
            >
              <BookOpen className="w-8 h-8 text-emerald-500" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Generate Flashcards</p>
                <p className="text-sm text-gray-500">Create study cards from this document</p>
              </div>
            </button>
            
            <button
              onClick={() => window.location.href = `/documents/${id}/quiz`}
              disabled={document?.status !== 'ready'}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-purple-200 hover:bg-purple-50 transition-all disabled:opacity-50"
            >
              <BrainCircuit className="w-8 h-8 text-purple-500" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Take Quiz</p>
                <p className="text-sm text-gray-500">Test your knowledge</p>
              </div>
            </button>
          </div>
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
      content: renderAIActionsTab() 
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    )
  }

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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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