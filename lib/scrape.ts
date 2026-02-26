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

// bioRxiv - biology preprints
async function scrapeBiorxiv(query?: string): Promise<Headline[]> {
  // bioRxiv RSS feeds by subject
  const subjects = query
    ? [query]
    : ['bioinformatics', 'cell-biology', 'genomics', 'genetics', 'microbiology', 'molecular-biology', 'neuroscience', 'cancer-biology', 'biochemistry', 'systems-biology'];

  const results: Headline[] = [];

  await Promise.all(
    subjects.slice(0, 6).map(async (subject) => {
      try {
        const url = query
          ? `https://www.biorxiv.org/search/${encodeURIComponent(query)}%20numresults%3A20%20sort%3Arelevance-rank%20format_result%3Astandard`
          : `https://connect.biorxiv.org/biorxiv_xml.php?subject=${subject}`;

        const response = await fetchWithTimeout(url);
        const xml = await response.text();
        const $ = cheerio.load(xml, { xmlMode: true });

        $('item').each((_, item) => {
          const title = $(item).find('title').text().trim();
          const link = $(item).find('link').text().trim();
          const pubDate = $(item).find('dc\\:date, date').text().trim();
          if (title && title.length > 10) {
            results.push({
              title,
              source: `bioRxiv ${query ? '' : subject}`.trim(),
              url: link || undefined,
              date: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString()
            });
          }
        });
      } catch (error) {
        console.error(`Failed to scrape bioRxiv ${subject}:`, error);
      }
    })
  );

  return results;
}

// medRxiv - medical preprints
async function scrapeMedrxiv(): Promise<Headline[]> {
  const results: Headline[] = [];

  try {
    const url = 'https://connect.medrxiv.org/medrxiv_xml.php?subject=all';
    const response = await fetchWithTimeout(url);
    const xml = await response.text();
    const $ = cheerio.load(xml, { xmlMode: true });

    $('item').slice(0, 20).each((_, item) => {
      const title = $(item).find('title').text().trim();
      const link = $(item).find('link').text().trim();
      const pubDate = $(item).find('dc\\:date, date').text().trim();
      if (title && title.length > 10) {
        results.push({
          title,
          source: 'medRxiv',
          url: link || undefined,
          date: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString()
        });
      }
    });
  } catch (error) {
    console.error('Failed to scrape medRxiv:', error);
  }

  return results;
}

// PubMed - free abstracts
async function scrapePubmed(query?: string): Promise<Headline[]> {
  const searchQuery = query || 'genomics OR CRISPR OR neuroscience OR cancer biology';
  const results: Headline[] = [];

  try {
    // Search PubMed via E-utilities (free API)
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(searchQuery)}&retmax=20&sort=date&retmode=json`;
    const searchResponse = await fetchWithTimeout(searchUrl);
    const searchData = await searchResponse.json();

    const ids = searchData.esearchresult?.idlist || [];
    if (ids.length === 0) return results;

    // Fetch summaries
    const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
    const summaryResponse = await fetchWithTimeout(summaryUrl);
    const summaryData = await summaryResponse.json();

    for (const id of ids) {
      const article = summaryData.result?.[id];
      if (article?.title) {
        results.push({
          title: article.title.replace(/<[^>]*>/g, ''),
          source: 'PubMed',
          url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
          date: article.pubdate ? new Date(article.pubdate).toISOString() : undefined
        });
      }
    }
  } catch (error) {
    console.error('Failed to scrape PubMed:', error);
  }

  return results;
}

// Nature News (free section)
async function scrapeNatureNews(): Promise<Headline[]> {
  const results: Headline[] = [];

  try {
    const url = 'https://www.nature.com/nature.rss';
    const response = await fetchWithTimeout(url);
    const xml = await response.text();
    const $ = cheerio.load(xml, { xmlMode: true });

    $('item').slice(0, 15).each((_, item) => {
      const title = $(item).find('title').text().trim();
      const link = $(item).find('link').text().trim();
      const pubDate = $(item).find('pubDate').text().trim();
      if (title) {
        results.push({
          title,
          source: 'Nature',
          url: link || undefined,
          date: pubDate ? new Date(pubDate).toISOString() : undefined
        });
      }
    });
  } catch (error) {
    console.error('Failed to scrape Nature:', error);
  }

  return results;
}

// Science Daily - biology news
async function scrapeScienceDaily(): Promise<Headline[]> {
  const results: Headline[] = [];
  const feeds = [
    { url: 'https://www.sciencedaily.com/rss/top/science.xml', source: 'ScienceDaily' },
    { url: 'https://www.sciencedaily.com/rss/plants_animals.xml', source: 'ScienceDaily Biology' },
    { url: 'https://www.sciencedaily.com/rss/health_medicine.xml', source: 'ScienceDaily Health' },
  ];

  await Promise.all(
    feeds.map(async ({ url, source }) => {
      try {
        const response = await fetchWithTimeout(url);
        const xml = await response.text();
        const $ = cheerio.load(xml, { xmlMode: true });

        $('item').slice(0, 10).each((_, item) => {
          const title = $(item).find('title').text().trim();
          const link = $(item).find('link').text().trim();
          const pubDate = $(item).find('pubDate').text().trim();
          if (title) {
            results.push({
              title,
              source,
              url: link || undefined,
              date: pubDate ? new Date(pubDate).toISOString() : undefined
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

// arXiv biology + AI
async function scrapeArxiv(query?: string): Promise<Headline[]> {
  if (query) {
    const searchUrl = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=25&sortBy=submittedDate&sortOrder=descending`;
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

  // Default: biology-focused RSS feeds
  const feeds = [
    { url: 'https://export.arxiv.org/rss/q-bio', source: 'arXiv q-bio' },
    { url: 'https://export.arxiv.org/rss/q-bio.BM', source: 'arXiv Biomolecules' },
    { url: 'https://export.arxiv.org/rss/q-bio.GN', source: 'arXiv Genomics' },
    { url: 'https://export.arxiv.org/rss/q-bio.NC', source: 'arXiv Neuroscience' },
    { url: 'https://export.arxiv.org/rss/q-bio.CB', source: 'arXiv Cell Biology' },
    { url: 'https://export.arxiv.org/rss/q-bio.MN', source: 'arXiv Molecular Networks' },
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
  const url = `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(searchQuery)}&tags=story&hitsPerPage=20`;

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
  if (query) {
    const searchUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=new&limit=20`;
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

  // Biology-focused subreddits
  const subreddits = ['biology', 'bioinformatics', 'genomics', 'neuroscience', 'microbiology', 'genetics', 'labrats', 'biochemistry'];
  const results: Headline[] = [];

  await Promise.all(
    subreddits.map(async (subreddit) => {
      try {
        const url = `https://www.reddit.com/r/${subreddit}/new.json?limit=10`;
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

export async function scrapeAllSources(query?: string): Promise<Headline[]> {
  const scrapers = [
    scrapeBiorxiv(query),
    scrapeMedrxiv(),
    scrapePubmed(query),
    scrapeNatureNews(),
    scrapeScienceDaily(),
    scrapeArxiv(query),
    scrapeHackerNews(query),
    scrapeReddit(query),
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
