"use client";
import type { AiResumeChange } from "@/types/ai";
import JobMatchBox from "./JobMatchBox";
import AiEditBox from "./AiEditBox";
import { useState } from "react";
import { useResumeHistory } from "@/hooks/use-resume-history";
import VersionHistory from "@/components/editor/VersionHistory";
import type {
  Education,
  Experience,
  Project,
  ResumeContent,
} from "@/types/resume";

type ResumeEditorProps = {
  resumeId: number;
  resumeName: string;
  initialContent: ResumeContent;
  initialVersionNumber: number;
};

const emptyExperience = (): Experience => ({
  id: crypto.randomUUID(),
  company: "",
  role: "",
  location: "",
  startDate: "",
  endDate: "",
  bullets: [
    {
      id: crypto.randomUUID(),
      text: "",
    },
  ],
});

const emptyProject = (): Project => ({
  id: crypto.randomUUID(),
  name: "",
  description: "",
  technologies: [],
  bullets: [
    {
      id: crypto.randomUUID(),
      text: "",
    },
  ],
});

const emptyEducation = (): Education => ({
  id: crypto.randomUUID(),
  institution: "",
  degree: "",
  startDate: "",
  endDate: "",
});

export default function ResumeEditor({
  resumeId,
  resumeName,
  initialContent,
  initialVersionNumber,
}: ResumeEditorProps) {
 const {
  value: content,
  update: updateContent,
  reset: resetContent,
  undo,
  redo,
  canUndo,
  canRedo,
} = useResumeHistory<ResumeContent>(
  initialContent
);

function setContent(
  updater:
    | ResumeContent
    | ((current: ResumeContent) => ResumeContent)
) {
  if (typeof updater === "function") {
    updateContent(updater(content));
  } else {
    updateContent(updater);
  }
}

  const [versionNumber, setVersionNumber] =
    useState(initialVersionNumber);
const [selectedText, setSelectedText] =
  useState("");

const [selectedTargetId, setSelectedTargetId] =
  useState<string | null>(null);

const [selectedSection, setSelectedSection] =
  useState<string | null>(null);

const [selectedContent, setSelectedContent] =
  useState("");

const [aiButtonPosition, setAiButtonPosition] =
  useState<{
    top: number;
    left: number;
  } | null>(null);

const [showAiEdit, setShowAiEdit] =
  useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  async function reloadLatestVersion() {
  const response = await fetch(
    `/api/resumes/${resumeId}/versions`
  );

  const data = await response.json();

  if (!response.ok) {
    return;
  }

  resetContent(
  data.contentJson as ResumeContent
);

  setVersionNumber(data.versionNumber);

resetContent(data.contentJson as ResumeContent);

  setMessage(
    `Restored as version ${data.versionNumber}.`
  );
}

  function updateBasics(
    field: keyof ResumeContent["basics"],
    value: string
  ) {
    setContent((current) => ({
      ...current,
      basics: {
        ...current.basics,
        [field]: value,
      },
    }));
  }

  function updateExperience(
    experienceId: string,
    field: keyof Experience,
    value: string
  ) {
    setContent((current) => ({
      ...current,
      experience: current.experience.map((experience) =>
        experience.id === experienceId
          ? {
              ...experience,
              [field]: value,
            }
          : experience
      ),
    }));
  }

  function updateExperienceBullet(
  experienceId: string,
  bulletId: string,
  value: string
) {
  const nextContent = {
    ...content,
    experience: content.experience.map((experience) =>
      experience.id === experienceId
        ? {
            ...experience,
            bullets: experience.bullets.map((bullet) =>
              bullet.id === bulletId
                ? {
                    ...bullet,
                    text: value,
                  }
                : bullet
            ),
          }
        : experience
    ),
  };

  updateContent(nextContent);
}
  function addExperience() {
    setContent((current) => ({
      ...current,
      experience: [
        ...current.experience,
        emptyExperience(),
      ],
    }));
  }

  function removeExperience(id: string) {
    setContent((current) => ({
      ...current,
      experience: current.experience.filter(
        (experience) => experience.id !== id
      ),
    }));
  }

  function addExperienceBullet(experienceId: string) {
    setContent((current) => ({
      ...current,
      experience: current.experience.map((experience) =>
        experience.id === experienceId
          ? {
              ...experience,
              bullets: [
                ...experience.bullets,
                {
                  id: crypto.randomUUID(),
                  text: "",
                },
              ],
            }
          : experience
      ),
    }));
  }

  function removeExperienceBullet(
    experienceId: string,
    bulletId: string
  ) {
    setContent((current) => ({
      ...current,
      experience: current.experience.map((experience) =>
        experience.id === experienceId
          ? {
              ...experience,
              bullets: experience.bullets.filter(
                (bullet) => bullet.id !== bulletId
              ),
            }
          : experience
      ),
    }));
  }

  function updateProject(
    projectId: string,
    field: keyof Project,
    value: string
  ) {
    setContent((current) => ({
      ...current,
      projects: current.projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              [field]: value,
            }
          : project
      ),
    }));
  }

  function updateProjectTechnologies(
    projectId: string,
    value: string
  ) {
    setContent((current) => ({
      ...current,
      projects: current.projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              technologies: value
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            }
          : project
      ),
    }));
  }

  function updateProjectBullet(
    projectId: string,
    bulletId: string,
    value: string
  ) {
    setContent((current) => ({
      ...current,
      projects: current.projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              bullets: project.bullets.map((bullet) =>
                bullet.id === bulletId
                  ? {
                      ...bullet,
                      text: value,
                    }
                  : bullet
              ),
            }
          : project
      ),
    }));
  }

  function addProject() {
    setContent((current) => ({
      ...current,
      projects: [
        ...current.projects,
        emptyProject(),
      ],
    }));
  }

  function removeProject(id: string) {
    setContent((current) => ({
      ...current,
      projects: current.projects.filter(
        (project) => project.id !== id
      ),
    }));
  }

  function addProjectBullet(projectId: string) {
    setContent((current) => ({
      ...current,
      projects: current.projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              bullets: [
                ...project.bullets,
                {
                  id: crypto.randomUUID(),
                  text: "",
                },
              ],
            }
          : project
      ),
    }));
  }

  function removeProjectBullet(
    projectId: string,
    bulletId: string
  ) {
    setContent((current) => ({
      ...current,
      projects: current.projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              bullets: project.bullets.filter(
                (bullet) => bullet.id !== bulletId
              ),
            }
          : project
      ),
    }));
  }

  function updateEducation(
    educationId: string,
    field: keyof Education,
    value: string
  ) {
    setContent((current) => ({
      ...current,
      education: current.education.map((education) =>
        education.id === educationId
          ? {
              ...education,
              [field]: value,
            }
          : education
      ),
    }));
  }

  function addEducation() {
    setContent((current) => ({
      ...current,
      education: [
        ...current.education,
        emptyEducation(),
      ],
    }));
  }

  function removeEducation(id: string) {
    setContent((current) => ({
      ...current,
      education: current.education.filter(
        (education) => education.id !== id
      ),
    }));
  }

  async function saveResume() {
    try {
      setSaving(true);
      setMessage("");

      const response = await fetch(
        `/api/resumes/${resumeId}/versions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content,
            changeSummary: "Edited resume content",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Failed to save resume"
        );
      }

      setVersionNumber(data.versionNumber);
      setMessage(
        `Saved successfully as version ${data.versionNumber}.`
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleTextSelection(
  event: React.SyntheticEvent<HTMLTextAreaElement | HTMLInputElement>,
  section: string,
  targetId: string
) {
  const element = event.currentTarget;

  const start = element.selectionStart;
  const end = element.selectionEnd;

  if (
    start === null ||
    end === null ||
    start === end
  ) {
    setSelectedText("");
    setSelectedTargetId(null);
    setSelectedSection(null);
    setSelectedContent("");
    setAiButtonPosition(null);
    setShowAiEdit(false);
    return;
  }

  const selected = element.value.slice(
    start,
    end
  );

  if (!selected.trim()) {
    setSelectedText("");
    setSelectedTargetId(null);
    setSelectedSection(null);
    setSelectedContent("");
    setAiButtonPosition(null);
    setShowAiEdit(false);
    return;
  }

  const rect =
    element.getBoundingClientRect();

  setSelectedText(selected);
  setSelectedTargetId(targetId);
  setSelectedSection(section);
  setSelectedContent(element.value);

  setAiButtonPosition({
    top: Math.max(10, rect.top - 50),
    left: rect.left,
  });

  setShowAiEdit(false);
}

function applyAiChanges(
  changes: AiResumeChange[]
) {
  for (const change of changes) {
    if (change.section === "basics") {
      const field =
        change.targetId.replace(
          "basics-",
          ""
        ) as keyof ResumeContent["basics"];

      updateBasics(
        field,
        change.newContent
      );
    }

    if (change.section === "summary") {
      setContent((current) => ({
        ...current,
        summary: change.newContent,
      }));
    }

    if (change.section === "experience") {
      const experience =
        content.experience.find(
          (item) =>
            change.targetId ===
              `${item.id}:company` ||
            change.targetId ===
              `${item.id}:role` ||
            change.targetId ===
              `${item.id}:location` ||
            change.targetId ===
              `${item.id}:startDate` ||
            change.targetId ===
              `${item.id}:endDate` ||
            item.bullets.some(
              (bullet) =>
                bullet.id ===
                change.targetId
            )
        );

      if (!experience) continue;

      if (
        change.targetId ===
        `${experience.id}:company`
      ) {
        updateExperience(
          experience.id,
          "company",
          change.newContent
        );
      }

      if (
        change.targetId ===
        `${experience.id}:role`
      ) {
        updateExperience(
          experience.id,
          "role",
          change.newContent
        );
      }

      if (
        change.targetId ===
        `${experience.id}:location`
      ) {
        updateExperience(
          experience.id,
          "location",
          change.newContent
        );
      }

      if (
        change.targetId ===
        `${experience.id}:startDate`
      ) {
        updateExperience(
          experience.id,
          "startDate",
          change.newContent
        );
      }

      if (
        change.targetId ===
        `${experience.id}:endDate`
      ) {
        updateExperience(
          experience.id,
          "endDate",
          change.newContent
        );
      }

      const bullet =
        experience.bullets.find(
          (item) =>
            item.id === change.targetId
        );

      if (bullet) {
        updateExperienceBullet(
          experience.id,
          bullet.id,
          change.newContent
        );
      }
    }

    if (change.section === "projects") {
      const project =
        content.projects.find(
          (item) =>
            change.targetId ===
              `${item.id}:name` ||
            change.targetId ===
              `${item.id}:description` ||
            change.targetId ===
              `${item.id}:technologies` ||
            item.bullets.some(
              (bullet) =>
                bullet.id ===
                change.targetId
            )
        );

      if (!project) continue;

      if (
        change.targetId ===
        `${project.id}:name`
      ) {
        updateProject(
          project.id,
          "name",
          change.newContent
        );
      }

      if (
        change.targetId ===
        `${project.id}:description`
      ) {
        updateProject(
          project.id,
          "description",
          change.newContent
        );
      }

      if (
        change.targetId ===
        `${project.id}:technologies`
      ) {
        updateProjectTechnologies(
          project.id,
          change.newContent
        );
      }

      const bullet =
        project.bullets.find(
          (item) =>
            item.id === change.targetId
        );

      if (bullet) {
        updateProjectBullet(
          project.id,
          bullet.id,
          change.newContent
        );
      }
    }

    if (change.section === "education") {
      const education =
        content.education.find(
          (item) =>
            change.targetId.startsWith(
              `${item.id}:`
            )
        );

      if (!education) continue;

      const field =
        change.targetId.split(
          ":"
        )[1] as keyof Education;

      updateEducation(
        education.id,
        field,
        change.newContent
      );
    }

    if (change.section === "skills") {
      const field =
        change.targetId.replace(
          "skills-",
          ""
        ) as keyof ResumeContent["skills"];

      setContent((current) => ({
        ...current,
        skills: {
          ...current.skills,
          [field]: change.newContent
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        },
      }));
    }
  }
}

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      {selectedText &&
  selectedTargetId &&
  selectedSection &&
  aiButtonPosition && (
    <>
      {!showAiEdit && (
        <button
          type="button"
          className="no-print fixed z-[9999] rounded-full bg-black px-4 py-2 text-sm font-medium text-white shadow-xl transition hover:scale-105"
          style={{
            top: aiButtonPosition.top,
            left: aiButtonPosition.left,
          }}
          onMouseDown={(event) => {
            event.preventDefault();
          }}
          onClick={() => {
            setShowAiEdit(true);
          }}
        >
          ✨ AI Edit
        </button>
      )}

      {showAiEdit && (
        <div
          className="no-print fixed z-[9999]"
          style={{
            top: aiButtonPosition.top,
            left: aiButtonPosition.left,
          }}
        >
          <AiEditBox
            resumeId={resumeId}
            section={selectedSection}
            targetId={selectedTargetId}
            currentContent={selectedContent}
            selectedText={selectedText}
            onAccept={(
              newContent,
              changeScope
            ) => {
              if (!selectedTargetId || !selectedSection) {
                return;
              }

              let finalContent =
                newContent;

              if (
                changeScope ===
                "selection"
              ) {
                finalContent =
                  selectedContent.replace(
                    selectedText,
                    newContent
                  );
              }

              if (
                selectedSection ===
                "experience"
              ) {
                const experience =
                  content.experience.find(
                    (experience) =>
                      experience.bullets.some(
                        (bullet) => bullet.id === selectedTargetId
                      ) ||
                      selectedTargetId.startsWith(`${experience.id}:`)
                  );

                if (experience) {
                  const bullet =
                    experience.bullets.find(
                      (bullet) =>
                        bullet.id ===
                        selectedTargetId
                    );

                  if (bullet) {
                    updateExperienceBullet(
                      experience.id,
                      bullet.id,
                      finalContent
                    );
                  } else {
                    const field = selectedTargetId
                      .slice(experience.id.length + 1) as
                      | "company"
                      | "role"
                      | "location"
                      | "startDate"
                      | "endDate";

                    updateExperience(
                      experience.id,
                      field,
                      finalContent
                    );
                  }
                }
              }

              if (
                selectedSection ===
                "projects"
              ) {
                const project =
                  content.projects.find(
                    (project) =>
                      project.bullets.some(
                        (bullet) =>
                          bullet.id ===
                          selectedTargetId
                      ) ||
                      selectedTargetId.startsWith(
                        `${project.id}:`
                      )
                  );

                if (project) {
                  if (
                    selectedTargetId ===
                    `${project.id}:name`
                  ) {
                    updateProject(
                      project.id,
                      "name",
                      finalContent
                    );
                  }

                  if (
                    selectedTargetId ===
                    `${project.id}:description`
                  ) {
                    updateProject(
                      project.id,
                      "description",
                      finalContent
                    );
                  }

                  if (
                    selectedTargetId ===
                    `${project.id}:technologies`
                  ) {
                    updateProjectTechnologies(
                      project.id,
                      finalContent
                    );
                  }

                  const bullet =
                    project.bullets.find(
                      (bullet) =>
                        bullet.id ===
                        selectedTargetId
                    );

                  if (bullet) {
                    updateProjectBullet(
                      project.id,
                      bullet.id,
                      finalContent
                    );
                  }
                }
              }

              if (
                selectedSection ===
                "basics"
              ) {
                const field =
                  selectedTargetId.replace(
                    "basics-",
                    ""
                  ) as keyof ResumeContent["basics"];

                updateBasics(
                  field,
                  finalContent
                );
              }

              if (
                selectedSection ===
                "summary"
              ) {
                setContent((current) => ({
                  ...current,
                  summary: finalContent,
                }));
              }

              if (
                selectedSection ===
                "education"
              ) {
                const education =
                  content.education.find(
                    (education) =>
                      selectedTargetId.startsWith(
                        `${education.id}:`
                      )
                  );

                if (education) {
                  const field =
                    selectedTargetId.split(
                      ":"
                    )[1] as keyof Education;

                  updateEducation(
                    education.id,
                    field,
                    finalContent
                  );
                }
              }

              if (
                selectedSection ===
                "skills"
              ) {
                const field =
                  selectedTargetId.replace(
                    "skills-",
                    ""
                  ) as keyof ResumeContent["skills"];

                setContent((current) => ({
                  ...current,
                  skills: {
                    ...current.skills,
                    [field]:
                      finalContent
                        .split(",")
                        .map(
                          (item) =>
                            item.trim()
                        )
                        .filter(Boolean),
                  },
                }));
              }

              setSelectedText("");
              setSelectedTargetId(null);
              setSelectedSection(null);
              setSelectedContent("");
              setAiButtonPosition(null);
              setShowAiEdit(false);
            }}
            onClose={() => {
              setShowAiEdit(false);
            }}
          />
        </div>
      )}
    </>
  )}
    <div className="mx-auto max-w-7xl">
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <div>
            <p className="text-sm text-gray-500">
              Resume Editor
            </p>

            <h1 className="text-3xl font-bold">
              {resumeName}
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Version {versionNumber}
            </p>
          </div>

          <div className="no-print flex items-center gap-2">
  <button
    onClick={undo}
    disabled={!canUndo}
    className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
  >
    Undo
  </button>

  <button
    onClick={redo}
    disabled={!canRedo}
    className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
  >
    Redo
  </button>

  <button
    onClick={saveResume}
    disabled={saving}
    className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
  >
    {saving ? "Saving..." : "Save Resume"}
  </button>

  <button
    type="button"
    onClick={() => window.print()}
    className="rounded-lg border px-4 py-2 text-sm"
  >
    Export PDF
  </button>

</div>
        </div>

        {message && (
          <div className="no-print mb-6 rounded-lg border bg-white p-4 text-sm">
            {message}
          </div>
        )}

        <section className="mb-8 rounded-xl border bg-white p-6">
          <h2 className="mb-5 text-xl font-semibold">
            Basic Information
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            {(
              [
                ["name", "Name"],
                ["email", "Email"],
                ["phone", "Phone"],
                ["location", "Location"],
                ["linkedin", "LinkedIn"],
                ["github", "GitHub"],
              ] as const
            ).map(([field, label]) => (
              <div key={field}>
                <label className="mb-1 block text-sm font-medium">
                  {label}
                </label>

                <input
                  value={content.basics[field]}
                  onChange={(event) =>
                    updateBasics(
                      field,
                      event.target.value
                    )
                  }
                  onMouseUp={(event) =>
                    handleTextSelection(
                      event,
                      "basics",
                      `basics-${field}`
                    )
                  }
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8 rounded-xl border bg-white p-6">
          <h2 className="mb-5 text-xl font-semibold">
            Professional Summary
          </h2>

          <textarea
            value={content.summary}
            onChange={(event) =>
              setContent((current) => ({
                ...current,
                summary: event.target.value,
              }))
            }
            onMouseUp={(event) =>
              handleTextSelection(
                event,
                "summary",
                "summary"
              )
            }
            rows={6}
            className="w-full rounded-lg border px-3 py-2"
            placeholder="Write a concise professional summary..."
          />
        </section>
        <div className="no-print">
          <JobMatchBox
            resumeId={resumeId}
            onApplyChanges={applyAiChanges}
          />
        </div>

        <section className="mb-8 rounded-xl border bg-white p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Experience
            </h2>

            <button
              onClick={addExperience}
              className="no-print rounded-lg border px-3 py-2 text-sm"
            >
              + Add Experience
            </button>
          </div>

          <div className="space-y-6">
            
            {content.experience.map((experience, index) => (
              <div
                key={experience.id}
                className="rounded-lg border p-5"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-medium">
                    Experience {index + 1}
                  </h3>

                  <button
                    onClick={() =>
                      removeExperience(experience.id)
                    }
                    className="no-print text-sm text-red-600"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {(
                    [
                      ["company", "Company"],
                      ["role", "Role"],
                      ["location", "Location"],
                      ["startDate", "Start Date"],
                      ["endDate", "End Date"],
                    ] as const
                  ).map(([field, label]) => (
                    <div key={field}>
                      <label className="mb-1 block text-sm font-medium">
                        {label}
                      </label>

                      <input
                        value={experience[field]}
                        onChange={(event) =>
                          updateExperience(
                            experience.id,
                            field,
                            event.target.value
                          )
                        }
                        onMouseUp={(event) =>
                          handleTextSelection(
                            event,
                            "experience",
                            `${experience.id}:${field}`
                          )
                        }
                        className="w-full rounded-lg border px-3 py-2"
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium">
                      Responsibilities / Achievements
                    </label>

                    <button
                      onClick={() =>
                        addExperienceBullet(
                          experience.id
                        )
                      }
                      className="no-print text-sm"
                    >
                      + Add Bullet
                    </button>
                  </div>

                  <div className="space-y-3">
                    {experience.bullets.map((bullet) => (
                      <div
                        key={bullet.id}
                        className="flex flex-col gap-2"
                      >
                        <div className="flex gap-2">
                          <textarea
  value={bullet.text}
  onChange={(event) =>
    updateExperienceBullet(
      experience.id,
      bullet.id,
      event.target.value
    )
  }
 onMouseUp={(event) =>
  handleTextSelection(
    event,
    "experience",
    bullet.id
  )
}
 rows={3}
  className="flex-1 rounded-lg border px-3 py-2"
  placeholder="Describe your achievement..."
/>
                          <button
                            onClick={() =>
                              removeExperienceBullet(
                                experience.id,
                                bullet.id
                              )
                            }
                            className="no-print text-sm text-red-600"
                          >
                            Remove
                          </button>
                        </div>

                       
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8 rounded-xl border bg-white p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Projects
            </h2>

            <button
              onClick={addProject}
              className="no-print rounded-lg border px-3 py-2 text-sm"
            >
              + Add Project
            </button>
          </div>

          <div className="space-y-6">
            {content.projects.map((project, index) => (
              <div
                key={project.id}
                className="rounded-lg border p-5"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-medium">
                    Project {index + 1}
                  </h3>

                  <button
                    onClick={() =>
                      removeProject(project.id)
                    }
                    className="no-print text-sm text-red-600"
                  >
                    Remove
                  </button>
                </div>

                <div className="space-y-4">
                  <input
                    value={project.name}
                    onChange={(event) =>
                      updateProject(
                        project.id,
                        "name",
                        event.target.value
                      )
                    }
                    onMouseUp={(event) =>
                      handleTextSelection(
                        event,
                        "projects",
                        `${project.id}:name`
                      )
                    }
                    className="w-full rounded-lg border px-3 py-2"
                    placeholder="Project name"
                  />

                  <textarea
                    value={project.description}
                    onChange={(event) =>
                      updateProject(
                        project.id,
                        "description",
                        event.target.value
                      )
                    }
                    onMouseUp={(event) =>
                      handleTextSelection(
                        event,
                        "projects",
                        `${project.id}:description`
                      )
                    }
                    rows={3}
                    className="w-full rounded-lg border px-3 py-2"
                    placeholder="Project description"
                  />

                  <input
                    value={project.technologies.join(", ")}
                    onChange={(event) =>
                      updateProjectTechnologies(
                        project.id,
                        event.target.value
                      )
                    }
                    onMouseUp={(event) =>
                      handleTextSelection(
                        event,
                        "projects",
                        `${project.id}:technologies`
                      )
                    }
                    className="w-full rounded-lg border px-3 py-2"
                    placeholder="Technologies: React, Node.js, MySQL"
                  />

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-sm font-medium">
                        Project Bullets
                      </label>

                      <button
                        onClick={() =>
                          addProjectBullet(project.id)
                        }
                        className="no-print text-sm"
                      >
                        + Add Bullet
                      </button>
                    </div>

                    <div className="space-y-3">
                      {project.bullets.map((bullet) => (
                        <div
                          key={bullet.id}
                          className="flex gap-2"
                        >
                          <textarea
                            value={bullet.text}
                            onChange={(event) =>
                              updateProjectBullet(
                                project.id,
                                bullet.id,
                                event.target.value
                              )
                            }
                            onMouseUp={(event) =>
                              handleTextSelection(
                                event,
                                "projects",
                                bullet.id
                              )
                            }
                            rows={3}
                            className="flex-1 rounded-lg border px-3 py-2"
                          />

                          <button
                            onClick={() =>
                              removeProjectBullet(
                                project.id,
                                bullet.id
                              )
                            }
                            className="no-print text-sm text-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8 rounded-xl border bg-white p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Education
            </h2>

            <button
              onClick={addEducation}
              className="no-print rounded-lg border px-3 py-2 text-sm"
            >
              + Add Education
            </button>
          </div>

          <div className="space-y-6">
            {content.education.map((education, index) => (
              <div
                key={education.id}
                className="rounded-lg border p-5"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-medium">
                    Education {index + 1}
                  </h3>

                  <button
                    onClick={() =>
                      removeEducation(education.id)
                    }
                    className="no-print text-sm text-red-600"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {(
                    [
                      ["institution", "Institution"],
                      ["degree", "Degree"],
                      ["startDate", "Start Date"],
                      ["endDate", "End Date"],
                    ] as const
                  ).map(([field, label]) => (
                    <div key={field}>
                      <label className="mb-1 block text-sm font-medium">
                        {label}
                      </label>

                      <input
                        value={education[field]}
                        onChange={(event) =>
                          updateEducation(
                            education.id,
                            field,
                            event.target.value
                          )
                        }
                        onMouseUp={(event) =>
                          handleTextSelection(
                            event,
                            "education",
                            `${education.id}:${field}`
                          )
                        }
                        className="w-full rounded-lg border px-3 py-2"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8 rounded-xl border bg-white p-6">
          <h2 className="mb-5 text-xl font-semibold">
            Skills
          </h2>

          <div className="space-y-4">
            {(
              [
                ["languages", "Programming Languages"],
                ["frameworks", "Frameworks"],
                ["databases", "Databases"],
                ["tools", "Tools"],
              ] as const
            ).map(([field, label]) => (
              <div key={field}>
                <label className="mb-1 block text-sm font-medium">
                  {label}
                </label>

                <input
                  value={content.skills[field].join(", ")}
                  onChange={(event) =>
                    setContent((current) => ({
                      ...current,
                      skills: {
                        ...current.skills,
                        [field]: event.target.value
                          .split(",")
                          .map((item) => item.trim())
                          .filter(Boolean),
                      },
                    }))
                  }
                  onMouseUp={(event) =>
                    handleTextSelection(
                      event,
                      "skills",
                      `skills-${field}`
                    )
                  }
                  className="w-full rounded-lg border px-3 py-2"
                  placeholder="React, TypeScript, MySQL"
                />
              </div>
            ))}
          </div>
        </section>

        <div className="no-print flex justify-end pb-12">
          <button
            onClick={saveResume}
            disabled={saving}
            className="rounded-lg bg-black px-6 py-3 font-medium text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Resume"}
          </button>
        </div>

        <div className="no-print lg:sticky lg:top-6 lg:self-start">
          <VersionHistory
            resumeId={resumeId}
            currentVersionNumber={versionNumber}
            onRestore={reloadLatestVersion}
          />
        </div>
      </div>
    </div>
  </main>
);
}