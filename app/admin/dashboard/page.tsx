"use client";
import { signOut } from "firebase/auth";
import { Award, Briefcase, ExternalLink, FolderGit2, GraduationCap, Inbox, Loader2, LogOut, Network, UserRound, Wrench } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import CollectionEditor, { type Notify } from "@/components/admin/CollectionEditor";
import ConnectionsEditor from "@/components/admin/ConnectionsEditor";
import MessagesPanel from "@/components/admin/MessagesPanel";
import { AreaField, LinesField, MediaField, SelectField, TagsField, TextField, Toggle } from "@/components/admin/fields";
import SettingsEditor from "@/components/admin/SettingsEditor";
import { useAdmin } from "@/components/admin/useAdmin";
import ThemeToggle from "@/components/ThemeToggle";
import { importDefaults, loadSettings, publish } from "@/lib/admin-client";
import { auth } from "@/lib/firebase";
import { inferGraphGroup } from "@/lib/graph";
import type { Award as AwardT, Education, Experience, Project, SiteSettings, SkillGroup } from "@/lib/types";

const TABS = [
  { id: "messages", label: "Messages", Icon: Inbox },
  { id: "profile", label: "Profile & links", Icon: UserRound },
  { id: "projects", label: "Projects", Icon: FolderGit2 },
  { id: "skills", label: "Skills", Icon: Wrench },
  { id: "experience", label: "Experience", Icon: Briefcase },
  { id: "education", label: "Education", Icon: GraduationCap },
  { id: "awards", label: "Awards", Icon: Award },
  { id: "connections", label: "Graph connections", Icon: Network },
] as const;
type TabId = (typeof TABS)[number]["id"];

