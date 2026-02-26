import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export const dynamic = 'force-dynamic';

function getGroqClient() {
  return new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { title, source, whyItMatters, researchAngle, category } = await request.json();

    const groq = getGroqClient();

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an expert research summarizer. Given a research idea, provide a detailed, actionable summary that a researcher could use to start exploring this topic.

Your response MUST be valid JSON with these exact fields:
{
  "detailedSummary": "2-3 paragraph comprehensive overview of the research idea, its significance, and current state of the field",
  "keyQuestions": ["3-4 specific research questions to explore"],
  "suggestedMethods": ["3-4 experimental or computational approaches"],
  "potentialImpact": "1 paragraph on real-world applications and implications",
  "relatedTopics": ["4-5 related research areas to explore"],
  "gettingStarted": "Brief actionable steps to begin researching this topic"
}

Return ONLY valid JSON, no markdown or extra text.`
        },
        {
          role: 'user',
          content: `Research Idea: ${title}

Source: ${source}
Category: ${category}

Initial Context:
- Why it matters: ${whyItMatters}
- Research angle: ${researchAngle}

Generate a detailed research summary with actionable insights.`
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in response');
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from response');
    }

    const summary = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ success: true, summary });
  } catch (error) {
    console.error('Summary API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}
