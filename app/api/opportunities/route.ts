import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { OpportunitiesData, Opportunity, OpportunityType } from '@/lib/types';
import { scrapeMultipleSources, isCloudflareConfigured } from '@/lib/cloudflare-scraper';
import { PRIORITY_SOURCES } from '@/lib/opportunity-sources';
import { deduplicateOpportunities } from '@/lib/opportunity-parser';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for scraping

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'opportunities.json');

// How old data can be before we refresh (in milliseconds) - 1 hour
const STALE_THRESHOLD_MS = 60 * 60 * 1000;

async function readOpportunitiesData(): Promise<OpportunitiesData> {
  try {
    const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {
      lastUpdated: new Date(0).toISOString(), // Very old date to trigger refresh
      opportunities: [],
      scrapeHistory: [],
    };
  }
}

async function writeOpportunitiesData(data: OpportunitiesData): Promise<void> {
  // Ensure data directory exists
  const dir = path.dirname(DATA_FILE_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2));
}

function isDataStale(data: OpportunitiesData): boolean {
  if (data.opportunities.length === 0) return true;

  const lastUpdated = new Date(data.lastUpdated).getTime();
  const now = Date.now();
  return (now - lastUpdated) > STALE_THRESHOLD_MS;
}

async function autoScrape(): Promise<Opportunity[]> {
  if (!isCloudflareConfigured()) {
    console.log('Cloudflare not configured, skipping auto-scrape');
    return [];
  }

  console.log('Auto-scraping opportunities...');

  // Scrape top 15 priority sources for quick results
  const sourcesToScrape = PRIORITY_SOURCES.slice(0, 15);
  const opportunities = await scrapeMultipleSources(sourcesToScrape, 5);
  const unique = deduplicateOpportunities(opportunities);

  console.log(`Auto-scrape found ${unique.length} unique opportunities`);
  return unique;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Query parameters
    const type = searchParams.get('type') as OpportunityType | null;
    const country = searchParams.get('country');
    const search = searchParams.get('q');
    const source = searchParams.get('source');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const skipAutoScrape = searchParams.get('skipScrape') === 'true';

    // Read existing data
    let data = await readOpportunitiesData();

    // Auto-scrape if data is stale or empty (unless skipped)
    if (!skipAutoScrape && isDataStale(data)) {
      try {
        const newOpportunities = await autoScrape();

        if (newOpportunities.length > 0) {
          // Merge with existing
          const existingIds = new Set(data.opportunities.map(o => o.id));
          const uniqueNew = newOpportunities.filter(o => !existingIds.has(o.id));

          data.opportunities = [...uniqueNew, ...data.opportunities];
          data.lastUpdated = new Date().toISOString();
          data.scrapeHistory.push({
            jobId: `auto-${Date.now()}`,
            startedAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
            opportunitiesFound: uniqueNew.length,
          });

          // Keep only last 90 days and last 10 scrape history
          const ninetyDaysAgo = new Date();
          ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
          data.opportunities = data.opportunities.filter(
            o => new Date(o.scrapedAt) > ninetyDaysAgo
          );
          data.scrapeHistory = data.scrapeHistory.slice(-10);

          // Save updated data
          await writeOpportunitiesData(data);
        }
      } catch (error) {
        console.error('Auto-scrape failed:', error);
        // Continue with existing data
      }
    }

    let opportunities = data.opportunities;

    // Apply filters
    if (type) {
      opportunities = opportunities.filter(o => o.type === type);
    }

    if (country && country !== 'all') {
      opportunities = opportunities.filter(
        o => o.country.toLowerCase() === country.toLowerCase()
      );
    }

    if (source) {
      opportunities = opportunities.filter(o => o.source === source);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      opportunities = opportunities.filter(
        o =>
          o.title.toLowerCase().includes(searchLower) ||
          o.institution.toLowerCase().includes(searchLower) ||
          o.description.toLowerCase().includes(searchLower)
      );
    }

    // Sort by posted date (newest first)
    opportunities = opportunities.sort(
      (a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
    );

    // Pagination
    const total = opportunities.length;
    opportunities = opportunities.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      opportunities,
      meta: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
        lastUpdated: data.lastUpdated,
        cloudflareConfigured: isCloudflareConfigured(),
      },
    });
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch opportunities',
      },
      { status: 500 }
    );
  }
}

// POST - Add new opportunities manually
export async function POST(request: NextRequest) {
  try {
    const { opportunities: newOpportunities } = await request.json();

    if (!Array.isArray(newOpportunities)) {
      return NextResponse.json(
        { success: false, error: 'opportunities must be an array' },
        { status: 400 }
      );
    }

    const data = await readOpportunitiesData();

    // Merge and deduplicate
    const existingIds = new Set(data.opportunities.map(o => o.id));
    const uniqueNew = newOpportunities.filter(
      (o: Opportunity) => !existingIds.has(o.id)
    );

    data.opportunities = [...uniqueNew, ...data.opportunities];
    data.lastUpdated = new Date().toISOString();

    // Keep only last 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    data.opportunities = data.opportunities.filter(
      o => new Date(o.scrapedAt) > ninetyDaysAgo
    );

    await writeOpportunitiesData(data);

    return NextResponse.json({
      success: true,
      added: uniqueNew.length,
      total: data.opportunities.length,
    });
  } catch (error) {
    console.error('Error saving opportunities:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save opportunities' },
      { status: 500 }
    );
  }
}
