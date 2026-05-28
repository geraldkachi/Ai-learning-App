// FlashcardSetCard.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const FlashcardSetCard = ({ flashcardSet }) => {
  const navigate = useNavigate();

  const handleStudyNow = () => {
    navigate(
      `/documents/${flashcardSet.documentId?._id}/flashcards`
    );
  };

  const reviewedCount =
    flashcardSet.cards?.filter(
      (card) => card.lastReviewed
    ).length || 0;

  const totalCards =
    flashcardSet.cards?.length || 0;

  const progressPercentage =
    totalCards > 0
      ? Math.round((reviewedCount / totalCards) * 100)
      : 0;

  return (
    <div
      className="group relative bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={handleStudyNow}
    >
      <div className="space-y-5">
        {/* Top */}
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="shrink-0 w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
            <BookOpen
              className="w-7 h-7 text-emerald-600"
              strokeWidth={2}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">
              {flashcardSet?.documentId?.title ||
                'Untitled Flashcard'}
            </h3>

            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-1">
              Created{' '}
              {dayjs(
                flashcardSet.createdAt
              ).fromNow()}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3">
          {/* Total Cards */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-slate-50">
            <Sparkles
              className="w-4 h-4 text-slate-500"
            />

            <span className="text-sm font-semibold text-slate-700">
              {totalCards} Cards
            </span>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-200 bg-emerald-50">
            <TrendingUp
              className="w-4 h-4 text-emerald-600"
            />

            <span className="text-sm font-semibold text-emerald-700">
              {progressPercentage}%
            </span>
          </div>
        </div>

        {/* Progress Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">
              Progress
            </span>

            <span className="text-sm font-semibold text-slate-700">
              {reviewedCount}/{totalCards} reviewed
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{
                width: `${progressPercentage}%`,
              }}
            />
          </div>
        </div>

        {/* CTA */}
        <button
          className="w-full mt-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />

          <span>Study Now</span>
        </button>
      </div>
    </div>
  );
};

export default FlashcardSetCard;