/**
 * Interface for a text chunk
 */
export interface TextChunk {
    content: string;
    chunkIndex: number;
    pageNumber: number;
    _id?: string | number;
}

/**
 * Interface for a scored chunk (used in search results)
 */
export interface ScoredChunk extends TextChunk {
    score: number;
    rawScore: number;
    matchedWords: number;
}

/**
 * Split text into chunks for better AI processing
 * @param text - Full text to chunk
 * @param chunkSize - Target size per chunk (in words)
 * @param overlap - Number of words to overlap between chunks
 * @returns Array of text chunks
 */
export const chunkText = (
    text: string | null | undefined, 
    chunkSize: number = 500, 
    overlap: number = 50
): TextChunk[] => {
    // Handle empty text
    if (!text || text.trim().length === 0) {
        return [];
    }

    // Clean text while preserving paragraph structure
    const cleanedText = text
        .replace(/\r\n/g, '\n')           // Normalize line endings
        .replace(/\s+/g, ' ')              // Replace multiple spaces with single space
        .replace(/ \n /g, '\n')             // Fix spaces around newlines
        .replace(/\n\s+/g, '\n')            // Remove spaces after newlines
        .replace(/\s+\n/g, '\n')            // Remove spaces before newlines
        .trim();

    // Try to split by paragraphs (single or double newlines)
    const paragraphs = cleanedText.split(/\n+/).filter((p: string) => p.trim().length > 0);

    const chunks: TextChunk[] = [];
    let currentChunk: string[] = [];
    let currentWordCount: number = 0;
    let chunkIndex: number = 0;

    for (const paragraph of paragraphs) {
        const paragraphWords: string[] = paragraph.trim().split(/\s+/);
        const paragraphWordCount: number = paragraphWords.length;

        // If single paragraph exceeds chunk size, split it by words
        if (paragraphWordCount > chunkSize) {
            // Save current chunk if it has content
            if (currentChunk.length > 0) {
                chunks.push({
                    content: currentChunk.join('\n\n'),
                    chunkIndex: chunkIndex++,
                    pageNumber: 0
                });
                currentChunk = [];
                currentWordCount = 0;
            }

            // Split large paragraph into word-based chunks
            for (let i = 0; i < paragraphWords.length; i += (chunkSize - overlap)) {
                const chunkWords: string[] = paragraphWords.slice(i, i + chunkSize);
                chunks.push({
                    content: chunkWords.join(' '),
                    chunkIndex: chunkIndex++,
                    pageNumber: 0
                });

                if (i + chunkSize >= paragraphWords.length) break;
            }
            continue;
        }

        // If adding this paragraph exceeds chunk size, save current chunk
        if (currentWordCount + paragraphWordCount > chunkSize && currentChunk.length > 0) {
            // Create overlap from previous chunk before saving
            const prevChunkText: string = currentChunk.join(' ');
            const prevWords: string[] = prevChunkText.split(/\s+/);
            const overlapText: string = prevWords.slice(-Math.min(overlap, prevWords.length)).join(' ');
            
            chunks.push({
                content: currentChunk.join('\n\n'),
                chunkIndex: chunkIndex++,
                pageNumber: 0
            });
            
            // Start new chunk with overlap
            currentChunk = [overlapText, paragraph.trim()];
            currentWordCount = overlapText.split(/\s+/).length + paragraphWordCount;
        } else {
            // Add paragraph to current chunk
            currentChunk.push(paragraph.trim());
            currentWordCount += paragraphWordCount;
        }
    }

    // Add the last chunk
    if (currentChunk.length > 0) {
        chunks.push({
            content: currentChunk.join('\n\n'),
            chunkIndex: chunkIndex++,
            pageNumber: 0
        });
    }

    // Fallback: if no chunks created, split by words
    if (chunks.length === 0 && cleanedText.length > 0) {
        const allWords: string[] = cleanedText.split(/\s+/);
        for (let i = 0; i < allWords.length; i += (chunkSize - overlap)) {
            const chunkWords: string[] = allWords.slice(i, i + chunkSize);
            chunks.push({
                content: chunkWords.join(' '),
                chunkIndex: chunkIndex++,
                pageNumber: 0
            });
        }
    }

    return chunks;
};

/**
 * Find relevant chunks based on keyword matching
 * @param chunks - Array of chunks
 * @param query - Search query
 * @param maxChunks - Maximum chunks to return
 * @returns Array of scored chunks
 */
