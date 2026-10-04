import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { getResumeById } from "@/services/resume/resume.service";
import { getLatestResumeVersion } from "@/services/resume/resume-version.service";
import ResumeEditor from "@/components/editor/ResumeEditor";
import type { ResumeContent } from "@/types/resume";

type EditorPageProps = {
  params: Promise<{
    resumeId: string;
  }>;
};

export default async function EditorPage({
  params,
}: EditorPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { resumeId } = await params;
  const id = Number(resumeId);

  if (!Number.isInteger(id)) {
    notFound();
  }

  const userId = Number(session.user.id);

  const [resume, version] = await Promise.all([
    getResumeById(userId, id),
    getLatestResumeVersion(userId, id),
  ]);

  if (!resume || !version) {
    notFound();
  }

  const initialContent = version.contentJson as unknown as ResumeContent;

  return (
    <ResumeEditor
      resumeId={resume.id}
      resumeName={resume.name}
      initialContent={initialContent}
      initialVersionNumber={version.versionNumber}
    />
  );
}