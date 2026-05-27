import React, { useState, useEffect, useRef } from 'react'
import { Send, MessageSquare, Sparkle, AlertCircle } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import aiService from '../../services/aiService'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../ui/Spinner'
import MarkdownRenderer from '../ui/MarkdownRenderer'
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Type definitions based on your actual API responses
interface ChatMessage {
    id: string | number
    role: 'user' | 'assistant'
    content: string
    timestamp: string
    documentId?: string
}

// Your actual getChatHistory response structure
interface GetChatHistoryResponse {
    success: boolean
    data: Array<{
        _id?: string
        role: 'user' | 'assistant'
        content: string
        timestamp: Date
        relevantChunks?: number[]
    }>
    message: string
    statusCode: number
}

// Your actual chat API response structure
interface ChatApiResponse {
    success: boolean
    data: {
        question: string
        answer: string
        relevantChunks: number[]
        chatHistoryId: string
    }
    message: string
    statusCode: number
}

interface ErrorWithResponse {
    response?: {
        status?: number
        data?: {
            message?: string
        }
    }
    status?: number
    message?: string
}

const ChatInterface: React.FC = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [input, setInput] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [error, setError] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const { id } = useParams<{ id: string }>()

    // Fetch chat history using React Query
    const {
        data: chatHistoryData,
        isLoading: isLoadingHistory,
        error: historyError,
        refetch
    } = useQuery<GetChatHistoryResponse>({
        queryKey: ['chatHistory', id],
        queryFn: async () => {
            const response = await aiService.getChatHistory(id!)
            return response
        },
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
        retry: 1,
    })

    // Initialize messages from chat history
    useEffect(() => {
        if (chatHistoryData?.data && Array.isArray(chatHistoryData.data)) {
            // Transform backend messages to frontend format
            const formattedMessages: ChatMessage[] = chatHistoryData.data.map((msg, index) => ({
                id: msg._id || Date.now() + index,
                role: msg.role,
                content: msg.content,
                timestamp: typeof msg.timestamp === 'string' ? msg.timestamp : msg.timestamp.toISOString(),
                documentId: id
            }))
            setMessages(formattedMessages)
        }
    }, [chatHistoryData, id])

    const scrollToBottom = (): void => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, loading])

    const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault()
        if (!input.trim() || loading || !id) return

        const userMessage: ChatMessage = {
            id: Date.now(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date().toISOString(),
            documentId: id
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setLoading(true)
        setError(null)

        try {
            const response = await aiService.chat(id, input.trim()) as ChatApiResponse
            
            console.log('Chat API Response:', response)
            
            // Extract the answer from the actual response structure
            let assistantContent = ''
            
            if (response.data?.answer) {
                assistantContent = response.data.answer
            } else if (response.message) {
                assistantContent = response.message
            } else {
                assistantContent = 'Sorry, I could not process your request.'
            }
            
            const assistantMessage: ChatMessage = {
                id: Date.now() + 1,
                role: 'assistant',
                content: assistantContent,
                timestamp: new Date().toISOString(),
                documentId: id
            }
            
            setMessages(prev => [...prev, assistantMessage])
            
            // Invalidate and refetch chat history to ensure consistency
            queryClient.invalidateQueries({ queryKey: ['chatHistory', id] })
        } catch (err) {
            console.error('Error sending message:', err)
            const errorObj = err as ErrorWithResponse
            
            // Check if it's a 401 error
            if (errorObj?.response?.status === 401 || errorObj?.status === 401) {
                setError('Session expired. Redirecting to login...')
                setTimeout(() => {
                    navigate('/login')
                }, 1500)
            } else {
                const errorMessage = errorObj?.response?.data?.message || errorObj?.message || 'Failed to send message. Please try again.'
                setError(errorMessage)
            }
            
            // Remove the user message if the API call failed
            setMessages(prev => prev.filter(msg => msg.id !== userMessage.id))
        } finally {
            setLoading(false)
        }
    }

    if (isLoadingHistory) {
        return (
            <div className='flex flex-col h-[70vh] bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl items-center justify-center shadow-xl'>
                <div className="h-14 w-14 rounded-2xl bg-linear-to-br from-emerald-100 flex items-center justify-center mb-4">
                    <MessageSquare className='w-7 h-7 text-emerald-600' strokeWidth="2" />
                </div>
                <Spinner />
                <div className='text-sm text-slate-500 mt-3 font-medium'>Loading chat history...</div>
            </div>
        )
    }

    if (historyError) {
        const errorObj = historyError as ErrorWithResponse
        const isUnauthorized = errorObj?.response?.status === 401 || errorObj?.status === 401
        
        if (isUnauthorized) {
            return (
                <div className='flex flex-col items-center justify-center h-[70vh] bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl'>
                    <AlertCircle className='w-16 h-16 text-red-500 mb-4' />
                    <h3 className='text-xl font-semibold text-slate-800 mb-2'>Session Expired</h3>
                    <p className='text-slate-600 mb-4'>Please login again to continue</p>
                    <button
                        onClick={() => navigate('/login')}
                        className='px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors'
                    >
                        Go to Login
                    </button>
                </div>
            )
        }
        
        return (
            <div className='flex items-center justify-center h-[70vh] bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl'>
                <div className='text-center'>
                    <AlertCircle className='w-12 h-12 text-red-500 mx-auto mb-3' />
                    <p className='text-red-500'>Error loading chat history</p>
                    <p className='text-sm text-slate-500 mt-2'>{errorObj?.response?.data?.message || errorObj?.message}</p>
                    <button
                        onClick={() => refetch()}
                        className='mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700'
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className='flex flex-col h-[70vh] bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl overflow-hidden'>
            {/* Header */}
            <div className='flex items-center justify-between px-6 py-4 border-b border-slate-200/60 bg-white/50'>
                <div className='flex items-center gap-3'>
                    <div className='h-10 w-10 rounded-xl bg-linear-to-br from-emerald-500 to-teal-500 flex items-center justify-center'>
                        <Sparkle className='w-5 h-5 text-white' />
                    </div>
                    <div>
                        <h2 className='font-semibold text-slate-800'>Chat Assistant</h2>
                        <p className='text-xs text-slate-500'>Ask questions about your document</p>
                    </div>
                </div>
                <div className='text-xs text-slate-400'>
                    {messages.length > 0 && `${messages.length} messages`}
                </div>
            </div>

            {/* Messages Container */}
            <div className='flex-1 overflow-y-auto p-6 space-y-4'>
                {messages.length === 0 ? (
                    <div className='flex flex-col items-center justify-center h-full text-center'>
                        <div className='h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4'>
                            <MessageSquare className='w-8 h-8 text-emerald-600' />
                        </div>
                        <h3 className='text-lg font-semibold text-slate-700 mb-2'>Start a conversation</h3>
                        <p className='text-sm text-slate-500 max-w-md'>
                            Ask questions about your document and I'll help you understand its contents better.
                        </p>
                    </div>
                ) : (
                    messages.map((message, index) => (
                        <div
                            key={message.id || index}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                    message.role === 'user'
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-slate-100 text-slate-700'
                                }`}
                            >
                                {message.role === 'assistant' ? (
                                    <MarkdownRenderer content={message.content} />
                                ) : (
                                    <p className='whitespace-pre-wrap'>{message.content}</p>
                                )}
                            </div>
                        </div>
                    ))
                )}
                
                {loading && (
                    <div className='flex justify-start'>
                        <div className='bg-slate-100 rounded-2xl px-2 py-2'>
                            <div className='flex items-center gap-2'>
                                <Spinner />
                                <span className='text-sm text-slate-500'>...</span>
                            </div>
                        </div>
                    </div>
                )}
                
                {error && (
                    <div className='flex justify-center'>
                        <div className='bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-red-600 text-sm flex items-center gap-2'>
                            <AlertCircle className='w-4 h-4' />
                            {error}
                        </div>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className='p-4 border-t border-slate-200/60 bg-white/50'>
                <div className='flex gap-3'>
                    <input
                        type='text'
                        value={input}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                        placeholder='Ask a question about your document...'
                        disabled={loading}
                        className='flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed'
                    />
                    <button
                        type='submit'
                        disabled={!input.trim() || loading}
                        className='px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                    >
                        <Send className='w-4 h-4' />
                        Send
                    </button>
                </div>
            </form>
        </div>
    )
}

export default ChatInterface