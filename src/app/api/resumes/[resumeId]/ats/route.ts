import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { analyzeAndSaveResume } from "@/services/ats/ats-report.service";

type RouteContext = {
  params: Promise<{
    resumeId: string;
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

  const { resumeId } = await context.params;

  const id = Number(resumeId);

  if (!Number.isInteger(id)) {
    return NextResponse.json(
      { error: "Invalid resume ID" },
      { status: 400 }
    );
  }

  const latestVersion =
    await prisma.resumeVersion.findFirst({
      where: {
        resumeId: id,
        resume: {
          userId: Number(session.user.id),
          deletedAt: null,
        },
      },
      orderBy: {
        versionNumber: "desc",
      },
    });

  if (!latestVersion) {
    return NextResponse.json(
      { error: "Resume version not found" },
      { status: 404 }
    );
  }

  const result =
    await analyzeAndSaveResume(
      Number(session.user.id),
      id,
      latestVersion.id
    );

  return NextResponse.json(result);
}