export const findRelevantChunks = (
    chunks: TextChunk[], 
    query: string, 
    maxChunks: number = 3
): ScoredChunk[] => {
    // Handle invalid inputs
    if (!chunks || chunks.length === 0 || !query) {
        return [];
    }

    // Common stop words to exclude
    const stopWords: Set<string> = new Set([
        'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but',
        'in', 'with', 'to', 'for', 'of', 'as', 'by', 'this', 'that', 'it',
        'from', 'have', 'has', 'had', 'was', 'were', 'will', 'would', 'could',
        'should', 'may', 'might', 'must', 'can', 'be', 'been', 'being'
    ]);

    // Extract and clean query words
    const queryWords: string[] = query
        .toLowerCase()
        .split(/\s+/)
        .filter((w: string) => w.length > 2 && !stopWords.has(w));

    // If no meaningful query words, return first chunks
    if (queryWords.length === 0) {
        return chunks.slice(0, maxChunks).map((chunk: TextChunk) => ({
            content: chunk.content,
            chunkIndex: chunk.chunkIndex,
            pageNumber: chunk.pageNumber,
            _id: chunk._id,
            score: 0,
            rawScore: 0,
            matchedWords: 0
        }));
    }

    // Score each chunk
    const scoredChunks: ScoredChunk[] = chunks.map((chunk: TextChunk, index: number): ScoredChunk => {
        const content: string = chunk.content.toLowerCase();
        const contentWords: number = content.split(/\s+/).length;
        let score: number = 0;
        const matchedWordsSet: Set<string> = new Set();

        // Score each query word
        for (const word of queryWords) {
            // Exact word match (higher score) - using word boundaries
            const exactRegex: RegExp = new RegExp(`\\b${word}\\b`, 'g');
            const exactMatches: RegExpMatchArray | null = content.match(exactRegex);
            const exactCount: number = exactMatches ? exactMatches.length : 0;
            
            if (exactCount > 0) {
                score += exactCount * 3;
                matchedWordsSet.add(word);
            }

            // Partial match (lower score) - only if not already matched exactly
            const partialRegex: RegExp = new RegExp(word, 'g');
            const partialMatches: RegExpMatchArray | null = content.match(partialRegex);
            const partialCount: number = partialMatches ? partialMatches.length : 0;
            
            if (partialCount > exactCount) {
                score += (partialCount - exactCount) * 1.5;
                matchedWordsSet.add(word);
            }
        }

        // Bonus: Multiple unique query words found
        const uniqueWordsFound: number = matchedWordsSet.size;
        if (uniqueWordsFound > 1) {
            score += uniqueWordsFound * 2;
        }

        // Normalize by content length (prevents long chunks from dominating)
        const normalizedScore: number = contentWords > 0 ? score / Math.sqrt(contentWords) : 0;

        // Small bonus for earlier chunks (context often flows sequentially)
        const positionBonus: number = 1 - (index / chunks.length) * 0.1;

        return {
            content: chunk.content,
            chunkIndex: chunk.chunkIndex,
            pageNumber: chunk.pageNumber,
            _id: chunk._id,
            score: normalizedScore * positionBonus,
            rawScore: score,
            matchedWords: uniqueWordsFound
        };
    });

    // Filter, sort, and return top chunks
    return scoredChunks
        .filter((chunk: ScoredChunk) => chunk.score > 0.01)  // Remove very low relevance chunks
        .sort((a: ScoredChunk, b: ScoredChunk): number => {
            // Sort by score (highest first)
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            // If scores are equal, sort by matched words
            if (b.matchedWords !== a.matchedWords) {
                return b.matchedWords - a.matchedWords;
            }
            // If still equal, sort by chunk index (earlier chunks first)
            return a.chunkIndex - b.chunkIndex;
        })
        .slice(0, maxChunks);
};

/**
 * Alternative simplified version of findRelevantChunks
 * Use this if you want basic keyword matching without scoring complexity
 * @param chunks - Array of chunks
 * @param query - Search query
 * @param maxChunks - Maximum chunks to return
 * @returns Array of text chunks
 */
export const findRelevantChunksSimple = (
    chunks: TextChunk[], 
    query: string, 
    maxChunks: number = 3
): TextChunk[] => {
    if (!chunks || chunks.length === 0 || !query) {
        return [];
    }

    const queryLower: string = query.toLowerCase();
    
    return chunks
        .filter((chunk: TextChunk) => chunk.content.toLowerCase().includes(queryLower))
        .slice(0, maxChunks)
        .map((chunk: TextChunk) => ({
            content: chunk.content,
            chunkIndex: chunk.chunkIndex,
            pageNumber: chunk.pageNumber,
            _id: chunk._id
        }));
};

/**
 * Extract keywords from text for better searching
 * @param text - Text to extract keywords from
 * @param maxKeywords - Maximum number of keywords to return
 * @returns Array of keywords
 */
export const extractKeywords = (text: string | null | undefined, maxKeywords: number = 10): string[] => {
    if (!text) return [];
    
    const stopWords: Set<string> = new Set([
        'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but',
        'in', 'with', 'to', 'for', 'of', 'as', 'by', 'this', 'that', 'it'
    ]);
    
    const words: string[] = text.toLowerCase()
        .split(/\s+/)
        .filter((w: string) => w.length > 3 && !stopWords.has(w));
    
    // Count word frequencies
    const wordCount: Record<string, number> = {};
    words.forEach((word: string) => {
        wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    // Sort by frequency and return top keywords
    return Object.entries(wordCount)
        .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
        .slice(0, maxKeywords)
        .map((entry: [string, number]) => entry[0]);
};