import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { createResumeVersion } from "@/services/resume/resume-version.service";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    resumeId: string;
    versionId: string;
  }>;
};

export async function POST(
  _request: Request,
  context: RouteContext
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { resumeId, versionId } = await context.params;

  const resumeIdNumber = Number(resumeId);
  const versionIdNumber = Number(versionId);

  if (
    !Number.isInteger(resumeIdNumber) ||
    !Number.isInteger(versionIdNumber)
  ) {
    return NextResponse.json(
      { error: "Invalid ID" },
      { status: 400 }
    );
  }

  const version = await prisma.resumeVersion.findFirst({
    where: {
      id: versionIdNumber,
      resumeId: resumeIdNumber,
      resume: {
        userId: Number(session.user.id),
        deletedAt: null,
      },
    },
  });

  if (!version) {
    return NextResponse.json(
      { error: "Version not found" },
      { status: 404 }
    );
  }

  const restoredVersion = await createResumeVersion(
    Number(session.user.id),
    resumeIdNumber,
    version.contentJson as any,
    `Restored version ${version.versionNumber}`
  );

  return NextResponse.json(restoredVersion);
}