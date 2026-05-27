import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Brain,
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Plus, 
  BookOpen,
  Sparkles,
  AlertCircle,
  Loader2,
  X,
  Star
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import flashcardService from '../../services/flashcardService'
import aiService from '../../services/aiService'

// Types matching your flashcardService structure
interface Flashcard {
  _id: string
  front: string
  back: string
  question?: string
  answer?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  reviewCount?: number
  isStarred?: boolean
  documentId: string
}

interface FlashcardSet {
  _id: string
  name: string
  title?: string
  documentId: string
  cards: Flashcard[]
  cardCount?: number
  createdAt: string
  updatedAt: string
}

interface GetFlashcardsResponse {
  success: boolean
  data: FlashcardSet[]
  message?: string
}

interface GenerateFlashcardsResponse {
  success: boolean
  data: {
    _id: string
    userId: string
    documentId: string
    cards: Flashcard[]
    createdAt: string
    updatedAt: string
  }
  message?: string
}

// Generate Count Modal Component
const GenerateCountModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  onConfirm: (count: number) => void
  isLoading: boolean
}> = ({ isOpen, onClose, onConfirm, isLoading }) => {
  const [count, setCount] = useState<number>(10)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Generate Flashcards</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-slate-600 mb-4">
          How many flashcards would you like to generate?
        </p>
        
        <input
          type="number"
          value={count}
          onChange={(e) => setCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
          min={1}
          max={50}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent mb-6"
        />
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(count)}
            disabled={isLoading || count < 1 || count > 50}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Generate'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Flashcard Card Component
const FlashcardCard: React.FC<{
  card: Flashcard
  onDelete: (id: string) => void
  onToggleStar?: (id: string) => void
}> = ({ card, onDelete, onToggleStar }) => {
  const [isFlipped, setIsFlipped] = useState(false)
  
  const frontText = card.front || card.question || ''
  const backText = card.back || card.answer || ''

  return (
    <div 
      className="relative h-96 cursor-pointer perspective-1000"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={`relative w-full h-full transition-transform duration-500 transform-gpu preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        {/* Front Side - Question */}
        <div className="absolute w-full h-full backface-hidden">
          <div className="h-full bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-6 flex flex-col shadow-lg">
            <div className="flex-1 flex items-center justify-center overflow-y-auto">
              <p className="text-slate-700 text-lg font-medium text-center">
                {frontText || 'No question available'}
              </p>
            </div>
            <div className="text-center text-xs text-slate-400 mt-4">
              Click to reveal answer
            </div>
            <div className="absolute top-3 right-3 flex gap-2">
              {onToggleStar && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleStar(card._id)
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-yellow-500 transition-colors"
                >
                  <Star className={`w-4 h-4 ${card.isStarred ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(card._id)
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Back Side - Answer */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180">
          <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6 flex flex-col shadow-lg">
            <div className="flex-1 overflow-y-auto">
              <p className="text-slate-700 leading-relaxed">
                {backText || 'No answer available'}
              </p>
            </div>
            <div className="text-center text-xs text-slate-400 mt-4">
              Click to see question
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Flashcard Set Component
const FlashcardSetView: React.FC<{
  set: FlashcardSet
  onBack: () => void
  onDeleteCard: (cardId: string) => void
  onToggleStar?: (cardId: string) => void
}> = ({ set, onBack, onDeleteCard, onToggleStar }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  const currentCard = set.cards[currentIndex]
  const progress = ((currentIndex + 1) / set.cards.length) * 100
  const setName = set.name || set.title || 'Flashcard Set'

  const handleNext = () => {
    if (currentIndex < set.cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sets
        </button>
        <div className="text-sm text-slate-500">
          {set.cards.length} cards
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800">{setName}</h2>
        <p className="text-sm text-slate-500 mt-1">
          Created {new Date(set.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Flashcard */}
      {currentCard && (
        <FlashcardCard 
          card={currentCard} 
          onDelete={onDeleteCard}
          onToggleStar={onToggleStar}
        />
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>
        
        <div className="text-sm text-slate-500">
          {currentIndex + 1} / {set.cards.length}
        </div>
        
        <button
          onClick={handleNext}
          disabled={currentIndex === set.cards.length - 1}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Main Flashcard Manager Component
const FlashcardManager: React.FC = () => {
  const { id: documentId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedSet, setSelectedSet] = useState<FlashcardSet | null>(null)
  const [setToDelete, setSetToDelete] = useState<FlashcardSet | null>(null)
  const [cardToDelete, setCardToDelete] = useState<{ setId: string; cardId: string } | null>(null)
  const [showGenerateModal, setShowGenerateModal] = useState<boolean>(false)

  // Fetch flashcards using flashcardService
  const { data: flashcardsData, isLoading, error } = useQuery<GetFlashcardsResponse>({
    queryKey: ['flashcards', documentId],
    queryFn: async () => {
      const response = await flashcardService.getFlashcardsForDocument(documentId!)
      return response
    },
    enabled: !!documentId,
  })

  // Delete flashcard set mutation
  const deleteSetMutation = useMutation({
    mutationFn: async (setId: string) => {
      const response = await flashcardService.deleteFlashcardSet(setId)
      return response
    },
    onSuccess: () => {
      toast.success('Flashcard set deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['flashcards', documentId] })
      setSetToDelete(null)
      if (selectedSet) setSelectedSet(null)
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete flashcard set')
      setSetToDelete(null)
    },
  })

  // Delete single card mutation
  const deleteCardMutation = useMutation({
    mutationFn: async ({ cardId }: { cardId: string }) => {
      // Use the review endpoint or create a delete endpoint
      const response = await flashcardService.toggleStar(cardId) // Placeholder - you'll need a delete endpoint
      return response
    },
    onSuccess: () => {
      toast.success('Flashcard deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['flashcards', documentId] })
      setCardToDelete(null)
      if (selectedSet) {
        queryClient.invalidateQueries({ queryKey: ['flashcards', documentId] })
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete flashcard')
      setCardToDelete(null)
    },
  })

  // Toggle star mutation
  const toggleStarMutation = useMutation({
    mutationFn: async (cardId: string) => {
      const response = await flashcardService.toggleStar(cardId)
      return response
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['flashcards', documentId] })
      toast.success(data.message || 'Flashcard updated successfully')
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update flashcard')
    },
  })

  // Generate new flashcards mutation using aiService
  const generateMutation = useMutation({
    mutationFn: async (count: number) => {
      // const response = await aiService.generateFlashcards(documentId)
      const response = await aiService.generateFlashcards(documentId!, { numberOfCards: count })
      return response
    },
    onSuccess: (data) => {
      toast.success(data.message || 'New flashcards generated successfully!')
      queryClient.invalidateQueries({ queryKey: ['flashcards', documentId] })
      setShowGenerateModal(false)
    },
    onError: (error: any) => {
      toast.error(error?.error || 'Failed to generate flashcards')
    },
  })

  const handleDeleteSet = (set: FlashcardSet) => {
    setSetToDelete(set)
  }

  const handleDeleteCard = (setId: string, cardId: string) => {
    setCardToDelete({ setId, cardId })
  }

  const handleToggleStar = (cardId: string) => {
    toggleStarMutation.mutate(cardId)
  }

  const handleGenerateNew = (count: number) => {
    generateMutation.mutate(count)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-slate-500">Loading flashcards...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-slate-600 mb-2">Failed to load flashcards</p>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['flashcards', documentId] })}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const flashcardSets = flashcardsData?.data || []

  // Show individual flashcard set
  if (selectedSet) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <FlashcardSetView 
          set={selectedSet}
          onBack={() => setSelectedSet(null)}
          onDeleteCard={(cardId) => handleDeleteCard(selectedSet._id, cardId)}
          onToggleStar={handleToggleStar}
        />

        {/* Delete Card Confirmation Modal */}
        {cardToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">Delete Flashcard?</h3>
              </div>
              <p className="text-slate-600 mb-6">
                Are you sure you want to delete this flashcard? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setCardToDelete(null)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteCardMutation.mutate({ cardId: cardToDelete.cardId })}
                  disabled={deleteCardMutation.isPending}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                >
                  {deleteCardMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Show all flashcard sets
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={() => navigate(`/documents/${documentId}`)}
            className="text-sm text-emerald-600 hover:text-emerald-700 mb-2 inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Documents
          </button>
          <h1 className="text-3xl font-bold text-slate-800">Flashcards</h1>
          <p className="text-slate-500 mt-1">Study and review your flashcards</p>
        </div>
        
        <button
          onClick={() => setShowGenerateModal(true)}
          disabled={generateMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
        >
          {generateMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Generate New Set
        </button>
      </div>

      {/* Flashcard Sets Grid */}
      {flashcardSets.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200">
          <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No Flashcards Yet</h3>
          <p className="text-slate-500 mb-6">Generate your first flashcard set to start studying</p>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Generate Flashcards
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flashcardSets.map((set) => {
            const setName = set.name || set.title || 'Flashcard Set'
            const cardCount = set.cards?.length || set.cardCount || 0
            
            return (
              <div
                key={set._id} onClick={() => setSelectedSet(set)}
                className="group bg-white rounded-2xl border border-slate-200 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-50 transition-all duration-200 overflow-hidden cursor-pointer"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <button
                      onClick={() => handleDeleteSet(set)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <h3 className="font-semibold text-slate-800 text-lg mb-1">
                    {setName}
                  </h3>
                  
                  <p className="text-xs text-slate-500 mb-4">
                    CREATED {new Date(set.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-slate-500">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm font-medium">{cardCount} cards</span>
                    </div>
                    
                    <button
                      onClick={() => setSelectedSet(set)}
                      className="px-4 py-2 text-sm bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      Study Now
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Delete Set Confirmation Modal */}
      {setToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Delete Flashcard Set?</h3>
            </div>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete this flashcard set? This action cannot be undone and all cards will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setSetToDelete(null)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteSetMutation.mutate(setToDelete._id)}
                disabled={deleteSetMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
              >
                {deleteSetMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Delete Set'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Count Modal */}
      <GenerateCountModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onConfirm={handleGenerateNew}
        isLoading={generateMutation.isPending}
      />
    </div>
  )
}

export default FlashcardManager