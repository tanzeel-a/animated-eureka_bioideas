import Groq from 'groq-sdk';
import { Headline } from './scrape';

export interface ResearchIdea {
  id?: string;
  title: string;
  source: string;
  sourceUrl?: string; // Link to original paper/article
  publishedDate: string; // ISO date or readable date
  category: 'biology' | 'ai' | 'bio-ai';
  trendingScore: number; // 1-10, higher = more trending
  whyItMatters: string;
  researchAngle: string;
}

function getGroqClient() {
  return new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
}

const SYSTEM_PROMPT = `You are a research idea synthesizer with deep expertise in Biology and life sciences.
Given a list of headlines with their publication dates, generate exactly 10 innovative research ideas across THREE categories:

CATEGORIES (biology-focused distribution):
1. BIOLOGY (5-6 ideas): Core biology research including:
   - Molecular biology, biochemistry, structural biology
   - Genomics, transcriptomics, proteomics, epigenetics
   - Cell biology, developmental biology, stem cells
   - Neuroscience, neurobiology, cognition
   - Microbiology, virology, immunology
   - Ecology, evolution, systems biology
   - Cancer biology, disease mechanisms
   - CRISPR, gene editing, synthetic biology
2. AI (2-3 ideas): Pure AI/ML research - architectures, training methods, reasoning, agents, etc.
3. BIO-AI (2 ideas): Applications of AI/ML to solve biological problems (drug discovery, protein folding, genomic analysis)

For each idea, provide:
1. A compelling title (concise, max 15 words)
2. The source headline that inspired it
3. Published date: The date from the source headline (format: YYYY-MM-DD)
4. Category: one of "biology", "ai", or "bio-ai"
5. Trending score (1-10): Rate based on:
   - RECENCY IS KEY: Papers from last 24-48 hours = 9-10, last week = 7-8, older = lower
   - Major breakthroughs (OpenAI, DeepMind, major labs = boost)
   - Viral discussions (multiple headlines on same topic = boost)
   - Cutting-edge techniques (new architectures, novel methods = boost)
6. Why it matters (1-2 sentences on real-world impact)
7. Research angle (1-2 sentences on how to approach this research)

Return your response as a valid JSON array with exactly 10 objects, SORTED BY trendingScore (highest first), each having these fields:
- "title": string
- "source": string
- "publishedDate": string (YYYY-MM-DD format)
- "category": "biology" | "ai" | "bio-ai"
- "trendingScore": number (1-10)
- "whyItMatters": string
- "researchAngle": string

Return ONLY the JSON array, no additional text or markdown.`;

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'Unknown';
  try {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  } catch {
    return 'Unknown';
  }
}

export async function generateIdeas(headlines: Headline[]): Promise<ResearchIdea[]> {
  const limitedHeadlines = headlines.slice(0, 50);

  // Create a map of sources to URLs for lookup
  const sourceUrlMap = new Map<string, string>();
  limitedHeadlines.forEach(h => {
    if (h.url) {
      // Use a simplified key for matching
      const key = h.title.toLowerCase().slice(0, 50);
      sourceUrlMap.set(key, h.url);
      sourceUrlMap.set(h.source + h.title.slice(0, 30), h.url);
    }
  });

  const headlineText = limitedHeadlines
    .map((h, i) => `${i + 1}. [${h.source}] [${formatDate(h.date)}] ${h.title}`)
    .join('\n');

  try {
    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Today's date is ${new Date().toISOString().split('T')[0]}.\n\nHere are the headlines with dates:\n\n${headlineText}\n\nGenerate 10 research ideas with a strong focus on core biology (5-6 biology ideas). Include cutting-edge topics like CRISPR, single-cell analysis, protein engineering, neuroimaging, cancer mechanisms, etc. Prioritize recent papers.` },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 3500,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in response');
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from response');
    }

    const ideas = JSON.parse(jsonMatch[0]) as ResearchIdea[];

    // Sort by trending score (highest first), add unique IDs, and try to match URLs
    return ideas
      .sort((a, b) => (b.trendingScore || 5) - (a.trendingScore || 5))
      .slice(0, 10)
      .map((idea, i) => {
        // Try to find matching URL from headlines
        let sourceUrl: string | undefined;
        for (const h of limitedHeadlines) {
          if (idea.source.toLowerCase().includes(h.source.toLowerCase().slice(0, 10)) ||
              h.title.toLowerCase().includes(idea.source.toLowerCase().slice(0, 20))) {
            sourceUrl = h.url;
            break;
          }
        }
        return { ...idea, id: `idea-${Date.now()}-${i}`, sourceUrl };
      });
  } catch (error) {
    console.error('Groq API error:', error);
    // Fallback: return raw headlines as ideas
    return headlines.slice(0, 10).map((h, i) => ({
      id: `idea-${Date.now()}-${i}`,
      title: h.title,
      source: h.source,
      sourceUrl: h.url,
      publishedDate: formatDate(h.date),
      category: (i % 3 === 0 ? 'biology' : i % 3 === 1 ? 'ai' : 'bio-ai') as 'biology' | 'ai' | 'bio-ai',
      trendingScore: 5,
      whyItMatters: 'Trending topic worth exploring.',
      researchAngle: 'Investigate this emerging trend further.',
    }));
  }
}
