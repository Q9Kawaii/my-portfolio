"use client";
import { FileText, ImageOff, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { useId, useRef, useState } from "react";
import { uploadFile } from "@/lib/admin-client";

export const inputCls =
  "w-full rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-text placeholder:text-[#9aa4b5] focus:border-accent focus:outline-none";

function Label({ htmlFor, label, help }: { htmlFor: string; label: string; help?: string }) {
  return (
    <span className="mb-1.5 block">
      <label htmlFor={htmlFor} className="text-sm font-medium text-text">
        {label}
      </label>
      {help && <span className="mt-0.5 block text-xs text-muted">{help}</span>}
    </span>
  );
}

export function TextField({
  label,
  value,
  onChange,
  help,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  help?: string;
  type?: "text" | "url" | "email";
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div>
      <Label htmlFor={id} label={label} help={help} />
      <input
        id={id}
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
      />
    </div>
  );
}

export function AreaField({
  label,
  value,
  onChange,
  help,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  help?: string;
  rows?: number;
}) {
  const id = useId();
  return (
    <div>
      <Label htmlFor={id} label={label} help={help} />
      <textarea
        id={id}
        rows={rows}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} resize-y`}
      />
    </div>
  );
}

/** string[] edited as one entry per line. */
export function LinesField({
  label,
  value,
  onChange,
  help = "One per line",
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  help?: string;
}) {
  return (
    <AreaField
      label={label}
      help={help}
      rows={Math.max(3, (value?.length ?? 0) + 1)}
      value={(value ?? []).join("\n")}
      onChange={(v) => onChange(v.split("\n"))}
    />
  );
}

/** string[] edited as a comma-separated list. */
export function TagsField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [text, setText] = useState((value ?? []).join(", "));
  return (
    <TextField
      label={label}
      help="Comma-separated"
      value={text}
      onChange={(v) => {
        setText(v);
        onChange(
          v
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        );
      }}
    />
  );
}

export function Toggle({
  label,
  checked,
  onChange,
  help,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  help?: string;
}) {
  const id = useId();
  return (
    <div className="flex items-start gap-3">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`mt-0.5 h-6 w-11 shrink-0 rounded-full border transition ${
          checked ? "border-accent bg-accent" : "border-line bg-surface-2"
        }`}
      >
        <span
          className={`block size-4 rounded-full transition ${checked ? "translate-x-6 bg-bg" : "translate-x-1 bg-text"}`}
        />
      </button>
      <span>
        <label htmlFor={id} className="text-sm font-medium text-text">
          {label}
        </label>
        {help && <span className="block text-xs text-muted">{help}</span>}
      </span>
    </div>
  );
}

/** Image or PDF: paste a URL / public path, or upload to Vercel Blob. */
export function MediaField({
  label,
  value,
  onChange,
  folder,
  accept = "image/png,image/jpeg,image/webp,image/avif,image/gif",
  help,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  folder: "projects" | "awards" | "profile" | "cv";
  accept?: string;
  help?: string;
}) {
  const id = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const isPdf = accept.includes("pdf");

  const onFile = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      onChange(await uploadFile(file, folder));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div>
      <Label htmlFor={id} label={label} help={help ?? "Upload a file (max 4 MB) or paste a URL / /public path."} />
      <div className="flex gap-3">
        <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-surface-2">
          {value && !isPdf ? (
            // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin preview
            <img src={value} alt="" className="size-full object-cover" />
          ) : value ? (
            <FileText className="text-accent" aria-hidden />
          ) : (
            <ImageOff className="text-muted" aria-hidden />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input id={id} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={inputCls} />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-text hover:border-accent disabled:opacity-60"
            >
              {busy ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <Upload size={15} aria-hidden />}
              {busy ? "Uploading…" : "Upload"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-text hover:border-danger"
              >
                <Trash2 size={15} aria-hidden /> Clear
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept={accept}
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/** Array of two-field objects, e.g. stats ({value,label}) or focus areas ({title,description}). */
export function PairsField<K1 extends string, K2 extends string>({
  label,
  value,
  onChange,
  keys,
  labels,
}: {
  label: string;
  value: Record<K1 | K2, string>[];
  onChange: (v: Record<K1 | K2, string>[]) => void;
  keys: [K1, K2];
  labels: [string, string];
}) {
  const rows = value ?? [];
  const set = (i: number, k: K1 | K2, v: string) =>
    onChange(rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-text">{label}</legend>
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="flex gap-2">
            <input
              aria-label={`${labels[0]} ${i + 1}`}
              placeholder={labels[0]}
              value={r[keys[0]] ?? ""}
              onChange={(e) => set(i, keys[0], e.target.value)}
              className={`${inputCls} w-1/3`}
            />
            <input
              aria-label={`${labels[1]} ${i + 1}`}
              placeholder={labels[1]}
              value={r[keys[1]] ?? ""}
              onChange={(e) => set(i, keys[1], e.target.value)}
              className={inputCls}
            />
            <button
              type="button"
              aria-label={`Remove row ${i + 1}`}
              onClick={() => onChange(rows.filter((_, j) => j !== i))}
              className="grid size-11 shrink-0 place-items-center rounded-lg border border-line text-text hover:border-danger"
            >
              <Trash2 size={16} aria-hidden />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...rows, { [keys[0]]: "", [keys[1]]: "" } as Record<K1 | K2, string>])}
        className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-text hover:border-accent"
      >
        <Plus size={15} aria-hidden /> Add row
      </button>
    </fieldset>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  help,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  help?: string;
}) {
  const id = useId();
  return (
    <div>
      <Label htmlFor={id} label={label} help={help} />
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
