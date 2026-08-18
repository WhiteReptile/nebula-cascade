export type CategoryId = "business_idea" | "landing_page" | "pitch_pdf";

export interface CategoryFramework {
  id: CategoryId;
  label: string;
  scoreContext: string;
  dimensions: { name: string; weight: number }[];
  analystPrompt: string;
  opinionPrompt: string;
}

export interface AnalystOutput {
  observations: string[];
  contradictions: string[];
  comparableReferences: string[];
}

export interface SteelmanOutput {
  caseFor: string[];
  caseAgainst: string[];
}

export interface Verdict {
  id: string;
  category: CategoryId;
  categoryLabel: string;
  scoreContext: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  originality: string;
  execution: string;
  appeal: string;
  competition: string;
  potential: string;
  biggestProblem: string;
  biggestOpportunity: string;
  verdict: string;
  confidence: number;
  analyst: AnalystOutput;
  steelman: SteelmanOutput;
  submissionPreview: string;
  createdAt: string;
  revisionOf?: string;
}

export interface HistoryEntry {
  id: string;
  score: number;
  categoryLabel: string;
  scoreContext: string;
  verdictPreview: string;
  createdAt: string;
}
