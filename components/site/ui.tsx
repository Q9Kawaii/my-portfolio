import Image, { type ImageProps } from "next/image";
import type { ReactNode } from "react";

export function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
      <p className="font-mono text-sm tracking-wide text-accent">{eyebrow}</p>
      <h2 id={`${id}-title`} className="mt-2 font-display text-3xl font-semibold tracking-tight text-text sm:text-4xl">
        {title}
      </h2>
      {intro && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{intro}</p>}
      <div className="mt-12">{children}</div>
    </section>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-line bg-surface-2 px-2.5 py-1 font-mono text-xs text-text">
      {children}
    </span>
  );
}

/** next/image that only optimizes local and Vercel Blob sources; other hosts load as-is. */
export function SmartImage(props: ImageProps) {
  const src = typeof props.src === "string" ? props.src : "";
  const optimizable = !src || src.startsWith("/") || src.includes(".public.blob.vercel-storage.com");
  return <Image {...props} unoptimized={!optimizable || props.unoptimized} alt={props.alt} />;
}
