import { createHash } from 'crypto';
import { Headline } from './scrape';

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function hashTitle(title: string): string {
  const normalized = normalizeTitle(title);
  return createHash('sha256').update(normalized).digest('hex');
}

export function deduplicateHeadlines(headlines: Headline[]): Headline[] {
  const seen = new Set<string>();
  const unique: Headline[] = [];

  for (const headline of headlines) {
    const hash = hashTitle(headline.title);
    if (!seen.has(hash)) {
      seen.add(hash);
      unique.push(headline);
    }
  }

  return unique;
}
