import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { ResumeContent } from "@/types/resume";

export async function getLatestResumeVersion(
  userId: number,
  resumeId: number
) {
  return prisma.resumeVersion.findFirst({
    where: {
      resumeId,
      resume: {
        userId,
        deletedAt: null,
      },
    },
    orderBy: {
      versionNumber: "desc",
    },
  });
}

export async function createResumeVersion(
  userId: number,
  resumeId: number,
  content: ResumeContent,
  changeSummary = "Updated resume"
) {
  return prisma.$transaction(async (tx) => {
    const resume = await tx.resume.findFirst({
      where: {
        id: resumeId,
        userId,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (!resume) {
      throw new Error("Resume not found");
    }

    const latestVersion = await tx.resumeVersion.findFirst({
      where: {
        resumeId,
      },
      orderBy: {
        versionNumber: "desc",
      },
      select: {
        versionNumber: true,
      },
    });

    const nextVersionNumber =
      (latestVersion?.versionNumber ?? 0) + 1;

    return tx.resumeVersion.create({
      data: {
        resumeId,
        versionNumber: nextVersionNumber,
        contentJson: content as unknown as Prisma.InputJsonValue,
        createdBy: "USER",
        changeSummary,
      },
    });
  });
}