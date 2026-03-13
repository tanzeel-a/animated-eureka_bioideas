import { Opportunity, OpportunityType, OpportunitySource, SourceConfig } from './types';
import { createHash } from 'crypto';

// ============================================================================
// OPPORTUNITY PARSER - Extract job listings from scraped HTML/Markdown
// ============================================================================

interface ParsedOpportunity {
  title: string;
  description: string;
  deadline?: string;
  location?: string;
  requirements?: string[];
  url: string;
  type?: OpportunityType;
}

/**
 * Generate unique ID for an opportunity
 */
function generateId(title: string, institution: string, url: string): string {
  const hash = createHash('sha256')
    .update(`${title}${institution}${url}`)
    .digest('hex');
  return hash.substring(0, 12);
}

/**
 * Detect opportunity type from title/description
 */
function detectOpportunityType(title: string, description: string): OpportunityType {
  const text = `${title} ${description}`.toLowerCase();

  if (text.includes('phd') || text.includes('doctoral') || text.includes('doctorate')) {
    return 'phd';
  }
  if (text.includes('postdoc') || text.includes('post-doc') || text.includes('postdoctoral')) {
    return 'postdoc';
  }
  if (text.includes('msc') || text.includes('m.sc') || text.includes('master') || text.includes('mtech') || text.includes('m.tech')) {
    return 'masters';
  }
  if (text.includes('intern') || text.includes('summer') || text.includes('trainee')) {
    return 'internship';
  }
  if (text.includes('fellowship') || text.includes('scholar')) {
    return 'fellowship';
  }
  if (text.includes('research assistant') || text.includes('ra position') || text.includes('jrf') || text.includes('srf')) {
    return 'research-assistant';
  }

  // Default based on common patterns
  if (text.includes('faculty') || text.includes('professor') || text.includes('scientist')) {
    return 'postdoc'; // Treat senior positions as postdoc level
  }

  return 'research-assistant'; // Default
}

/**
 * Extract deadline from text
 */
