import * as cheerio from 'cheerio';

export interface Headline {
  title: string;
  source: string;
  url?: string;
  date?: string; // ISO date string
}

const TIMEOUT = 5000;

async function fetchWithTimeout(url: string, options?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function scrapeArxiv(query?: string): Promise<Headline[]> {
  // If query provided, search arXiv API; otherwise use RSS feeds
  if (query) {
    const searchUrl = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=30&sortBy=submittedDate&sortOrder=descending`;
    try {
      const response = await fetchWithTimeout(searchUrl);
      const xml = await response.text();
      const $ = cheerio.load(xml, { xmlMode: true });

      const results: Headline[] = [];
      $('entry').each((_, entry) => {
        const title = $(entry).find('title').text().trim().replace(/\s+/g, ' ');
        const link = $(entry).find('id').text().trim();
        const published = $(entry).find('published').text().trim();
        if (title) {
          results.push({
            title,
            source: 'arXiv',
            url: link || undefined,
            date: published || undefined
          });
        }
      });
      return results;
    } catch (error) {
      console.error('Failed to search arXiv:', error);
      return [];
    }
  }

  // Default: use RSS feeds - prioritize biology
  const feeds = [
    { url: 'https://export.arxiv.org/rss/q-bio', source: 'arXiv q-bio' },
    { url: 'https://export.arxiv.org/rss/q-bio.BM', source: 'arXiv Biomolecules' },
    { url: 'https://export.arxiv.org/rss/q-bio.GN', source: 'arXiv Genomics' },
    { url: 'https://export.arxiv.org/rss/q-bio.NC', source: 'arXiv Neurons & Cogntic' },
    { url: 'https://export.arxiv.org/rss/q-bio.CB', source: 'arXiv Cell Behavior' },
    { url: 'https://export.arxiv.org/rss/cs.AI', source: 'arXiv cs.AI' },
  ];

  const results: Headline[] = [];

  await Promise.all(
    feeds.map(async ({ url, source }) => {
      try {
        const response = await fetchWithTimeout(url);
        const xml = await response.text();
        const $ = cheerio.load(xml, { xmlMode: true });

        $('item').each((_, item) => {
          const title = $(item).find('title').text().trim();
          const link = $(item).find('link').text().trim();
          // RSS feeds are daily, use today's date
          if (title) {
            results.push({
              title,
              source,
              url: link || undefined,
              date: new Date().toISOString()
            });
          }
        });
      } catch (error) {
        console.error(`Failed to scrape ${source}:`, error);
      }
    })
  );

  return results;
}

async function scrapeHackerNews(query?: string): Promise<Headline[]> {
  const searchQuery = query || 'biology genomics CRISPR protein cell neuroscience cancer drug discovery';
  const url = `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(searchQuery)}&tags=story&hitsPerPage=25`;

  try {
    const response = await fetchWithTimeout(url);
    const data = await response.json();

    return data.hits?.map((hit: { title: string; url?: string; objectID: string; created_at: string }) => ({
      title: hit.title,
      source: 'Hacker News',
      url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
      date: hit.created_at,
    })) || [];
  } catch (error) {
    console.error('Failed to scrape Hacker News:', error);
    return [];
  }
}

async function scrapeReddit(query?: string): Promise<Headline[]> {
  // If query provided, search Reddit; otherwise browse subreddits
  if (query) {
    const searchUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=new&limit=25`;
    try {
      const response = await fetchWithTimeout(searchUrl, {
        headers: { 'User-Agent': 'BioAIIdeas/1.0' },
      });
      const data = await response.json();

      return data.data?.children?.map((child: { data: { title: string; permalink: string; subreddit: string; created_utc: number } }) => ({
        title: child.data.title,
        source: `Reddit r/${child.data.subreddit}`,
        url: `https://reddit.com${child.data.permalink}`,
        date: new Date(child.data.created_utc * 1000).toISOString(),
      })) || [];
    } catch (error) {
      console.error('Failed to search Reddit:', error);
      return [];
    }
  }

  // Default: browse subreddits - biology focused
  const subreddits = ['biology', 'bioinformatics', 'genomics', 'neuroscience', 'microbiology', 'genetics', 'cellbiology', 'MachineLearning'];
  const results: Headline[] = [];

  await Promise.all(
    subreddits.map(async (subreddit) => {
      try {
        const url = `https://www.reddit.com/r/${subreddit}/new.json?limit=15`;
        const response = await fetchWithTimeout(url, {
          headers: { 'User-Agent': 'BioAIIdeas/1.0' },
        });
        const data = await response.json();

        data.data?.children?.forEach((child: { data: { title: string; permalink: string; created_utc: number } }) => {
          results.push({
            title: child.data.title,
            source: `Reddit r/${subreddit}`,
            url: `https://reddit.com${child.data.permalink}`,
            date: new Date(child.data.created_utc * 1000).toISOString(),
          });
        });
      } catch (error) {
        console.error(`Failed to scrape r/${subreddit}:`, error);
      }
    })
  );

  return results;
}

async function scrapeGoogleNews(query?: string): Promise<Headline[]> {
  const searchQuery = query || 'biology research genomics CRISPR neuroscience cell therapy';
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery)}&hl=en-US&gl=US&ceid=US:en`;

  try {
    const response = await fetchWithTimeout(url);
    const xml = await response.text();
    const $ = cheerio.load(xml, { xmlMode: true });

    const results: Headline[] = [];
    $('item').slice(0, 20).each((_, item) => {
      const title = $(item).find('title').text().trim();
      const link = $(item).find('link').text().trim();
      const pubDate = $(item).find('pubDate').text().trim();
      if (title) {
        results.push({
          title,
          source: 'Google News',
          url: link || undefined,
          date: pubDate ? new Date(pubDate).toISOString() : undefined
        });
      }
    });

    return results;
  } catch (error) {
    console.error('Failed to scrape Google News:', error);
    return [];
  }
}

export async function scrapeAllSources(query?: string): Promise<Headline[]> {
  const scrapers = [
    scrapeArxiv(query),
    scrapeHackerNews(query),
    scrapeReddit(query),
    scrapeGoogleNews(query),
  ];

  const results = await Promise.allSettled(scrapers);
  const headlines: Headline[] = [];

  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      headlines.push(...result.value);
    }
  });

  return headlines;
}
