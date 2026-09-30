"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Resume = {
  id: number;
  name: string;
  description: string | null;
  status: string;
  updatedAt: Date;
};

type Props = {
  user: {
    name?: string | null;
    email?: string | null;
  };

  resumes: Resume[];
};

export default function ResumeDashboard({
  user,
  resumes: initialResumes,
}: Props) {
  const router = useRouter();

  const [resumes, setResumes] =
    useState(initialResumes);

  const [creating, setCreating] =
    useState(false);

  async function handleCreateResume() {
    const name = window.prompt(
      "Enter resume name"
    );

    if (!name?.trim()) {
      return;
    }

    setCreating(true);

    try {
      const response = await fetch("/api/resumes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message ?? "Failed to create resume");
        return;
      }

      router.push(`/editor/${data.resume.id}`);
    } catch {
      alert("Something went wrong");
    } finally {
      setCreating(false);
    }
  }

  async function handleRename(resumeId: number) {
    const resume = resumes.find(
      (item) => item.id === resumeId
    );

    if (!resume) {
      return;
    }

    const name = window.prompt(
      "Enter new resume name",
      resume.name
    );

    if (!name?.trim()) {
      return;
    }

    const response = await fetch(
      `/api/resumes/${resumeId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "rename",
          name: name.trim(),
        }),
      }
    );

    if (!response.ok) {
      const data = await response.json();

      alert(
        data.message ?? "Failed to rename resume"
      );

      return;
    }

    setResumes((current) =>
      current.map((item) =>
        item.id === resumeId
          ? {
              ...item,
              name: name.trim(),
            }
          : item
      )
    );
  }

  async function handleDelete(resumeId: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this resume?"
    );

    if (!confirmed) {
      return;
    }

    const response = await fetch(
      `/api/resumes/${resumeId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "delete",
        }),
      }
    );

    if (!response.ok) {
      const data = await response.json();

      alert(
        data.message ?? "Failed to delete resume"
      );

      return;
    }

    setResumes((current) =>
      current.filter(
        (item) => item.id !== resumeId
      )
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold">
              AI Resume Editor
            </h1>

            <p className="text-sm text-gray-500">
              {user.name ?? user.email}
            </p>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">
              My Resumes
            </h2>

            <p className="mt-2 text-gray-600">
              Create and manage your resumes.
            </p>
          </div>

          <button
            onClick={handleCreateResume}
            disabled={creating}
            className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {creating
              ? "Creating..."
              : "+ New Resume"}
          </button>
        </div>

        {resumes.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-white p-12 text-center">
            <h3 className="text-lg font-semibold">
              No resumes yet
            </h3>

            <p className="mt-2 text-gray-500">
              Create your first resume to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="rounded-xl border bg-white p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold">
                  {resume.name}
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  {resume.description ||
                    "No description"}
                </p>

                <p className="mt-4 text-xs text-gray-400">
                  Updated{" "}
                  {new Date(
                    resume.updatedAt
                  ).toLocaleDateString("en-US", {
                    timeZone: "UTC",
                  })}
                </p>

                <div className="mt-6 flex gap-2">
                  <button
                    onClick={() =>
                      router.push(
                        `/editor/${resume.id}`
                      )
                    }
                    className="flex-1 rounded-lg bg-black px-3 py-2 text-sm text-white"
                  >
                    Open
                  </button>

                  <button
                    onClick={() =>
                      handleRename(resume.id)
                    }
                    className="rounded-lg border px-3 py-2 text-sm"
                  >
                    Rename
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(resume.id)
                    }
                    className="rounded-lg border px-3 py-2 text-sm text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}