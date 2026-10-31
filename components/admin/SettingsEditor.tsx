"use client";
import { Loader2, Save } from "lucide-react";
import { useState } from "react";
import { publish, saveSettings } from "@/lib/admin-client";
import type { FocusArea, SiteSettings, SocialLinks, Stat } from "@/lib/types";
import type { Notify } from "./CollectionEditor";
import { AreaField, MediaField, PairsField, TextField, Toggle } from "./fields";

const SOCIALS: { key: keyof SocialLinks; label: string }[] = [
  { key: "github", label: "GitHub" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "instagram", label: "Instagram" },
  { key: "x", label: "X (Twitter)" },
  { key: "leetcode", label: "LeetCode" },
];

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4 rounded-xl border border-line bg-surface p-5">
      <legend className="px-1 font-display text-lg font-semibold text-text">{title}</legend>
      {children}
    </fieldset>
  );
}

export default function SettingsEditor({ initial, notify }: { initial: SiteSettings; notify: Notify }) {
  const [s, setS] = useState<SiteSettings>(initial);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => {
    setS((prev) => ({ ...prev, [k]: v }));
    setDirty(true);
  };

  const save = async () => {
    setBusy(true);
    try {
      await saveSettings({
        ...s,
        socials: Object.fromEntries(
          Object.entries(s.socials).map(([k, v]) => [k, v.trim()]),
        ) as unknown as SocialLinks,
        stats: s.stats.filter((x) => x.value || x.label),
        focusAreas: s.focusAreas.filter((x) => x.title || x.description),
      });
      setDirty(false);
      await publish();
      notify("Profile & links saved. The live site is updated.");
    } catch (e) {
      notify(e instanceof Error ? e.message : "Save failed.", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold text-text">Profile & links</h2>
        <button
          type="button"
          onClick={save}
          disabled={busy || !dirty}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-semibold text-bg hover:brightness-110 disabled:opacity-50"
        >
          {busy ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Save size={16} aria-hidden />}
          {dirty ? "Save & publish" : "Saved"}
        </button>
      </div>

      <Card title="Hero">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Name" value={s.name} onChange={(v) => set("name", v)} />
          <TextField label="Role" value={s.role} onChange={(v) => set("role", v)} />
        </div>
        <AreaField label="Headline" rows={2} value={s.headline} onChange={(v) => set("headline", v)} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Availability badge" value={s.availability} onChange={(v) => set("availability", v)} />
          <TextField
            label="Location"
            help="City or region only, never a street address"
            value={s.location}
            onChange={(v) => set("location", v)}
          />
        </div>
        <PairsField<"value", "label">
          label="Stats"
          keys={["value", "label"]}
          labels={["Value", "Label"]}
          value={s.stats as Stat[]}
          onChange={(v) => set("stats", v)}
        />
      </Card>

      <Card title="About">
        <AreaField
          label="Bio"
          help="Separate paragraphs with a blank line"
          rows={8}
          value={s.bio}
          onChange={(v) => set("bio", v)}
        />
        <MediaField label="Profile photo" folder="profile" value={s.avatar} onChange={(v) => set("avatar", v)} />
        <PairsField<"title", "description">
          label="Focus areas"
          keys={["title", "description"]}
          labels={["Title", "Description"]}
          value={s.focusAreas as FocusArea[]}
          onChange={(v) => set("focusAreas", v)}
        />
      </Card>

      <Card title="Contact & CV">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Email" type="email" value={s.email} onChange={(v) => set("email", v)} />
          <TextField label="Phone" value={s.phone} onChange={(v) => set("phone", v)} />
        </div>
        <Toggle
          label="Show phone number on the public site"
          help="Off by default. The number is stored but not displayed while this is off."
          checked={s.showPhone}
          onChange={(v) => set("showPhone", v)}
        />
        <MediaField
          label="CV (PDF)"
          folder="cv"
          accept="application/pdf"
          help="Upload a PDF (max 4 MB) or paste a URL / /public path."
          value={s.cvUrl}
          onChange={(v) => set("cvUrl", v)}
        />
      </Card>

      <Card title="Social links">
        <p className="text-sm text-muted">Leave a field empty to hide that icon everywhere on the site.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {SOCIALS.map(({ key, label }) => (
            <TextField
              key={key}
              label={label}
              type="url"
              placeholder="https://"
              value={s.socials[key]}
              onChange={(v) => set("socials", { ...s.socials, [key]: v })}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
