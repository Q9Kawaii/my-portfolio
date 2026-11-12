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
import type { Testimonial } from "./testimonials";
import { COLLECTIONS, SETTINGS_DOC, type SiteSettings } from "./types";

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

// ---- Testimonials (all through the server: Firestore rules deny client access) ----

async function testimonialFetch(method: "GET" | "PATCH" | "DELETE", body?: Record<string, unknown>) {
  const res = await fetch("/api/testimonials", {
    method,
    headers: { Authorization: `Bearer ${await idToken()}`, ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Request failed.");
  return json;
}

export const loadTestimonials = async (): Promise<Testimonial[]> => (await testimonialFetch("GET")).items;
export const updateTestimonial = (id: string, patch: Partial<Pick<Testimonial, "status" | "quote" | "role" | "company" | "project">>) =>
  testimonialFetch("PATCH", { id, ...patch });
export const deleteTestimonial = (id: string) => testimonialFetch("DELETE", { id });

export const newId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
