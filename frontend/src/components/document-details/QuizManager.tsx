import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  ArrowLeft, 
  Trash2, 
  Plus, 
  BookOpen,
  Sparkles,
  AlertCircle,
  Loader2,
  X,
  Trophy,
  ChevronRight
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import quizService from '../../services/quizService'
import type { Quiz } from '../../services/quizService'
import aiService from '../../services/aiService'

// Generate Quiz Modal Component
const GenerateQuizModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  onConfirm: (numQuestions: number) => void
  isLoading: boolean
}> = ({ isOpen, onClose, onConfirm, isLoading }) => {
  const [numQuestions, setNumQuestions] = useState<number>(10)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Generate New Quiz</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Number of Questions
            </label>
            <input
              type="number"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
              min={1}
              max={20}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(numQuestions)}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Quiz Card Component
const QuizCard: React.FC<{
  quiz: Quiz
  onDelete: (id: string) => void
  onStart: (id: string) => void
  onViewResults: (id: string) => void
  score?: number
}> = ({ quiz, onDelete, onStart, onViewResults, score }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  return (
    <>
      <div className="group bg-white rounded-2xl border border-slate-200 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-50 transition-all duration-200 overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          
          <h3 className="font-semibold text-slate-800 text-lg mb-1">
            {quiz.title}
          </h3>
          
          <p className="text-xs text-slate-500 mb-4">
            CREATED {new Date(quiz.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
          </p>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-600">{quiz.totalQuestions} Questions</span>
            </div>
            {score !== undefined && (
              <div className="flex items-center gap-1">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-semibold text-slate-700">Score: {score}%</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            {score !== undefined ? (
              <button
                onClick={() => onViewResults(quiz._id)}
                className="flex-1 px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                View Results
              </button>
            ) : (
              <button
                // onClick={() => onStart(quiz.id)}
                onClick={() => onStart(quiz._id)}
                className="flex-1 px-4 py-2 text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-colors flex items-center justify-center gap-1"
              >
                Start Quiz
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Delete Quiz?</h3>
            </div>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete this quiz? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => onDelete(quiz._id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Main QuizPage Component
const QuizPage: React.FC = () => {
  const { id: documentId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showGenerateModal, setShowGenerateModal] = useState<boolean>(false)
  const [quizScores, setQuizScores] = useState<Record<string, number>>({})
  

  console.log(documentId, 'documentId')
  // Fetch quizzes
  const { data: quizzesData, isLoading, error } = useQuery({
    queryKey: ['quizzes', documentId],
    queryFn: async () => {
      const response = await quizService.getQuizzesForDocument(documentId!)
      return response
    },
    enabled: !!documentId,
  })

  // Fetch quiz results for scores
  useQuery({
    queryKey: ['quizScores', documentId],
    queryFn: async () => {
      const quizzes = quizzesData?.data || []
      const scores: Record<string, number> = {}
      
      for (const quiz of quizzes) {
        try {
          const results = await quizService.getQuizResults(quiz._id)
          if (results.data && !Array.isArray(results.data)) {
            scores[quiz._id] = results.data.percentage
          }
        } catch (error) {
          // No results yet
        }
      }
      
      setQuizScores(scores)
      return scores
    },
    enabled: !!quizzesData?.data?.length,
  })

  // Delete quiz mutation
  const deleteQuizMutation = useMutation({
    mutationFn: async (quizId: string) => {
      const response = await quizService.deleteQuiz(quizId)
      return response
    },
    onSuccess: (data) => {
      toast.success(data?.message || 'Quiz deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['quizzes', documentId] })
    },
    onError: (error: any) => {
      toast.error(error?.message || error?.error || 'Failed to delete quiz')
    },
  })

  // Generate quiz mutation
  const generateQuizMutation = useMutation({
    mutationFn: async (numQuestions: number) => {
      const response = await aiService.generateQuiz(documentId!, { 
        numberOfQuestions: numQuestions 
      })
      return response
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Quiz generated successfully!')
      queryClient.invalidateQueries({ queryKey: ['quizzes', documentId] })
      setShowGenerateModal(false)
    },
    onError: (error: any) => {
      toast.error(error?.message || error?.error || 'Failed to generate quiz')
    },
  })

  const handleDeleteQuiz = (quizId: string) => {
    deleteQuizMutation.mutate(quizId)
  }

  const handleStartQuiz = (quizId: string) => {
    console.log(quizId, 'quizId')
    // navigate(`/documents/${documentId}/quiz/${quizId}/take`)
    navigate(`/quizzes/${documentId}/${quizId}`) 
  }

  const handleViewResults = (quizId: string) => {
    // navigate(`/documents/${documentId}/quiz/${quizId}/results`)
    navigate(`/quizzes/${documentId}/${quizId}/results`) 
  }

  const handleGenerateQuiz = (numQuestions: number) => {
    generateQuizMutation.mutate(numQuestions)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-slate-500">Loading quizzes...</p>
        </div>
      </div>
    )
  }

  const quizzes = quizzesData?.data || []
console.log(quizzes)
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
          <h1 className="text-3xl font-bold text-slate-800">Quizzes</h1>
          <p className="text-slate-500 mt-1">Test your knowledge with interactive quizzes</p>
        </div>
        
        <button
          onClick={() => setShowGenerateModal(true)}
          disabled={generateQuizMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
        >
          {generateQuizMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Generate New Quiz
        </button>
      </div>

      {/* Quiz List */}
      {quizzes.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200">
          <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No Quizzes Yet</h3>
          <p className="text-slate-500 mb-6">Generate your first quiz to test your knowledge</p>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Generate Quiz
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <QuizCard
              key={quiz._id}
              quiz={quiz}
              onDelete={handleDeleteQuiz}
              onStart={handleStartQuiz}
              onViewResults={handleViewResults}
              score={quizScores[quiz._id]}
            />
          ))}
        </div>
      )}

      {/* Generate Quiz Modal */}
      <GenerateQuizModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onConfirm={handleGenerateQuiz}
        isLoading={generateQuizMutation.isPending}
      />
    </div>
  )
}

export default QuizPage