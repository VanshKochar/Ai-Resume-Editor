import type { ResumeContent } from "@/types/resume";
import type { JobMatchResult } from "@/types/ai";

function extractResumeText(content: ResumeContent): string {
  return [
    content.basics.name,
    content.basics.email,
    content.basics.phone,
    content.basics.location,
    content.basics.linkedin,
    content.basics.github,
    content.summary,

    ...content.experience.flatMap((experience) => [
      experience.company,
      experience.role,
      experience.location,
      ...experience.bullets.map((bullet) => bullet.text),
    ]),

    ...content.projects.flatMap((project) => [
      project.name,
      project.description,
      ...project.technologies,
      ...project.bullets.map((bullet) => bullet.text),
    ]),

    ...content.education.flatMap((education) => [
      education.institution,
      education.degree,
    ]),

    ...content.skills.languages,
    ...content.skills.frameworks,
    ...content.skills.databases,
    ...content.skills.tools,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function extractKeywords(jobDescription: string): string[] {
  const stopWords = new Set([
    "the",
    "and",
    "for",
    "with",
    "you",
    "your",
    "are",
    "our",
    "this",
    "that",
    "from",
    "will",
    "have",
    "has",
    "about",
    "into",
    "their",
    "they",
    "who",
    "what",
    "when",
    "where",
    "how",
    "can",
    "should",
    "would",
    "could",
    "using",
    "used",
    "years",
    "year",
  ]);

  return Array.from(
    new Set(
      jobDescription
        .toLowerCase()
        .match(/[a-z][a-z0-9+#.-]{2,}/g)
        ?.filter(
          (keyword) => !stopWords.has(keyword)
        ) ?? []
    )
  );
}

export function matchResumeToJob(
  content: ResumeContent,
  jobDescription: string
): JobMatchResult {
  const resumeText = extractResumeText(content);
  const keywords = extractKeywords(jobDescription);

  const matchedKeywords = keywords.filter((keyword) =>
    resumeText.includes(keyword)
  );

  const missingKeywords = keywords.filter(
    (keyword) => !resumeText.includes(keyword)
  );

  const overallScore =
    keywords.length === 0
      ? 0
      : Math.round(
          (matchedKeywords.length / keywords.length) * 100
        );

  const recommendations = missingKeywords
    .slice(0, 10)
    .map(
      (keyword) =>
        `Consider mentioning "${keyword}" if you genuinely have relevant experience.`
    );

  return {
    overallScore,
    matchedKeywords,
    missingKeywords,
    recommendations,
  };
}