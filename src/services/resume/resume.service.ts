import { prisma } from "@/lib/prisma";

export async function getUserResumes(userId: number) {
  return prisma.resume.findMany({
    where: {
      userId,
      deletedAt: null,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}

export async function getResumeById(
  userId: number,
  resumeId: number
) {
  return prisma.resume.findFirst({
    where: {
      id: resumeId,
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
}

export async function createResume(
  userId: number,
  name: string
) {
  return prisma.$transaction(async (tx) => {
    const resume = await tx.resume.create({
      data: {
        userId,
        name,
      },
    });

    const version = await tx.resumeVersion.create({
      data: {
        resumeId: resume.id,
        versionNumber: 1,
        createdBy: "USER",
        changeSummary: "Initial resume version",

        contentJson: {
          basics: {
            name: "",
            email: "",
            phone: "",
            location: "",
            linkedin: "",
            github: "",
          },

          summary: "",

          experience: [],

          projects: [],

          education: [],

          skills: {
            languages: [],
            frameworks: [],
            databases: [],
            tools: [],
          },
        },
      },
    });

    return {
      resume,
      version,
    };
  });
}

export async function renameResume(
  userId: number,
  resumeId: number,
  name: string
) {
  return prisma.resume.updateMany({
    where: {
      id: resumeId,
      userId,
      deletedAt: null,
    },
    data: {
      name,
    },
  });
}

export async function archiveResume(
  userId: number,
  resumeId: number
) {
  return prisma.resume.updateMany({
    where: {
      id: resumeId,
      userId,
      deletedAt: null,
    },
    data: {
      status: "ARCHIVED",
    },
  });
}

export async function deleteResume(
  userId: number,
  resumeId: number
) {
  return prisma.resume.updateMany({
    where: {
      id: resumeId,
      userId,
      deletedAt: null,
    },
    data: {
      status: "DELETED",
      deletedAt: new Date(),
    },
  });
}