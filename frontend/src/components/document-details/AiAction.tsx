import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { FileText, Lightbulb, Loader2, X, Sparkles, ChevronRight } from 'lucide-react'
import aiService from '../../services/aiService'
import MarkdownRenderer from '../ui/MarkdownRenderer'

// ── Types ────────────────────────────────────────────────────────────────────

interface SummaryResponse {
  success: boolean
  data: {
    documentId: string
    title: string
    summary: string
  }
  message: string
  statusCode: number
}

interface ExplainConceptResponse {
  success: boolean
  data: {
    concept: string
    explanation: string
    relevantChunks: number[]
  }
  message: string
  statusCode: number
}

interface ModalState {
  isOpen: boolean
  title: string
  content: string
}

// ── Sub-components ────────────────────────────────────────────────────────────

const ResultModal: React.FC<{
  modal: ModalState
  onClose: () => void
}> = ({ modal, onClose }) => {
  if (!modal.isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-200/60 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-semibold text-slate-800">{modal.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <MarkdownRenderer content={modal.content} />
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

const AIActions: React.FC = () => {
  const { id: documentId } = useParams<{ id: string }>()
  const [concept, setConcept] = useState<string>('')
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    title: '',
    content: '',
  })

  const openModal = (title: string, content: string) => {
    setModal({ isOpen: true, title, content })
  }

  const closeModal = () => {
    setModal((prev) => ({ ...prev, isOpen: false }))
  }

  // ── Summary Mutation ──────────────────────────────────────────────────────

  const summaryMutation = useMutation<SummaryResponse, Error>({
    mutationFn: async () => await aiService.generateSummary(documentId!),
    onSuccess: (data) => {
        console.log(data, 'data summary')
      openModal('Document Summary', data.data.summary)
    },
    onError: (error: any) => {
        console.error('Summary generation error:', error)
      const message =
        error?.response?.data?.message || error?.error || 'Failed to generate summary. Please try again.'
      toast.error(message)
    },
  })

  // ── Explain Concept Mutation ──────────────────────────────────────────────

  const explainMutation = useMutation<ExplainConceptResponse, Error, string>({
    mutationFn: (conceptText: string) =>
      aiService.explainConcept(documentId!, conceptText),
    onSuccess: (data) => {
      openModal(`Explanation: ${data.data.concept}`, data.data.explanation)
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Failed to explain concept. Please try again.'
      toast.error(message)
    },
  })

  const handleExplainConcept = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!concept.trim()) {
      toast.error('Please enter a concept to explain.')
      return
    }
    explainMutation.mutate(concept.trim())
  }

  const isAnythingLoading = summaryMutation.isPending || explainMutation.isPending

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 p-5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl text-white shadow-lg shadow-emerald-200">
          <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-base leading-tight">AI Assistant</p>
            <p className="text-emerald-100 text-xs mt-0.5">Powered by advanced AI</p>
          </div>
        </div>

        {/* Generate Summary Card */}
        <div className="group p-5 bg-gradient-to-br from-slate-50/50 to-white rounded-2xl border border-slate-200/60 hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-50 transition-all duration-200">
          <div className="flex items-start gap-3 mb-4">
            <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-800 text-sm">Generate Summary</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Get a concise summary of the entire document.
              </p>
            </div>
          </div>

          <button
            onClick={() => summaryMutation.mutate()}
            disabled={isAnythingLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-medium rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md hover:shadow-emerald-200 active:scale-[0.98]"
          >
            {summaryMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Summarizing…
              </>
            ) : (
              <>
                Summarize
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Explain Concept Card */}
        <div className="group p-5 bg-gradient-to-br from-slate-50/50 to-white rounded-2xl border border-slate-200/60 hover:border-amber-200 hover:shadow-md hover:shadow-amber-50 transition-all duration-200">
          <div className="flex items-start gap-3 mb-4">
            <div className="h-9 w-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 group-hover:bg-amber-100 transition-colors">
              <Lightbulb className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-800 text-sm">Explain a Concept</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Enter a topic or concept from the document to get a detailed explanation.
              </p>
            </div>
          </div>

          <form onSubmit={handleExplainConcept} className="space-y-3">
            <input
              type="text"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="e.g. React JSX, closures…"
              disabled={isAnythingLoading}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-300 disabled:bg-slate-50 disabled:cursor-not-allowed transition-all"
            />
            <button
              type="submit"
              disabled={isAnythingLoading || !concept.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white text-sm font-medium rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md hover:shadow-amber-200 active:scale-[0.98]"
            >
              {explainMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Explaining…
                </>
              ) : (
                <>
                  Explain
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Result Modal */}
      <ResultModal modal={modal} onClose={closeModal} />
    </>
  )
}

export default AIActions