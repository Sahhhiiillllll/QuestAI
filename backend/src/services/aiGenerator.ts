import { IGeneratedPaper } from '../models/Assignment';
import { buildPrompt, type GenerationInput } from './promptBuilder';
import { parseAndValidatePaper } from './parsePaper';

export type { GenerationInput };

export async function generateQuestionPaper(
  input: GenerationInput
): Promise<IGeneratedPaper> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const prompt = buildPrompt(input);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI API error: ${response.status} - ${error}`);
  }

  const data = (await response.json()) as {
    content: Array<{ type: string; text: string }>;
  };

  const rawText = data.content
    .filter((c) => c.type === 'text')
    .map((c) => c.text)
    .join('');

  return parseAndValidatePaper(rawText);
}
