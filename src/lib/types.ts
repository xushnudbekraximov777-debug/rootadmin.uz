export type Profile = {
  id: string;
  name: string;
  title: string;
  bio: string;
  location: string;
  status: string;
  phone: string;
  email: string;
  telegram: string;
  cv_url: string;
  github_url: string;
  linkedin_url: string;
  updated_at: string;
};

export type Experience = {
  id: string;
  company: string;
  role: string;
  start_date: string;
  end_date: string;
  current: boolean;
  description: string;
  sort_order: number;
  created_at: string;
};

export type Education = {
  id: string;
  institution: string;
  degree: string;
  field: string;
  start_year: string;
  end_year: string;
  description: string;
  sort_order: number;
  created_at: string;
};

export type Certification = {
  id: string;
  name: string;
  issuer: string;
  year: string;
  credential_url: string;
  sort_order: number;
  created_at: string;
};

export type Skill = {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  icon: string;
  sort_order: number;
  created_at: string;
};

export type Project = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  github_url: string;
  live_url: string;
  image_url: string;
  status: string;
  sort_order: number;
  created_at: string;
};

export type Message = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  created_at: string;
};

export type Settings = {
  id: string;
  accent_color: string;
  seo_title: string;
  seo_description: string;
  resume_url: string;
  maintenance_mode: boolean;
  open_for_freelance: boolean;
  matrix_enabled: boolean;
  matrix_brightness: number;
  ui_version: string;
  updated_at: string;
};

export type SecurityLog = {
  id: string;
  event: string;
  ip: string;
  user_agent: string;
  created_at: string;
};

export type BannedIp = {
  id: string;
  ip: string;
  reason: string;
  created_at: string;
};

export type CtfArticle = {
  id: string;
  title: string;
  slug: string;
  content: string;
  difficulty: string;
  category: string;
  tags: string[];
  created_at: string;
};

export const CTF_DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;
export const CTF_CATEGORIES = ["Web", "Pwn", "Crypto", "Forensics", "Reverse Engineering", "Misc"] as const;

export type CheatSheet = {
  id: string;
  title: string;
  category: string;
  description: string | null;
  content: string;
  tags: string[];
  is_private: boolean;
  created_at: string;
};

export type LabManual = {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  created_at: string;
};

export type Quiz = {
  id: string;
  title: string;
  category: string;
  description: string | null;
  created_at: string;
};

export type QuizQuestion = {
  id: string;
  quiz_id: string;
  text: string;
  position: number;
};

export type QuizOption = {
  id: string;
  question_id: string;
  text: string;
  is_correct: boolean;
  position: number;
};

export type QuizWithDetails = Quiz & {
  questions: (QuizQuestion & { options: QuizOption[] })[];
};

export const QUIZ_CATEGORIES = [
  "Linux",
  "Cisco",
  "AWS",
  "Security",
  "Networking",
  "Docker",
  "Databases",
  "Shell Scripting",
  "Misc",
] as const;

export const LAB_MANUAL_CATEGORIES = [
  "Linux",
  "Cisco",
  "AWS",
  "Security",
  "Networking",
  "Docker",
  "Databases",
  "Shell Scripting",
  "Misc",
] as const;

export const CHEATSHEET_CATEGORIES = [
  "Linux",
  "Networking",
  "Security",
  "Docker",
  "Kubernetes",
  "Databases",
  "Cloud",
  "Shell Scripting",
  "Monitoring",
  "Misc",
] as const;

export const SKILL_CATEGORIES = [
  "Routing & Switching",
  "Network Security",
  "Server Administration",
  "Tools",
] as const;

export const ACCENT_COLORS: Record<string, { rgb: string; hex: string; label: string }> = {
  cyan: { rgb: "34 211 238", hex: "#22d3ee", label: "Cyan" },
  green: { rgb: "34 255 136", hex: "#22ff88", label: "Matrix Green" },
  amber: { rgb: "251 191 36", hex: "#fbbf24", label: "Amber" },
  purple: { rgb: "168 85 247", hex: "#a855f7", label: "Purple" },
};
