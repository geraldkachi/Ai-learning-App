// components/documents/DocumentCard.tsx
import React, { useState } from 'react'
import { 
  FileText, 
  MoreVertical, 
  Eye, 
  Trash2, 
  BrainCircuit, 
  BookOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import type { Document } from '../../pages/Documents/DocumentsList'
import DeleteConfirmationModal from './DeleteDocumentModal'

interface DocumentCardProps {
  document: Document;
  onDelete: (id: string) => Promise<void>;
  onView?: (id: string) => void;
  onFlashcards?: (id: string) => void;
  onQuiz?: (id: string) => void;
}

interface StatusBadge {
  color: string;
  label: string;
  icon: React.ReactNode | null;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ 
  document, 
  onDelete, 
  onView, 
  onFlashcards, 
  onQuiz 
}) => {
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState<boolean>(false)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)

  const {
    _id,
    title,
    fileName,
    fileSize,
    status,
    createdAt,
    numFlashcardSets = 0,
    numQuizzes = 0,
    description,
    errorMessage
  } = document

  // Get status badge configuration
  const getStatusBadge = (): StatusBadge => {
    switch(status) {
      case 'ready':
        return { 
          color: 'bg-emerald-100 text-emerald-700', 
          label: 'Ready',
          icon: <CheckCircle size={12} className="mr-1" />
        }
      case 'processing':
        return { 
          color: 'bg-yellow-100 text-yellow-700', 
          label: 'Processing',
          icon: <Loader size={12} className="mr-1 animate-spin" />
        }
      case 'failed':
        return { 
          color: 'bg-red-100 text-red-700', 
          label: 'Failed',
          icon: <AlertCircle size={12} className="mr-1" />
        }
      default:
        return { 
          color: 'bg-gray-100 text-gray-700', 
          label: status || 'Draft',
          icon: null
        }
    }
  }

  // Format file size
  const formatFileSize = (bytes: number): string | null => {
    if (!bytes) return null
    const sizes: string[] = ['B', 'KB', 'MB', 'GB']
    const i: number = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  // Format date
  const formatDate = (dateString: string): string | null => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const statusBadge = getStatusBadge()

  const handleDeleteClick = () => {
    setShowMenu(false)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async (): Promise<void> => {
    setIsDeleting(true)
    try {
      await onDelete(_id)
      toast.success('Document deleted successfully')
      setShowDeleteModal(false)
    } catch (error) {
      toast.error((error as Error).message || 'Failed to delete document')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleView = (): void => {
    if (onView) {
      onView(_id)
    } else {
      navigate(`/documents/${_id}`)
    }
  }

  const handleCreateFlashcards = (): void => {
    if (onFlashcards) {
      onFlashcards(_id)
    } else {
      navigate(`/documents/${_id}/flashcards/create`)
    }
  }

  const handleTakeQuiz = (): void => {
    if (onQuiz) {
      onQuiz(_id)
    } else {
      navigate(`/documents/${_id}/quiz`)
    }
  }

  return (
    <>
      <div className="group bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
        <div className="p-6">
          {/* Header with Icon and Menu */}
          <div className="flex items-start justify-between mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <FileText className="w-6 h-6 text-emerald-600" />
            </div>
            
            {/* Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isDeleting}
              >
                <MoreVertical size={18} className="text-gray-500" />
              </button>
              
              {showMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                    <button
                      onClick={() => {
                        handleView()
                        setShowMenu(false)
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg transition-colors cursor-pointer"
                    >
                      <Eye size={16} />
                      View Details
                    </button>
                    
                    <button
                      onClick={() => {
                        handleCreateFlashcards()
                        setShowMenu(false)
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <BookOpen size={16} />
                      Create Flashcards
                    </button>
                    
                    <button
                      onClick={() => {
                        handleTakeQuiz()
                        setShowMenu(false)
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <BrainCircuit size={16} />
                      Take Quiz
                    </button>
                    
                    <hr className="my-1" />
                    
                    <button
                      onClick={handleDeleteClick}
                      disabled={isDeleting}
                      className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-b-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isDeleting ? (
                        <Loader size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
              {title}
            </h3>
            {fileName && fileName !== title && (
              <p className="text-xs text-gray-400 truncate">
                {fileName}
              </p>
            )}
            {description && (
              <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                {description}
              </p>
            )}
          </div>

          {/* Document Stats */}
          {(fileSize || numFlashcardSets > 0 || numQuizzes > 0) && (
            <div className="mb-3 flex flex-wrap gap-3 text-xs">
              {fileSize && (
                <div className="text-gray-500">
                  📄 {formatFileSize(fileSize)}
                </div>
              )}
              {numFlashcardSets > 0 && (
                <div className="text-gray-500">
                  🃏 {numFlashcardSets} Set{numFlashcardSets !== 1 ? 's' : ''}
                </div>
              )}
              {numQuizzes > 0 && (
                <div className="text-gray-500">
                  📝 {numQuizzes} Quiz{numQuizzes !== 1 ? 'zes' : ''}
                </div>
              )}
            </div>
          )}

          {/* Status and Date */}
          <div className="flex items-center justify-between mb-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}>
              {statusBadge.icon}
              {statusBadge.label}
            </span>
            
            {createdAt && (
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Clock size={12} />
                {formatDate(createdAt)}
              </div>
            )}
          </div>

          {/* Error Message for failed documents */}
          {status === 'failed' && errorMessage && (
            <div className="mb-3 text-xs text-red-600 bg-red-50 p-2 rounded-lg">
              {errorMessage}
            </div>
          )}

          {/* Action Buttons */}
          {status === 'ready' && (
            <div className="flex gap-2">
              <button
                onClick={handleView}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium cursor-pointer"
              >
                <Eye size={16} />
                View
              </button>
              <button
                onClick={handleCreateFlashcards}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium cursor-pointer"
              >
                <BookOpen size={16} />
                Flashcards
              </button>
            </div>
          )}
          
          {status === 'processing' && (
            <div className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
              <Loader size={16} className="animate-spin text-emerald-500" />
              <span className="text-sm text-gray-600">Processing document...</span>
            </div>
          )}

          {status === 'failed' && (
            <div className="px-3 py-2 bg-red-50 rounded-lg text-center">
              <p className="text-sm text-red-600">Failed to process. Please try again.</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        documentTitle={title}
        isDeleting={isDeleting}
      />
    </>
  )
}

export default DocumentCard