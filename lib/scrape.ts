import * as cheerio from 'cheerio';

export interface Headline {
  title: string;
  source: string;
  url?: string;
  date?: string;
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

// ============ PREPRINT SERVERS ============

// bioRxiv - biology preprints
async function scrapeBiorxiv(query?: string): Promise<Headline[]> {
  const subjects = query
    ? [query]
    : ['bioinformatics', 'cell-biology', 'genomics', 'genetics', 'microbiology', 'molecular-biology', 'neuroscience', 'cancer-biology', 'biochemistry', 'synthetic-biology', 'developmental-biology', 'immunology'];

  const results: Headline[] = [];

  await Promise.all(
    subjects.slice(0, 8).map(async (subject) => {
      try {
        const url = `https://connect.biorxiv.org/biorxiv_xml.php?subject=${subject}`;
        const response = await fetchWithTimeout(url);
        const xml = await response.text();
        const $ = cheerio.load(xml, { xmlMode: true });

        $('item').slice(0, 10).each((_, item) => {
          const title = $(item).find('title').text().trim();
          const link = $(item).find('link').text().trim();
          const pubDate = $(item).find('dc\\:date, date').text().trim();
          if (title && title.length > 10) {
            results.push({
              title,
              source: `bioRxiv`,
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

    $('item').slice(0, 15).each((_, item) => {
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

// ============ RESEARCH DATABASES ============

// PubMed - free abstracts via NCBI E-utilities
async function scrapePubmed(query?: string): Promise<Headline[]> {
  const searchQuery = query || 'genomics OR CRISPR OR neuroscience OR cancer biology OR cell biology';
  const results: Headline[] = [];

  try {
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(searchQuery)}&retmax=25&sort=date&retmode=json`;
    const searchResponse = await fetchWithTimeout(searchUrl);
    const searchData = await searchResponse.json();

    const ids = searchData.esearchresult?.idlist || [];
    if (ids.length === 0) return results;

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

// Europe PMC - 40M+ biomedical articles
async function scrapeEuropePmc(query?: string): Promise<Headline[]> {
  const searchQuery = query || 'biology genomics cell neuroscience';
  const results: Headline[] = [];

  try {
    const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(searchQuery)}&format=json&pageSize=20&sort=DATE desc`;
    const response = await fetchWithTimeout(url);
    const data = await response.json();

    data.resultList?.result?.forEach((article: { title: string; id: string; source: string; firstPublicationDate: string }) => {
      if (article.title) {
        results.push({
          title: article.title,
          source: 'Europe PMC',
          url: `https://europepmc.org/article/${article.source}/${article.id}`,
          date: article.firstPublicationDate ? new Date(article.firstPublicationDate).toISOString() : undefined
        });
      }
    });
  } catch (error) {
    console.error('Failed to scrape Europe PMC:', error);
  }

  return results;
}

// ============ OPEN ACCESS JOURNALS ============

// PLOS journals
async function scrapePlos(): Promise<Headline[]> {
  const feeds = [
    { url: 'https://journals.plos.org/plosbiology/feed/atom', source: 'PLOS Biology' },
    { url: 'https://journals.plos.org/plosgenetics/feed/atom', source: 'PLOS Genetics' },
    { url: 'https://journals.plos.org/ploscompbiol/feed/atom', source: 'PLOS Comp Bio' },
    { url: 'https://journals.plos.org/plospathogens/feed/atom', source: 'PLOS Pathogens' },
  ];

  const results: Headline[] = [];

  await Promise.all(
    feeds.map(async ({ url, source }) => {
      try {
        const response = await fetchWithTimeout(url);
        const xml = await response.text();
        const $ = cheerio.load(xml, { xmlMode: true });

        $('entry').slice(0, 8).each((_, entry) => {
          const title = $(entry).find('title').text().trim();
          const link = $(entry).find('link').attr('href') || $(entry).find('id').text().trim();
          const published = $(entry).find('published').text().trim();
          if (title) {
            results.push({
              title,
              source,
              url: link || undefined,
              date: published ? new Date(published).toISOString() : undefined
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

// eLife journal
async function scrapeElife(): Promise<Headline[]> {
  const results: Headline[] = [];

  try {
    const url = 'https://elifesciences.org/rss/recent.xml';
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
          source: 'eLife',
          url: link || undefined,
          date: pubDate ? new Date(pubDate).toISOString() : undefined
        });
      }
    });
  } catch (error) {
    console.error('Failed to scrape eLife:', error);
  }

  return results;
}

// Nature journals (free RSS)
async function scrapeNature(): Promise<Headline[]> {
  const feeds = [
    { url: 'https://www.nature.com/nature.rss', source: 'Nature' },
    { url: 'https://www.nature.com/nbt.rss', source: 'Nature Biotech' },
    { url: 'https://www.nature.com/ng.rss', source: 'Nature Genetics' },
    { url: 'https://www.nature.com/nn.rss', source: 'Nature Neuroscience' },
    { url: 'https://www.nature.com/ncb.rss', source: 'Nature Cell Bio' },
  ];

  const results: Headline[] = [];

  await Promise.all(
    feeds.map(async ({ url, source }) => {
      try {
        const response = await fetchWithTimeout(url);
        const xml = await response.text();
        const $ = cheerio.load(xml, { xmlMode: true });

        $('item').slice(0, 8).each((_, item) => {
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

// ============ NEWS AGGREGATORS ============

// ScienceDaily
async function scrapeScienceDaily(): Promise<Headline[]> {
  const feeds = [
    { url: 'https://www.sciencedaily.com/rss/top/science.xml', source: 'ScienceDaily' },
    { url: 'https://www.sciencedaily.com/rss/plants_animals/genetics.xml', source: 'ScienceDaily Genetics' },
    { url: 'https://www.sciencedaily.com/rss/mind_brain/neuroscience.xml', source: 'ScienceDaily Neuro' },
    { url: 'https://www.sciencedaily.com/rss/plants_animals/biology.xml', source: 'ScienceDaily Biology' },
  ];

  const results: Headline[] = [];

  await Promise.all(
    feeds.map(async ({ url, source }) => {
      try {
        const response = await fetchWithTimeout(url);
        const xml = await response.text();
        const $ = cheerio.load(xml, { xmlMode: true });

        $('item').slice(0, 8).each((_, item) => {
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

// EurekAlert - research news
async function scrapeEurekAlert(): Promise<Headline[]> {
  const results: Headline[] = [];

  try {
    const url = 'https://www.eurekalert.org/rss/biology.xml';
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
          source: 'EurekAlert',
          url: link || undefined,
          date: pubDate ? new Date(pubDate).toISOString() : undefined
        });
      }
    });
  } catch (error) {
    console.error('Failed to scrape EurekAlert:', error);
  }

  return results;
}

// Phys.org biology news
async function scrapePhysOrg(): Promise<Headline[]> {
  const results: Headline[] = [];

  try {
    const url = 'https://phys.org/rss-feed/biology-news/';
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
          source: 'Phys.org',
          url: link || undefined,
          date: pubDate ? new Date(pubDate).toISOString() : undefined
        });
      }
    });
  } catch (error) {
    console.error('Failed to scrape Phys.org:', error);
  }

  return results;
}

// Medical Xpress
async function scrapeMedicalXpress(): Promise<Headline[]> {
  const results: Headline[] = [];

  try {
    const url = 'https://medicalxpress.com/rss-feed/';
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
          source: 'Medical Xpress',
          url: link || undefined,
          date: pubDate ? new Date(pubDate).toISOString() : undefined
        });
      }
    });
  } catch (error) {
    console.error('Failed to scrape Medical Xpress:', error);
  }

  return results;
}

// ============ arXiv ============

async function scrapeArxiv(query?: string): Promise<Headline[]> {
  if (query) {
    const searchUrl = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=20&sortBy=submittedDate&sortOrder=descending`;
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
  ];

  const results: Headline[] = [];

  await Promise.all(
    feeds.map(async ({ url, source }) => {
      try {
        const response = await fetchWithTimeout(url);
        const xml = await response.text();
        const $ = cheerio.load(xml, { xmlMode: true });

        $('item').slice(0, 10).each((_, item) => {
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

// ============ SOCIAL/COMMUNITY ============

async function scrapeHackerNews(query?: string): Promise<Headline[]> {
  const searchQuery = query || 'biology genomics CRISPR protein cell neuroscience cancer';
  const url = `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(searchQuery)}&tags=story&hitsPerPage=15`;

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
    const searchUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=new&limit=15`;
    try {
      const response = await fetchWithTimeout(searchUrl, {
        headers: { 'User-Agent': 'BioIdeas/1.0' },
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

  const subreddits = ['biology', 'bioinformatics', 'genomics', 'neuroscience', 'microbiology', 'genetics', 'labrats', 'biochemistry'];
  const results: Headline[] = [];

  await Promise.all(
    subreddits.map(async (subreddit) => {
      try {
        const url = `https://www.reddit.com/r/${subreddit}/new.json?limit=8`;
        const response = await fetchWithTimeout(url, {
          headers: { 'User-Agent': 'BioIdeas/1.0' },
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

// ============ DATA REPOSITORIES ============

// Zenodo - research outputs
async function scrapeZenodo(query?: string): Promise<Headline[]> {
  const searchQuery = query || 'biology genomics';
  const results: Headline[] = [];

  try {
    const url = `https://zenodo.org/api/records?q=${encodeURIComponent(searchQuery)}&size=15&sort=mostrecent&type=publication`;
    const response = await fetchWithTimeout(url);
    const data = await response.json();

    data.hits?.hits?.forEach((record: { metadata: { title: string; publication_date: string }; links: { self_html: string } }) => {
      if (record.metadata?.title) {
        results.push({
          title: record.metadata.title,
          source: 'Zenodo',
          url: record.links?.self_html,
          date: record.metadata.publication_date ? new Date(record.metadata.publication_date).toISOString() : undefined
        });
      }
    });
  } catch (error) {
    console.error('Failed to scrape Zenodo:', error);
  }

  return results;
}

// ============ MAIN EXPORT ============

export async function scrapeAllSources(query?: string): Promise<Headline[]> {
  const scrapers = [
    // Preprints
    scrapeBiorxiv(query),
    scrapeMedrxiv(),
    // Research databases
    scrapePubmed(query),
    scrapeEuropePmc(query),
    // Open access journals
    scrapePlos(),
    scrapeElife(),
    scrapeNature(),
    // News
    scrapeScienceDaily(),
    scrapeEurekAlert(),
    scrapePhysOrg(),
    scrapeMedicalXpress(),
    // arXiv
    scrapeArxiv(query),
    // Social
    scrapeHackerNews(query),
    scrapeReddit(query),
    // Data repos
    scrapeZenodo(query),
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
