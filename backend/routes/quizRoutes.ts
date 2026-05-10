import express from 'express';
import { 
    getQuizzes,
    getQuizById,
    submitQuiz,
    getQuizResults,
    deleteQuiz
} from '../controllers/quizController.ts';
import protect from '../middleware/auth.ts';
const router = express.Router();

// All routes are protected
router.use(protect);
    
router.get('/:documentId', getQuizzes);
router.get('/:id', getQuizById);
router.post('/:id/submit', submitQuiz);
router.get('/:id/results', getQuizResults);
router.delete('/:id', deleteQuiz);

export default router;