function extractDeadline(text: string): string | undefined {
  // Common date patterns
  const patterns = [
    // "Deadline: March 15, 2026"
    /deadline[:\s]+([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
    // "Apply by 15/03/2026"
    /apply\s+by[:\s]+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
    // "Last date: 15-Mar-2026"
    /last\s+date[:\s]+(\d{1,2}[\/\-\.][A-Za-z]{3,}[\/\-\.]\d{4})/i,
    // "Due: 2026-03-15"
    /due[:\s]+(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/i,
    // "Closes on March 15"
    /closes?\s+(?:on\s+)?([A-Za-z]+\s+\d{1,2}(?:,?\s+\d{4})?)/i,
    // "15 March 2026"
    /(\d{1,2}\s+[A-Za-z]+\s+\d{4})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  return undefined;
}

/**
 * Extract location from text
 */
function extractLocation(text: string, defaultCountry: string): string {
  // Common location patterns
  const locationPatterns = [
    /location[:\s]+([^,\n]+(?:,\s*[^,\n]+)?)/i,
    /based\s+(?:in|at)\s+([^,\n]+)/i,
    /position\s+(?:in|at)\s+([^,\n]+)/i,
  ];

  for (const pattern of locationPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  // Indian cities
  const indianCities = [
    'Bangalore', 'Bengaluru', 'Mumbai', 'Delhi', 'New Delhi', 'Hyderabad',
    'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Chandigarh', 'Lucknow',
    'Thiruvananthapuram', 'Trivandrum', 'Mohali', 'Bhopal', 'Guwahati',
    'Kharagpur', 'Roorkee', 'Kanpur', 'Varanasi', 'Mysore', 'Manipal'
  ];

  for (const city of indianCities) {
    if (text.toLowerCase().includes(city.toLowerCase())) {
      return `${city}, India`;
    }
  }

  return defaultCountry;
}

/**
 * Extract requirements from text
 */
function extractRequirements(text: string): string[] {
  const requirements: string[] = [];

  // Look for requirement sections
  const reqPatterns = [
    /requirements?[:\s]+([^\n]+(?:\n[•\-\*]\s*[^\n]+)*)/i,
    /qualifications?[:\s]+([^\n]+(?:\n[•\-\*]\s*[^\n]+)*)/i,
    /eligibility[:\s]+([^\n]+(?:\n[•\-\*]\s*[^\n]+)*)/i,
  ];

  for (const pattern of reqPatterns) {
    const match = text.match(pattern);
    if (match) {
      const reqText = match[1];
      const items = reqText.split(/[•\-\*\n]+/).filter(item => item.trim().length > 10);
      requirements.push(...items.map(item => item.trim()).slice(0, 5));
      break;
    }
  }

  // Look for common requirement keywords
  const keywords = [
    /ph\.?d\.?\s+(?:in\s+)?[a-z]+/i,
    /m\.?sc\.?\s+(?:in\s+)?[a-z]+/i,
    /\d+\+?\s+years?\s+(?:of\s+)?experience/i,
    /experience\s+(?:in|with)\s+[a-z]+/i,
    /proficiency\s+in\s+[a-z]+/i,
    /knowledge\s+of\s+[a-z]+/i,
  ];

  for (const pattern of keywords) {
    const match = text.match(pattern);
    if (match && !requirements.some(r => r.toLowerCase().includes(match[0].toLowerCase()))) {
      requirements.push(match[0]);
    }
  }

  return requirements.slice(0, 5);
}

/**
 * Parse opportunities from generic HTML/Markdown content
 */
export function parseOpportunitiesFromContent(
  content: string,
  sourceConfig: SourceConfig
): ParsedOpportunity[] {
  const opportunities: ParsedOpportunity[] = [];

  // Try different parsing strategies based on content structure
  const strategies = [
    parseJobListings,
    parseMarkdownSections,
    parseHTMLSections,
  ];

  for (const strategy of strategies) {
    const parsed = strategy(content, sourceConfig);
    if (parsed.length > 0) {
      opportunities.push(...parsed);
      break;
    }
  }

  return opportunities;
}

/**
 * Parse job listing patterns (common on career pages)
 */
function parseJobListings(content: string, sourceConfig: SourceConfig): ParsedOpportunity[] {
  const opportunities: ParsedOpportunity[] = [];

  // Look for job listing patterns
  // Pattern: Title followed by details
  const listingPatterns = [
    // Markdown links with job titles
    /\[([^\]]+(?:PhD|PostDoc|Intern|Fellow|Research|Scientist|Position)[^\]]*)\]\(([^)]+)\)/gi,
    // HTML links
    /<a[^>]+href="([^"]+)"[^>]*>([^<]+(?:PhD|PostDoc|Intern|Fellow|Research|Scientist|Position)[^<]*)<\/a>/gi,
    // Heading + link pattern
    /#{1,3}\s*([^\n]+(?:PhD|PostDoc|Intern|Fellow|Research|Scientist|Position)[^\n]*)/gi,
  ];

  for (const pattern of listingPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const [, titleOrUrl, urlOrTitle] = match;
      const title = titleOrUrl.startsWith('http') ? urlOrTitle : titleOrUrl;
      const url = titleOrUrl.startsWith('http') ? titleOrUrl : (urlOrTitle || sourceConfig.url);

      // Extract surrounding context for description
      const startIdx = Math.max(0, match.index - 500);
      const endIdx = Math.min(content.length, match.index + 1000);
      const context = content.substring(startIdx, endIdx);

      opportunities.push({
        title: title.trim(),
        description: extractDescription(context, title),
        deadline: extractDeadline(context),
        location: extractLocation(context, sourceConfig.country),
        requirements: extractRequirements(context),
        url: url.startsWith('http') ? url : `${sourceConfig.url}${url}`,
        type: detectOpportunityType(title, context),
      });
    }
  }

  return opportunities;
}

/**
 * Parse Markdown sections for opportunities
 */
function parseMarkdownSections(content: string, sourceConfig: SourceConfig): ParsedOpportunity[] {
  const opportunities: ParsedOpportunity[] = [];

  // Split by markdown headings
  const sections = content.split(/(?=^#{1,3}\s)/m);

  for (const section of sections) {
    // Check if section contains job-related keywords
    const jobKeywords = /phd|postdoc|intern|fellow|research|scientist|position|opening|vacancy|job/i;
    if (!jobKeywords.test(section)) continue;

    // Extract title from heading
    const titleMatch = section.match(/^#{1,3}\s*(.+)$/m);
    if (!titleMatch) continue;

    const title = titleMatch[1].trim();

    // Extract URL if present
    const urlMatch = section.match(/\[(?:Apply|Link|More)[^\]]*\]\(([^)]+)\)/i) ||
                     section.match(/href="([^"]+)"/i);
    const url = urlMatch ? urlMatch[1] : sourceConfig.url;

    opportunities.push({
      title,
      description: extractDescription(section, title),
      deadline: extractDeadline(section),
      location: extractLocation(section, sourceConfig.country),
      requirements: extractRequirements(section),
      url: url.startsWith('http') ? url : `${sourceConfig.url}${url}`,
      type: detectOpportunityType(title, section),
    });
  }

  return opportunities;
}

/**
 * Parse HTML sections for opportunities
 */
