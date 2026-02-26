'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onToggle}
      className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.svg
            key="sun"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
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
            transition={{ duration: 0.2 }}
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
  return (
    <div className="space-y-6">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800"
        >
          <div className="flex gap-2 mb-4">
            <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded-full w-20 animate-pulse"></div>
            <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded-full w-16 animate-pulse"></div>
          </div>
          <div className="h-7 bg-neutral-200 dark:bg-neutral-800 rounded-lg w-4/5 mb-3 animate-pulse"></div>
          <div className="h-4 bg-neutral-100 dark:bg-neutral-800/60 rounded w-1/3 mb-6 animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-4 bg-neutral-100 dark:bg-neutral-800/40 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-neutral-100 dark:bg-neutral-800/40 rounded w-5/6 animate-pulse"></div>
          </div>
        </motion.div>
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
  onExpand
}: {
  idea: ResearchIdea;
  index: number;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onExpand: () => void;
}) {
  const style = categoryStyles[idea.category] || categoryStyles['bio-ai'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: "spring", damping: 20 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`group relative bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300 hover:shadow-xl cursor-pointer`}
      onClick={onExpand}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none`}></div>

      <div className="relative">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <motion.span
              whileHover={{ scale: 1.05 }}
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}
            >
              {style.label}
            </motion.span>
            <TrendingBadge score={idea.trendingScore} />
            <span className="text-neutral-400 dark:text-neutral-600 text-xs font-medium">#{index + 1}</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); onToggleBookmark(); }}
            className={`p-2 rounded-xl transition-all duration-200 ${
              isBookmarked
                ? 'text-amber-500 bg-amber-100 dark:bg-amber-500/10 hover:bg-amber-200 dark:hover:bg-amber-500/20'
                : 'text-neutral-400 hover:text-amber-500 hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
            }`}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
            </svg>
          </motion.button>
        </div>

        <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3 leading-tight tracking-tight">
          {idea.title}
        </h3>

        <div className="flex items-center gap-3 text-sm mb-5">
          {idea.sourceUrl ? (
            <a
              href={idea.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center gap-1.5 group/link"
            >
              <span className="font-medium">{idea.source}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 group-hover/link:opacity-100 transition-opacity">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          ) : (
            <span className="text-neutral-500 font-medium">{idea.source}</span>
          )}
          {idea.publishedDate && idea.publishedDate !== 'Unknown' && (
            <>
              <span className="text-neutral-300 dark:text-neutral-700">·</span>
              <span className="text-neutral-500">{formatDisplayDate(idea.publishedDate)}</span>
            </>
          )}
        </div>

        <div className="space-y-3">
          <div className="bg-neutral-50 dark:bg-neutral-800/30 rounded-xl p-4 border border-neutral-100 dark:border-neutral-800">
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400/80 uppercase tracking-wider mb-2">Why it matters</p>
            <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed line-clamp-2">{idea.whyItMatters}</p>
          </div>
          <div className="bg-neutral-50 dark:bg-neutral-800/30 rounded-xl p-4 border border-neutral-100 dark:border-neutral-800">
            <p className="text-xs font-semibold text-sky-600 dark:text-sky-400/80 uppercase tracking-wider mb-2">Research angle</p>
            <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed line-clamp-2">{idea.researchAngle}</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 flex items-center justify-center text-neutral-400 dark:text-neutral-500 text-xs group-hover:text-emerald-500 transition-colors"
        >
          <span>Click to expand</span>
          <motion.svg
            animate={{ y: [0, 2, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </motion.svg>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [ideas, setIdeas] = useState<ResearchIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarks, setBookmarks] = useState<ResearchIdea[]>([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // Modal state
  const [selectedIdea, setSelectedIdea] = useState<ResearchIdea | null>(null);
  const [summary, setSummary] = useState<DetailedSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

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
    <main className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0b] transition-colors duration-300">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none"></div>

      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0a0a0b]/80 backdrop-blur-2xl border-b border-neutral-200 dark:border-neutral-800/50 transition-colors duration-300">
        <div className="max-w-3xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between mb-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
                Bio<span className="text-emerald-500">Ideas</span>
              </h1>
              <p className="text-sm text-neutral-500 mt-0.5">Curated research ideas from 15+ sources</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowBookmarks(!showBookmarks)}
                className={`relative p-2.5 rounded-xl transition-all duration-200 ${
                  showBookmarks
                    ? 'text-amber-500 bg-amber-100 dark:bg-amber-500/10 ring-1 ring-amber-500/30'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-amber-500 hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
                }`}
                aria-label="View bookmarks"
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
                      className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                    >
                      {bookmarks.length}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={loading}
                className="p-2.5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/50 rounded-xl transition-all duration-200 disabled:opacity-50"
                aria-label="Refresh"
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
            </motion.div>
          </div>

          <AnimatePresence mode="wait">
            {!showBookmarks && (
              <motion.form
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleSearch}
                className="relative overflow-hidden rounded-xl"
              >
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search CRISPR, protein folding..."
                  className="w-full bg-neutral-100 dark:bg-neutral-900/50 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 rounded-xl pl-12 pr-24 py-3.5 text-sm border border-neutral-200 dark:border-neutral-800/50 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  Search
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {showBookmarks ? (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 mt-4"
              >
                <span className="text-amber-500 font-semibold">Saved Ideas</span>
                <span className="text-neutral-500">({bookmarks.length})</span>
              </motion.div>
            ) : searchQuery ? (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 mt-4"
              >
                <span className="text-neutral-500 text-sm">Results for</span>
                <span className="text-emerald-500 font-medium text-sm">&quot;{searchQuery}&quot;</span>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </header>

      <div className="relative max-w-3xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {showBookmarks ? (
            bookmarks.length === 0 ? (
              <motion.div
                key="empty-bookmarks"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-20"
              >
                <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400 dark:text-neutral-600">
                    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                  </svg>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 font-medium mb-2">No saved ideas yet</p>
                <p className="text-neutral-400 dark:text-neutral-600 text-sm">Bookmark ideas to save them for later</p>
              </motion.div>
            ) : (
              <motion.div
                key="bookmarks"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {bookmarks.map((idea, index) => (
                  <IdeaCard
                    key={idea.id || index}
                    idea={idea}
                    index={index}
                    isBookmarked={true}
                    onToggleBookmark={() => toggleBookmark(idea)}
                    onExpand={() => handleExpand(idea)}
                  />
                ))}
              </motion.div>
            )
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 rounded-2xl p-8 text-center"
            >
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => fetchIdeas(searchQuery)}
                className="px-5 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors text-sm font-medium"
              >
                Try Again
              </motion.button>
            </motion.div>
          ) : loading ? (
            <motion.div key="loading">
              <LoadingSkeleton />
            </motion.div>
          ) : displayedIdeas.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-20"
            >
              <p className="text-neutral-500 dark:text-neutral-400">No ideas found. Try a different search.</p>
            </motion.div>
          ) : (
            <motion.div
              key="ideas"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {displayedIdeas.map((idea, index) => (
                <IdeaCard
                  key={idea.id || index}
                  idea={idea}
                  index={index}
                  isBookmarked={isBookmarked(idea)}
                  onToggleBookmark={() => toggleBookmark(idea)}
                  onExpand={() => handleExpand(idea)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="border-t border-neutral-200 dark:border-neutral-800/50 mt-12 transition-colors">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <p className="text-center text-xs text-neutral-400 dark:text-neutral-600">
            Powered by bioRxiv · medRxiv · PubMed · Europe PMC · PLOS · eLife · Nature · arXiv · and more
          </p>
        </div>
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
    </main>
  );
}
