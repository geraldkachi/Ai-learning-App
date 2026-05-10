import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    // description: {
    //     type: String,
    //     trim: true,
    //     maxlength: [500, 'Quiz description cannot exceed 500 characters']
    // },
    questions: [
        {
            question: {
                type: String,
                required: [true, 'Question text is required']
            },
          
            options: {
                type: [String],
                required: true,
                // validate: [(array: any) => array.length > 0, 'At least one option is required']
                validate: [(array: any) => array.length === 4, 'Must have exactly 4 options']
            },
            correctAnswer: {
                type: String,
                default: null
            },
            explanation: {
                type: String,
                default: null
            },
            difficulty: {
                type: String,
                enum: ['easy', 'medium', 'hard'],
                default: 'medium'
            },
        }
    ],
    userAnswers: [{
        questionIndex: {
            type: Number,
            required: true
        },
        selectedAnswer: {
            type: String,
            required: true
        },
        isCorrect: {
            type: Boolean,
            required: true
        },
        answeredAt: {
            type: Date,
            default: Date.now
        }
    }],
    score: {
        type: Number,
        default: 0
    },
    totalQuestions: {
        type: Number,
        required: true
    },
    completedAt: {
        type: Date,
        default: null
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// index for first query
quizSchema.index({ userId: 1, documentId: 1 }, { unique: true });

const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;    