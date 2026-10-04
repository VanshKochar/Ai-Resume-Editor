import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

import type {
  AiEditRequest,
  AiEditSuggestion,
} from "@/types/ai";

import { buildAiEditPrompt } from "./ai-edit-prompt";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not configured");
}

const gemini = new GoogleGenAI({
  apiKey,
});

const aiEditSuggestionSchema = z.object({
  targetId: z.string(),
  originalContent: z.string(),
  selectedText: z.string(),
  changeScope: z.enum(["selection", "bullet"]),
  newContent: z.string(),
  reason: z.string(),
});

export async function generateGeminiText(prompt: string) {
  const response = await gemini.models.generateContent({
    model: "gemini-3.8-flash",
    contents: prompt,
  });

  return response.text ?? "";
}

export async function generateResumeEditSuggestion(
  request: AiEditRequest
): Promise<AiEditSuggestion> {
  const prompt = buildAiEditPrompt(request);

  const response = await gemini.models.generateContent({
    model: "gemini-3.8-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  const text = response.text;

  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(text);
  } catch {
    throw new Error("Gemini returned invalid JSON");
  }

  const parsed =
    aiEditSuggestionSchema.safeParse(parsedJson);

  if (!parsed.success) {
    throw new Error(
      "Gemini returned an invalid AI edit suggestion"
    );
  }

  if (parsed.data.targetId !== request.targetId) {
    throw new Error("Gemini returned the wrong target ID");
  }

  if (
    parsed.data.originalContent !==
    request.currentContent
  ) {
    throw new Error(
      "Gemini changed the original content"
    );
  }

  if (
    parsed.data.selectedText !==
    request.selectedText
  ) {
    throw new Error(
      "Gemini changed the selected text"
    );
  }

  if (parsed.data.changeScope === "selection") {
    if (!request.currentContent.includes(request.selectedText)) {
      throw new Error(
        "Selected text was not found in original content"
      );
    }
  }

  return parsed.data;
}