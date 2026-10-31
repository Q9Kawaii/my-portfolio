// Shared content model for the public site and the admin dashboard.
// Firestore layout:
//   portfolio/settings          -> SiteSettings
//   portfolioProjects/{id}      -> Project
//   portfolioSkills/{id}        -> SkillGroup
//   portfolioExperience/{id}    -> Experience
//   portfolioEducation/{id}     -> Education
//   portfolioAwards/{id}        -> Award
//   portfolioGraphLinks/{id}    -> GraphLink

export type SocialLinks = {
  github: string;
  linkedin: string;
  instagram: string;
  x: string;
  leetcode: string;
};

export type Stat = { value: string; label: string };
export type FocusArea = { title: string; description: string };

export type SiteSettings = {
  name: string;
  role: string;
  headline: string;
  availability: string;
  location: string;
  bio: string; // paragraphs separated by blank lines
  avatar: string;
  email: string;
  phone: string;
  showPhone: boolean;
  cvUrl: string;
  socials: SocialLinks;
  stats: Stat[];
  focusAreas: FocusArea[];
  /** Set once the admin imports the built-in defaults; after that Firestore is the only source. */
  seeded?: boolean;
};

type Ordered = { id: string; order: number };

export type Project = Ordered & {
  title: string;
  summary: string;
  description: string;
  tech: string[];
  image: string;
  imageAlt: string;
  /** True when the image is a generated illustration rather than a real screenshot. */
  imageIsPlaceholder: boolean;
  repoUrl: string;
  liveUrl: string;
  isPrivate: boolean;
  featured: boolean;
  hidden: boolean;
  context: string; // e.g. "Internship · Maz Software Solutions"
  year?: string;
};

export type GraphGroup = "Skills" | "Tools";

export type SkillGroup = Ordered & {
  name: string;
  items: string[];
  /** Which knowledge-graph group this category's items belong to. */
  graphGroup?: GraphGroup;
};

export type Experience = Ordered & {
  role: string;
  org: string;
  period: string;
  location: string;
  bullets: string[];
  link: string;
};

export type Education = Ordered & {
  degree: string;
  institution: string;
  period: string;
  details: string;
  /** Skill/tool names this links to in the knowledge graph. */
  tags?: string[];
};

export type Award = Ordered & {
  title: string;
  issuer: string;
  date: string;
  description: string;
  image: string;
  imageAlt: string;
  imageIsPlaceholder: boolean;
  link: string;
  kind?: "award" | "certification";
  /** Skill/tool names this links to in the knowledge graph. */
  tags?: string[];
};

/** A manual knowledge-graph connection between two node ids (e.g. "project:taskmesh"). */
export type GraphLink = Ordered & { source: string; target: string; label: string };

export type PortfolioContent = {
  settings: SiteSettings;
  projects: Project[];
  skills: SkillGroup[];
  experience: Experience[];
  education: Education[];
  awards: Award[];
  graphLinks: GraphLink[];
};

export const COLLECTIONS = {
  projects: "portfolioProjects",
  skills: "portfolioSkills",
  experience: "portfolioExperience",
  education: "portfolioEducation",
  awards: "portfolioAwards",
  graphLinks: "portfolioGraphLinks",
} as const;

export const SETTINGS_DOC = { collection: "portfolio", id: "settings" } as const;
