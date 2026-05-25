import express  from 'express';
import { 
    generateFlashcards,
    generateQuiz,
    generateSummary,
    chat,
    explainConcept,
    getChatHistory,
    deleteSingleMessage,
    deleteChatHistory,
} from '../controllers/aiController.ts';
import protect from '../middleware/auth.ts';

const router = express.Router()
router.use(protect)

router.post('/generate-flashcards', generateFlashcards)
router.post('/generate-quiz', generateQuiz)
router.post('/generate-summary', generateSummary)
router.post('/chat', chat)
router.post('/explain-concept', explainConcept)
router.get('/chat-history/:documentId', getChatHistory)

// Add these new routes
router.delete('/chat-history/:documentId', deleteChatHistory)                    // Delete entire chat history
router.delete('/chat-history/:documentId/message/:messageId', deleteSingleMessage)  // Delete single message

export default router