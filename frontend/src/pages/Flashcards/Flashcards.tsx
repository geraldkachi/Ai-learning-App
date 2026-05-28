import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, AlertCircle, Star } from 'lucide-react'
import { toast } from 'react-hot-toast'
import flashcardService from '../../services/flashcardService'

interface Flashcard {
  _id: string
  question: string
  answer: string
  isStarred?: boolean
  reviewCount?: number
  lastReviewed?: string
  createdAt?: string
}

interface FlashcardSet {
  _id: string
  title: string
  name?: string
  documentId: {
    _id: string
    title: string
  }
  cards: Flashcard[]
  createdAt: string
  updatedAt?: string
}

interface ApiResponse {
  success: boolean
  count: number
  data: FlashcardSet[]
  message: string
  statusCode: number
}

const FlashcardCard: React.FC<{
  card: Flashcard
  onDelete: (cardId: string) => void
  onToggleStar?: (cardId: string) => void
}> = ({ card, onDelete, onToggleStar }) => {
  const [isFlipped, setIsFlipped] = useState(false)

  const frontText = card.question || 'No question available'
  const backText = card.answer || 'No answer available'

  return (
    <div className="relative">
      <div
        className="cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className="bg-white border border-slate-200 rounded-2xl p-8 min-h-[400px] flex flex-col items-center justify-center transition-all duration-300 hover:shadow-lg">
          {!isFlipped ? (
            <div className="text-center">
              <h3 className="text-lg font-semibold text-slate-500 mb-4">Question</h3>
              <p className="text-xl text-slate-800">{frontText}</p>
            </div>
          ) : (
            <div className="text-center">
              <h3 className="text-lg font-semibold text-emerald-600 mb-4">Answer</h3>
              <p className="text-xl text-slate-800">{backText}</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="absolute top-4 right-4 flex gap-2">
        {onToggleStar && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleStar(card._id)
            }}
            className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <Star className={`w-4 h-4 ${card.isStarred ? 'fill-yellow-500 text-yellow-500' : 'text-slate-400'}`} />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(card._id)
          }}
          className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 transition-colors"
        >
          <span className="text-red-500">🗑️</span>
        </button>
      </div>
      
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm text-slate-400">
        Click to {isFlipped ? 'show question' : 'reveal answer'}
      </div>
    </div>
  )
}

const Flashcards: React.FC = () => {
  // Fix: Use 'id' as the parameter name since that's what's in your route
  const { id: documentId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null)

  // Fetch all flashcard sets
  const { data: flashcardsData, isLoading, error } = useQuery<ApiResponse>({
    queryKey: ['flashcards', documentId],
    queryFn: async () => {
      const response = await flashcardService.getAllFlashcardSets()
      return response
    },
  })

  // Filter flashcard sets by documentId and filter out sets with no cards
  const allFlashcardSets = flashcardsData?.data || []
  const flashcardSets = allFlashcardSets.filter(
    set => set.documentId?._id === documentId && set.cards.length > 0
  )

  // Select the first set or use selected set
  const flashcardSet = flashcardSets.find(set => set._id === selectedSetId) || flashcardSets[0]

  // Delete card mutation
  const deleteCardMutation = useMutation({
    mutationFn: async (cardId: string) => {
      // You'll need to add this endpoint to your flashcardService
      const response = await flashcardService.toggleStar(cardId) // Placeholder
      return response
    },
    onSuccess: () => {
      toast.success('Card deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['flashcards', documentId] })
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete card')
    },
  })

  // Toggle star mutation
  const toggleStarMutation = useMutation({
    mutationFn: async (cardId: string) => {
      const response = await flashcardService.toggleStar(cardId)
      return response
    },
    onSuccess: (data) => {
      toast.success(data?.message || 'Updated successfully')
      queryClient.invalidateQueries({ queryKey: ['flashcards', documentId] })
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update')
    },
  })

  const handleDeleteCard = (cardId: string) => {
    deleteCardMutation.mutate(cardId)
    // Adjust current index if needed
    if (flashcardSet && currentIndex >= flashcardSet.cards.length - 1) {
      setCurrentIndex(Math.max(0, currentIndex - 1))
    }
  }

  const handleToggleStar = (cardId: string) => {
    toggleStarMutation.mutate(cardId)
  }

  const handleBack = () => {
    navigate(-1)
  }

  const handleNext = () => {
    if (flashcardSet && currentIndex < flashcardSet.cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleSetChange = (setId: string) => {
    setSelectedSetId(setId)
    setCurrentIndex(0)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto" />
          <p className="mt-4 text-slate-600">Loading flashcards...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <p className="text-red-600 mt-4">Failed to load flashcards</p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (flashcardSets.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto" />
          <p className="text-slate-600 mt-4">No flashcard sets found for this document.</p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!flashcardSet) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Select a flashcard set to study</p>
          <div className="space-y-2">
            {flashcardSets.map(set => (
              <button
                key={set._id}
                onClick={() => handleSetChange(set._id)}
                className="block w-full px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                {set.title || set.name || 'Flashcard Set'} ({set.cards.length} cards)
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (flashcardSet.cards.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-slate-600">No flashcards in this set yet.</p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const currentCard = flashcardSet.cards[currentIndex]
  const progress = ((currentIndex + 1) / flashcardSet.cards.length) * 100
  const setName = flashcardSet.title || flashcardSet.name || 'Flashcard Set'

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          
          {/* Set selector if multiple sets */}
          {flashcardSets.length > 1 && (
            <select
              value={flashcardSet._id}
              onChange={(e) => handleSetChange(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white"
            >
              {flashcardSets.map(set => (
                <option key={set._id} value={set._id}>
                  {set.title || set.name || 'Flashcard Set'} ({set.cards.length} cards)
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="text-sm text-slate-500">
          {flashcardSet.cards.length} cards
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800">{setName}</h2>
        <p className="text-sm text-slate-500 mt-1">
          Created {flashcardSet.createdAt 
            ? new Date(flashcardSet.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
            : 'Recently'}
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
          onDelete={handleDeleteCard}
          onToggleStar={handleToggleStar}
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
          {currentIndex + 1} / {flashcardSet.cards.length}
        </div>
        
        <button
          onClick={handleNext}
          disabled={currentIndex === flashcardSet.cards.length - 1}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default Flashcards