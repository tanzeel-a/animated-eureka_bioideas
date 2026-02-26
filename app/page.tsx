'use client';

import { useState, useEffect } from 'react';

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

const categoryStyles = {
  biology: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
    label: 'Biology',
    gradient: 'from-emerald-500/20'
  },
  ai: {
    bg: 'bg-violet-500/10',
    text: 'text-violet-400',
    border: 'border-violet-500/20',
    label: 'AI',
    gradient: 'from-violet-500/20'
  },
  'bio-ai': {
    bg: 'bg-sky-500/10',
    text: 'text-sky-400',
    border: 'border-sky-500/20',
    label: 'Bio + AI',
    gradient: 'from-sky-500/20'
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
    if (score >= 8) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    if (score >= 6) return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
    return 'text-neutral-400 bg-neutral-500/10 border-neutral-500/30';
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStyle()}`}>
      {score >= 8 ? 'HOT' : score >= 6 ? 'TRENDING' : score}/10
    </span>
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

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-gradient-to-br from-neutral-900 to-neutral-950 rounded-2xl p-6 border border-neutral-800/50 animate-pulse"
        >
          <div className="flex gap-2 mb-4">
            <div className="h-6 bg-neutral-800 rounded-full w-20"></div>
            <div className="h-6 bg-neutral-800 rounded-full w-16"></div>
          </div>
          <div className="h-7 bg-neutral-800 rounded-lg w-4/5 mb-3"></div>
          <div className="h-4 bg-neutral-800/60 rounded w-1/3 mb-6"></div>
          <div className="space-y-2">
            <div className="h-4 bg-neutral-800/40 rounded w-full"></div>
            <div className="h-4 bg-neutral-800/40 rounded w-5/6"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function IdeaCard({
  idea,
  index,
  isBookmarked,
  onToggleBookmark
}: {
  idea: ResearchIdea;
  index: number;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}) {
  const style = categoryStyles[idea.category] || categoryStyles['bio-ai'];

  return (
    <div className={`group relative bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 rounded-2xl p-6 border border-neutral-800/50 hover:border-neutral-700/50 transition-all duration-300 hover:shadow-xl hover:shadow-black/20`}>
      {/* Subtle gradient overlay on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none`}></div>

      <div className="relative">
        {/* Top row: badges and bookmark */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}>
              {style.label}
            </span>
            <TrendingBadge score={idea.trendingScore} />
            <span className="text-neutral-600 text-xs font-medium">#{index + 1}</span>
          </div>
          <button
            onClick={onToggleBookmark}
            className={`p-2 rounded-xl transition-all duration-200 ${
              isBookmarked
                ? 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
                : 'text-neutral-500 hover:text-amber-400 hover:bg-neutral-800/50'
            }`}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={isBookmarked ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
            </svg>
          </button>
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-white mb-3 leading-tight tracking-tight">
          {idea.title}
        </h3>

        {/* Source with link */}
        <div className="flex items-center gap-3 text-sm mb-5">
          {idea.sourceUrl ? (
            <a
              href={idea.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 group/link"
            >
              <span className="font-medium">{idea.source}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-50 group-hover/link:opacity-100 transition-opacity"
              >
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
              <span className="text-neutral-700">·</span>
              <span className="text-neutral-500">{formatDisplayDate(idea.publishedDate)}</span>
            </>
          )}
        </div>

        {/* Content sections */}
        <div className="space-y-4">
          <div className="bg-neutral-800/30 rounded-xl p-4">
            <p className="text-xs font-semibold text-emerald-400/80 uppercase tracking-wider mb-2">Why it matters</p>
            <p className="text-sm text-neutral-300 leading-relaxed">
              {idea.whyItMatters}
            </p>
          </div>
          <div className="bg-neutral-800/30 rounded-xl p-4">
            <p className="text-xs font-semibold text-sky-400/80 uppercase tracking-wider mb-2">Research angle</p>
            <p className="text-sm text-neutral-300 leading-relaxed">
              {idea.researchAngle}
            </p>
          </div>
        </div>
      </div>
    </div>
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
    <main className="min-h-screen bg-[#0a0a0b]">
      {/* Subtle grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none"></div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0b]/80 backdrop-blur-2xl border-b border-neutral-800/50">
        <div className="max-w-3xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Bio<span className="text-emerald-400">Ideas</span>
              </h1>
              <p className="text-sm text-neutral-500 mt-0.5">Curated research ideas from 15+ sources</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowBookmarks(!showBookmarks)}
                className={`relative p-2.5 rounded-xl transition-all duration-200 ${
                  showBookmarks
                    ? 'text-amber-400 bg-amber-500/10 ring-1 ring-amber-500/30'
                    : 'text-neutral-400 hover:text-amber-400 hover:bg-neutral-800/50'
                }`}
                aria-label="View bookmarks"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill={showBookmarks ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                </svg>
                {bookmarks.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-black text-xs rounded-full flex items-center justify-center font-bold">
                    {bookmarks.length}
                  </span>
                )}
              </button>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-2.5 text-neutral-400 hover:text-white hover:bg-neutral-800/50 rounded-xl transition-all duration-200 disabled:opacity-50"
                aria-label="Refresh"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={loading ? 'animate-spin' : ''}
                >
                  <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                </svg>
              </button>
            </div>
          </div>

          {!showBookmarks && (
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-neutral-500"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search CRISPR, protein folding, neural networks..."
                className="w-full bg-neutral-900/50 text-white placeholder-neutral-500 rounded-xl pl-12 pr-4 py-3.5 text-sm border border-neutral-800/50 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all duration-200"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
              >
                Search
              </button>
            </form>
          )}

          {showBookmarks ? (
            <div className="flex items-center gap-2 mt-4">
              <span className="text-amber-400 font-semibold">Saved Ideas</span>
              <span className="text-neutral-500">({bookmarks.length})</span>
            </div>
          ) : searchQuery ? (
            <div className="flex items-center gap-2 mt-4">
              <span className="text-neutral-500 text-sm">Results for</span>
              <span className="text-emerald-400 font-medium text-sm">&quot;{searchQuery}&quot;</span>
            </div>
          ) : null}
        </div>
      </header>

      {/* Content */}
      <div className="relative max-w-3xl mx-auto px-6 py-8">
        {showBookmarks ? (
          bookmarks.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-neutral-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-600">
                  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                </svg>
              </div>
              <p className="text-neutral-400 font-medium mb-2">No saved ideas yet</p>
              <p className="text-neutral-600 text-sm">Bookmark ideas to save them for later</p>
            </div>
          ) : (
            <div className="space-y-6">
              {bookmarks.map((idea, index) => (
                <IdeaCard
                  key={idea.id || index}
                  idea={idea}
                  index={index}
                  isBookmarked={true}
                  onToggleBookmark={() => toggleBookmark(idea)}
                />
              ))}
            </div>
          )
        ) : error ? (
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => fetchIdeas(searchQuery)}
              className="px-5 py-2.5 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        ) : loading ? (
          <LoadingSkeleton />
        ) : displayedIdeas.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-neutral-400">No ideas found. Try a different search.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {displayedIdeas.map((idea, index) => (
              <IdeaCard
                key={idea.id || index}
                idea={idea}
                index={index}
                isBookmarked={isBookmarked(idea)}
                onToggleBookmark={() => toggleBookmark(idea)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-800/50 mt-12">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <p className="text-center text-xs text-neutral-600">
            Powered by bioRxiv · medRxiv · PubMed · Europe PMC · PLOS · eLife · Nature · arXiv · and more
          </p>
        </div>
      </footer>
    </main>
  );
}
