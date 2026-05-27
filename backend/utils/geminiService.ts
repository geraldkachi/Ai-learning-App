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
    _id?: string | number; // Allow both string and number
    score?: number; // Make score optional
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
        throw new Error(`Failed to generate flashcards: ${error}`);
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
        throw new Error(`Failed to generate quiz: ${error}`);
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
        throw new Error(`Failed to generate summary: ${error}`);
    }
};

// /**
//  * Chat with document context
//  * @param question - User question
//  * @param chunks - Relevant document chunks
//  * @returns Promise<string>
//  */
// export const chatWithContext = async (question: string, chunks: TextChunk[]): Promise<string> => {
//     const context = chunks.map((c, i) => `[Chunk ${i + 1}]\n${c.content}`).join('\n\n');

//     const prompt = `Based on the following context from a document, analyze the context and answer the user's question. If the answer is not in the context, say "I couldn't find information about that in the document."

// Context:
// ${context}

// Question: ${question}

// Answer:`;

//     try {
//         const response = await ai.models.generateContent({
//             model: "gemini-2.5-flash-lite",
//             contents: prompt,
//         });

//         const generatedText = response.text;
        
//         if (!generatedText) {
//             throw new Error('No response from Gemini API');
//         }

//         return generatedText;
//     } catch (error) {
//         console.error('Gemini API error:', error);
//         throw new Error('Failed to process chat request');
//     }
// };

/**
 * Chat with document context
 * @param question - User question
 * @param chunks - Relevant document chunks
 * @returns Promise<string>
 */
export const chatWithContext = async (question: string, chunks: TextChunk[]): Promise<string> => {
    // Handle case when no relevant chunks are found
    if (!chunks || chunks.length === 0) {
        const noContextPrompt = `The user asked: "${question}"

However, no relevant context was found in the document to answer this question.

Please respond with a helpful message that:
1. Acknowledges you couldn't find information about this topic in the document
2. Suggests what the document might be about (based on the document title or general content if available)
3. Offers to help with other questions about the document

Keep the response friendly and helpful.`;

        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-lite",
                contents: noContextPrompt,
            });
            
            return response.text || "I couldn't find information about that in this document. Could you ask something else about the document content?";
        } catch (error) {
            console.error('Gemini API error:', error);
            return `I couldn't find information about that in this document. Please try asking a different question.`;
        }
    }

    // Prepare context with better formatting
    const context = chunks.map((c, i) => {
        const chunkNumber = i + 1;
        const relevance = c.score ? ` (relevance: ${Math.round(c.score * 100)}%)` : '';
        return `[Excerpt ${chunkNumber}${relevance}]\n${c.content}`;
    }).join('\n\n---\n\n');

    // Count total words in context for better prompt engineering
    const contextWordCount = context.split(/\s+/).length;
    const isLargeContext = contextWordCount > 2000;

    // Enhanced prompt with better instructions
    const prompt = `You are a helpful document analysis assistant. Your task is to answer questions based ONLY on the provided document excerpts.

## Instructions:
1. **Answer ONLY from the context** - Do not use external knowledge
2. **Be specific** - Quote or reference the relevant parts of the context
3. **Be honest** - If the answer isn't in the context, say so clearly
4. **Be helpful** - Suggest what the document DOES contain if possible
5. **Keep it concise** - Don't add unnecessary information

## Context from Document:
${context}

${isLargeContext ? "Note: The context is quite detailed. Focus on the most relevant excerpts for your answer.\n" : ""}

## User's Question:
${question}

## Your Response:
${chunks.length === 1 ? "(Based on the single relevant excerpt found)" : `(Based on ${chunks.length} relevant excerpts found)`}

Answer:`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
            config: {
                temperature: 0.3,  // Lower temperature for more factual responses
                topP: 0.8,
                topK: 40,
            }
        });

        const generatedText = response.text;
        
        if (!generatedText) {
            throw new Error('No response from Gemini API');
        }

        return generatedText.trim();
    } catch (error) {
        console.error('Gemini API error:', error);
        
        // Fallback response for API errors
        return "I'm having trouble processing your request right now. Please try again in a moment.";
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