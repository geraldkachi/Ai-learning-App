import mongoose from "mongoose";

const flashcardSchema = new mongoose.Schema({
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
      title: {
        type: String,
        default: 'Flashcard Set'
    },
    cards: [
        {
            question: {
                type: String,
                required: [true, 'Question text is required']
            },
            answer: {
                type: String,
                required: [true, 'Answer text is required']
            },
            difficulty: {
                type: String,
                enum: ['easy', 'medium', 'hard'],
                default: 'medium'
            },
            lastReviewed: {
                 type: Date,
                 default: null
            },
            nextReview: {
                 type: Date,
                 default: null
            },
             reviewCount: {
                 type: Number,
                 default: 0
             },
             correctCount: {
                 type: Number,
                 default: 0
             },
             isStarred: {
                 type: Boolean,
                 default: false
             }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});
// flashcardSchema.index({ userId: 1, documentId: 1 }, { unique: true });
// Remove the unique index - allow multiple sets per document
// Just use a regular index for faster queries
flashcardSchema.index({ userId: 1, documentId: 1 });
flashcardSchema.index({ userId: 1, createdAt: -1 });

const Flashcard = mongoose.model('Flashcard', flashcardSchema);
export default Flashcard;   
              