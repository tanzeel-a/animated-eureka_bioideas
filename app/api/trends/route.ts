import { NextRequest, NextResponse } from 'next/server';
import { scrapeAllSources } from '@/lib/scrape';
import { deduplicateHeadlines } from '@/lib/dedupe';
import { generateIdeas } from '@/lib/groq';

// Ensure this route is always dynamic (no caching)
export const dynamic = 'force-dynamic';

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || undefined;

  try {
    // Scrape all sources
    const headlines = await scrapeAllSources(query);

    // Deduplicate
    const uniqueHeadlines = deduplicateHeadlines(headlines);

    // Shuffle headlines for variety on each request
    const shuffledHeadlines = shuffleArray(uniqueHeadlines);

    // Generate ideas via Groq
    const ideas = await generateIdeas(shuffledHeadlines);

    return NextResponse.json(
      {
        success: true,
        ideas,
        meta: {
          totalHeadlines: headlines.length,
          uniqueHeadlines: uniqueHeadlines.length,
          query: query || null,
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate ideas' },
      { status: 500 }
    );
  }
}
