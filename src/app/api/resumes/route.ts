import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  createResume,
  getUserResumes,
} from "@/services/resume/resume.service";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }

  const userId = Number(session.user.id);

  const resumes = await getUserResumes(userId);

  return NextResponse.json({
    success: true,
    resumes,
  });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Resume name is required",
        },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Resume name is too long",
        },
        { status: 400 }
      );
    }

    const userId = Number(session.user.id);

    const result = await createResume(userId, name);

    return NextResponse.json(
      {
        success: true,
        resume: result.resume,
        version: result.version,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create resume error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create resume",
      },
      { status: 500 }
    );
  }
}