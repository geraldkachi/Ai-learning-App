import React from 'react';
import { useQuery } from '@tanstack/react-query';
import FlashcardSetCard from './FlashcardSetCard';
import flashcardService from '../../services/flashcardService';

const FlashcardList = () => {

  // Fetch flashcards using flashcardService
  const {
    data: flashcardsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['getFlashcardsSets'],
    queryFn: async () => {
      const response =
        await flashcardService.getAllFlashcardSets();

      return response;
    },
    // enabled: !!documentId,
  });

  console.log(flashcardsData, 'flashcardsData');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-48 bg-white rounded-3xl shadow-sm"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-2xl">
          Failed to load flashcards
        </div>
      </div>
    );
  }

  const flashcardSets =
    flashcardsData?.data ||
    flashcardsData?.flashcards ||
    [];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          All Flashcard Sets
        </h1>

        <p className="text-slate-500 mt-2">
          Study smarter with your generated flashcards
        </p>
      </div>

      {/* Empty State */}
      {flashcardSets.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center">
          <h2 className="text-xl font-semibold text-slate-800">
            No Flashcards Yet
          </h2>

          <p className="text-slate-500 mt-2">
            Generate flashcards from your documents to begin studying.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flashcardSets.map((flashcardSet) => (
            <FlashcardSetCard
              key={flashcardSet._id}
              flashcardSet={flashcardSet}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FlashcardList;