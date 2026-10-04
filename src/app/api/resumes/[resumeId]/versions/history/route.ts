import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    resumeId: string;
  }>;
};

export async function GET(
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

  const versions = await prisma.resumeVersion.findMany({
    where: {
      resumeId: id,
      resume: {
        userId: Number(session.user.id),
        deletedAt: null,
      },
    },
    select: {
      id: true,
      versionNumber: true,
      createdBy: true,
      changeSummary: true,
      createdAt: true,
    },
    orderBy: {
      versionNumber: "desc",
    },
  });

  return NextResponse.json(versions);
}