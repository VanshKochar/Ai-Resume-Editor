import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import { matchResumeToJob } from "@/services/job-match/job-match.service";
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

    const result = matchResumeToJob(
      content,
      body.jobDescription
    );

    return Response.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Job match failed:", error);

    return Response.json(
      { error: "Failed to analyze job description" },
      { status: 500 }
    );
  }
}