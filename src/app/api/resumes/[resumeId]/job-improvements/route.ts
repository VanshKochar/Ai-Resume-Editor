import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { findResumeTarget } from "@/services/ai/find-resume-target";

import { generateResumeImprovements } from "@/services/ai/resume-improvement.service";
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
    const body = await request.json();

    if (
      typeof body.jobDescription !== "string" ||
      !body.jobDescription.trim()
    ) {
      return Response.json(
        { error: "Job description is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.questions)) {
      return Response.json(
        { error: "Questions are required" },
        { status: 400 }
      );
    }

    if (
      !body.answers ||
      typeof body.answers !== "object"
    ) {
      return Response.json(
        { error: "Answers are required" },
        { status: 400 }
      );
    }

    const resume = await prisma.resume.findFirst({
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

    const content =
      latestVersion.contentJson as unknown as ResumeContent;

    const improvements =
      await generateResumeImprovements(
        content,
        body.jobDescription,
        body.questions,
        body.answers
      );

      for (const change of improvements.changes) {
  const actualContent = findResumeTarget(
    content,
    change.section,
    change.targetId
  );

  if (actualContent === null) {
    return Response.json(
      {
        error: `AI returned an invalid target: ${change.targetId}`,
      },
      { status: 400 }
    );
  }

  if (actualContent !== change.originalContent) {
    return Response.json(
      {
        error:
          `AI returned incorrect original content ` +
          `for target: ${change.targetId}`,
      },
      { status: 400 }
    );
  }
}

    return Response.json({
      success: true,
      improvements,
    });
  } catch (error) {
    console.error(
      "AI resume improvement failed:",
      error
    );

    return Response.json(
  {
    error:
      error instanceof Error
        ? error.message
        : String(error),
  },
  { status: 500 }
);
  }
}