import React from 'react'
import { useQuery } from '@tanstack/react-query'
import Spinner from '../../components/ui/Spinner'
import progressService from '../../services/progressService'
import toast from 'react-hot-toast'
import { FileText, BookOpen, BrainCircuit, Clock } from "lucide-react"

// Query key constants
const DASHBOARD_QUERY_KEY = ['dashboard']

const Dashboard = () => {
  const { 
    data: dashboardData, 
    isLoading, 
    error, 
    refetch,
  } = useQuery({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: async () => {
      const response = await progressService.getDashboardData()
      return response
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  })

  React.useEffect(() => {
    if (error) {
      toast.error(error.message || 'Failed to load dashboard data')
    }
  }, [error])

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <Spinner />
      </div>
    )
  }

  if (!dashboardData || !dashboardData.data) {
    return (
      <div className='flex items-center justify-center h-full'>
        <div className="text-center">
          <p className="text-gray-500">No dashboard data available</p>
          <button 
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Calculate totals for the design
  const totalDocuments = dashboardData.data?.overview?.totalDocuments || 0
  const totalFlashcards = dashboardData.data?.overview?.totalFlashcards || 0
  const totalQuizzes = dashboardData.data?.overview?.totalQuizzes || 0

  // Sample recent activity data structure matching your design
  const recentActivities = [
    ...(dashboardData.data?.recentActivity?.documents?.map((doc: any) => ({
      id: doc._id,
      type: 'document',
      title: doc.title,
      timestamp: doc.accessedAt || new Date().toISOString(),
      action: 'Accessed Document'
    })) || []),
    ...(dashboardData.data?.recentActivity?.quizzes?.map((quiz: any) => ({
      id: quiz._id,
      type: 'quiz',
      title: quiz.title || `${quiz.documentId?.title} Quiz`,
      timestamp: quiz.createdAt,
      action: 'Attempted Quiz'
    })) || [])
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
          <p className="text-sm text-gray-500">Track your learning progress and activity</p>
        </div>

        {/* Stats Cards - Exactly matching the design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Total Documents Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">TOTAL DOCUMENTS</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalDocuments}</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total Flashcards Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">TOTAL FLASHCARDS</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalFlashcards}</p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Total Quizzes Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">TOTAL QUIZZES</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalQuizzes}</p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <BrainCircuit className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Section - Exactly matching the design */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              Recent Activity
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action}: {activity.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {activity.timestamp && !isNaN(new Date(activity.timestamp).getTime()) 
                          ? new Date(activity.timestamp).toLocaleString('en-GB', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            }).replace(',', ',')
                          : 'Invalid Date'}
                      </p>
                    </div>
                    <button className="ml-4 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
                      View
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center">
                <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard