import type { Request, Response, NextFunction } from "express";
import Document from "../models/Documents.ts";
import Flashcard from "../models/Flashcard.ts";
import Quiz from "../models/Quiz.ts";

// @desc Get dashboard data
// @route GET /api/progress/dashboard
// @access Private
export const getDashboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user._id;

        // Get counts
        // Get total documents
        const totalDocuments = await Document.countDocuments({ userId });
        // Get total flashcards
        const totalFlashcardSets = await Flashcard.countDocuments({ userId });
        // Get total quizzes
        const totalQuizzes = await Quiz.countDocuments({ userId });
        // complete quizzes
        const completedQuizzes = await Quiz.countDocuments({ userId, isCompleted: true, completedAt: {$ne: null} });

       
        // Get flashcards statistics
        const flashcardsSets = await Flashcard.find({ userId })
        let totalFlashcards = 0;
        let reviewedFlashcards = 0;
        let starredFlashcards = 0;

        flashcardsSets.forEach(set => {
            totalFlashcards += set.cards.length;
            reviewedFlashcards += set.cards.filter(card => card.reviewCount > 0).length;
            starredFlashcards += set.cards.filter(card => card.isStarred).length;
        });

        // Get quizzes statistics
        const quizzes = await Quiz.find({ userId, createdAt: { $gte: null } });
        const averageQuizScore = quizzes.length > 0 ? quizzes.reduce((sum, quiz) => sum + quiz.score, 0) / quizzes.length : 0;

        // Get recent activity
        const recentDocuments = await Document.find({ userId }).sort({ lastAccessed: -1 }).limit(5).select('title filename lastAccessed status');
        const recentQuizzes = await Flashcard.find({ userId }).sort({ createdAt: -1 }).limit(5).populate('documentId', 'title').select('title score totalQuestions createdAt');

        //Study streak (simplified - in production, track daily activity)
        const studyStreak = Math.floor(Math.random() * 7) + 1; // Mock data for 1-7 day streak

        res.status(200).json({
            success: true,
            message: 'Dashboard data retrieved successfully',
            statusCode: 200,
            data: {
                overview: {
                    totalDocuments,
                    totalFlashcardSets,
                    totalFlashcards,
                    reviewedFlashcards,
                    starredFlashcards,
                    totalQuizzes,
                    completedQuizzes,
                    averageQuizScore,
                    studyStreak
                },
                recentActivity: {
                    documents: recentDocuments,
                    quizzes: recentQuizzes,
                }
            }   
        });
        
    } catch (error) {
        next(error);
    }
};

// @desc Get progress for a document
// @route GET /api/progress/:documentId
// @access Private
export const getProgress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { documentId } = req.params;
        const userId = req.user._id;

        // Get flashcard progress
        const flashcards = await Flashcard.find({ documentId, userId });
        const totalFlashcards = flashcards.length;
        const completedFlashcards = flashcards.filter(fc => fc.isCompleted).length;

        // Get quiz progress
        const quizzes = await Quiz.find({ documentId, userId });
        const totalQuizzes = quizzes.length;
        const completedQuizzes = quizzes.filter(qz => qz.isCompleted).length;

        res.status(200).json({
            success: true,
            message: 'Progress data retrieved successfully',
            statusCode: 200,
            data: {
                flashcardProgress: totalFlashcards > 0 ? (completedFlashcards / totalFlashcards) * 100 : 0,
                quizProgress: totalQuizzes > 0 ? (completedQuizzes / totalQuizzes) * 100 : 0
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc Update progress for a document
// @route PUT /api/progress/:documentId
// @access Private
export const updateProgress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { documentId } = req.params;
        const userId = req.user._id;
        const { flashcardId, quizId, isCompleted } = req.body;

        if (flashcardId) {
            const flashcard = await Flashcard.findOne({ _id: flashcardId, userId });
            if (!flashcard) {
                return res.status(404).json({
                    success: false,
                    message: 'Flashcard not found',
                    statusCode: 404
                });
            }
            flashcard.isCompleted = isCompleted;
            flashcard.completedAt = isCompleted ? new Date() : null;
            await flashcard.save();
        }

        if (quizId) {
            const quiz = await Quiz.findOne({ _id: quizId, userId });
            if (!quiz) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz not found',
                    statusCode: 404
                });
            }
            quiz.isCompleted = isCompleted;
            quiz.completedAt = isCompleted ? new Date() : null;
            await quiz.save();
        }

        res.status(200).json({
            success: true,
            message: 'Progress updated successfully',
            statusCode: 200
        });
    } catch (error) {
        next(error);
    }
};