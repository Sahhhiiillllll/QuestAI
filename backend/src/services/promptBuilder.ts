export interface GenerationInput {
  title: string;
  subject: string;
  className: string;
  questionTypes: string[];
  totalQuestions: number;
  totalMarks: number;
  difficulty: string;
  additionalInstructions?: string;
  fileContent?: string;
}

export function buildPrompt(input: GenerationInput): string {
  const typeMap: Record<string, string> = {
    mcq: 'Multiple Choice Questions (MCQ)',
    short: 'Short Answer Questions',
    long: 'Long Answer / Essay Questions',
    true_false: 'True/False Questions',
    fill_blank: 'Fill in the Blanks',
  };

  const typesList = input.questionTypes.map((t) => typeMap[t] || t).join(', ');

  const difficultyDistribution =
    input.difficulty === 'mixed'
      ? 'Mix of easy (30%), medium (50%), and hard (20%) questions'
      : `All questions should be ${input.difficulty} difficulty`;

  const contextNote = input.fileContent
    ? `\n\nUse the following content as reference material for generating questions:\n${input.fileContent.slice(0, 3000)}`
    : '';

  return `You are an expert educator creating a structured examination paper. Generate a complete question paper in valid JSON format.

Assignment Details:
- Title: ${input.title}
- Subject: ${input.subject}
- Class/Grade: ${input.className}
- Question Types: ${typesList}
- Total Questions: ${input.totalQuestions}
- Total Marks: ${input.totalMarks}
- Difficulty: ${difficultyDistribution}
${input.additionalInstructions ? `- Additional Instructions: ${input.additionalInstructions}` : ''}
${contextNote}

Create logical sections (Section A, B, C etc.) grouping similar question types together.
Distribute marks appropriately: MCQ/True-False = 1-2 marks, Short Answer = 3-5 marks, Long Answer = 6-10 marks.

Respond ONLY with a valid JSON object in this exact structure (no markdown, no preamble):
{
  "subject": "${input.subject}",
  "className": "${input.className}",
  "totalMarks": ${input.totalMarks},
  "duration": "2 hours",
  "sections": [
    {
      "title": "Section A",
      "instruction": "Attempt all questions. Each question carries 1 mark.",
      "totalMarks": 10,
      "questions": [
        {
          "id": "A1",
          "text": "Question text here",
          "difficulty": "easy",
          "marks": 1,
          "type": "mcq"
        }
      ]
    }
  ]
}

Rules:
- id format: SectionLetter + QuestionNumber (A1, A2, B1, B2, etc.)
- difficulty must be exactly: "easy", "medium", or "hard"
- type must be exactly: "mcq", "short", "long", "true_false", or "fill_blank"
- totalMarks in each section = sum of question marks
- overall totalMarks = sum of all section totalMarks = ${input.totalMarks}
- Generate exactly ${input.totalQuestions} questions total
- Make questions relevant, educational, and age-appropriate for ${input.className}
- Questions should be substantive and test understanding, not just recall`;
}
