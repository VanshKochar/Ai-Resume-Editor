import { auth } from "@/auth";
import { redirect } from "next/navigation";

import { getUserResumes } from "@/services/resume/resume.service";

import ResumeDashboard from "@/components/dashboard/ResumeDashboard";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const resumes = await getUserResumes(
    Number(session.user.id)
  );

  return (
    <ResumeDashboard
      user={{
        name: session.user.name,
        email: session.user.email,
      }}
      resumes={resumes}
    />
  );
}