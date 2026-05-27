import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle,
  Loader2
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import quizService from '../../services/quizService'

// Backend expects answers with questionIndex (number), not questionId (string)
interface BackendAnswer {
  questionIndex: number;
  selectedAnswer: string;
}

const QuizTake: React.FC = () => {
  const { id: documentId, quizId } = useParams<{ id: string; quizId: string }>()

  const navigate = useNavigate()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})

  // Fetch quiz data
  const { data: quizData, isLoading, error } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: async () => {
      const response = await quizService.getQuizById(quizId!)
      return response
    },
    enabled: !!quizId,
  })

  const quiz = quizData?.data

  // Submit quiz mutation
  const submitQuizMutation = useMutation({
    mutationFn: async (answersArray: BackendAnswer[]) => {
      const response = await quizService.submitQuiz(quizId!, answersArray)
      return response
    },
    onSuccess: (data) => {
      toast.success(data?.message || 'Quiz submitted successfully')
      navigate(`/quizzes/${documentId}/${quizId}/results`, { 
        state: { results: data.data }
      })
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to submit quiz')
    },
  })

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answer }))
  }

  const handleNext = () => {
    if (quiz?.questions && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleSubmitQuiz = () => {
    if (!quiz?.questions) {
      toast.error('Quiz data is invalid')
      return
    }

    // Check if all questions are answered
    const totalQuestions = quiz.questions.length
    const answeredCount = Object.keys(answers).length
    
    if (answeredCount < totalQuestions) {
      toast.error(`Please answer all questions before submitting. ${totalQuestions - answeredCount} question(s) remaining.`)
      return
    }

    // Format answers for backend - using questionIndex (number) and selectedAnswer
    const answersArray: BackendAnswer[] = Object.entries(answers).map(([index, answer]) => ({
      questionIndex: parseInt(index),
      selectedAnswer: answer as string,
    }))

    submitQuizMutation.mutate(answersArray)
  }

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-slate-500">Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (error) {
    console.error('Error loading quiz:', error)
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-slate-600 mb-2">Failed to load quiz</p>
          <p className="text-slate-500 text-sm mb-4">{error instanceof Error ? error.message : 'Unknown error'}</p>
          <button
            onClick={() => navigate(`/documents/${documentId}`)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Back to Documents
          </button>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-slate-600 mb-2">Quiz not found</p>
          <button
            onClick={() => navigate(`/documents/${documentId}`)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Back to Documents
          </button>
        </div>
      </div>
    )
  }

  // Safely access questions with fallback
  const questions = quiz.questions || []
  
  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-slate-600 mb-2">This quiz has no questions</p>
          <button
            onClick={() => navigate(`/documents/${documentId}`)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Back to Documents
          </button>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const currentAnswer = answers[currentQuestionIndex] || ''

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(`/documents/${documentId}`)}
          className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Documents
        </button>
      </div>

      {/* Quiz Title */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800">{quiz.title || 'Untitled Quiz'}</h1>
        <p className="text-slate-500 mt-1">Question {currentQuestionIndex + 1} of {questions.length}</p>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-8 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-800 mb-6">
          {currentQuestion?.text || currentQuestion?.question || 'Question text not available'}
        </h3>

        {/* Answer Options */}
        <div className="space-y-3">
          {(currentQuestion?.options || []).map((option: string, index: number) => (
            <label
              key={index}
              className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                currentAnswer === option
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/50'
              }`}
            >
              <input
                type="radio"
                name={`question-${currentQuestionIndex}`}
                value={option}
                checked={currentAnswer === option}
                onChange={(e) => handleAnswerChange(currentQuestionIndex, e.target.value)}
                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-slate-700">{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="flex items-center gap-2 px-6 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>
        
        {currentQuestionIndex === questions.length - 1 ? (
          <button
            onClick={handleSubmitQuiz}
            disabled={submitQuizMutation.isPending}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 transition-colors"
          >
            {submitQuizMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Submit Quiz'
            )}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Question Pagination */}
      <div className="flex flex-wrap justify-center gap-2">
        {questions.map((_: any, index: number) => (
          <button
            key={index}
            onClick={() => goToQuestion(index)}
            className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
              currentQuestionIndex === index
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                : answers[index]
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  )
}

export default QuizTake
