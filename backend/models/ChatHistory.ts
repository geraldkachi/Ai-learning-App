import mongoose from "mongoose";

const chatHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: true
    },
    messages: [
        {
            role: {
                type: String,
                enum: ['user', 'assistant'],
                required: true
            },
            content: {
                type: String, 
                required: true
            },
            timestamp: {
                type: Date,
                default: Date.now
            },
            relevantChunks: {
                type: [Number],
                default: []
            }
        }
    ] 
}, {
    timestamps: true
});

//  check index for the first query
// chatHistorySchema.index({ userId: 1, documentId: 1 });
// Add to your schema (optional - for better performance)
chatHistorySchema.index({ userId: 1, documentId: 1, 'messages._id': 1 });
chatHistorySchema.index({ updatedAt: -1 });
const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);
export default ChatHistory;