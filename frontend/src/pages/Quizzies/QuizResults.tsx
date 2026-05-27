import React from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { 
  ArrowLeft, 
  Trophy, 
  Target, 
  CheckCircle, 
  XCircle,
  Loader2,
  AlertCircle
} from 'lucide-react'
import quizService from '../../services/quizService'
import type { SubmitQuizResponse } from '../../services/quizService'

const QuizResults: React.FC = () => {
  const { id: documentId, quizId } = useParams<{ id: string; quizId: string }>()
  console.log(quizId, 'result quizId')
  const navigate = useNavigate()
  const location = useLocation()
  const results = location.state?.results as SubmitQuizResponse['data'] | undefined

  // Fetch quiz results if not passed via state
  const { data: resultsData, isLoading, error } = useQuery({
    queryKey: ['quizResults', quizId],
    queryFn: async () => {
      const response = await quizService.getQuizResults(quizId!)
      return response
    },
    enabled: !!quizId && !results,
  })

  // Fetch quiz details
  const { data: quizData } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: async () => {
      const response = await quizService.getQuizById(quizId!)
      return response
    },
    enabled: !!quizId,
  })

  const quizResults = results || resultsData?.data
  const quiz = quizData?.data

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-slate-500">Loading results...</p>
        </div>
      </div>
    )
  }

  if (error || !quizResults) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-slate-600 mb-2">Failed to load results</p>
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

  const percentage = quizResults.percentage
  const passed = quizResults.passed
  const earnedPoints = quizResults.earnedPoints
  const totalPoints = quizResults.totalPoints

  // Determine feedback message based on score
  const getFeedbackMessage = () => {
    if (percentage >= 90) return 'Excellent! Great job!'
    if (percentage >= 70) return 'Good work! Keep it up!'
    if (percentage >= 50) return 'Not bad! Review and try again.'
    return 'Keep practicing! You\'ll get better.'
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <button
        onClick={() => navigate(`/documents/${documentId}`)}
        className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Documents
      </button>

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800">{quiz?.title || 'Quiz Results'}</h1>
      </div>

      {/* Score Card */}
      <div className={`rounded-2xl p-8 mb-8 text-center ${
        passed 
          ? 'bg-gradient-to-br from-emerald-500 to-teal-500' 
          : 'bg-gradient-to-br from-orange-500 to-red-500'
      } text-white shadow-lg`}>
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-4">
          {passed ? (
            <Trophy className="w-10 h-10" />
          ) : (
            <Target className="w-10 h-10" />
          )}
        </div>
        
        <div className="text-5xl font-bold mb-2">{percentage}%</div>
        <p className="text-white/90 mb-2">{getFeedbackMessage()}</p>
        <p className="text-white/80 text-sm">
          Score: {earnedPoints}/{totalPoints} points
        </p>
      </div>

      {/* Detailed Review Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Detailed Review</h2>
        <div className="space-y-6">
          {quizResults.questionResults.map((result, index) => {
            const question = quiz?.questions.find(q => q.id === result.questionId)
            
            return (
              <div key={result.questionId} className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-slate-800">
                    Question {index + 1}: {question?.text || result.questionId}
                  </h3>
                  {result.isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  )}
                </div>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-slate-500">Your answer: </span>
                    <span className={`font-medium ${result.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {Array.isArray(result.userAnswer) ? result.userAnswer.join(', ') : result.userAnswer}
                    </span>
                  </div>
                  
                  {!result.isCorrect && (
                    <div>
                      <span className="text-slate-500">Correct answer: </span>
                      <span className="font-medium text-green-600">
                        {Array.isArray(result.correctAnswer) ? result.correctAnswer.join(', ') : result.correctAnswer}
                      </span>
                    </div>
                  )}
                  
                  {result.explanation && (
                    <div className="mt-2 p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-500">Explanation: </span>
                      <span className="text-slate-700">{result.explanation}</span>
                    </div>
                  )}
                  
                  <div className="text-xs text-slate-400 mt-2">
                    Points: {result.pointsEarned}/{result.pointsPossible}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          // onClick={() => navigate(`/documents/${documentId}/quiz/${quizId}/take`)}
          onClick={() => navigate(`/quizzes/${documentId}/${quizId}`)}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-colors font-medium"
        >
          Retake Quiz
        </button>
        <button
          onClick={() => navigate(`/documents/${documentId}`)}
          className="flex-1 px-6 py-3 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
        >
          Back to Document
        </button>
      </div>
    </div>
  )
}

export default QuizResults