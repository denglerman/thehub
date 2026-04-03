export type Subcat =
  | "candidate"
  | "person"
  | "company"
  | "conference"
  | "event"
  | "competition"
  | "paper"
  | "tool"
  | "resource"
  | "other";

export interface UserProfile {
  id: string;
  user_id: string;
  hub_name: string;
  onboarded: boolean;
  plan: string;
  created_at: string;
}

export interface Pillar {
  id: string;
  user_id: string;
  name: string;
  color: string;
  position: number;
  created_at: string;
}

export interface HubItem {
  id: string;
  user_id: string;
  pillar_id: string;
  subcat: Subcat;
  title: string;
  subtitle: string | null;
  url: string | null;
  raw_input: string;
  ai_notes: string | null;
  created_at: string;
}

export interface ClassifyResponse {
  pillar_name: string;
  subcat: Subcat;
  title: string;
  subtitle: string;
  url: string;
  ai_notes: string;
}

export const PILLAR_COLORS = ["#00d4aa", "#6366f1", "#f59e0b", "#f43f5e"] as const;

export const SUBCAT_STYLES: Record<
  Subcat,
  { bg: string; text: string; border: string }
> = {
  candidate: { bg: "#0d2b1f", text: "#00d4aa", border: "#1a4a35" },
  person: { bg: "#0d1f2b", text: "#38bdf8", border: "#1a3a4a" },
  company: { bg: "#1a1040", text: "#818cf8", border: "#2d1f6e" },
  conference: { bg: "#1f1a10", text: "#fbbf24", border: "#3d3010" },
  event: { bg: "#2b1020", text: "#f472b6", border: "#4a1f35" },
  competition: { bg: "#2b0d0d", text: "#f87171", border: "#4a1a1a" },
  paper: { bg: "#1a1500", text: "#d97706", border: "#332800" },
  tool: { bg: "#0d1f10", text: "#4ade80", border: "#1a3520" },
  resource: { bg: "#14141a", text: "#94a3b8", border: "#2a2a38" },
  other: { bg: "#14141a", text: "#4a5068", border: "#1e2030" },
};
