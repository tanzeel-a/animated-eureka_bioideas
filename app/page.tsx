'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

// Dynamically import Lottie to avoid SSR issues
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

interface ResearchIdea {
  id?: string;
  title: string;
  source: string;
  sourceUrl?: string;
  publishedDate: string;
  category: 'biology' | 'ai' | 'bio-ai';
  trendingScore: number;
  whyItMatters: string;
  researchAngle: string;
}

interface DetailedSummary {
  detailedSummary: string;
  keyQuestions: string[];
  suggestedMethods: string[];
  potentialImpact: string;
  relatedTopics: string[];
  gettingStarted: string;
}

// Opportunity Types
type OpportunityType = 'internship' | 'phd' | 'masters' | 'postdoc' | 'fellowship' | 'research-assistant';

interface Opportunity {
  id: string;
  title: string;
  institution: string;
  department?: string;
  type: OpportunityType;
  location: string;
  country: string;
  deadline?: string;
  postedDate: string;
  description: string;
  requirements?: string[];
  sourceUrl: string;
  source: string;
  summary?: string;
  scrapedAt: string;
}

interface Reactions {
  [ideaId: string]: { liked: boolean; disliked: boolean; likeCount: number; dislikeCount: number };
}

const categoryStyles = {
  biology: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/20',
    label: 'Biology',
    gradient: 'from-emerald-500/20',
    glow: 'shadow-emerald-500/20'
  },
  ai: {
    bg: 'bg-violet-500/10 dark:bg-violet-500/10',
    text: 'text-violet-600 dark:text-violet-400',
    border: 'border-violet-500/20',
    label: 'AI',
    gradient: 'from-violet-500/20',
    glow: 'shadow-violet-500/20'
  },
  'bio-ai': {
    bg: 'bg-sky-500/10 dark:bg-sky-500/10',
    text: 'text-sky-600 dark:text-sky-400',
    border: 'border-sky-500/20',
    label: 'Bio + AI',
    gradient: 'from-sky-500/20',
    glow: 'shadow-sky-500/20'
  },
};

const opportunityTypeStyles: Record<OpportunityType, { bg: string; text: string; border: string; label: string }> = {
  internship: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/20',
    label: 'Internship'
  },
  phd: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500/20',
    label: 'PhD'
  },
  masters: {
    bg: 'bg-green-500/10',
    text: 'text-green-600 dark:text-green-400',
    border: 'border-green-500/20',
    label: 'MSc/MTech'
  },
  postdoc: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-500/20',
    label: 'PostDoc'
  },
  fellowship: {
    bg: 'bg-pink-500/10',
    text: 'text-pink-600 dark:text-pink-400',
    border: 'border-pink-500/20',
    label: 'Fellowship'
  },
  'research-assistant': {
    bg: 'bg-teal-500/10',
    text: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-500/20',
    label: 'Research Asst'
  }
};

interface ApiResponse {
  success: boolean;
  ideas: ResearchIdea[];
  meta?: {
    totalHeadlines: number;
    uniqueHeadlines: number;
    query: string | null;
  };
  error?: string;
}

