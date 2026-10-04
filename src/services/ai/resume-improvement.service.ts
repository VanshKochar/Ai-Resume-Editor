import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

import type {
  AiResumeImprovement,
} from "@/types/ai";

import type { ResumeContent } from "@/types/resume";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not configured");
}

const gemini = new GoogleGenAI({
  apiKey,
});

const schema = z.object({
  changes: z.array(
    z.object({
      section: z.string(),
      targetId: z.string(),
      originalContent: z.string(),
      newContent: z.string(),
      reason: z.string(),
    })
  ),
});

export async function generateResumeImprovements(
  resume: ResumeContent,
  jobDescription: string,
  questions: {
    id: string;
    question: string;
    reason: string;
    relatedKeywords: string[];
  }[],
  answers: Record<string, string>
): Promise<AiResumeImprovement> {
  const prompt = `
You are an AI resume editor.

Improve the user's resume for the provided job description.

IMPORTANT RULES:

1. Never invent experience, skills, technologies,
   achievements, metrics, employers, or responsibilities.
2. Only use information explicitly present in the
   existing resume or provided by the user's answers.
3. Do not remove genuine existing information unless
   necessary for a clear improvement.
4. Preserve factual accuracy.
5. Make targeted improvements rather than rewriting
   the entire resume unnecessarily.
6. Every targetId must refer to an existing resume field.
7. originalContent must exactly match the existing
   content of that field.
8. newContent must contain the complete replacement
   content for that field.
9. Return ONLY valid JSON.

RESUME:
${JSON.stringify(resume)}

JOB DESCRIPTION:
${jobDescription}

QUESTIONS:
${JSON.stringify(questions)}

USER ANSWERS:
${JSON.stringify(answers)}

Return exactly:

{
  "changes": [
    {
      "section": "experience",
      "targetId": "existing-target-id",
      "originalContent": "exact existing content",
      "newContent": "improved content",
      "reason": "why this change helps"
    }
  ]
}
`;

  const response =
    await gemini.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

  const text = response.text;

  if (!text) {
    throw new Error(
      "Gemini returned an empty response"
    );
  }

  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(text);
  } catch {
    throw new Error(
      "Gemini returned invalid JSON"
    );
  }

  const parsed = schema.safeParse(parsedJson);

  if (!parsed.success) {
    throw new Error(
      "Gemini returned invalid resume improvements"
    );
  }

  return parsed.data;
}