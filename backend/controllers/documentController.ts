// controllers/documentController.ts
import type { Request, Response, NextFunction } from 'express';
import Document from "../models/Documents.ts";
import { extractTextFromPDF } from "../utils/pdfParse.ts";
import { chunkText } from "../utils/textChunker.ts";
import fs from "fs/promises";
import mongoose from "mongoose";
import Flashcard from '../models/Flashcard.ts';
import Quiz from '../models/Quiz.ts';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc upload document 
// @route POST /api/documents/upload
// @access Private

export const uploadDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded. Please upload a PDF file',
                statusCode: 400
            });
        }

        const { path: filePath, originalname, size, mimetype, filename: storedFilename } = req.file;
        const { title } = req.body;

        if (!title) {
            // Clean up uploaded file if title is missing
            await fs.unlink(filePath).catch(() => {});
            return res.status(400).json({
                success: false,
                error: 'Please provide a document title',
                statusCode: 400
            });
        }
        
        // Construct the URL for the uploaded file
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const fileUrl = `${baseUrl}/uploads/documents/${storedFilename}`;

        // Create document in database first with 'processing' status
        const document = await Document.create({
            userId: req.user._id,
            title,
            fileName: originalname,
            filePath: fileUrl,
            fileSize: size,
            fileType: mimetype,
            status: 'processing',
        });

        // Process PDF in background (only for PDF files)
        if (mimetype === 'application/pdf' || mimetype === 'application/octet-stream') {
            processPDF(document._id as mongoose.Types.ObjectId, filePath).catch(err => {
                console.error("PDF processing error:", err);
            });
        } else {
            // For images, mark as ready immediately
            await Document.findByIdAndUpdate(document._id, { status: 'ready' });
        }

        res.status(201).json({
            success: true,
            data: document,
            message: mimetype === 'application/pdf' ? 'Document uploaded successfully. Processing in background.' : 'Document uploaded successfully',
            statusCode: 201
        });
    } catch (error) {
        // Clean up file if there's an error
        if (req.file) {
            await fs.unlink(req.file.path).catch(() => {});
        }
        next(error);
    }
};

const processPDF = async (documentId: mongoose.Types.ObjectId, filePath: string) => {
    try {
        console.log(`Processing PDF for document ${documentId}`);
        
        // Extract text from PDF
        const { text, numPages } = await extractTextFromPDF(filePath);
        
        // Chunk the text (using appropriate chunk size)
        const chunks = chunkText(text, 500, 50);

        // Update document with extracted data
        await Document.findByIdAndUpdate(documentId, {
            extractedText: text,
            numPages,
            chunks: chunks,
            status: 'ready'
        });
        
        console.log(`PDF processing complete for document ${documentId}`);
    } catch (error) {
        console.error("Error processing PDF: ", error);
        await Document.findByIdAndUpdate(documentId, { 
            status: 'failed',
            errorMessage: error instanceof Error ? error.message : 'PDF processing failed'
        });
    }
};

// @desc    get all user documents 
// @route   GET /api/documents
// @access  Private

export const getDocuments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const documents = await Document.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(req.user._id) } },
            {
                $lookup: {
                    from: 'flashcards',
                    localField: '_id',
                    foreignField: 'documentId',
                    as: 'flashcardSets'
                }
            },
            {
                $lookup: {
                    from: 'quizzes',
                    localField: '_id',
                    foreignField: 'documentId',
                    as: 'quizzes'
                }
            },
            {
                $addFields: {
                    numFlashcardSets: { $size: '$flashcardSets' },
                    numQuizzes: { $size: '$quizzes' }
                } 
            },
            { $sort: { createdAt: -1 } },
            {
                $project: {
                    extractedText: 0,
                    chunks: 0,
                    flashcardSets: 0,
                    quizzes: 0
                }
            }
        ]);

        res.status(200).json({
            success: true,
            count: documents.length,
            data: documents,
            message: 'Documents retrieved successfully',
            statusCode: 200
        });
    } catch (error) {
        console.error('Get documents error:', error);
        next(error);
    }
};

// @desc    delete a single user document
// @route   DELETE /api/documents/:id
// @access  Private

export const deleteDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                statusCode: 404
            });
        }

        // Delete file from filesystem if it exists
        if (document.filePath) {
            try {
                // Extract filename from URL
                const filename = document.filePath.split('/').pop();
                if (filename) {
                    // Use path.join with __dirname to construct the correct file path
                    const uploadDir = path.join(__dirname, '../upload/documents');
                    const filePath = path.join(uploadDir, filename);
                    
                    // Check if file exists before trying to delete
                    await fs.access(filePath);
                    await fs.unlink(filePath);
                    console.log(`Deleted file: ${filePath}`);
                }
            } catch (fileError) {
                console.error('Error deleting file:', fileError);
                // Don't throw error if file doesn't exist, just log it
            }
        }
        
        // Delete document from database
        await document.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Document deleted successfully',
            statusCode: 200
        });
    } catch (error) {
        console.error('Delete document error:', error);
        next(error);
    }
};

// @desc    get a single user document
// @route   GET /api/documents/:id
// @access  Private

export const getDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            userId: req.user._id
        }).select('-__v');

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                statusCode: 404
            });
        }

        // Get counts of flashcard sets and quizzes
        const flashcardSetCount = await Flashcard.countDocuments({ documentId: document._id });
        const quizCount = await Quiz.countDocuments({ documentId: document._id });

        // Convert document to object and add counts
        const documentData = document.toObject();
        
        res.status(200).json({
            success: true,
            data: {
                ...documentData,
                numFlashcardSets: flashcardSetCount,
                numQuizzes: quizCount
            },
            message: 'Document retrieved successfully',
            statusCode: 200
        });
    } catch (error) {
        next(error);
    }
};

// @desc    update a user document
// @route   PUT /api/documents/:id
// @access  Private

export const updateDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title } = req.body;
        
        const document = await Document.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { title },
            { new: true, runValidators: true }
        ).select('-__v');

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                statusCode: 404
            });
        }

        res.status(200).json({
            success: true,
            data: document,
            message: 'Document updated successfully',
            statusCode: 200
        });
    } catch (error) {
        next(error);
    }
};