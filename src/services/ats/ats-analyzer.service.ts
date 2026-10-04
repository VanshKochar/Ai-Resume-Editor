import type { ResumeContent } from "@/types/resume";

type AtsIssue = {
  type: "content" | "keyword" | "formatting" | "structure";
  message: string;
};

type AtsSuggestion = {
  category: string;
  message: string;
};

export type AtsAnalysisResult = {
  overallScore: number;
  contentScore: number;
  keywordScore: number;
  formattingScore: number;
  structureScore: number;
  missingKeywords: string[];
  issues: AtsIssue[];
  suggestions: AtsSuggestion[];
};

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s+#.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getAllResumeText(content: ResumeContent) {
  const parts: string[] = [];

  parts.push(content.basics.name);
  parts.push(content.basics.email);
  parts.push(content.basics.phone);
  parts.push(content.basics.location);
  parts.push(content.basics.linkedin);
  parts.push(content.basics.github);
  parts.push(content.summary);

  for (const experience of content.experience) {
    parts.push(experience.company);
    parts.push(experience.role);
    parts.push(experience.location);

    for (const bullet of experience.bullets) {
      parts.push(bullet.text);
    }
  }

  for (const project of content.projects) {
    parts.push(project.name);
    parts.push(project.description);
    parts.push(...project.technologies);

    for (const bullet of project.bullets) {
      parts.push(bullet.text);
    }
  }

  for (const education of content.education) {
    parts.push(education.institution);
    parts.push(education.degree);
  }

  parts.push(...content.skills.languages);
  parts.push(...content.skills.frameworks);
  parts.push(...content.skills.databases);
  parts.push(...content.skills.tools);

  return normalizeText(parts.join(" "));
}

function calculateContentScore(
  content: ResumeContent
) {
  let score = 0;

  if (content.basics.name.trim()) {
    score += 10;
  }

  if (content.basics.email.trim()) {
    score += 10;
  }

  if (content.basics.phone.trim()) {
    score += 10;
  }

  if (content.summary.trim().length >= 50) {
    score += 15;
  }

  if (content.experience.length > 0) {
    score += 20;
  }

  if (content.projects.length > 0) {
    score += 10;
  }

  if (content.education.length > 0) {
    score += 10;
  }

  const totalSkills =
    content.skills.languages.length +
    content.skills.frameworks.length +
    content.skills.databases.length +
    content.skills.tools.length;

  if (totalSkills >= 5) {
    score += 15;
  }

  return Math.min(score, 100);
}

function calculateStructureScore(
  content: ResumeContent
) {
  let score = 0;

  if (content.basics.name.trim()) {
    score += 20;
  }

  if (content.summary.trim()) {
    score += 15;
  }

  if (content.experience.length > 0) {
    score += 25;
  }

  if (content.projects.length > 0) {
    score += 15;
  }

  if (content.education.length > 0) {
    score += 15;
  }

  const totalSkills =
    content.skills.languages.length +
    content.skills.frameworks.length +
    content.skills.databases.length +
    content.skills.tools.length;

  if (totalSkills > 0) {
    score += 10;
  }

  return Math.min(score, 100);
}

function calculateFormattingScore(
  content: ResumeContent
) {
  let score = 100;

  if (!content.basics.email.includes("@")) {
    score -= 15;
  }

  if (
    content.basics.linkedin &&
    !content.basics.linkedin.startsWith("http")
  ) {
    score -= 10;
  }

  if (
    content.basics.github &&
    !content.basics.github.startsWith("http")
  ) {
    score -= 10;
  }

  const allBullets = [
    ...content.experience.flatMap(
      (experience) => experience.bullets
    ),
    ...content.projects.flatMap(
      (project) => project.bullets
    ),
  ];

  for (const bullet of allBullets) {
    if (bullet.text.length > 500) {
      score -= 5;
    }

    if (bullet.text.trim().length < 20) {
      score -= 5;
    }
  }

  return Math.max(score, 0);
}

