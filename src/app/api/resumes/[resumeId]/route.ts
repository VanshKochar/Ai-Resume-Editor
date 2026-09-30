import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  getResumeById,
  renameResume,
  archiveResume,
  deleteResume,
} from "@/services/resume/resume.service";

type RouteContext = {
  params: Promise<{
    resumeID: string;
  }>;
};

export async function GET(
  request: Request,
  context: RouteContext
) {
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

  const { resumeID } = await context.params;

  const id = Number(resumeID);

  if (!Number.isInteger(id)) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid resume ID",
      },
      { status: 400 }
    );
  }

  const resume = await getResumeById(
    Number(session.user.id),
    id
  );

  if (!resume) {
    return NextResponse.json(
      {
        success: false,
        message: "Resume not found",
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    resume,
  });
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
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

  const { resumeID } = await context.params;

  const id = Number(resumeID);

  if (!Number.isInteger(id)) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid resume ID",
      },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();

    const action = body.action;

    const userId = Number(session.user.id);

    if (action === "rename") {
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

      const result = await renameResume(
        userId,
        id,
        name
      );

      if (result.count === 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Resume not found",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Resume renamed",
      });
    }

    if (action === "archive") {
      const result = await archiveResume(
        userId,
        id
      );

      if (result.count === 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Resume not found",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Resume archived",
      });
    }

    if (action === "delete") {
      const result = await deleteResume(
        userId,
        id
      );

      if (result.count === 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Resume not found",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Resume deleted",
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Invalid action",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Resume update error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update resume",
      },
      { status: 500 }
    );
  }
}