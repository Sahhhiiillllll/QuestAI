import { IGeneratedPaper, ISection, IQuestion } from '../models/Assignment';

export function parseAndValidatePaper(rawText: string): IGeneratedPaper {
  let parsed: IGeneratedPaper;
  try {
    const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    parsed = JSON.parse(cleaned);
  } catch (e) {
    throw new Error(`Failed to parse AI response as JSON: ${e}`);
  }

  if (!parsed.sections || !Array.isArray(parsed.sections)) {
    throw new Error('Invalid paper structure: missing sections');
  }

  parsed.generatedAt = new Date();

  parsed.sections.forEach((section: ISection, si: number) => {
    const letter = String.fromCharCode(65 + si);
    section.questions.forEach((q: IQuestion, qi: number) => {
      if (!q.id) q.id = `${letter}${qi + 1}`;
      if (!['easy', 'medium', 'hard'].includes(q.difficulty)) {
        q.difficulty = 'medium';
      }
      if (!['mcq', 'short', 'long', 'true_false', 'fill_blank'].includes(q.type)) {
        q.type = 'short';
      }
    });
  });

  return parsed;
}
