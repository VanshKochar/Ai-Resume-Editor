import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import { generateResumeEditSuggestion } from "@/services/ai/gemini.service";
import { findResumeTarget } from "@/services/ai/find-resume-target";

import type { AiEditRequest } from "@/types/ai";
import type { ResumeContent } from "@/types/resume";

export async function POST(
  request: Request,
  context: {
    params: Promise<{
      resumeId: string;
    }>;
  }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { resumeId } = await context.params;

  const parsedResumeId = Number(resumeId);
  const userId = Number(session.user.id);

  if (
    !Number.isInteger(parsedResumeId) ||
    !Number.isInteger(userId)
  ) {
    return Response.json(
      { error: "Invalid ID" },
      { status: 400 }
    );
  }

  try {
    const body =
      (await request.json()) as AiEditRequest;

    if (
      !body.section ||
      !body.targetId ||
      !body.currentContent ||
      !body.selectedText ||
      !body.instruction
    ) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const resume =
      await prisma.resume.findFirst({
        where: {
          id: parsedResumeId,
          userId,
          deletedAt: null,
        },
        include: {
          versions: {
            orderBy: {
              versionNumber: "desc",
            },
            take: 1,
          },
        },
      });

    if (!resume) {
      return Response.json(
        { error: "Resume not found" },
        { status: 404 }
      );
    }

    const latestVersion = resume.versions[0];

    if (!latestVersion) {
      return Response.json(
        { error: "Resume has no version" },
        { status: 400 }
      );
    }

    const resumeContent =
      latestVersion.contentJson as unknown as ResumeContent;

    const actualTargetContent =
      findResumeTarget(
        resumeContent,
        body.section,
        body.targetId
      );

    if (actualTargetContent === null) {
      return Response.json(
        { error: "Target not found in resume" },
        { status: 400 }
      );
    }

    if (
      !body.currentContent.includes(
        body.selectedText
      )
    ) {
      return Response.json(
        {
          error:
            "Selected text was not found in the target content",
        },
        { status: 400 }
      );
    }

    const suggestion =
      await generateResumeEditSuggestion(body);

    return Response.json({
      success: true,
      suggestion,
    });
  } catch (error) {
    console.error(
      "AI resume edit failed:",
      error
    );

    return Response.json(
      {
        error:
          "Failed to generate AI suggestion",
      },
      { status: 500 }
    );
  }
}