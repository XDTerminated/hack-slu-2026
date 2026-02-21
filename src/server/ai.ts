import Groq from "groq-sdk";
import { env } from "~/env";

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

export type StudyQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export async function generateStudyQuestions(
  courseName: string,
  content: string,
  count = 10,
): Promise<StudyQuestion[]> {
  const trimmedContent = content.slice(0, 12000);

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a study assistant for a college course called "${courseName}".
Generate exactly ${count} multiple-choice study questions based on the provided course material.

Return valid JSON in this exact format:
{
  "questions": [
    {
      "question": "What is...?",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correctIndex": 0,
      "explanation": "The answer is A because..."
    }
  ]
}

Rules:
- Questions should test understanding, not just memorization
- All 4 options should be plausible
- Explanations should be educational and concise
- Cover different topics from the material`,
      },
      {
        role: "user",
        content: `Course material:\n\n${trimmedContent}`,
      },
    ],
  });

  const text = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(text) as { questions?: StudyQuestion[] };
  return parsed.questions ?? [];
}
