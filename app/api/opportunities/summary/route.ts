import { NextRequest, NextResponse } from 'next/server';
import { groq } from '@/lib/groq';

export const dynamic = 'force-dynamic';

interface SummaryRequest {
  title: string;
  institution: string;
  description: string;
  type: string;
  deadline?: string;
  requirements?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: SummaryRequest = await request.json();
    const { title, institution, description, type, deadline, requirements } = body;

    if (!title || !institution || !description) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, institution, description' },
        { status: 400 }
      );
    }

    const prompt = `Summarize this research position opportunity in 2-3 concise sentences. Focus on what makes this position attractive and key qualifications needed.

Position: ${title}
Institution: ${institution}
Type: ${type}
${deadline ? `Deadline: ${deadline}` : ''}
${requirements?.length ? `Requirements: ${requirements.join(', ')}` : ''}

Description:
${description}

Return ONLY the summary text, no JSON formatting or additional text. Make it informative and engaging for potential applicants.`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that summarizes research position opportunities. Be concise, informative, and highlight key aspects that would interest potential applicants.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 300,
    });

    const summary = response.choices[0]?.message?.content?.trim();

    if (!summary) {
      throw new Error('No summary generated');
    }

    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate summary',
      },
      { status: 500 }
    );
  }
}
