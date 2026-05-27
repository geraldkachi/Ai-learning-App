import type { Request, Response, NextFunction } from "express"
import ChatHistory from "../models/ChatHistory.ts";
import Document from "../models/Documents.ts";
import Flashcard from "../models/Flashcard.ts";
import Quiz from "../models/Quiz.ts";
import * as geminiService from "../utils/geminiService.ts";
import {  findRelevantChunks } from "../utils/textChunker.ts";

//@desc Generate flascards from document
//@route POST /api/ai/generate-flashcards
//@access Private
export const generateFlashcards = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { documentId , count = 10} = req.body;
        const document = await Document.findOne({ _id: documentId, userId: req.user._id, status: 'ready' });
        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found or not ready',
                statusCode: 404
            });
        }

         if (!documentId) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a valid document ID',
                statusCode: 400
            });
        }
        

        // Extract text from document and chunk it
        // const textChunks = await findRelevantChunksSimple(document.filePath, '', 3);

        // Generate flashcards using Gemini API
        const cards = await geminiService.generateFlashcards(
            document.extractedText || '',
            parseInt(count as string, 10),
            // textChunks,
        );

        // Save flashcards to database
        const flashcardSet = await Flashcard.create({
            userId: req.user._id,
            documentId: document._id,
            cards: cards.map((card: any) => ({
                question: card.question,
                answer: card.answer,
                difficulty: card.difficulty,
                reviewCount: 0,
                isStarred: false
            }))
            // flashcards
        });
        // const flashcardDoc = new Flashcard({
        //     userId: req.user._id,
        //     documentId: document._id,
        //     title: `Flashcards for ${document.originalName}`,
        //     flashcards
        // });
        // await flashcardDoc.save();

        res.status(201).json({
            success: true,
            data: flashcardSet,
            message: 'Flashcards generated successfully',
            statusCode: 201
         });
    } catch (error) {
        console.error('Error generating flashcards:', error);
        next(error);
    }
}

// @desc Generate quiz from document
// @route POST /api/ai/generate-quiz
// @access Private
export const generateQuiz = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { documentId, numQuestions = 5, title } = req.body;
        const document = await Document.findOne({ _id: documentId, userId: req.user._id, status: 'ready' });
        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found or not ready',
                statusCode: 404
            });
        }
        if (!documentId) {
            return res.status(404).json({
                success: false,
                error: 'Please provide a valid document ID',
                statusCode: 404
            });
        }

        // generate quiz from document
        const questions = await geminiService.generateQuiz(document.extractedText || '', parseInt(numQuestions as string, 10));

        // Generate quiz using Gemini API
        // const quizData = await geminiService.generateQuizFromText(textChunks);

        // Save quiz to database
        // Save quiz to database - USING create() (Recommended)
        const quizDoc = await Quiz.create({
            userId: req.user._id,
            documentId: document._id,
            title: title || `${document.title} - Quiz`,
            questions: questions,
            totalQuestions: questions.length,
            userAnswers: [],
            score: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        res.status(201).json({
            success: true,
            data: quizDoc,
            message: 'Quiz generated successfully',
            statusCode: 201
         });
    } catch (error) {
        console.error('Error generating quiz:', error);
        next(error);
    }
}

// @desc Generate summary from document
// @route POST /api/ai/generate-summary
// @access Private
export const generateSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { documentId } = req.body;
        const document = await Document.findOne({ _id: documentId, userId: req.user._id , status: "ready"});
        if (!documentId) {
            return res.status(404).json({
                success: false,
                error: 'Please Provide Document ID',
                statusCode: 404
            });
        }
        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found or not ready',
                statusCode: 404
            });
        }

        // // Generate summary using Gemini API
        const summary = await geminiService.generateSummary(document.extractedText || '');

        res.status(200).json({
            success: true,
            data: { 
                documentId: document._id,
                title:document.title, 
                summary 
            },
            message: 'Summary generated successfully',
            statusCode: 200
         });
    }   catch (error) {
        console.error('Error generating summary:', error);
        next(error);
    }
}

// @desc  Chat with document
// @route POST /api/ai/chat
// @access Private

export const chat = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { documentId, question } = req.body;

        // ✅ Validate inputs BEFORE hitting the database
        if (!documentId || !question) {
            return res.status(400).json({
                success: false,
                error: 'Please provide both document ID and question',
                statusCode: 400
            });
        }

        const document = await Document.findOne({ 
            _id: documentId, 
            userId: req.user._id, 
            status: "ready" 
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                statusCode: 404
            });
        }

        const mappedChunks = document.chunks.map(chunk => ({
            content: chunk.content,
            chunkIndex: chunk.chunkIndex,
            pageNumber: chunk.pageNumber ?? 0
        }));

        const relevantChunks = await findRelevantChunks(mappedChunks, question, 3);
        const chunkIndices = relevantChunks.map((chunk) => chunk.chunkIndex);

        let chatHistory = await ChatHistory.findOne({ userId: req.user._id, documentId });
        if (!chatHistory) {
            chatHistory = await ChatHistory.create({
                userId: req.user._id,
                documentId,
                messages: []
            });
        }

        const answer = await geminiService.chatWithContext(question, relevantChunks);

        chatHistory.messages.push({ 
            role: 'user', 
            content: question, 
            timestamp: new Date(), 
            relevantChunks: [] 
        });
        chatHistory.messages.push({ 
            role: 'assistant', 
            content: answer, 
            timestamp: new Date(), 
            relevantChunks: chunkIndices 
        });
        await chatHistory.save();

        res.status(200).json({
            success: true,
            data: { 
                question, 
                answer, 
                relevantChunks: chunkIndices, 
                chatHistoryId: chatHistory._id 
            },
            message: 'Chat response generated successfully', 
            statusCode: 200
        });
    } catch (error) {
        console.error('Error in chat:', error);
        next(error);
    }  
}

