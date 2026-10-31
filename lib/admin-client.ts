"use client";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { defaultContent } from "./defaults";
import { COLLECTIONS, SETTINGS_DOC, type PortfolioContent, type SiteSettings } from "./types";

export type CollectionKey = keyof typeof COLLECTIONS;
type Item = { id: string; order: number } & Record<string, unknown>;

async function idToken() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in.");
  return user.getIdToken();
}

/** Asks the server to rebuild the public page so saved changes go live. */
export async function publish() {
  const res = await fetch("/api/revalidate", {
    method: "POST",
    headers: { Authorization: `Bearer ${await idToken()}` },
  });
  if (!res.ok) throw new Error("Saved, but the live site could not be refreshed.");
}

export async function uploadFile(file: File, folder: "projects" | "awards" | "profile" | "cv") {
  const body = new FormData();
  body.set("file", file);
  body.set("folder", folder);
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${await idToken()}` },
    body,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Upload failed.");
  return json.url as string;
}

/** Deletes a file previously uploaded to Vercel Blob. Local /public paths are ignored. */
export async function deleteUploaded(url: string) {
  if (!url.includes(".public.blob.vercel-storage.com")) return;
  await fetch("/api/upload", {
    method: "DELETE",
    headers: { Authorization: `Bearer ${await idToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
}

const settingsRef = () => doc(db, SETTINGS_DOC.collection, SETTINGS_DOC.id);
// Admin-only doc (see firestore.rules) that holds the phone number while it is hidden,
// because portfolio/settings is publicly readable.
const privateRef = () => doc(db, "portfolioPrivate", "contact");

export async function loadSettings(): Promise<SiteSettings | null> {
  const [pub, priv] = await Promise.all([getDoc(settingsRef()), getDoc(privateRef())]);
  if (!pub.exists()) return null;
  const s = pub.data() as SiteSettings;
  return { ...s, phone: s.phone || ((priv.data()?.phone as string) ?? "") };
}

export async function saveSettings(settings: SiteSettings) {
  const batch = writeBatch(db);
  batch.set(privateRef(), { phone: settings.phone });
  batch.set(settingsRef(), { ...settings, phone: settings.showPhone ? settings.phone : "", seeded: true });
  await batch.commit();
}

export async function loadItems<T extends Item>(key: CollectionKey): Promise<T[]> {
  const snap = await getDocs(collection(db, COLLECTIONS[key]));
  return snap.docs
    .map((d) => ({ ...(d.data() as T), id: d.id }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function saveItem(key: CollectionKey, item: Item) {
  const { id, ...data } = item;
  await setDoc(doc(db, COLLECTIONS[key], id), data);
}

export async function deleteItem(key: CollectionKey, id: string) {
  await deleteDoc(doc(db, COLLECTIONS[key], id));
}

/** Writes new order values for a reordered list in one batch. */
export async function saveOrder(key: CollectionKey, items: Item[]) {
  const batch = writeBatch(db);
  items.forEach((it, i) => batch.update(doc(db, COLLECTIONS[key], it.id), { order: i + 1 }));
  await batch.commit();
}

/** Copies the built-in content into Firestore. Existing items with the same id are overwritten. */
export async function importDefaults() {
  const batch = writeBatch(db);
  for (const key of Object.keys(COLLECTIONS) as CollectionKey[]) {
    for (const { id, ...data } of defaultContent[key] as Item[]) {
      batch.set(doc(db, COLLECTIONS[key], id), data);
    }
  }
  const s = defaultContent.settings;
  batch.set(privateRef(), { phone: s.phone });
  batch.set(settingsRef(), { ...s, phone: s.showPhone ? s.phone : "", seeded: true });
  await batch.commit();
}

/** Everything the public site renders, as the admin currently sees it in Firestore. */
export async function loadAll(): Promise<PortfolioContent | null> {
  const settings = await loadSettings();
  if (!settings) return null;
  const [projects, skills, experience, education, awards, graphLinks] = await Promise.all([
    loadItems("projects"),
    loadItems("skills"),
    loadItems("experience"),
    loadItems("education"),
    loadItems("awards"),
    loadItems("graphLinks"),
  ]);
  return { settings, projects, skills, experience, education, awards, graphLinks } as unknown as PortfolioContent;
}

// Fields added for the knowledge graph after the first import.
const GRAPH_FIELDS: Partial<Record<CollectionKey, string[]>> = {
  projects: ["year"],
  skills: ["graphGroup"],
  education: ["tags"],
  awards: ["kind", "tags"],
};

/**
 * Brings an older import up to date for the knowledge graph: adds the default
 * connections that don't exist yet, and fills graph fields (year, tags, kind,
 * graphGroup) only where an item with the same id doesn't have them. Never
 * overwrites anything you've edited.
 */
export async function importGraphDefaults() {
  const batch = writeBatch(db);
  let writes = 0;
  const existingLinks = new Set((await loadItems("graphLinks")).map((l) => l.id));
  for (const { id, ...data } of defaultContent.graphLinks) {
    if (existingLinks.has(id)) continue;
    batch.set(doc(db, COLLECTIONS.graphLinks, id), data);
    writes++;
  }
  for (const [key, fields] of Object.entries(GRAPH_FIELDS) as [CollectionKey, string[]][]) {
    const current = new Map((await loadItems(key)).map((it) => [it.id, it]));
    for (const def of defaultContent[key] as Item[]) {
      const cur = current.get(def.id);
      if (!cur) continue;
      const patch = Object.fromEntries(fields.filter((f) => cur[f] === undefined && def[f] !== undefined).map((f) => [f, def[f]]));
      if (Object.keys(patch).length) {
        batch.update(doc(db, COLLECTIONS[key], def.id), patch);
        writes++;
      }
    }
  }
  if (writes) await batch.commit();
  return writes;
}

// ---- Contact messages (read directly: rules allow only the admin; writes go through the server) ----

export type Message = {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: Date | null;
};

export async function loadMessages(): Promise<Message[]> {
  const snap = await getDocs(query(collection(db, "messages"), orderBy("createdAt", "desc"), limit(200)));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      name: String(data.name ?? ""),
      email: String(data.email ?? ""),
      message: String(data.message ?? ""),
      read: !!data.read,
      createdAt: data.createdAt?.toDate?.() ?? null,
    };
  });
}

async function messageAction(method: "PATCH" | "DELETE", body: Record<string, unknown>) {
  const res = await fetch("/api/messages", {
    method,
    headers: { Authorization: `Bearer ${await idToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Request failed.");
}

export const setMessageRead = (id: string, read: boolean) => messageAction("PATCH", { id, read });
export const deleteMessage = (id: string) => messageAction("DELETE", { id });

export const newId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
