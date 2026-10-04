import type { ResumeContent } from "@/types/resume";

export function findResumeTarget(
  content: ResumeContent,
  section: string,
  targetId: string
): string | null {
  if (section === "basics") {
    if (targetId === "basics-name") {
      return content.basics.name;
    }

    if (targetId === "basics-email") {
      return content.basics.email;
    }

    if (targetId === "basics-phone") {
      return content.basics.phone;
    }

    if (targetId === "basics-location") {
      return content.basics.location;
    }

    if (targetId === "basics-linkedin") {
      return content.basics.linkedin;
    }

    if (targetId === "basics-github") {
      return content.basics.github;
    }
  }

  if (
    section === "summary" &&
    targetId === "summary"
  ) {
    return content.summary;
  }

  if (section === "experience") {
    for (const experience of content.experience) {
      if (targetId === `${experience.id}:company`) {
        return experience.company;
      }

      if (targetId === `${experience.id}:role`) {
        return experience.role;
      }

      if (targetId === `${experience.id}:location`) {
        return experience.location;
      }

      if (targetId === `${experience.id}:startDate`) {
        return experience.startDate;
      }

      if (targetId === `${experience.id}:endDate`) {
        return experience.endDate;
      }

      for (const bullet of experience.bullets) {
        if (bullet.id === targetId) {
          return bullet.text;
        }
      }
    }
  }

  if (section === "projects") {
    for (const project of content.projects) {
      if (targetId === `${project.id}:name`) {
        return project.name;
      }

      if (targetId === `${project.id}:description`) {
        return project.description;
      }

      if (targetId === `${project.id}:technologies`) {
        return project.technologies.join(", ");
      }

      for (const bullet of project.bullets) {
        if (bullet.id === targetId) {
          return bullet.text;
        }
      }
    }
  }

  if (section === "education") {
    for (const education of content.education) {
      if (targetId === `${education.id}:institution`) {
        return education.institution;
      }

      if (targetId === `${education.id}:degree`) {
        return education.degree;
      }

      if (targetId === `${education.id}:startDate`) {
        return education.startDate;
      }

      if (targetId === `${education.id}:endDate`) {
        return education.endDate;
      }
    }
  }

  if (section === "skills") {
    if (targetId === "skills-languages") {
      return content.skills.languages.join(", ");
    }

    if (targetId === "skills-frameworks") {
      return content.skills.frameworks.join(", ");
    }

    if (targetId === "skills-databases") {
      return content.skills.databases.join(", ");
    }

    if (targetId === "skills-tools") {
      return content.skills.tools.join(", ");
    }
  }

  return null;
}