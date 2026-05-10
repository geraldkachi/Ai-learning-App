import express from "express";
import {
    getFlashcards,
    getAllFlashcardSets,
    reviewFlashcards,
    toggleStarFlashcard,
    deleteFlashcard,
} from "../controllers/flashcardsController.ts";
import protect from "../middleware/auth.ts";

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getAllFlashcardSets);
router.get('/:documentId', getFlashcards);
router.post('/:cardId/review', reviewFlashcards);
router.post('/:cardId/star', toggleStarFlashcard);
router.delete('/:id', deleteFlashcard);

export default router;