const Badge = ({ children, tone = "line" }: { children: React.ReactNode; tone?: "accent" | "line" | "warn" }) => (
  <span
    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
      tone === "accent" ? "bg-accent text-bg" : tone === "warn" ? "bg-warn text-bg" : "border border-line text-text"
    }`}
  >
    {children}
  </span>
);

export default function Dashboard() {
  const router = useRouter();
  const state = useAdmin();
  const [tab, setTab] = useState<TabId>("profile");
  const [settings, setSettings] = useState<SiteSettings | null | undefined>(undefined);
  const [toast, setToast] = useState<{ msg: string; kind: "ok" | "error" } | null>(null);
  const [importing, setImporting] = useState(false);

  const notify: Notify = useCallback((msg, kind = "ok") => setToast({ msg, kind }), []);

  useEffect(() => {
    if (state.status === "signed-out" || state.status === "denied") router.replace("/admin");
    if (state.status === "admin") loadSettings().then(setSettings).catch(() => setSettings(null));
  }, [state.status, router]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  if (state.status !== "admin" || settings === undefined) {
    return (
      <main className="grid min-h-dvh place-items-center text-muted">
        <p className="flex items-center gap-2">
          <Loader2 className="animate-spin" size={20} aria-hidden /> Checking access…
        </p>
      </main>
    );
  }

  const seeded = !!settings?.seeded;

  const doImport = async () => {
    setImporting(true);
    try {
      await importDefaults();
      await publish();
      setSettings(await loadSettings());
      notify("Content imported. You can now edit everything.");
    } catch (e) {
      notify(e instanceof Error ? e.message : "Import failed. Check the Firestore rules are deployed.", "error");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b-2 border-line bg-bg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <p className="font-display text-base font-bold text-text">&gt; portfolio_admin</p>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-muted md:inline">{state.user.email}</span>
            <ThemeToggle />
            <a
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm text-text hover:border-accent"
            >
              <ExternalLink size={15} aria-hidden /> View site
            </a>
            <button
              type="button"
              onClick={() => signOut(auth).then(() => router.replace("/admin"))}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm text-text hover:border-danger"
            >
              <LogOut size={15} aria-hidden /> Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {!seeded ? (
          <section className="border-2 border-accent bg-surface shadow-hard p-6">
            <h1 className="font-display text-2xl font-semibold text-text">Import your content</h1>
            <p className="mt-2 max-w-2xl text-muted">
              The live site currently shows the built-in content (from your resume, LinkedIn and GitHub). Import it into
              Firestore once to start editing. Your old <code className="text-text">projects</code>/
              <code className="text-text">awards</code> collections are left untouched.
            </p>
            <button
              type="button"
              onClick={doImport}
              disabled={importing}
              className="mt-5 inline-flex items-center gap-2 rounded-lg border-2 border-line bg-accent px-5 py-2.5 font-display font-semibold text-bg shadow-hard-sm disabled:opacity-60"
            >
              {importing && <Loader2 size={16} className="animate-spin" aria-hidden />} Import defaults
            </button>
          </section>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
            <nav aria-label="Sections" className="lg:sticky lg:top-24 lg:self-start">
              <ul className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
                {TABS.map(({ id, label, Icon }) => (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => setTab(id)}
                      aria-current={tab === id ? "page" : undefined}
                      className={`flex w-full items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2.5 text-left ${
                        tab === id ? "bg-accent font-semibold text-bg" : "text-text hover:bg-surface"
                      }`}
                    >
                      <Icon size={18} aria-hidden /> {label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            <section aria-live="off">
              {tab === "profile" && settings && <SettingsEditor initial={settings} notify={notify} />}

              {tab === "projects" && (
                <CollectionEditor<Project>
                  collectionKey="projects"
                  title="Projects"
                  notify={notify}
                  mediaKeys={["image"]}
                  itemTitle={(p) => p.title}
                  badges={(p) => (
                    <>
                      {p.featured ? <Badge tone="accent">Featured</Badge> : <Badge>Small card</Badge>}
                      {p.hidden && <Badge>Hidden</Badge>}
                      {p.isPrivate && <Badge>Private</Badge>}
                      {p.imageIsPlaceholder && <Badge tone="warn">Placeholder image</Badge>}
                    </>
                  )}
                  blank={() => ({
                    title: "New project",
                    summary: "",
                    description: "",
                    tech: [],
                    image: "",
                    imageAlt: "",
                    imageIsPlaceholder: false,
                    repoUrl: "",
                    liveUrl: "",
                    isPrivate: false,
                    featured: false,
                    hidden: true,
                    context: "",
                    year: "",
                  })}
                  renderFields={(p, up) => (
                    <>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <Toggle label="Featured" help="Large card in the masonry" checked={p.featured} onChange={(v) => up({ featured: v })} />
                        <Toggle label="Hidden" help="Not shown on the site" checked={p.hidden} onChange={(v) => up({ hidden: v })} />
                        <Toggle label="Private code" help="Shows a lock badge" checked={p.isPrivate} onChange={(v) => up({ isPrivate: v })} />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <TextField label="Title" value={p.title} onChange={(v) => up({ title: v })} />
                        <TextField label="Context label" help="e.g. Internship · Company" value={p.context} onChange={(v) => up({ context: v })} />
                        <TextField label="Year" help="Shown in the knowledge graph" value={p.year ?? ""} onChange={(v) => up({ year: v })} />
                      </div>
                      <TextField label="One-line summary" value={p.summary} onChange={(v) => up({ summary: v })} />
                      <AreaField label="Description" value={p.description} onChange={(v) => up({ description: v })} />
                      <TagsField label="Tech stack (also links the project to skills in the graph)" value={p.tech} onChange={(v) => up({ tech: v })} />
                      <div className="grid gap-4 sm:grid-cols-2">
                        <TextField label="Live URL" type="url" value={p.liveUrl} onChange={(v) => up({ liveUrl: v })} />
                        <TextField label="Code URL" type="url" help="Leave empty for private repos" value={p.repoUrl} onChange={(v) => up({ repoUrl: v })} />
                      </div>
                      <MediaField label="Image" folder="projects" value={p.image} onChange={(v) => up({ image: v, imageIsPlaceholder: false })} />
                      <TextField label="Image alt text" value={p.imageAlt} onChange={(v) => up({ imageAlt: v })} />
                      <Toggle
                        label="Image is a placeholder"
                        help="Admin-only flag for generated images; turns off when you upload a new one"
                        checked={p.imageIsPlaceholder}
                        onChange={(v) => up({ imageIsPlaceholder: v })}
                      />
                    </>
                  )}
                />
              )}

              {tab === "skills" && (
                <CollectionEditor<SkillGroup>
                  collectionKey="skills"
                  title="Skills"
                  notify={notify}
                  itemTitle={(g) => g.name}
                  badges={(g) => <Badge>{g.items.filter(Boolean).length} skills</Badge>}
                  blank={() => ({ name: "New group", items: [], graphGroup: "Skills" })}
                  renderFields={(g, up) => (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <TextField label="Group name" value={g.name} onChange={(v) => up({ name: v })} />
                        <SelectField
                          label="Graph group"
                          help="Colour and filter used in the knowledge graph"
                          value={g.graphGroup ?? inferGraphGroup(g)}
                          onChange={(v) => up({ graphGroup: v as "Skills" | "Tools" })}
                          options={[
                            { value: "Skills", label: "Skills" },
                            { value: "Tools", label: "Tools" },
                          ]}
                        />
                      </div>
                      <LinesField label="Skills" value={g.items} onChange={(v) => up({ items: v })} />
                    </>
                  )}
                />
              )}

              {tab === "experience" && (
                <CollectionEditor<Experience>
                  collectionKey="experience"
                  title="Experience"
                  notify={notify}
                  itemTitle={(e) => `${e.role} · ${e.org}`}
                  blank={() => ({ role: "New role", org: "", period: "", location: "", bullets: [], link: "" })}
                  renderFields={(e, up) => (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <TextField label="Role" value={e.role} onChange={(v) => up({ role: v })} />
                        <TextField label="Organisation" value={e.org} onChange={(v) => up({ org: v })} />
                        <TextField label="Period" placeholder="Jan 2026 – Present" value={e.period} onChange={(v) => up({ period: v })} />
                        <TextField label="Location" help="City only" value={e.location} onChange={(v) => up({ location: v })} />
                      </div>
                      <LinesField label="Highlights" help="One bullet per line" value={e.bullets} onChange={(v) => up({ bullets: v })} />
                      <TextField label="Link (optional)" type="url" value={e.link} onChange={(v) => up({ link: v })} />
                    </>
                  )}
                />
              )}

              {tab === "education" && (
                <CollectionEditor<Education>
                  collectionKey="education"
                  title="Education"
                  notify={notify}
                  itemTitle={(e) => e.degree}
                  blank={() => ({ degree: "New entry", institution: "", period: "", details: "", tags: [] })}
                  renderFields={(e, up) => (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <TextField label="Degree / course" value={e.degree} onChange={(v) => up({ degree: v })} />
                        <TextField label="Institution" value={e.institution} onChange={(v) => up({ institution: v })} />
                        <TextField label="Period" value={e.period} onChange={(v) => up({ period: v })} />
                      </div>
                      <AreaField label="Details" rows={3} value={e.details} onChange={(v) => up({ details: v })} />
                      <TagsField label="Graph tags (skills this links to)" value={e.tags ?? []} onChange={(v) => up({ tags: v })} />
                    </>
                  )}
                />
              )}

              {tab === "awards" && (
                <CollectionEditor<AwardT>
                  collectionKey="awards"
                  title="Awards & achievements"
                  notify={notify}
                  mediaKeys={["image"]}
                  itemTitle={(a) => a.title}
                  badges={(a) => (a.imageIsPlaceholder ? <Badge tone="warn">Placeholder image</Badge> : null)}
                  blank={() => ({
                    title: "New award",
                    issuer: "",
                    date: "",
                    description: "",
                    image: "",
                    imageAlt: "",
                    imageIsPlaceholder: false,
                    link: "",
                    kind: "award",
                    tags: [],
                  })}
                  renderFields={(a, up) => (
                    <>
                      <TextField label="Title" value={a.title} onChange={(v) => up({ title: v })} />
                      <SelectField
                        label="Type"
                        value={a.kind ?? (/certif/i.test(a.title) ? "certification" : "award")}
                        onChange={(v) => up({ kind: v as "award" | "certification" })}
                        options={[
                          { value: "award", label: "Award / achievement" },
                          { value: "certification", label: "Certification" },
                        ]}
                      />
                      <div className="grid gap-4 sm:grid-cols-2">
                        <TextField label="Issuer" value={a.issuer} onChange={(v) => up({ issuer: v })} />
                        <TextField label="Date" value={a.date} onChange={(v) => up({ date: v })} />
                      </div>
                      <AreaField label="Description" rows={3} value={a.description} onChange={(v) => up({ description: v })} />
                      <TextField label="Certificate link" type="url" value={a.link} onChange={(v) => up({ link: v })} />
                      <TagsField label="Graph tags (skills this links to)" value={a.tags ?? []} onChange={(v) => up({ tags: v })} />
                      <MediaField label="Image" folder="awards" value={a.image} onChange={(v) => up({ image: v, imageIsPlaceholder: false })} />
                      <TextField label="Image alt text" value={a.imageAlt} onChange={(v) => up({ imageAlt: v })} />
                    </>
                  )}
                />
              )}
              {tab === "connections" && <ConnectionsEditor notify={notify} />}
              {tab === "messages" && <MessagesPanel notify={notify} />}
            </section>
          </div>
        )}
      </div>

      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4"
      >
        {toast && (
          <p
            className={`pointer-events-auto rounded-lg px-4 py-3 font-medium shadow-lg ${
              toast.kind === "error" ? "bg-danger text-bg" : "bg-accent text-bg"
            }`}
          >
            {toast.msg}
          </p>
        )}
      </div>
    </div>
  );
}
