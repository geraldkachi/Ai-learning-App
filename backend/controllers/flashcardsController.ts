import type { Request, Response, NextFunction } from "express"
import Flashcard from "../models/Flashcard.ts";

// @desc get all flashcards for a document
// @route GET /api/flashcards/:documentId
// @access Private
export const getFlashcards = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { documentId } = req.params;
        const flashcards = await Flashcard.find({ documentId, userId: req.user._id })
        .populate('documentId', 'title fileName')
        .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: flashcards.length,
            data: flashcards
        });
    } catch (error) {
        console.error("Error fetching flashcards: ", error);
        // res.status(500).json({
        //     success: false,
        //     error: 'Server Error',
        //     statusCode: 500
        // }); 
        next(error);
    }
}

// @desc GET all flashcard set for a user
// @route GET /api/flashcards
// @access Private
export const getAllFlashcardSets = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const flashcardSets = await Flashcard.find({ userId: req.user._id })
        .populate('documentId', 'title')
        .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: flashcardSets.length,
            data: flashcardSets,
            message: 'Flashcard sets retrieved successfully',
            statusCode: 200
        });
    } catch (error) {
        console.error("Error fetching flashcard sets: ", error);
        next(error);
    }
}

//@desc Marl flashcard as reviewed
//@route PUT /api/flashcards/:id/review
//@access Private
export const reviewFlashcards = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const flashcard = await Flashcard.findOne({ 
            // _id: req.params.id, 
            "cards._id": req.params.cardId, 
            userId: req.user._id 
        });

        if (!flashcard) {
            return res.status(404).json({
                success: false,
                error: 'Flashcard set or card not found',
                statusCode: 404
            });
        }
        const cardIndex = flashcard.cards.findIndex(card => card._id.toString() === req.params.cardId);
        if (cardIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Flashcard card not found in set',
                statusCode: 404
            });
        }
        
        // Update flashcard as reviewed
        flashcard.cards[cardIndex].lastReviewed = new Date();
        // flashcard.cards[cardIndex].reviewCount = (flashcard.cards[cardIndex].reviewCount || 0) + 1;
        flashcard.cards[cardIndex].reviewCount += 1;
        await flashcard.save();

        res.status(200).json({
            success: true,
            data: flashcard,
            message: 'Flashcard reviewed successfully',
            statusCode: 200
        });
    } catch (error) {
        console.error("Error reviewing flashcard: ", error);
        next(error);
    }
}   

// @desc Toggle set/favorite on flashcard
// @route POST /api/flashcards/:documentId
// @access Private

export const toggleStarFlashcard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, cardId } = req.params;
        const flashcard = await Flashcard.findOne({ 
            "cards._id": cardId, 
            userId: req.user._id 
        });
        if (!flashcard) {
            return res.status(404).json({
                success: false,
                error: 'Flashcard not found',
                statusCode: 404
            });
        }
        // Toggle star/favorite
        // flashcard.starred = !flashcard.starred;
        const cardIndex = flashcard.cards.findIndex(card => card._id.toString() === cardId);
        if (cardIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Flashcard card not found in set',
                statusCode: 404
            });
        }
        flashcard.cards[cardIndex].isStarred = !flashcard.cards[cardIndex].isStarred;
        await flashcard.save();

        res.status(200).json({
            success: true,
            data: flashcard,
            message: `Flashcard ${flashcard.cards[cardIndex].isStarred ? 'starred' : 'unstarred'} successfully`,
            statusCode: 200
        });
    } catch (error) {
        console.error("Error toggling star on flashcard: ", error);
        next(error);
    }
}


// @desc delete flashcard set for a user
// @route DELETE /api/flashcards/:documentId
// @access Private

export const deleteFlashcard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const flashcardSet = await Flashcard.findOne({ 
            _id: id, 
            userId: req.user._id 
        });
        if (!flashcardSet) {
            return res.status(404).json({
                success: false,
                error: 'Flashcard set not found',
                statusCode: 404
            });
        }
        await flashcardSet.deleteOne();
        res.status(200).json({
            success: true,
            message: 'Flashcard set deleted successfully',
            statusCode: 200
        });
    } catch (error) {
        console.error("Error deleting flashcard set: ", error);
        next(error);
    }
}

// @desc create flashcard set for a user
// @route POST /api/flashcards/:documentId
// @access Private

export const createFlashcardSet = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { documentId } = req.params;
        const { title, flashcards } = req.body;

        // Create flashcard set
        const newFlashcardSet = new Flashcard({
            documentId,
            userId: req.user._id,
            title,
            flashcards
        });

        await newFlashcardSet.save();

        res.status(201).json({
            success: true,
            data: newFlashcardSet,
            message: 'Flashcard set created successfully',
            statusCode: 201
        });
    } catch (error) {
        console.error("Error creating flashcard set: ", error);
        res.status(500).json({
            success: false,
            error: 'Server Error',
            statusCode: 500
        });
    }
}