import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { scrapeMultipleSources, isCloudflareConfigured } from '@/lib/cloudflare-scraper';
import { deduplicateOpportunities } from '@/lib/opportunity-parser';
import { PRIORITY_SOURCES, getBiotecnikaSources, getIndianSources, ALL_SOURCES } from '@/lib/opportunity-sources';
import { OpportunitiesData } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max for manual scraping

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'opportunities.json');

async function readOpportunitiesData(): Promise<OpportunitiesData> {
  try {
    const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {
      lastUpdated: new Date().toISOString(),
      opportunities: [],
      scrapeHistory: [],
    };
  }
}

async function writeOpportunitiesData(data: OpportunitiesData): Promise<void> {
  const dir = path.dirname(DATA_FILE_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2));
}

interface ScrapeRequest {
  sources?: 'priority' | 'biotecnika' | 'indian' | 'all';
  maxSources?: number;
  concurrency?: number;
}

/**
 * POST - Trigger a manual scrape job
 */
export async function POST(request: NextRequest) {
  try {
    // Check for Cloudflare credentials
    if (!isCloudflareConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cloudflare credentials not configured',
          setup: {
            steps: [
              '1. Create a Cloudflare account at https://dash.cloudflare.com/sign-up',
              '2. Enable Browser Rendering in Workers & Pages',
              '3. Create an API token with Browser Rendering permissions',
              '4. Add CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN to .env.local',
            ],
          },
        },
        { status: 400 }
      );
    }

    const body: ScrapeRequest = await request.json().catch(() => ({}));
    const { sources = 'priority', maxSources = 30, concurrency = 5 } = body;

    // Select sources based on request
    let sourcesToScrape;
    switch (sources) {
      case 'biotecnika':
        sourcesToScrape = getBiotecnikaSources();
        break;
      case 'indian':
        sourcesToScrape = getIndianSources().slice(0, maxSources);
        break;
      case 'all':
        sourcesToScrape = ALL_SOURCES.slice(0, maxSources);
        break;
      case 'priority':
      default:
        sourcesToScrape = PRIORITY_SOURCES.slice(0, maxSources);
    }

    console.log(`Starting manual scrape of ${sourcesToScrape.length} sources...`);

    // Scrape all sources
    const allOpportunities = await scrapeMultipleSources(sourcesToScrape, concurrency);
    const uniqueOpportunities = deduplicateOpportunities(allOpportunities);

    // Save to data file
    const data = await readOpportunitiesData();

    // Merge with existing, avoiding duplicates
    const existingIds = new Set(data.opportunities.map(o => o.id));
    const newOpportunities = uniqueOpportunities.filter(o => !existingIds.has(o.id));

    data.opportunities = [...newOpportunities, ...data.opportunities];
    data.lastUpdated = new Date().toISOString();
    data.scrapeHistory.push({
      jobId: `manual-${Date.now()}`,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      opportunitiesFound: newOpportunities.length,
    });

    // Keep only last 10 scrape history entries
    data.scrapeHistory = data.scrapeHistory.slice(-10);

    // Keep only last 90 days of opportunities
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    data.opportunities = data.opportunities.filter(
      o => new Date(o.scrapedAt) > ninetyDaysAgo
    );

    await writeOpportunitiesData(data);

    return NextResponse.json({
      success: true,
      stats: {
        sourcesScraped: sourcesToScrape.length,
        totalFound: allOpportunities.length,
        uniqueFound: uniqueOpportunities.length,
        newAdded: newOpportunities.length,
        totalStored: data.opportunities.length,
      },
    });
  } catch (error) {
    console.error('Scrape error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to scrape opportunities',
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Check scrape status
 */
export async function GET() {
  try {
    const data = await readOpportunitiesData();

    return NextResponse.json({
      success: true,
      lastUpdated: data.lastUpdated,
      totalOpportunities: data.opportunities.length,
      scrapeHistory: data.scrapeHistory,
      cloudflareConfigured: isCloudflareConfigured(),
    });
  } catch (error) {
    console.error('Error getting scrape status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get scrape status' },
      { status: 500 }
    );
  }
}
