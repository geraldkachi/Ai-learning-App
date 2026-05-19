// models/Documents.ts
import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true // Just a regular index, NOT unique
    },
    title: {
        type: String,
        required: [true, 'Please provide Document title is required'],
        trim: true,
        maxlength: [100, 'Document title cannot exceed 100 characters']
    },
    fileName: {
        type: String,
        required: [true, 'Original file name is required']
    },
    fileType: {
        type: String,
        required: [true, 'File type is required']
    },
    fileSize: {
        type: Number,
        required: [true, 'File size is required']
    },
    filePath: {
        type: String,
        required: [true, 'File path is required']
    },
    extractedText: {
        type: String,
        default: null
    },
    summary: {
        type: String,
        default: null
    },
    chunks: [{
        content: {
            type: String,
            required: [true, 'Document content is required']
        },
        pageNumber: {
            type: Number,
            default: null
        },
        chunkIndex: {
            type: Number,
            required: [true, 'Chunk index is required']
        }
    }],
    updateDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['processing', 'ready', 'failed'],
        default: 'processing'
    },
    errorMessage: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Only add NON-UNIQUE indexes 
// This allows multiple documents per user
DocumentSchema.index({ userId: 1, createdAt: -1 });
DocumentSchema.index({ userId: 1, status: 1 });

// DO NOT add this unless you want to prevent duplicate titles:
// DocumentSchema.index({ userId: 1, title: 1 }, { unique: true });

const Document = mongoose.model('Document', DocumentSchema);
export default Document;