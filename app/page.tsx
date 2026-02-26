'use client';

import { useState, useEffect } from 'react';

interface ResearchIdea {
  id?: string;
  title: string;
  source: string;
  publishedDate: string;
  category: 'biology' | 'ai' | 'bio-ai';
  trendingScore: number;
  whyItMatters: string;
  researchAngle: string;
}

const categoryStyles = {
  biology: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Biology' },
  ai: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'AI' },
  'bio-ai': { bg: 'bg-cyan-500/20', text: 'text-cyan-400', label: 'Bio + AI' },
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
  const getColor = () => {
    if (score >= 8) return 'text-orange-400 bg-orange-500/20';
    if (score >= 6) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-neutral-400 bg-neutral-500/20';
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getColor()}`}>
      {score}/10
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
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="bg-neutral-900 rounded-xl p-6 animate-pulse"
        >
          <div className="h-6 bg-neutral-800 rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-neutral-800 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-neutral-800 rounded w-full mb-2"></div>
          <div className="h-4 bg-neutral-800 rounded w-5/6"></div>
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
    <div className="bg-neutral-900 rounded-xl p-6 hover:bg-neutral-800/80 transition-colors">
      <div className="flex items-start gap-4">
        <span className="flex-shrink-0 w-8 h-8 bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center text-sm font-medium">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}>
                {style.label}
              </span>
              <TrendingBadge score={idea.trendingScore} />
            </div>
            <button
              onClick={onToggleBookmark}
              className={`p-1.5 rounded-lg transition-colors ${
                isBookmarked
                  ? 'text-yellow-400 bg-yellow-500/20 hover:bg-yellow-500/30'
                  : 'text-neutral-500 hover:text-yellow-400 hover:bg-neutral-800'
              }`}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
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
          <h3 className="text-lg font-semibold text-white mb-2 leading-tight">
            {idea.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-3">
            <span className="uppercase tracking-wide">{idea.source}</span>
            {idea.publishedDate && idea.publishedDate !== 'Unknown' && (
              <>
                <span>•</span>
                <span>{formatDisplayDate(idea.publishedDate)}</span>
              </>
            )}
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-emerald-400 font-medium mb-1">Why it matters</p>
              <p className="text-sm text-neutral-300 leading-relaxed">
                {idea.whyItMatters}
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-400 font-medium mb-1">Research angle</p>
              <p className="text-sm text-neutral-300 leading-relaxed">
                {idea.researchAngle}
              </p>
            </div>
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

  // Load bookmarks from localStorage on mount
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

  // Save bookmarks to localStorage when changed
  useEffect(() => {
    localStorage.setItem('bioai-bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const toggleBookmark = (idea: ResearchIdea) => {
    const ideaId = idea.id || idea.title;
    const isBookmarked = bookmarks.some(b => (b.id || b.title) === ideaId);

    if (isBookmarked) {
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
    <main className="min-h-screen bg-neutral-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-white">Biology Research Ideas</h1>
              <p className="text-xs text-neutral-500">Trending ideas in Biology, Genomics & AI</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowBookmarks(!showBookmarks)}
                className={`relative p-2 rounded-lg transition-colors ${
                  showBookmarks
                    ? 'text-yellow-400 bg-yellow-500/20'
                    : 'text-neutral-400 hover:text-yellow-400 hover:bg-neutral-800'
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
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 text-black text-xs rounded-full flex items-center justify-center font-medium">
                    {bookmarks.length}
                  </span>
                )}
              </button>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors disabled:opacity-50"
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
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search topics (e.g., protein folding, LLM agents)"
                className="w-full bg-neutral-900 text-white placeholder-neutral-500 rounded-lg px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-neutral-400 hover:text-emerald-400 disabled:opacity-50"
              >
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
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </button>
            </form>
          )}

          {showBookmarks ? (
            <p className="text-sm text-yellow-400 mt-2">
              Saved Ideas ({bookmarks.length})
            </p>
          ) : searchQuery ? (
            <p className="text-xs text-neutral-500 mt-2">
              Searching: <span className="text-emerald-400">{searchQuery}</span>
            </p>
          ) : null}
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {showBookmarks ? (
          bookmarks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-500 mb-2">No saved ideas yet.</p>
              <p className="text-neutral-600 text-sm">Click the bookmark icon on any idea to save it.</p>
            </div>
          ) : (
            <div className="space-y-4">
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
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => fetchIdeas(searchQuery)}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
            >
              Try Again
            </button>
          </div>
        ) : loading ? (
          <LoadingSkeleton />
        ) : displayedIdeas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-500">No ideas found. Try a different search.</p>
          </div>
        ) : (
          <div className="space-y-4">
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
      <footer className="border-t border-neutral-800 mt-8">
        <div className="max-w-2xl mx-auto px-4 py-6 text-center">
          <p className="text-xs text-neutral-600">
            Powered by Groq + arXiv + Hacker News + Reddit + Google News
          </p>
        </div>
      </footer>
    </main>
  );
}