function calculateKeywordScore(
  content: ResumeContent
) {
  const totalSkills =
    content.skills.languages.length +
    content.skills.frameworks.length +
    content.skills.databases.length +
    content.skills.tools.length;

  const normalizedResume = getAllResumeText(content);

  const commonTechnicalKeywords = [
    "javascript",
    "typescript",
    "react",
    "next.js",
    "node.js",
    "python",
    "java",
    "sql",
    "mysql",
    "postgresql",
    "mongodb",
    "git",
    "docker",
    "aws",
    "api",
    "rest",
  ];

  const foundKeywords = commonTechnicalKeywords.filter(
    (keyword) =>
      normalizedResume.includes(
        normalizeText(keyword)
      )
  );

  const skillScore = Math.min(
    totalSkills * 5,
    50
  );

  const keywordScore = Math.min(
    foundKeywords.length * 3,
    50
  );

  return Math.min(
    skillScore + keywordScore,
    100
  );
}

function collectIssues(
  content: ResumeContent
): AtsIssue[] {
  const issues: AtsIssue[] = [];

  if (content.summary.trim().length < 50) {
    issues.push({
      type: "content",
      message:
        "Your professional summary is too short.",
    });
  }

  if (content.experience.length === 0) {
    issues.push({
      type: "structure",
      message:
        "No work experience has been added.",
    });
  }

  if (content.projects.length === 0) {
    issues.push({
      type: "content",
      message:
        "No projects have been added.",
    });
  }

  if (!content.basics.linkedin.trim()) {
    issues.push({
      type: "formatting",
      message:
        "LinkedIn profile is missing.",
    });
  }

  if (!content.basics.github.trim()) {
    issues.push({
      type: "formatting",
      message:
        "GitHub profile is missing.",
    });
  }

  const allBullets = [
    ...content.experience.flatMap(
      (experience) => experience.bullets
    ),
    ...content.projects.flatMap(
      (project) => project.bullets
    ),
  ];

  const weakBullets = allBullets.filter(
    (bullet) =>
      bullet.text.trim().length < 40
  );

  if (weakBullets.length > 0) {
    issues.push({
      type: "content",
      message: `${weakBullets.length} bullet point(s) may be too short or lacking detail.`,
    });
  }

  return issues;
}

function collectSuggestions(
  content: ResumeContent
): AtsSuggestion[] {
  const suggestions: AtsSuggestion[] = [];

  if (content.summary.trim().length < 100) {
    suggestions.push({
      category: "Summary",
      message:
        "Aim for a concise summary that clearly describes your role, experience, and strongest skills.",
    });
  }

  if (content.experience.length > 0) {
    suggestions.push({
      category: "Experience",
      message:
        "Use measurable outcomes in experience bullets where possible.",
    });
  }

  if (content.projects.length > 0) {
    suggestions.push({
      category: "Projects",
      message:
        "Mention the technologies used and explain the impact of each project.",
    });
  }

  if (
    content.skills.languages.length +
      content.skills.frameworks.length +
      content.skills.databases.length +
      content.skills.tools.length <
    5
  ) {
    suggestions.push({
      category: "Skills",
      message:
        "Add relevant technical skills that accurately represent your experience.",
    });
  }

  return suggestions;
}

export function analyzeResume(
  content: ResumeContent
): AtsAnalysisResult {
  const contentScore =
    calculateContentScore(content);

  const keywordScore =
    calculateKeywordScore(content);

  const formattingScore =
    calculateFormattingScore(content);

  const structureScore =
    calculateStructureScore(content);

  const overallScore = Math.round(
    contentScore * 0.3 +
      keywordScore * 0.25 +
      formattingScore * 0.2 +
      structureScore * 0.25
  );

  const issues = collectIssues(content);

  const suggestions =
    collectSuggestions(content);

  return {
    overallScore,
    contentScore,
    keywordScore,
    formattingScore,
    structureScore,
    missingKeywords: [],
    issues,
    suggestions,
  };
}