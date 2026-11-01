import Image, { type ImageProps } from "next/image";
import type { ReactNode } from "react";

/** Shared page width: ~1000px content with wide side margins. */
export const WRAP = "mx-auto w-full max-w-[1000px] px-4 sm:px-8";

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
    <section id={id} aria-labelledby={`${id}-title`} className={`${WRAP} py-20 md:py-32`}>
      <p className="label">{eyebrow}</p>
      <h2 id={`${id}-title`} className="mt-3 font-display text-2xl font-bold tracking-tight text-text sm:text-3xl">
        {title}
      </h2>
      {intro && <p className="mt-4 max-w-[60ch] text-lg leading-relaxed text-muted">{intro}</p>}
      <div className="mt-12">{children}</div>
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
