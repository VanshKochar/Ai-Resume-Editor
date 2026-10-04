export interface AiEditRequest {
  section: string;
  targetId: string;
  currentContent: string;
  selectedText: string;
  instruction: string;
}

export interface AiEditSuggestion {
  targetId: string;
  originalContent: string;
  selectedText: string;
  changeScope: "selection" | "bullet";
  newContent: string;
  reason: string;
}

export interface JobMatchResult {
  overallScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  recommendations: string[];
}

export interface JobAnalysisQuestion {
  id: string;
  question: string;
  reason: string;
  relatedKeywords: string[];
}

export interface AiJobAnalysis {
  matchedKeywords: string[];
  missingKeywords: string[];
  questions: JobAnalysisQuestion[];
}


export interface AiResumeChange {
  section: string;
  targetId: string;
  originalContent: string;
  newContent: string;
  reason: string;
}

export interface AiResumeImprovement {
  changes: AiResumeChange[];
}