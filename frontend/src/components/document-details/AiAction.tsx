import React, {useState} from 'react'
import { useParams } from 'react-router-dom'
import aiService from '../../services/aiService'
import { toast } from 'react-hot-toast/headless'

const AiAction = () => {
        const { id: documentId } = useParams()
        const [loadingAction, setLoadingAction] = useState(null)
        const [modalOpen, setModalOpen] = useState(false)
        const [modalContent, setModalContent] = useState<React.ReactNode>(null)
        const [modalTitle, setModalTitle] = useState('')
        const [concept, setConcept] = useState('')


    const handleGenerateSummary = async () => {
        setLoadingAction('summary') 
        try {
            const { summary } = await aiService.generateSummary(documentId!)
            setModalTitle('Generated Summary');
            setModalContent(summary)
            setModalOpen(true)
        } catch (error) {
            toast.error('Failed to generate summary. Please try again.')
        } finally {
            setLoadingAction(null)
        }
    }

    const handleExplainConcept = async (e) => {
        e.preventDefault()
        if (!concept.trim()) {
            toast.error('Please enter a concept to explain.')
            return
        }
    }

  return (
    <div>AiAction</div>
  )
}

export default AiAction