import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  createResumeVersion,
  getLatestResumeVersion,
} from "@/services/resume/resume-version.service";
import type { ResumeContent } from "@/types/resume";

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

  const version = await getLatestResumeVersion(
    Number(session.user.id),
    id
  );

  if (!version) {
    return NextResponse.json(
      { error: "Resume version not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(version);
}

export async function POST(
  request: Request,
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

  const body = await request.json();

  if (!body?.content) {
    return NextResponse.json(
      { error: "Resume content is required" },
      { status: 400 }
    );
  }

  const version = await createResumeVersion(
    Number(session.user.id),
    id,
    body.content as ResumeContent,
    body.changeSummary ?? "Updated resume"
  );

  return NextResponse.json(version, { status: 201 });
}