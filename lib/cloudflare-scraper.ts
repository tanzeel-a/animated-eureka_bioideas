import { Opportunity } from './types';
import { parseOpportunitiesFromContent, parseBiotecnikaContent, toOpportunity } from './opportunity-parser';
import { SourceConfig } from './opportunity-sources';

const CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4/accounts';

function getAccountId(): string {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  if (!accountId) {
    throw new Error('CLOUDFLARE_ACCOUNT_ID environment variable is not set');
  }
  return accountId;
}

function getApiToken(): string {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!token) {
    throw new Error('CLOUDFLARE_API_TOKEN environment variable is not set');
  }
  return token;
}

export interface ContentOptions {
  url: string;
  rejectResourceTypes?: string[];
  waitForSelector?: {
    selector: string;
    timeout?: number;
  };
}

export interface ContentResult {
  html?: string;
  markdown?: string;
  status?: number;
}

/**
 * Fetch content from a single URL using Cloudflare Browser Rendering /content endpoint
 * This is simpler and faster than the /crawl endpoint for single pages
 */
export async function fetchContent(options: ContentOptions): Promise<ContentResult | null> {
  const accountId = getAccountId();
  const token = getApiToken();

  try {
    const response = await fetch(
      `${CLOUDFLARE_API_BASE}/${accountId}/browser-rendering/content`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: options.url,
          rejectResourceTypes: options.rejectResourceTypes ?? ['image', 'media', 'font', 'stylesheet'],
          waitForSelector: options.waitForSelector,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error(`Cloudflare API error for ${options.url}: ${response.status} - ${error}`);
      return null;
    }

    const data = await response.json();

    if (!data.success) {
      console.error(`Cloudflare API failed for ${options.url}:`, data.errors);
      return null;
    }

    return {
      html: data.result?.html,
      markdown: data.result?.text || data.result?.markdown,
      status: data.result?.status,
    };
  } catch (error) {
    console.error(`Failed to fetch content from ${options.url}:`, error);
    return null;
  }
}

/**
 * Scrape opportunities from a single source
 */
export async function scrapeSource(source: SourceConfig): Promise<Opportunity[]> {
  try {
    console.log(`Scraping: ${source.name} (${source.url})`);

    const content = await fetchContent({
      url: source.url,
      rejectResourceTypes: ['image', 'media', 'font', 'stylesheet'],
    });

    if (!content || (!content.html && !content.markdown)) {
      console.log(`No content from ${source.name}`);
      return [];
    }

    const textContent = content.markdown || content.html || '';

    // Parse based on source type
    let parsed;
    if (source.category === 'biotecnika') {
      parsed = parseBiotecnikaContent(textContent, source.url);
    } else {
      parsed = parseOpportunitiesFromContent(textContent, source);
    }

    // Convert to full Opportunity objects
    const opportunities = parsed.map(p => toOpportunity(p, source));

    console.log(`Found ${opportunities.length} opportunities from ${source.name}`);
    return opportunities;
  } catch (error) {
    console.error(`Error scraping ${source.name}:`, error);
    return [];
  }
}

/**
 * Scrape multiple sources in parallel with rate limiting
 */
export async function scrapeMultipleSources(
  sources: SourceConfig[],
  concurrency: number = 5
): Promise<Opportunity[]> {
  const allOpportunities: Opportunity[] = [];

  // Process in batches to avoid overwhelming the API
  for (let i = 0; i < sources.length; i += concurrency) {
    const batch = sources.slice(i, i + concurrency);

    const results = await Promise.allSettled(
      batch.map(source => scrapeSource(source))
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        allOpportunities.push(...result.value);
      }
    }

    // Small delay between batches
    if (i + concurrency < sources.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return allOpportunities;
}

/**
 * Check if Cloudflare credentials are configured
 */
export function isCloudflareConfigured(): boolean {
  return !!(process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN);
}