// @desc Explain concept from document
// @route POST /api/ai/explain-concept
// @access Private
export const explainConcept = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { documentId, concept } = req.body;
        const document = await Document.findOne({ 
            _id: documentId, 
            userId: req.user._id, 
            status: "ready" 
        });

        if (!documentId) {
            return res.status(404).json({
                success: false,
                error: 'Please provide a valid document ID',
                statusCode: 404
            });
        }
        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found or not ready',
                statusCode: 404
            });
        }

        // OR better: map to expected format
        const mappedChunks = document.chunks.map(chunk => ({
            content: chunk.content,
            chunkIndex: chunk.chunkIndex,
            pageNumber: chunk.pageNumber ?? 0 // Provide default if needed
        }));
        // Extract text from document and chunk it
        const relevantChunks = await findRelevantChunks(mappedChunks, concept, 3);
        // const relevantChunks = await findRelevantChunks(mappedChunks, concept, 3);
        const context = relevantChunks.map((c) => `${c.content}`).join('\n\n');
        // const context = relevantChunks.map((c, i) => `[Chunk ${i + 1}]\n${c.content}`).join('\n\n');
        // Generate explanation using Gemini API
        const explanation = await geminiService.explainConcept(concept, context);

        res.status(200).json({
            success: true,
            data: { concept, explanation, relevantChunks: relevantChunks.map(c => c.chunkIndex) },
            message: 'Concept explained successfully',
            statusCode: 200
         });
    } catch (error) {
        console.error('Error explaining concept:', error);
        next(error);
    }
}

// @desc Get chat history for a document
// @route GET /api/ai/chat-history/:documentId
// @access Private

export const getChatHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { documentId } = req.params;

        // ✅ Validate documentId FIRST before any DB call
        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a valid document ID',
                statusCode: 400
            });
        }

        const document = await Document.findOne({ 
            _id: documentId, 
            userId: req.user._id, 
            status: "ready"   // 'status: ready' is correct here on Document
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                statusCode: 404
            });
        }

        // ✅ Removed the wrong `status: "ready"` filter — ChatHistory has no status field
        const chatHistory = await ChatHistory.findOne({ 
            userId: req.user._id, 
            documentId 
        });

        if (!chatHistory) {
            return res.status(200).json({
                success: true,
                data: [],
                message: 'No chat history found for this document',
                statusCode: 200
            }); 
        }

        res.status(200).json({
            success: true,
            data: chatHistory.messages,   // ✅ Full messages with _id included
            message: 'Chat history retrieved successfully', 
            statusCode: 200
        });
    } catch (error) {
        console.error('Error retrieving chat history:', error);
        next(error);
    }
}

////////////////////////

// @desc Delete chat history for a document
// @route DELETE /api/ai/chat-history/:documentId
// @access Private
export const deleteChatHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { documentId } = req.params;

        // Validate documentId
        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a valid document ID',
                statusCode: 400
            });
        }

        // Verify document exists and belongs to user
        const document = await Document.findOne({ 
            _id: documentId, 
            userId: req.user._id, 
            status: "ready" 
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                statusCode: 404
            });
        }

        // Delete chat history
        const deletedChat = await ChatHistory.findOneAndDelete({ 
            userId: req.user._id, 
            documentId 
        });

        if (!deletedChat) {
            return res.status(200).json({
                success: true,
                data: null,
                message: 'No chat history found to delete',
                statusCode: 200
            });
        }

        res.status(200).json({
            success: true,
            data: { documentId, deleted: true },
            message: 'Chat history deleted successfully',
            statusCode: 200
        });
    } catch (error) {
        console.error('Error deleting chat history:', error);
        next(error);
    }
};

// @desc Delete a single message from chat history
// @route DELETE /api/ai/chat-history/:documentId/message/:messageId
// @access Private
export const deleteSingleMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { documentId, messageId } = req.params;

        if (!documentId || !messageId) {
            return res.status(400).json({
                success: false,
                error: 'Please provide both document ID and message ID',
                statusCode: 400
            });
        }

        // Verify document exists
        const document = await Document.findOne({ 
            _id: documentId, 
            userId: req.user._id 
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                statusCode: 404
            });
        }

        // Remove specific message from chat history
        const chatHistory = await ChatHistory.findOne({ 
            userId: req.user._id, 
            documentId 
        },
          { 
                $pull: { 
                    messages: { _id: messageId } 
                } 
            },
            { 
                new: true // Return the updated document
            }
    );

        if (!chatHistory) {
            return res.status(404).json({
                success: false,
                error: 'Chat history not found',
                statusCode: 404
            });
        }

        // Filter out the message to delete
        const initialLength = chatHistory.messages.length;
        // chatHistory.messages = chatHistory.messages.filter(
        //     (msg: any) => msg._id.toString() !== messageId
        // );
        // Check if message exists before pulling
        const messageExists = chatHistory.messages.some(
            (msg: any) => msg._id.toString() === messageId
        );

        if (!messageExists) {
            return res.status(404).json({
                success: false,
                error: 'Message not found',
                statusCode: 404
            });
        }

        if (chatHistory.messages.length === initialLength) {
            return res.status(404).json({
                success: false,
                error: 'Message not found',
                statusCode: 404
            });
        }

         // Remove the message using pull
        chatHistory.messages.pull({ _id: messageId });
        await chatHistory.save();

        res.status(200).json({
            success: true,
            data: { 
                documentId, 
                messageId, 
                remainingMessages: chatHistory.messages.length 
            },
            message: 'Message deleted successfully',
            statusCode: 200
        });
    } catch (error) {
        console.error('Error deleting message:', error);
        next(error);
    }
};