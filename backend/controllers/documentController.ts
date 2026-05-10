// controllers/documentController.ts (fixed version)
import type { Request, Response, NextFunction } from 'express';
import Document from "../models/Documents.ts";
import { extractTextFromPDF } from "../utils/pdfParse.ts";
import { chunkText } from "../utils/textChunker.ts";
import fs from "fs/promises";
import mongoose from "mongoose";
import Flashcard from '../models/Flashcard.ts';
import Quiz from '../models/Quiz.ts';

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

        const { path: filePath, originalname, size, mimetype, filename } = req.file;
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
        const baseUrl = `http://localhost:${process.env.PORT || 6000}`;
        const fileUrl = `${baseUrl}/uploads/documents/${filename}`;

        // Create document in database first with 'processing' status
        const document = await Document.create({
            userId: req.user._id,
            title,
            fileName: originalname,
            filePath: fileUrl,
            fileSize: size,
            fileType: mimetype,
            status: 'processing',
            // uploadDate: new Date()
        });

        // Process PDF in background (don't await it)
        processPDF(document._id as mongoose.Types.ObjectId, filePath).catch(err => {
            console.error("PDF processing error:", err);
        });

        res.status(201).json({
            success: true,
            data: document,
            // data: {
            //     documentId: document._id,
            //     title: document.title,
            //     status: document.status,
            //     uploadDate: document.uploadDate
            // },
            message: 'Document uploaded successfully. Processing in background.',
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
            // chunks: chunks.map(chunk => ({
            //     content: chunk.content,
            //     chunkIndex: chunk.chunkIndex,
            //     pageNumber: chunk.pageNumber
            // })),
            status: 'ready'
        });
        
        console.log(`PDF processing complete for document ${documentId}`);
    } catch (error) {
        console.error("Error processing PDF: ", error);
        await Document.findByIdAndUpdate(documentId, { status: 'failed' });
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
            { $sort: { uploadDate: -1 } },
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
        next(error)
        // res.status(500).json({
        //     success: false,
        //     error: 'Error retrieving documents',
        //     statusCode: 500
        // });
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

        res.status(200).json({
            success: true,
            data: document,
            message: 'Document retrieved successfully',
            statusCode: 200
        });

        // Get counts of flashcard sets and quizzes
        const flashcardSetCount = await Flashcard.countDocuments({ documentId: document._id });
        const quizCount = await Quiz.countDocuments({ documentId: document._id });

        // uUpdate lass accessed date
        // document.lastAccessed = new Date();
        await document.save();

        // Combine document data with counts and send in response
        const documentData = document.toObject();
        // documentData.flashcardCount = flashcardCount;
        // documentData.quizCount = quizCount;

        // Include counts in response
        res.status(200).json({
            success: true,
            data: documentData,
            // data: {
            //     document,
            //     flashcardSetCount,
            //     quizCount
            // },
            message: 'Document retrieved successfully',
            statusCode: 200
        });

    } catch (error) {
        next(error);
    }
};

// @desc    delete a single user document
// @route   DELETE /api/documents/:id
// @access  Private

export const deleteDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const document = await Document.findOneAndDelete({
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
            const filePath = document.filePath.replace(`${req.protocol}://${req.get('host')}/`, '');
            await fs.unlink(filePath).catch(() => {});
        }
        // Delete Document 
        await document.deleteOne();
        // Optional: Delete the actual file from disk
        // You'd need to extract filename from document.filePath

        res.status(200).json({
            success: true,
            message: 'Document deleted successfully',
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
