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
- Cover different topics from the material
- IMPORTANT: Only use English text and standard ASCII characters. For math, use plain notation like x^2, sqrt(x), a*b, det(A), R^n, etc. Never use Chinese, Japanese, or other non-Latin characters.`,
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

export type ExamQuestion = {
  type: "multiple-choice" | "short-answer" | "true-false" | "essay";
  question: string;
  options?: string[];
  answer: string;
  points: number;
};

export type MockExam = {
  title: string;
  instructions: string;
  totalPoints: number;
  sections: {
    name: string;
    questions: ExamQuestion[];
  }[];
};

export async function generateMockExam(
  content: string,
): Promise<MockExam> {
  const trimmedContent = content.slice(0, 20000);

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.5,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a college professor creating a comprehensive mock final exam.
Based on ALL the provided course material, create a realistic final exam with mixed question types organized into sections.

Return valid JSON in this exact format:
{
  "title": "Introduction to Psychology - Final Exam",
  "instructions": "Read each question carefully. Show all work where applicable. You have 2 hours to complete this exam.",
  "totalPoints": 100,
  "sections": [
    {
      "name": "Section I: Multiple Choice",
      "questions": [
        {
          "type": "multiple-choice",
          "question": "Which of the following best describes...?",
          "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
          "answer": "B) ...",
          "points": 2
        }
      ]
    },
    {
      "name": "Section II: True or False",
      "questions": [
        {
          "type": "true-false",
          "question": "Statement here.",
          "answer": "False. Explanation...",
          "points": 2
        }
      ]
    },
    {
      "name": "Section III: Short Answer",
      "questions": [
        {
          "type": "short-answer",
          "question": "Explain the concept of...",
          "answer": "The expected answer is...",
          "points": 5
        }
      ]
    },
    {
      "name": "Section IV: Essay",
      "questions": [
        {
          "type": "essay",
          "question": "Discuss in detail...",
          "answer": "A strong response would include...",
          "points": 15
        }
      ]
    }
  ]
}

Rules:
- Create a realistic exam worth exactly 100 points total
- Include 4 sections: Multiple Choice (10 questions, 2 pts each = 20 pts), True/False (5 questions, 2 pts each = 10 pts), Short Answer (6 questions, 5 pts each = 30 pts), Essay (2 questions, 20 pts each = 40 pts)
- Cover ALL major topics proportionally across the sections
- Multiple choice and true/false should test recall and comprehension
- Short answer should require explanation and application
- Essay questions should require deep analysis and synthesis across topics
- The "answer" field is for the answer key — make it thorough
- IMPORTANT: Only use English text and standard ASCII characters. For math, use plain notation like x^2, sqrt(x), a*b, etc.
- IMPORTANT: The "title" must be specific to the subject matter. Identify the course or topic from the material and use it (e.g. "Organic Chemistry - Final Exam", "HIST 101: World History - Final Exam"). Never use a generic title like just "Final Exam".`,
      },
      {
        role: "user",
        content: `Course material for the final exam:\n\n${trimmedContent}`,
      },
    ],
  });

  const text = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(text) as MockExam;
  return parsed;
}
