import mongoose from "mongoose";
const DocumentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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
 

DocumentSchema.index({ userId: 1, documentId: 1 }, { unique: true });


const Document = mongoose.model('Document', DocumentSchema);
export default Document;