// services/geminiService.ts
import dotenv from 'dotenv';
import { GoogleGenAI } from "@google/genai";

dotenv.config();

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

if (!process.env.GEMINI_API_KEY) {
    console.error('FATAL ERROR: GEMINI_API_KEY is not set in the environment variables.');
    process.exit(1);
}

// Types for flashcards and quizzes
export interface Flashcard {
    question: string;
    answer: string;
    difficulty: 'easy' | 'medium' | 'hard';
}   

export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    difficulty: 'easy' | 'medium' | 'hard';
}

export interface TextChunk {
    content: string;
    chunkIndex: number;
    pageNumber: number;
    _id?: string;
}

/**
 * Generate flashcards from text
 * @param text - Document text
 * @param count - Number of flashcards to generate
 * @returns Promise<Array<Flashcard>>
 */
export const generateFlashcards = async (text: string, count: number = 10): Promise<Flashcard[]> => {
    const prompt = `Generate exactly ${count} educational flashcards from the following text.
    
Format each flashcard as:
Q: [Clear, specific question]
A: [Concise, accurate answer]
D: [Difficulty level: easy, medium, or hard]

Separate each flashcard with "---"

Text:
${text.substring(0, 15000)}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
        });

        const generatedText = response.text;
        
        if (!generatedText) {
            throw new Error('No response from Gemini API');
        }

        // Parse the response
        const flashcards: Flashcard[] = [];
        const cards = generatedText.split('---').filter(c => c.trim());

        for (const card of cards) {
            const lines = card.trim().split('\n');
            let question = '';
            let answer = '';
            let difficulty: 'easy' | 'medium' | 'hard' = 'medium';

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('Q:')) {
                    question = trimmed.substring(2).trim();
                } else if (trimmed.startsWith('A:')) {
                    answer = trimmed.substring(2).trim();
                } else if (trimmed.startsWith('D:')) {
                    const diff = trimmed.substring(2).trim().toLowerCase();
                    if (diff === 'easy' || diff === 'medium' || diff === 'hard') {
                        difficulty = diff;
                    }
                }
            }

            if (question && answer) {
                flashcards.push({ question, answer, difficulty });
            }
        }

        return flashcards.slice(0, count);
    } catch (error) {
        console.error('Gemini API error:', error);
        throw new Error('Failed to generate flashcards');
    }
};

/**
 * Generate quiz questions
 * @param text - Document text
 * @param numQuestions - Number of questions
 * @returns Promise<Array<QuizQuestion>>
 */
export const generateQuiz = async (text: string, numQuestions: number = 5): Promise<QuizQuestion[]> => {
    const prompt = `Generate exactly ${numQuestions} multiple choice questions from the following text.

Format each question as:
Q: [Question]
O1: [Option 1]
O2: [Option 2]
O3: [Option 3]
O4: [Option 4]
C: [Correct option - exactly as written above]
E: [Brief explanation]
D: [Difficulty: easy, medium, or hard]

Separate each question with "---"

Text:
${text.substring(0, 15000)}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
        });

        const generatedText = response.text;
        
        if (!generatedText) {
            throw new Error('No response from Gemini API');
        }

        const questions: QuizQuestion[] = [];
        const questionBlocks = generatedText.split('---').filter(q => q.trim());

        for (const block of questionBlocks) {
            const lines = block.trim().split('\n');
            let question = '';
            let options: string[] = [];
            let correctAnswer = '';
            let explanation = '';
            let difficulty: 'easy' | 'medium' | 'hard' = 'medium';

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('Q:')) {
                    question = trimmed.substring(2).trim();
                } else if (trimmed.startsWith('O1:')) {
                    options[0] = trimmed.substring(3).trim();
                } else if (trimmed.startsWith('O2:')) {
                    options[1] = trimmed.substring(3).trim();
                } else if (trimmed.startsWith('O3:')) {
                    options[2] = trimmed.substring(3).trim();
                } else if (trimmed.startsWith('O4:')) {
                    options[3] = trimmed.substring(3).trim();
                } else if (trimmed.startsWith('C:')) {
                    correctAnswer = trimmed.substring(2).trim();
                } else if (trimmed.startsWith('E:')) {
                    explanation = trimmed.substring(2).trim();
                } else if (trimmed.startsWith('D:')) {
                    const diff = trimmed.substring(2).trim().toLowerCase();
                    if (diff === 'easy' || diff === 'medium' || diff === 'hard') {
                        difficulty = diff;
                    }
                }
            }

            if (question && options.length === 4 && correctAnswer) {
                questions.push({ 
                    question, 
                    options, 
                    correctAnswer, 
                    explanation, 
                    difficulty 
                });
            }
        }

        return questions.slice(0, numQuestions);
    } catch (error) {
        console.error('Gemini API error:', error);
        throw new Error('Failed to generate quiz');
    }
};

/**
 * Generate document summary
 * @param text - Document text
 * @returns Promise<string>
 */
export const generateSummary = async (text: string): Promise<string> => {
    const prompt = `Provide a concise summary of the following text, highlighting the key concepts, main ideas, and important points. Keep the summary clear and structured.

Text:
${text.substring(0, 20000)}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
        });

        const generatedText = response.text;
        
        if (!generatedText) {
            throw new Error('No response from Gemini API');
        }

        return generatedText;
    } catch (error) {
        console.error('Gemini API error:', error);
        throw new Error('Failed to generate summary');
    }
};

/**
 * Chat with document context
 * @param question - User question
 * @param chunks - Relevant document chunks
 * @returns Promise<string>
 */
export const chatWithContext = async (question: string, chunks: TextChunk[]): Promise<string> => {
    const context = chunks.map((c, i) => `[Chunk ${i + 1}]\n${c.content}`).join('\n\n');

    const prompt = `Based on the following context from a document, analyze the context and answer the user's question. If the answer is not in the context, say "I couldn't find information about that in the document."

Context:
${context}

Question: ${question}

Answer:`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
        });

        const generatedText = response.text;
        
        if (!generatedText) {
            throw new Error('No response from Gemini API');
        }

        return generatedText;
    } catch (error) {
        console.error('Gemini API error:', error);
        throw new Error('Failed to process chat request');
    }
};

/**
 * Explain a specific concept
 * @param concept - Concept to explain
 * @param context - Relevant context
 * @returns Promise<string>
 */
export const explainConcept = async (concept: string, context: string): Promise<string> => {
    const prompt = `Explain the concept of "${concept}" based on the following context.
Provide a clear, educational explanation that's easy to understand.
Include examples if relevant.

Context:
${context.substring(0, 10000)}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
        });

        const generatedText = response.text;
        
        if (!generatedText) {
            throw new Error('No response from Gemini API');
        }

        return generatedText;
    } catch (error) {
        console.error('Gemini API error:', error);
        throw new Error('Failed to explain concept');
    }
};