function TrendingBadge({ score }: { score: number }) {
  const getStyle = () => {
    if (score >= 8) return 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30';
    if (score >= 6) return 'text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/30';
    return 'text-neutral-500 dark:text-neutral-400 bg-neutral-500/10 border-neutral-500/30';
  };

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStyle()}`}
    >
      {score >= 8 ? 'HOT' : score >= 6 ? 'TRENDING' : score}/10
    </motion.span>
  );
}

function formatDisplayDate(dateStr: string): string {
  if (!dateStr || dateStr === 'Unknown') return '';
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

function ThemeToggle({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onToggle}
      className="p-2 rounded-full text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.svg
            key="sun"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.15 }}
            xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2"/>
            <path d="M12 20v2"/>
            <path d="m4.93 4.93 1.41 1.41"/>
            <path d="m17.66 17.66 1.41 1.41"/>
            <path d="M2 12h2"/>
            <path d="M20 12h2"/>
            <path d="m6.34 17.66-1.41 1.41"/>
            <path d="m19.07 4.93-1.41 1.41"/>
          </motion.svg>
        ) : (
          <motion.svg
            key="moon"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.15 }}
            xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
          </motion.svg>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function LoadingSkeleton() {
  const [showLottie, setShowLottie] = useState(false);
  const [animationData, setAnimationData] = useState(null);

  // Show Lottie animation after 500ms if still loading
  useEffect(() => {
    const timer = setTimeout(() => setShowLottie(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Load animation data
  useEffect(() => {
    if (showLottie) {
      fetch('/loading.json')
        .then(res => res.json())
        .then(data => setAnimationData(data))
        .catch(console.error);
    }
  }, [showLottie]);

  // Show Lottie animation for longer loads
  if (showLottie && animationData) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20"
      >
        <div className="w-32 h-32 mb-4">
          <Lottie
            animationData={animationData}
            loop={true}
            autoplay={true}
          />
        </div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-neutral-500 dark:text-neutral-400 text-sm"
        >
          Loading research ideas...
        </motion.p>
      </motion.div>
    );
  }

  // Quick skeleton for initial load
  return (
    <div>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="border-b border-neutral-200 dark:border-neutral-800 px-4 py-4"
        >
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-16 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
                <div className="h-4 w-24 bg-neutral-100 dark:bg-neutral-800/60 rounded animate-pulse" />
              </div>
              <div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded w-11/12 mb-2 animate-pulse" />
              <div className="space-y-1.5 mb-3">
                <div className="h-4 bg-neutral-100 dark:bg-neutral-800/50 rounded w-full animate-pulse" />
                <div className="h-4 bg-neutral-100 dark:bg-neutral-800/50 rounded w-4/5 animate-pulse" />
              </div>
              <div className="h-8 bg-neutral-100 dark:bg-neutral-800/30 rounded-lg w-2/3 mb-3 animate-pulse" />
              <div className="flex gap-8">
                <div className="h-8 w-16 bg-neutral-100 dark:bg-neutral-800/30 rounded-full animate-pulse" />
                <div className="h-8 w-12 bg-neutral-100 dark:bg-neutral-800/30 rounded-full animate-pulse" />
                <div className="h-8 w-12 bg-neutral-100 dark:bg-neutral-800/30 rounded-full animate-pulse" />
                <div className="h-8 w-8 bg-neutral-100 dark:bg-neutral-800/30 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Modal for detailed summary
function SummaryModal({
  idea,
  summary,
  loading,
  error,
  onClose,
  onRetry
}: {
  idea: ResearchIdea;
  summary: DetailedSummary | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onRetry: () => void;
}) {
  const style = categoryStyles[idea.category] || categoryStyles['bio-ai'];

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative bg-white dark:bg-neutral-900 rounded-t-2xl sm:rounded-2xl border border-neutral-200 dark:border-neutral-800 w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="p-4 sm:p-6 sm:pt-6 pt-2 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}>
                {style.label}
              </span>
              <TrendingBadge score={idea.trendingScore} />
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </motion.button>
          </div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white leading-tight">{idea.title}</h2>
          <div className="flex items-center gap-3 text-sm mt-2">
            {idea.sourceUrl ? (
              <a href={idea.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 transition-colors">
                {idea.source}
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            ) : (
              <span className="text-neutral-500">{idea.source}</span>
            )}
            {idea.publishedDate && idea.publishedDate !== 'Unknown' && (
              <>
                <span className="text-neutral-300 dark:text-neutral-700">·</span>
                <span className="text-neutral-500">{formatDisplayDate(idea.publishedDate)}</span>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 overscroll-contain touch-pan-y">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`h-4 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse`}
                  style={{ width: `${100 - i * 10}%` }}
                />
              ))}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 text-center text-neutral-500 text-sm"
              >
                Generating detailed summary...
              </motion.p>
            </div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-10"
            >
              <div className="w-14 h-14 bg-red-100 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 dark:text-red-400">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <p className="text-red-500 dark:text-red-400 mb-2 font-medium">{error}</p>
              <p className="text-neutral-500 text-sm mb-6">Could not generate AI summary</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onRetry}
                className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors text-sm font-medium"
              >
                Try Again
              </motion.button>
            </motion.div>
          ) : summary ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Summary */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <h3 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-3">Overview</h3>
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line">{summary.detailedSummary}</p>
              </motion.div>

              {/* Key Questions */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h3 className="text-sm font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-3">Key Research Questions</h3>
                <ul className="space-y-2">
                  {summary.keyQuestions.map((q, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.05 }}
                      className="flex gap-2 text-neutral-700 dark:text-neutral-300"
                    >
                      <span className="text-sky-500">•</span>
                      {q}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Methods */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h3 className="text-sm font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-3">Suggested Methods</h3>
                <ul className="space-y-2">
                  {summary.suggestedMethods.map((m, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      className="flex gap-2 text-neutral-700 dark:text-neutral-300"
                    >
                      <span className="text-violet-500">•</span>
                      {m}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Impact */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <h3 className="text-sm font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-3">Potential Impact</h3>
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">{summary.potentialImpact}</p>
              </motion.div>

              {/* Related Topics */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">Related Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {summary.relatedTopics.map((topic, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.05 }}
                      className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg text-sm"
                    >
                      {topic}
                    </motion.span>
                  ))}
                </div>
              </motion.div>

              {/* Getting Started */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-4 border border-emerald-200 dark:border-emerald-500/20"
              >
                <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">Getting Started</h3>
                <p className="text-neutral-700 dark:text-neutral-300 text-sm leading-relaxed">{summary.gettingStarted}</p>
              </motion.div>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <div className="bg-neutral-100 dark:bg-neutral-800/30 rounded-xl p-4">
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400/80 uppercase tracking-wider mb-2">Why it matters</p>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">{idea.whyItMatters}</p>
              </div>
              <div className="bg-neutral-100 dark:bg-neutral-800/30 rounded-xl p-4">
                <p className="text-xs font-semibold text-sky-600 dark:text-sky-400/80 uppercase tracking-wider mb-2">Research angle</p>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">{idea.researchAngle}</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function IdeaCard({
  idea,
  index,
  isBookmarked,
  onToggleBookmark,
  onExpand,
  reaction,
  onLike,
  onDislike
}: {
  idea: ResearchIdea;
  index: number;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onExpand: () => void;
  reaction: { liked: boolean; disliked: boolean; likeCount: number; dislikeCount: number };
  onLike: () => void;
  onDislike: () => void;
}) {
  const style = categoryStyles[idea.category] || categoryStyles['bio-ai'];

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.03 }}
      className="group relative border-b border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors cursor-pointer"
      onClick={onExpand}
    >
      <div className="px-4 py-4">
        {/* Header row with avatar and meta */}
        <div className="flex gap-3">
          {/* Category Avatar */}
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${style.bg} ${style.border} border`}>
            {idea.category === 'biology' && (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={style.text}>
                <path d="M12 2a10 10 0 1 0 10 10H12V2z"/>
                <path d="M21.18 8.02c-1.4-2.66-4.52-3.54-6.9-2.1"/>
              </svg>
            )}
            {idea.category === 'ai' && (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={style.text}>
                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
              </svg>
            )}
            {idea.category === 'bio-ai' && (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={style.text}>
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83"/>
              </svg>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Meta row */}
            <div className="flex items-center gap-2 text-sm mb-1">
              <span className={`font-semibold ${style.text}`}>{style.label}</span>
              <span className="text-neutral-400 dark:text-neutral-600">·</span>
              {idea.sourceUrl ? (
                <a
                  href={idea.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-neutral-500 dark:text-neutral-400 hover:underline truncate"
                >
                  {idea.source}
                </a>
              ) : (
                <span className="text-neutral-500 truncate">{idea.source}</span>
              )}
              {idea.publishedDate && idea.publishedDate !== 'Unknown' && (
                <>
                  <span className="text-neutral-400 dark:text-neutral-600">·</span>
                  <span className="text-neutral-500 whitespace-nowrap">{formatDisplayDate(idea.publishedDate)}</span>
                </>
              )}
              {idea.trendingScore >= 8 && (
                <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  HOT
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-[15px] font-medium text-neutral-900 dark:text-white leading-snug mb-2">
              {idea.title}
            </h3>

            {/* Why it matters - compact */}
            <p className="text-[15px] text-neutral-600 dark:text-neutral-400 leading-relaxed mb-3">
              {idea.whyItMatters}
            </p>

            {/* Research angle tag */}
            <div className="mb-3">
              <span className="inline-block px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-lg text-sm">
                {idea.researchAngle.length > 80 ? idea.researchAngle.slice(0, 80) + '...' : idea.researchAngle}
              </span>
            </div>

            {/* Action buttons row - Twitter style */}
            <div className="flex items-center justify-between max-w-md -ml-2">
              {/* Comment/Expand */}
              <button
                onClick={(e) => { e.stopPropagation(); onExpand(); }}
                className="flex items-center gap-2 px-3 py-2 rounded-full text-neutral-500 hover:text-sky-500 hover:bg-sky-500/10 transition-colors group/btn"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <span className="text-sm">Expand</span>
              </button>

              {/* Like */}
              <button
                onClick={(e) => { e.stopPropagation(); onLike(); }}
                className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${
                  reaction.liked
                    ? 'text-rose-500'
                    : 'text-neutral-500 hover:text-rose-500 hover:bg-rose-500/10'
                }`}
              >
                <motion.svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill={reaction.liked ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  whileTap={{ scale: 1.3 }}
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                </motion.svg>
                <span className="text-sm">{reaction.likeCount > 0 ? reaction.likeCount : ''}</span>
              </button>

              {/* Dislike */}
              <button
                onClick={(e) => { e.stopPropagation(); onDislike(); }}
                className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${
                  reaction.disliked
                    ? 'text-blue-500'
                    : 'text-neutral-500 hover:text-blue-500 hover:bg-blue-500/10'
                }`}
              >
                <motion.svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill={reaction.disliked ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  whileTap={{ scale: 1.3 }}
                >
                  <path d="M17 14V2"/>
                  <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"/>
                </motion.svg>
                <span className="text-sm">{reaction.dislikeCount > 0 ? reaction.dislikeCount : ''}</span>
              </button>

              {/* Bookmark */}
              <button
                onClick={(e) => { e.stopPropagation(); onToggleBookmark(); }}
                className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${
                  isBookmarked
                    ? 'text-amber-500'
                    : 'text-neutral-500 hover:text-amber-500 hover:bg-amber-500/10'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
                </svg>
              </button>

              {/* Share */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(idea.title);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-full text-neutral-500 hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                  <polyline points="16 6 12 2 8 6"/>
                  <line x1="12" x2="12" y1="2" y2="15"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

// Opportunity Card Component
function OpportunityCard({
  opportunity,
  index,
  isBookmarked,
  onToggleBookmark,
  onExpand
}: {
  opportunity: Opportunity;
  index: number;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onExpand: () => void;
}) {
  const style = opportunityTypeStyles[opportunity.type] || opportunityTypeStyles.internship;

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.03 }}
      className="group relative border-b border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors cursor-pointer"
      onClick={onExpand}
    >
      <div className="px-4 py-4">
        <div className="flex gap-3">
          {/* Type Icon */}
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${style.bg} ${style.border} border`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={style.text}>
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            {/* Meta row */}
            <div className="flex items-center gap-2 text-sm mb-1 flex-wrap">
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${style.bg} ${style.text} ${style.border} border`}>
                {style.label}
              </span>
              <span className="text-neutral-400 dark:text-neutral-600">·</span>
              <span className="text-neutral-500 truncate">{opportunity.institution}</span>
              {opportunity.country && (
                <>
                  <span className="text-neutral-400 dark:text-neutral-600">·</span>
                  <span className="text-neutral-500 whitespace-nowrap">{opportunity.country}</span>
                </>
              )}
            </div>

            {/* Title */}
            <h3 className="text-[15px] font-medium text-neutral-900 dark:text-white leading-snug mb-2">
              {opportunity.title}
            </h3>

            {/* Deadline badge */}
            {opportunity.deadline && (
              <div className="mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-xs font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  Deadline: {opportunity.deadline}
                </span>
              </div>
            )}

            {/* Summary/Description */}
            <p className="text-[14px] text-neutral-600 dark:text-neutral-400 leading-relaxed mb-3 line-clamp-2">
              {opportunity.summary || opportunity.description.slice(0, 150) + '...'}
            </p>

            {/* Action buttons */}
            <div className="flex items-center justify-between max-w-md -ml-2">
              {/* Expand */}
              <button
                onClick={(e) => { e.stopPropagation(); onExpand(); }}
                className="flex items-center gap-2 px-3 py-2 rounded-full text-neutral-500 hover:text-sky-500 hover:bg-sky-500/10 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <span className="text-sm">Details</span>
              </button>

              {/* Apply Link */}
              <a
                href={opportunity.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 px-3 py-2 rounded-full text-neutral-500 hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                <span className="text-sm">Apply</span>
              </a>

              {/* Bookmark */}
              <button
                onClick={(e) => { e.stopPropagation(); onToggleBookmark(); }}
                className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${
                  isBookmarked
                    ? 'text-amber-500'
                    : 'text-neutral-500 hover:text-amber-500 hover:bg-amber-500/10'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

// Opportunity Modal
function OpportunityModal({
  opportunity,
  onClose
}: {
  opportunity: Opportunity;
  onClose: () => void;
}) {
  const style = opportunityTypeStyles[opportunity.type] || opportunityTypeStyles.internship;
  const [generatedSummary, setGeneratedSummary] = useState<string | null>(opportunity.summary || null);
  const [loadingSummary, setLoadingSummary] = useState(!opportunity.summary);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (!opportunity.summary && !generatedSummary) {
      setLoadingSummary(true);
      fetch('/api/opportunities/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: opportunity.title,
          institution: opportunity.institution,
          description: opportunity.description,
          type: opportunity.type,
          deadline: opportunity.deadline,
          requirements: opportunity.requirements
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.summary) {
            setGeneratedSummary(data.summary);
          }
        })
        .catch(console.error)
        .finally(() => setLoadingSummary(false));
    }
  }, [opportunity, generatedSummary]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <motion.div
        className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="relative bg-white dark:bg-neutral-900 rounded-t-2xl sm:rounded-2xl border border-neutral-200 dark:border-neutral-800 w-full sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}>
                {style.label}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                {opportunity.country}
              </span>
            </div>
            <button onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white leading-tight">{opportunity.title}</h2>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">{opportunity.institution}</p>
          {opportunity.deadline && (
            <div className="mt-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                Application Deadline: {opportunity.deadline}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <div className="space-y-6">
            {/* AI Summary */}
            {(loadingSummary || generatedSummary) && (
              <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-4 border border-emerald-200 dark:border-emerald-500/20">
                <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
                  </svg>
                  AI Summary
                </h3>
                {loadingSummary ? (
                  <div className="space-y-2">
                    <div className="h-4 bg-emerald-200/50 dark:bg-emerald-500/20 rounded animate-pulse w-full" />
                    <div className="h-4 bg-emerald-200/50 dark:bg-emerald-500/20 rounded animate-pulse w-3/4" />
                  </div>
                ) : (
                  <p className="text-neutral-700 dark:text-neutral-300 text-sm leading-relaxed">{generatedSummary}</p>
                )}
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">Description</h3>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line">{opportunity.description}</p>
            </div>

            {/* Requirements */}
            {opportunity.requirements && opportunity.requirements.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">Requirements</h3>
                <ul className="space-y-2">
                  {opportunity.requirements.map((req, i) => (
                    <li key={i} className="flex gap-2 text-neutral-700 dark:text-neutral-300">
                      <span className="text-emerald-500">•</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Location & Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-100 dark:bg-neutral-800/30 rounded-xl p-4">
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Location</p>
                <p className="text-sm text-neutral-900 dark:text-white">{opportunity.location}</p>
              </div>
              <div className="bg-neutral-100 dark:bg-neutral-800/30 rounded-xl p-4">
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Posted</p>
                <p className="text-sm text-neutral-900 dark:text-white">{formatDisplayDate(opportunity.postedDate)}</p>
              </div>
            </div>

            {/* Apply Button */}
            <a
              href={opportunity.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-center rounded-xl font-semibold transition-colors"
            >
              Apply Now
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  // Main tab state
  const [activeMainTab, setActiveMainTab] = useState<'ideas' | 'opportunities'>('ideas');

  // Ideas state
  const [ideas, setIdeas] = useState<ResearchIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarks, setBookmarks] = useState<ResearchIdea[]>([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [reactions, setReactions] = useState<Reactions>({});

  // Opportunities state
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [opportunitiesLoading, setOpportunitiesLoading] = useState(false);
  const [opportunitiesError, setOpportunitiesError] = useState<string | null>(null);
  const [opportunityTypeFilter, setOpportunityTypeFilter] = useState<OpportunityType | 'all'>('all');
  const [opportunityCountryFilter, setOpportunityCountryFilter] = useState<string>('all');
  const [opportunityBookmarks, setOpportunityBookmarks] = useState<Opportunity[]>([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [scrapeStatus, setScrapeStatus] = useState<{ configured: boolean; lastUpdated: string | null }>({ configured: false, lastUpdated: null });

  // Modal state
  const [selectedIdea, setSelectedIdea] = useState<ResearchIdea | null>(null);
  const [summary, setSummary] = useState<DetailedSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Load reactions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('bioai-reactions');
    if (saved) {
      try {
        setReactions(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load reactions:', e);
      }
    }
  }, []);

  // Save reactions to localStorage
  useEffect(() => {
    localStorage.setItem('bioai-reactions', JSON.stringify(reactions));
  }, [reactions]);

  const getReaction = useCallback((idea: ResearchIdea) => {
    const ideaId = idea.id || idea.title;
    return reactions[ideaId] || { liked: false, disliked: false, likeCount: 0, dislikeCount: 0 };
  }, [reactions]);

  const handleLike = useCallback((idea: ResearchIdea) => {
    const ideaId = idea.id || idea.title;
    setReactions(prev => {
      const current = prev[ideaId] || { liked: false, disliked: false, likeCount: 0, dislikeCount: 0 };
      const wasLiked = current.liked;
      const wasDisliked = current.disliked;
      return {
        ...prev,
        [ideaId]: {
          liked: !wasLiked,
          disliked: false,
          likeCount: wasLiked ? current.likeCount - 1 : current.likeCount + 1,
          dislikeCount: wasDisliked ? current.dislikeCount - 1 : current.dislikeCount
        }
      };
    });
  }, []);

  const handleDislike = useCallback((idea: ResearchIdea) => {
    const ideaId = idea.id || idea.title;
    setReactions(prev => {
      const current = prev[ideaId] || { liked: false, disliked: false, likeCount: 0, dislikeCount: 0 };
      const wasLiked = current.liked;
      const wasDisliked = current.disliked;
      return {
        ...prev,
        [ideaId]: {
          liked: false,
          disliked: !wasDisliked,
          likeCount: wasLiked ? current.likeCount - 1 : current.likeCount,
          dislikeCount: wasDisliked ? current.dislikeCount - 1 : current.dislikeCount + 1
        }
      };
    });
  }, []);

  // Theme initialization
  useEffect(() => {
    const savedTheme = localStorage.getItem('bioai-theme');
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
    } else {
      setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('bioai-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    const saved = localStorage.getItem('bioai-bookmarks');
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load bookmarks:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('bioai-bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const toggleBookmark = (idea: ResearchIdea) => {
    const ideaId = idea.id || idea.title;
    const exists = bookmarks.some(b => (b.id || b.title) === ideaId);

    if (exists) {
      setBookmarks(bookmarks.filter(b => (b.id || b.title) !== ideaId));
    } else {
      setBookmarks([...bookmarks, { ...idea, id: ideaId }]);
    }
  };

  const isBookmarked = (idea: ResearchIdea) => {
    const ideaId = idea.id || idea.title;
    return bookmarks.some(b => (b.id || b.title) === ideaId);
  };

  const fetchIdeas = async (q?: string) => {
    setLoading(true);
    setError(null);
    setShowBookmarks(false);

    try {
      const url = q ? `/api/trends?q=${encodeURIComponent(q)}` : '/api/trends';
      const response = await fetch(url, { cache: 'no-store' });
      const data: ApiResponse = await response.json();

      if (data.success) {
        setIdeas(data.ideas);
      } else {
        setError(data.error || 'Failed to load ideas');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async (idea: ResearchIdea) => {
    setSummaryLoading(true);
    setSummary(null);
    setSummaryError(null);

    try {
      const response = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: idea.title,
          source: idea.source,
          whyItMatters: idea.whyItMatters,
          researchAngle: idea.researchAngle,
          category: idea.category
        })
      });
      const data = await response.json();

      if (data.success && data.summary) {
        setSummary(data.summary);
      } else {
        setSummaryError(data.error || 'Failed to generate summary');
      }
    } catch (err) {
      console.error('Failed to fetch summary:', err);
      setSummaryError('Network error. Please try again.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleExpand = (idea: ResearchIdea) => {
    setSelectedIdea(idea);
    setSummaryError(null);
    fetchSummary(idea);
  };

  const handleCloseModal = () => {
    setSelectedIdea(null);
    setSummary(null);
    setSummaryError(null);
  };

  const handleRetrySummary = () => {
    if (selectedIdea) {
      fetchSummary(selectedIdea);
    }
  };

  // Fetch opportunities
  const fetchOpportunities = async () => {
    setOpportunitiesLoading(true);
    setOpportunitiesError(null);

    try {
      const params = new URLSearchParams();
      if (opportunityTypeFilter !== 'all') params.set('type', opportunityTypeFilter);
      if (opportunityCountryFilter !== 'all') params.set('country', opportunityCountryFilter);

      const response = await fetch(`/api/opportunities?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setOpportunities(data.opportunities);
      } else {
        setOpportunitiesError(data.error || 'Failed to load opportunities');
      }
    } catch (err) {
      setOpportunitiesError('Network error. Please try again.');
      console.error(err);
    } finally {
      setOpportunitiesLoading(false);
    }
  };

  // Check scrape status
  const checkScrapeStatus = async () => {
    try {
      const response = await fetch('/api/opportunities/scrape');
      const data = await response.json();
      setScrapeStatus({
        configured: data.cloudflareConfigured,
        lastUpdated: data.lastUpdated
      });
    } catch (err) {
      console.error('Failed to check scrape status:', err);
    }
  };

  // Trigger scrape
  const triggerScrape = async () => {
    try {
      const response = await fetch('/api/opportunities/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sources: 'priority', maxSources: 20 })
      });
      const data = await response.json();
      if (data.success) {
        fetchOpportunities();
      }
    } catch (err) {
      console.error('Scrape failed:', err);
    }
  };

  // Opportunity bookmarks
  const toggleOpportunityBookmark = (opp: Opportunity) => {
    const exists = opportunityBookmarks.some(b => b.id === opp.id);
    if (exists) {
      setOpportunityBookmarks(opportunityBookmarks.filter(b => b.id !== opp.id));
    } else {
      setOpportunityBookmarks([...opportunityBookmarks, opp]);
    }
  };

  const isOpportunityBookmarked = (opp: Opportunity) => {
    return opportunityBookmarks.some(b => b.id === opp.id);
  };

  // Load opportunity bookmarks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('bioai-opportunity-bookmarks');
    if (saved) {
      try {
        setOpportunityBookmarks(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load opportunity bookmarks:', e);
      }
    }
  }, []);

  // Save opportunity bookmarks
  useEffect(() => {
    localStorage.setItem('bioai-opportunity-bookmarks', JSON.stringify(opportunityBookmarks));
  }, [opportunityBookmarks]);

  // Fetch opportunities when tab changes or filters change
  useEffect(() => {
    if (activeMainTab === 'opportunities') {
      fetchOpportunities();
      checkScrapeStatus();
    }
  }, [activeMainTab, opportunityTypeFilter, opportunityCountryFilter]);

  useEffect(() => {
    fetchIdeas();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(query);
    fetchIdeas(query);
  };

  const handleRefresh = () => {
    setQuery('');
    setSearchQuery('');
    fetchIdeas();
  };

  const displayedIdeas = showBookmarks ? bookmarks : ideas;

  return (
    <main className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      {/* Twitter-like sidebar borders */}
      <div className="fixed inset-y-0 left-0 w-[calc((100%-600px)/2)] border-r border-neutral-200 dark:border-neutral-800 hidden lg:block" />
      <div className="fixed inset-y-0 right-0 w-[calc((100%-600px)/2)] border-l border-neutral-200 dark:border-neutral-800 hidden lg:block" />

      <header className="sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors duration-300">
        <div className="max-w-[600px] mx-auto">
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xl font-bold text-neutral-900 dark:text-white"
              >
                Bio<span className="text-emerald-500">Ideas</span>
              </motion.h1>
            </div>
            <div className="flex items-center gap-1">
              <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowBookmarks(!showBookmarks)}
                className={`relative p-2 rounded-full transition-all duration-200 ${
                  showBookmarks
                    ? 'text-amber-500 bg-amber-500/10'
                    : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={showBookmarks ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                </svg>
                <AnimatePresence>
                  {bookmarks.length > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold"
                    >
                      {bookmarks.length}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={loading}
                className="p-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-full transition-all duration-200 disabled:opacity-50"
              >
                <motion.svg
                  animate={loading ? { rotate: 360 } : {}}
                  transition={loading ? { repeat: Infinity, duration: 1, ease: "linear" } : {}}
                  xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                </motion.svg>
              </motion.button>
            </div>
          </div>

          {/* Main Tab bar - Ideas vs Opportunities */}
          <div className="flex border-b border-neutral-200 dark:border-neutral-800">
            <button
              onClick={() => { setActiveMainTab('ideas'); setShowBookmarks(false); }}
              className={`flex-1 py-3 text-sm font-semibold relative ${
                activeMainTab === 'ideas' ? 'text-neutral-900 dark:text-white' : 'text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-900'
              }`}
            >
              Research Ideas
              {activeMainTab === 'ideas' && (
                <motion.div
                  layoutId="mainTab"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-emerald-500 rounded-full"
                />
              )}
            </button>
            <button
              onClick={() => setActiveMainTab('opportunities')}
              className={`flex-1 py-3 text-sm font-semibold relative ${
                activeMainTab === 'opportunities' ? 'text-neutral-900 dark:text-white' : 'text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-900'
              }`}
            >
              Opportunities
              {activeMainTab === 'opportunities' && (
                <motion.div
                  layoutId="mainTab"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-purple-500 rounded-full"
                />
              )}
            </button>
          </div>

          {/* Sub Tab bar for Ideas - For You vs Bookmarks */}
          {activeMainTab === 'ideas' && (
            <div className="flex border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
              <button
                onClick={() => { setShowBookmarks(false); if (searchQuery) { setSearchQuery(''); fetchIdeas(); } }}
                className={`flex-1 py-2.5 text-xs font-semibold relative ${
                  !showBookmarks ? 'text-neutral-900 dark:text-white' : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                For You
                {!showBookmarks && (
                  <motion.div
                    layoutId="subTab"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-emerald-500 rounded-full"
                  />
                )}
              </button>
              <button
                onClick={() => setShowBookmarks(true)}
                className={`flex-1 py-2.5 text-xs font-semibold relative ${
                  showBookmarks ? 'text-neutral-900 dark:text-white' : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                Saved ({bookmarks.length})
                {showBookmarks && (
                  <motion.div
                    layoutId="subTab"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-amber-500 rounded-full"
                  />
                )}
              </button>
            </div>
          )}

          {/* Opportunity Filters */}
          {activeMainTab === 'opportunities' && (
            <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {(['all', 'internship', 'phd', 'masters', 'postdoc', 'fellowship'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setOpportunityTypeFilter(type)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                      opportunityTypeFilter === type
                        ? 'bg-purple-500 text-white'
                        : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-300 dark:hover:bg-neutral-700'
                    }`}
                  >
                    {type === 'all' ? 'All Types' : opportunityTypeStyles[type]?.label || type}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-2 overflow-x-auto pb-1 scrollbar-hide">
                {['all', 'India', 'USA', 'UK', 'Germany', 'Global'].map((country) => (
                  <button
                    key={country}
                    onClick={() => setOpportunityCountryFilter(country)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                      opportunityCountryFilter === country
                        ? 'bg-emerald-500 text-white'
                        : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-300 dark:hover:bg-neutral-700'
                    }`}
                  >
                    {country === 'all' ? 'All Countries' : country}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search bar */}
          <AnimatePresence mode="wait">
            {!showBookmarks && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSearch}
                className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800"
              >
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search research ideas..."
                    className="w-full bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-500 rounded-full pl-10 pr-4 py-2.5 text-sm border-0 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Search results indicator */}
          <AnimatePresence mode="wait">
            {searchQuery && !showBookmarks && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-4 py-2 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between"
              >
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  Results for <span className="font-semibold text-emerald-500">&quot;{searchQuery}&quot;</span>
                </span>
                <button
                  onClick={() => { setQuery(''); setSearchQuery(''); fetchIdeas(); }}
                  className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                >
                  Clear
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Feed */}
      <div className="max-w-[600px] mx-auto min-h-screen">
        <AnimatePresence mode="wait">
          {/* OPPORTUNITIES TAB */}
          {activeMainTab === 'opportunities' ? (
            opportunitiesLoading ? (
              <motion.div key="opp-loading">
                <LoadingSkeleton />
              </motion.div>
            ) : opportunitiesError ? (
              <motion.div
                key="opp-error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 px-4"
              >
                <div className="w-12 h-12 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <p className="text-neutral-900 dark:text-white font-bold text-lg mb-1">Failed to load opportunities</p>
                <p className="text-neutral-500 text-sm mb-4">{opportunitiesError}</p>
                <button
                  onClick={fetchOpportunities}
                  className="px-4 py-2 bg-purple-500 text-white rounded-full text-sm font-semibold hover:bg-purple-600 transition-colors"
                >
                  Try Again
                </button>
              </motion.div>
            ) : opportunities.length === 0 ? (
              <motion.div
                key="opp-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 px-4"
              >
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                  </svg>
                </div>
                <p className="text-neutral-900 dark:text-white font-bold text-xl mb-2">No opportunities yet</p>
                <p className="text-neutral-500 text-sm mb-6 max-w-sm mx-auto">
                  {scrapeStatus.configured
                    ? 'Scrape biology research positions from 1000+ universities and research centers.'
                    : 'Configure Cloudflare Browser Rendering API to start scraping opportunities.'}
                </p>
                {scrapeStatus.configured ? (
                  <button
                    onClick={triggerScrape}
                    className="px-6 py-3 bg-purple-500 text-white rounded-xl text-sm font-semibold hover:bg-purple-600 transition-colors inline-flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
                      <path d="M21 3v5h-5"/>
                    </svg>
                    Scrape Opportunities
                  </button>
                ) : (
                  <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 max-w-md mx-auto text-left">
                    <p className="text-amber-700 dark:text-amber-400 text-sm font-medium mb-2">Setup Required</p>
                    <ol className="text-amber-600 dark:text-amber-300 text-xs space-y-1">
                      <li>1. Create Cloudflare account</li>
                      <li>2. Enable Browser Rendering API</li>
                      <li>3. Add CLOUDFLARE_ACCOUNT_ID to .env.local</li>
                      <li>4. Add CLOUDFLARE_API_TOKEN to .env.local</li>
                    </ol>
                  </div>
                )}
                {scrapeStatus.lastUpdated && (
                  <p className="text-neutral-400 text-xs mt-4">
                    Last updated: {formatDisplayDate(scrapeStatus.lastUpdated)}
                  </p>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="opp-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {opportunities.map((opp, index) => (
                  <OpportunityCard
                    key={opp.id}
                    opportunity={opp}
                    index={index}
                    isBookmarked={isOpportunityBookmarked(opp)}
                    onToggleBookmark={() => toggleOpportunityBookmark(opp)}
                    onExpand={() => setSelectedOpportunity(opp)}
                  />
                ))}
                <div className="py-8 text-center border-b border-neutral-200 dark:border-neutral-800">
                  <p className="text-neutral-500 text-sm">{opportunities.length} opportunities found</p>
                  <button
                    onClick={fetchOpportunities}
                    className="mt-2 text-purple-500 text-sm font-medium hover:underline"
                  >
                    Refresh
                  </button>
                </div>
              </motion.div>
            )
          ) : showBookmarks ? (
            bookmarks.length === 0 ? (
              <motion.div
                key="empty-bookmarks"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16 px-4"
              >
                <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400">
                    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                  </svg>
                </div>
                <p className="text-neutral-900 dark:text-white font-bold text-lg mb-1">Save ideas for later</p>
                <p className="text-neutral-500 text-sm">Bookmark research ideas to build your reading list</p>
              </motion.div>
            ) : (
              <motion.div
                key="bookmarks"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {bookmarks.map((idea, index) => (
                  <IdeaCard
                    key={idea.id || index}
                    idea={idea}
                    index={index}
                    isBookmarked={true}
                    onToggleBookmark={() => toggleBookmark(idea)}
                    onExpand={() => handleExpand(idea)}
                    reaction={getReaction(idea)}
                    onLike={() => handleLike(idea)}
                    onDislike={() => handleDislike(idea)}
                  />
                ))}
              </motion.div>
            )
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16 px-4"
            >
              <div className="w-12 h-12 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <p className="text-neutral-900 dark:text-white font-bold text-lg mb-1">Something went wrong</p>
              <p className="text-neutral-500 text-sm mb-4">{error}</p>
              <button
                onClick={() => fetchIdeas(searchQuery)}
                className="px-4 py-2 bg-emerald-500 text-white rounded-full text-sm font-semibold hover:bg-emerald-600 transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          ) : loading ? (
            <motion.div key="loading">
              <LoadingSkeleton />
            </motion.div>
          ) : displayedIdeas.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16 px-4"
            >
              <p className="text-neutral-900 dark:text-white font-bold text-lg mb-1">No results found</p>
              <p className="text-neutral-500 text-sm">Try searching for something else</p>
            </motion.div>
          ) : (
            <motion.div
              key="ideas"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {displayedIdeas.map((idea, index) => (
                <IdeaCard
                  key={idea.id || index}
                  idea={idea}
                  index={index}
                  isBookmarked={isBookmarked(idea)}
                  onToggleBookmark={() => toggleBookmark(idea)}
                  onExpand={() => handleExpand(idea)}
                  reaction={getReaction(idea)}
                  onLike={() => handleLike(idea)}
                  onDislike={() => handleDislike(idea)}
                />
              ))}

              {/* End of feed indicator */}
              <div className="py-8 text-center border-b border-neutral-200 dark:border-neutral-800">
                <p className="text-neutral-500 text-sm">You&apos;re all caught up</p>
                <button
                  onClick={handleRefresh}
                  className="mt-2 text-emerald-500 text-sm font-medium hover:underline"
                >
                  Refresh for more
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="max-w-[600px] mx-auto py-6 px-4">
        <p className="text-center text-xs text-neutral-400 dark:text-neutral-600">
          Powered by bioRxiv · medRxiv · PubMed · Europe PMC · PLOS · eLife · Nature · arXiv · and more
        </p>
      </footer>

      {/* Summary Modal */}
      <AnimatePresence>
        {selectedIdea && (
          <SummaryModal
            idea={selectedIdea}
            summary={summary}
            loading={summaryLoading}
            error={summaryError}
            onClose={handleCloseModal}
            onRetry={handleRetrySummary}
          />
        )}
      </AnimatePresence>

      {/* Opportunity Modal */}
      <AnimatePresence>
        {selectedOpportunity && (
          <OpportunityModal
            opportunity={selectedOpportunity}
            onClose={() => setSelectedOpportunity(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
