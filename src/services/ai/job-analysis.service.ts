import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

import type {
  AiJobAnalysis,
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
  matchedKeywords: z.array(z.string()),
  missingKeywords: z.array(z.string()),
  questions: z.array(
    z.object({
      id: z.string(),
      question: z.string(),
      reason: z.string(),
      relatedKeywords: z.array(z.string()),
    })
  ),
});

function resumeToText(
  content: ResumeContent
): string {
  return JSON.stringify(content);
}

export async function analyzeJobWithGemini(
  resume: ResumeContent,
  jobDescription: string
): Promise<AiJobAnalysis> {
  const prompt = `
You are an AI resume assistant.

Analyze the user's resume against the job description.

Rules:
1. Never invent experience or skills.
2. Identify skills/requirements already supported by the resume.
3. Identify important requirements missing from the resume.
4. For missing information, ask the user questions that could reveal genuine experience.
5. Do not assume the user has the experience.
6. Questions should be specific and useful.
7. Only ask questions that could meaningfully improve the resume.
8. Return ONLY valid JSON.

Resume:
${resumeToText(resume)}

Job Description:
${jobDescription}

Return exactly:

{
  "matchedKeywords": [],
  "missingKeywords": [],
  "questions": [
    {
      "id": "q1",
      "question": "Have you used Docker in any project or work?",
      "reason": "Docker is required by the job description.",
      "relatedKeywords": ["docker"]
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
      "Gemini returned invalid job analysis"
    );
  }

  return parsed.data;
}