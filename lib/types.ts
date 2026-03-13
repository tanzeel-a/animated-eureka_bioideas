// Opportunity Types for Research Positions

export type OpportunityType = 'internship' | 'phd' | 'masters' | 'postdoc' | 'fellowship' | 'research-assistant';

export type OpportunitySource = 'university' | 'biotecnika' | 'research-center' | 'publication' | 'government';

export interface Opportunity {
  id: string;
  title: string;
  institution: string;
  department?: string;
  type: OpportunityType;
  location: string;
  country: string;
  deadline?: string;
  postedDate: string;
  description: string;
  requirements?: string[];
  sourceUrl: string;
  source: OpportunitySource;
  summary?: string; // Groq-generated
  scrapedAt: string;
  salary?: string;
  duration?: string;
  contactEmail?: string;
  applicationUrl?: string;
}

export interface ScrapeJob {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'errored' | 'cancelled';
  total: number;
  finished: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
  browserSecondsUsed?: number;
}

export interface OpportunitiesData {
  lastUpdated: string;
  opportunities: Opportunity[];
  scrapeHistory: {
    jobId: string;
    startedAt: string;
    completedAt?: string;
    opportunitiesFound: number;
  }[];
}

// Cloudflare Browser Rendering Types
export interface CrawlOptions {
  url: string;
  limit?: number;
  depth?: number;
  formats?: ('html' | 'markdown' | 'json')[];
  render?: boolean;
  source?: 'all' | 'sitemaps' | 'links';
  maxAge?: number;
  includePatterns?: string[];
  excludePatterns?: string[];
  waitForSelector?: {
    selector: string;
    timeout?: number;
  };
  rejectResourceTypes?: string[];
  setExtraHTTPHeaders?: Record<string, string>;
}

export interface CrawlRecord {
  url: string;
  status: 'success' | 'disallowed' | 'error';
  html?: string;
  markdown?: string;
  json?: Record<string, unknown>;
  error?: string;
}

export interface CrawlResult {
  id: string;
  status: 'running' | 'completed' | 'cancelled_due_to_timeout' | 'cancelled_due_to_limits' | 'cancelled_by_user' | 'errored';
  browserSecondsUsed: number;
  total: number;
  finished: number;
  records: CrawlRecord[];
}

// Source Configuration Types
export interface SourceConfig {
  name: string;
  url: string;
  category: OpportunitySource;
  country: string;
  careerPaths: string[];
  selectors?: {
    jobList?: string;
    title?: string;
    deadline?: string;
    description?: string;
    location?: string;
  };
  parsePattern?: 'default' | 'biotecnika' | 'nature-jobs' | 'academic-positions' | 'university';
}