function parseHTMLSections(content: string, sourceConfig: SourceConfig): ParsedOpportunity[] {
  const opportunities: ParsedOpportunity[] = [];

  // Look for common job listing HTML patterns
  const articlePatterns = [
    /<article[^>]*>([\s\S]*?)<\/article>/gi,
    /<div[^>]*class="[^"]*(?:job|position|vacancy|listing)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<li[^>]*class="[^"]*(?:job|position|vacancy)[^"]*"[^>]*>([\s\S]*?)<\/li>/gi,
  ];

  for (const pattern of articlePatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const articleContent = match[1];

      // Extract title from heading or link
      const titleMatch = articleContent.match(/<h[1-4][^>]*>([^<]+)<\/h[1-4]>/i) ||
                         articleContent.match(/<a[^>]+>([^<]+)<\/a>/i);
      if (!titleMatch) continue;

      const title = titleMatch[1].trim();

      // Skip if not job-related
      const jobKeywords = /phd|postdoc|intern|fellow|research|scientist|position|opening/i;
      if (!jobKeywords.test(title) && !jobKeywords.test(articleContent)) continue;

      // Extract URL
      const urlMatch = articleContent.match(/href="([^"]+)"/i);
      const url = urlMatch ? urlMatch[1] : sourceConfig.url;

      // Strip HTML for description
      const cleanContent = articleContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

      opportunities.push({
        title,
        description: extractDescription(cleanContent, title),
        deadline: extractDeadline(cleanContent),
        location: extractLocation(cleanContent, sourceConfig.country),
        requirements: extractRequirements(cleanContent),
        url: url.startsWith('http') ? url : `${sourceConfig.url}${url}`,
        type: detectOpportunityType(title, cleanContent),
      });
    }
  }

  return opportunities;
}

/**
 * Extract description from context
 */
function extractDescription(context: string, title: string): string {
  // Remove the title from context
  let description = context.replace(title, '').trim();

  // Strip markdown/HTML
  description = description
    .replace(/#{1,6}\s*/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Limit length
  if (description.length > 500) {
    description = description.substring(0, 500) + '...';
  }

  return description || 'No description available.';
}

/**
 * Parse Biotecnika-specific format
 */
export function parseBiotecnikaContent(content: string, url: string): ParsedOpportunity[] {
  const opportunities: ParsedOpportunity[] = [];

  // Biotecnika uses WordPress blog format
  // Look for article patterns
  const articlePattern = /<article[^>]*>([\s\S]*?)<\/article>/gi;

  let match;
  while ((match = articlePattern.exec(content)) !== null) {
    const articleContent = match[1];

    // Extract title
    const titleMatch = articleContent.match(/<h2[^>]*class="[^"]*entry-title[^"]*"[^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>/i);
    if (!titleMatch) continue;

    const title = titleMatch[1].trim();

    // Extract link
    const linkMatch = articleContent.match(/href="([^"]+)"/i);
    const articleUrl = linkMatch ? linkMatch[1] : url;

    // Extract excerpt
    const excerptMatch = articleContent.match(/<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    const excerpt = excerptMatch
      ? excerptMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      : '';

    opportunities.push({
      title,
      description: excerpt.substring(0, 500) || 'View full details on Biotecnika.',
      deadline: extractDeadline(articleContent),
      location: 'India',
      url: articleUrl,
      type: detectOpportunityType(title, excerpt),
    });
  }

  return opportunities;
}

/**
 * Convert parsed opportunity to full Opportunity object
 */
export function toOpportunity(
  parsed: ParsedOpportunity,
  sourceConfig: SourceConfig
): Opportunity {
  return {
    id: generateId(parsed.title, sourceConfig.name, parsed.url),
    title: parsed.title,
    institution: sourceConfig.name,
    department: undefined,
    type: parsed.type || detectOpportunityType(parsed.title, parsed.description),
    location: parsed.location || sourceConfig.country,
    country: sourceConfig.country,
    deadline: parsed.deadline,
    postedDate: new Date().toISOString().split('T')[0],
    description: parsed.description,
    requirements: parsed.requirements,
    sourceUrl: parsed.url,
    source: sourceConfig.category,
    scrapedAt: new Date().toISOString(),
  };
}

/**
 * Deduplicate opportunities by title similarity
 */
export function deduplicateOpportunities(opportunities: Opportunity[]): Opportunity[] {
  const seen = new Map<string, Opportunity>();

  for (const opp of opportunities) {
    // Normalize title for comparison
    const normalizedTitle = opp.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 50);

    if (!seen.has(normalizedTitle)) {
      seen.set(normalizedTitle, opp);
    }
  }

  return Array.from(seen.values());
}

/**
 * Filter out expired opportunities
 */
export function filterExpiredOpportunities(opportunities: Opportunity[]): Opportunity[] {
  const now = new Date();

  return opportunities.filter(opp => {
    if (!opp.deadline) return true; // Keep if no deadline

    try {
      const deadline = new Date(opp.deadline);
      return deadline > now;
    } catch {
      return true; // Keep if deadline can't be parsed
    }
  });
}
