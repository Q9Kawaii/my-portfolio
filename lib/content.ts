import "server-only";
import { defaultContent } from "./defaults";
import { firebaseConfig } from "./firebase-config";
import {
  COLLECTIONS,
  SETTINGS_DOC,
  type PortfolioContent,
  type SiteSettings,
} from "./types";

const BASE = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`;

type FsValue = {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  nullValue?: null;
  timestampValue?: string;
  arrayValue?: { values?: FsValue[] };
  mapValue?: { fields?: Record<string, FsValue> };
};

function decode(v: FsValue): unknown {
  if (v.stringValue !== undefined) return v.stringValue;
  if (v.integerValue !== undefined) return Number(v.integerValue);
  if (v.doubleValue !== undefined) return v.doubleValue;
  if (v.booleanValue !== undefined) return v.booleanValue;
  if (v.timestampValue !== undefined) return v.timestampValue;
  if (v.arrayValue) return (v.arrayValue.values ?? []).map(decode);
  if (v.mapValue) return decodeFields(v.mapValue.fields ?? {});
  return null;
}

function decodeFields(fields: Record<string, FsValue>) {
  return Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, decode(v)]));
}

async function fsGet(path: string) {
  const res = await fetch(`${BASE}/${path}`, { next: { tags: ["content"] } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Firestore ${path}: ${res.status}`);
  return res.json();
}

async function readCollection<T>(name: string): Promise<T[]> {
  const json = await fsGet(`${name}?pageSize=300`);
  const docs: { name: string; fields?: Record<string, FsValue> }[] = json?.documents ?? [];
  return docs
    .map((d) => ({ ...decodeFields(d.fields ?? {}), id: d.name.split("/").pop()! }) as T)
    .sort((a, b) => ((a as { order?: number }).order ?? 0) - ((b as { order?: number }).order ?? 0));
}

/**
 * Loads all portfolio content. Until the admin has imported the defaults
 * (settings.seeded), the built-in content is used. Any fetch failure also
 * falls back to the defaults so the site always renders.
 */
export async function getContent(): Promise<PortfolioContent> {
  try {
    const settingsDoc = await fsGet(`${SETTINGS_DOC.collection}/${SETTINGS_DOC.id}`);
    if (!settingsDoc?.fields) return defaultContent;
    const stored = decodeFields(settingsDoc.fields) as Partial<SiteSettings>;
    if (!stored.seeded) return defaultContent;

    const settings: SiteSettings = {
      ...defaultContent.settings,
      ...stored,
      socials: { ...defaultContent.settings.socials, ...(stored.socials ?? {}) },
    };
    const [projects, skills, experience, education, awards, graphLinks] = await Promise.all([
      readCollection<PortfolioContent["projects"][number]>(COLLECTIONS.projects),
      readCollection<PortfolioContent["skills"][number]>(COLLECTIONS.skills),
      readCollection<PortfolioContent["experience"][number]>(COLLECTIONS.experience),
      readCollection<PortfolioContent["education"][number]>(COLLECTIONS.education),
      readCollection<PortfolioContent["awards"][number]>(COLLECTIONS.awards),
      readCollection<PortfolioContent["graphLinks"][number]>(COLLECTIONS.graphLinks),
    ]);
    return { settings, projects, skills, experience, education, awards, graphLinks };
  } catch (err) {
    console.error("[content] falling back to defaults:", err);
    return defaultContent;
  }
}
