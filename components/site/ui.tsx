import Image, { type ImageProps } from "next/image";
import type { ReactNode } from "react";

/** Shared page width. */
export const WRAP = "mx-auto w-full max-w-[1200px] px-5 sm:px-8";

/** "Exhibit A", "Exhibit B", ... then "Exhibit AA" past 26. */
export function exhibit(n: number) {
  let s = "";
  let i = n;
  do {
    s = String.fromCharCode(65 + (i % 26)) + s;
    i = Math.floor(i / 26) - 1;
  } while (i >= 0);
  return s;
}

export function Section({
  id,
  index,
  eyebrow,
  title,
  intro,
  children,
  tinted = false,
}: {
  id: string;
  /** Section number shown on the file tab, e.g. "02". */
  index?: string;
  eyebrow: string;
  title: ReactNode;
  intro?: string;
  children: ReactNode;
  /** Alternate background band to separate long pages into clear blocks. */
  tinted?: boolean;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={tinted ? "border-y border-line bg-surface-2/55" : undefined}
    >
      <div className={`${WRAP} py-20 md:py-28`}>
        {/* File tab + full-width rule, like a divider in a binder. */}
        <div className="flex items-center gap-4">
          <p className="label shrink-0">
            {index && <span className="text-muted">§{index} / </span>}
            {eyebrow}
          </p>
          <span aria-hidden className="h-px flex-1 bg-line" />
        </div>
        <div className="mt-7 grid gap-6 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:items-end md:gap-12">
          <h2 id={`${id}-title`} className="h2 text-[2.9rem] text-text sm:text-6xl lg:text-[5.2rem]">
            {title}
          </h2>
          {intro && <p className="max-w-[46ch] text-lg leading-relaxed text-muted md:justify-self-end">{intro}</p>}
        </div>
        <div className="mt-12 md:mt-16">{children}</div>
      </div>
    </section>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return <span className="tag">{children}</span>;
}

/** next/image that only optimizes local and Vercel Blob sources; other hosts load as-is. */
export function SmartImage(props: ImageProps) {
  const src = typeof props.src === "string" ? props.src : "";
  const optimizable = !src || src.startsWith("/") || src.includes(".public.blob.vercel-storage.com");
  return <Image {...props} unoptimized={!optimizable || props.unoptimized} alt={props.alt} />;
}
