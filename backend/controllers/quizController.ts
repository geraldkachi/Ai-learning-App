import type { Request, Response, NextFunction } from "express";
import Quiz from "../models/Quiz.ts";

// @desc Get All quizzes for a document
// @route GET /api/quizzes/:documentId
// @access Private
export const getQuizzes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { documentId } = req.params;
        const quizzes = await Quiz.find({ documentId, userId: req.user._id })
        .populate('documentId', 'title fileName')
        .sort({ createdAt: -1 });

        if (!quizzes) {
            return res.status(404).json({
                success: false,
                message: 'No quizzes found for this document',
                statusCode: 404
            });
        }

        res.status(200).json({
            success: true,
            message: 'Quizzes retrieved successfully',
            statusCode: 200,
            count: quizzes.length,
            data: quizzes
        });
    } catch (error) {
        next(error);
    }
};

// @desc Get a single quiz By ID
// @route GET /api/quizzes/:id
// @access Private
export const getQuizById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const quizQuestion = await Quiz.findOne({ _id: req.params.id, userId: req.user._id });

        if (!quizQuestion) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found',
                statusCode: 404
            });
        }

        res.status(200).json({
            success: true,
            message: 'Quiz question retrieved successfully',
            statusCode: 200,
            data: quizQuestion
        });
    } catch (error) {
        next(error);
    }
}

// @desc Submit a quiz Answer
// @route POST /api/quizzes/:id/submit
// @access Private

export const submitQuiz = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { answers } = req.body;
        
        // Validate answers array
        if (!Array.isArray(answers)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide answers in an array format',
                statusCode: 400
            });
        }

        // Find the quiz - remove status filter since it doesn't exist
        const quiz = await Quiz.findOne({ 
            _id: req.params.id, 
            userId: req.user._id 
        });

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found',
                statusCode: 404
            });
        }

        // Check if quiz has already been submitted
        if (quiz.completedAt) {
            return res.status(400).json({
                success: false,
                message: 'Quiz has already been submitted',
                statusCode: 400
            });
        }

        // Process answers and calculate score
        let correctCount = 0;
        const userAnswers = [];
        
        for (const answer of answers) {
            const { questionIndex, selectedAnswer } = answer;
            
            // Validate questionIndex is a number and within bounds
            if (typeof questionIndex !== 'number' || 
                questionIndex < 0 || 
                questionIndex >= quiz.questions.length) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid question index: ${questionIndex}`,
                    statusCode: 400
                });
            }
            
            // Validate selectedAnswer exists
            if (!selectedAnswer || typeof selectedAnswer !== 'string') {
                return res.status(400).json({
                    success: false,
                    message: `Invalid selected answer for question ${questionIndex}`,
                    statusCode: 400
                });
            }
            
            const question = quiz.questions[questionIndex];
            const isCorrect = question.correctAnswer === selectedAnswer;
            
            if (isCorrect) correctCount++;
            
            userAnswers.push({
                questionIndex,
                selectedAnswer,
                isCorrect,
                answeredAt: new Date()
            });
        }

        // Calculate score (percentage)
        const score = Math.round((correctCount / quiz.totalQuestions) * 100);

        // Save user answers and score to quiz document
        // quiz.userAnswers = userAnswers;
        quiz.userAnswers = [] as any;
        
        // OR better - clear without reassigning:
        // quiz.userAnswers.splice(0, quiz.userAnswers.length); // Option 2: Clear in place

          userAnswers.forEach(answer => {
            quiz.userAnswers.push(answer);
        })
        quiz.score = score;
        quiz.completedAt = new Date();
        await quiz.save();

        res.status(200).json({
            success: true,
            message: 'Quiz submitted successfully',
            statusCode: 200,
            data: {
                quizId: quiz._id,
                score,
                correctCount,
                totalQuestions: quiz.totalQuestions,
                percentage: score,
                userAnswers: userAnswers.map(answer => ({
                    questionIndex: answer.questionIndex,
                    selectedAnswer: answer.selectedAnswer,
                    isCorrect: answer.isCorrect
                }))
            }
        });
    } catch (error) {
        next(error);
    }
}

// @desc Get quiz results
// @route GET /api/quizzes/:id/results
// @access Private
export const getQuizResults = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const quizQuestion = await Quiz.findOne({ 
            _id: req.params.id, 
            userId: req.user._id,})
            .populate('documentId', 'title');

        if (!quizQuestion) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found',
                statusCode: 404
            });
         }
        if (!quizQuestion.completedAt) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not completed yet',
                statusCode: 404
            });
         }

         // Build details result
         const detailedResults = quizQuestion.questions.map((question, index) => {
            const userAnswer = quizQuestion.userAnswers?.find(ans => ans.questionIndex === index);
            return {
                question: question.question,
                options: question.options,
                correctAnswer: question.correctAnswer,
                userAnswer: userAnswer ? userAnswer.selectedAnswer : null,
                isCorrect: userAnswer ? userAnswer.isCorrect : false,
                explanation: question.explanation
            } 
         });

        // For simplicity, we are just returning the correct answer and explanation here.
        // In a real application, you would likely want to track user answers and calculate results based on that.
        res.status(200).json({
            success: true,
            data: {
                quiz: {
                    id: quizQuestion._id,
                    title: quizQuestion.title,
                    document: quizQuestion.documentId,
                    score: quizQuestion.score,
                    totalQuestions: quizQuestion.totalQuestions,
                    percentage: quizQuestion.score,
                    completedAt: quizQuestion.completedAt,
                },
                result: detailedResults
            },
            message: 'Quiz results retrieved successfully',
            statusCode: 200
         });
    } catch (error) { 
         next(error);
    }
}

// @desc Delete a quiz
// @route DELETE /api/quizzes/:id
// @access Private
export const deleteQuiz = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const quizQuestion = await Quiz.findOne({ _id: req.params.id, userId: req.user._id });

        if (!quizQuestion) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found',
                statusCode: 404
            });
        }

        await quizQuestion.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Quiz deleted successfully',
            statusCode: 200
        });
    } catch (error) {
         next(error);
    }
}