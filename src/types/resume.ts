export interface ResumeBasics {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
}

export interface ResumeBullet {
  id: string;
  text: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: ResumeBullet[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  bullets: ResumeBullet[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
}

export interface ResumeSkills {
  languages: string[];
  frameworks: string[];
  databases: string[];
  tools: string[];
}

export interface ResumeContent {
  basics: ResumeBasics;
  summary: string;
  experience: Experience[];
  projects: Project[];
  education: Education[];
  skills: ResumeSkills;
}