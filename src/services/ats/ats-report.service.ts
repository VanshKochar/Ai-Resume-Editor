import { prisma } from "@/lib/prisma";

import {
  analyzeResume,
} from "@/services/ats/ats-analyzer.service";
import type { ResumeContent } from "@/types/resume";

export async function analyzeAndSaveResume(
  userId: number,
  resumeId: number,
  versionId: number
) {
  const version =
    await prisma.resumeVersion.findFirst({
      where: {
        id: versionId,
        resumeId,
        resume: {
          userId,
          deletedAt: null,
        },
      },
    });

  if (!version) {
    throw new Error("Resume version not found");
  }

  const rawContent = version.contentJson;

  if (
    !rawContent ||
    typeof rawContent !== "object" ||
    Array.isArray(rawContent)
  ) {
    throw new Error("Resume content is missing or invalid");
  }

  const content =
    rawContent as unknown as ResumeContent;

  const analysis = analyzeResume(content);

  const report = await prisma.atsReport.create({
    data: {
      resumeId,
      versionId,

      overallScore: analysis.overallScore,
      contentScore: analysis.contentScore,
      keywordScore: analysis.keywordScore,
      formattingScore:
        analysis.formattingScore,
      structureScore:
        analysis.structureScore,

      missingKeywordsJson:
        analysis.missingKeywords,

      issuesJson: analysis.issues,

      suggestionsJson:
        analysis.suggestions,
    },
  });

  return {
    report,
    analysis,
  };
}