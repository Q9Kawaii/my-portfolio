import Image, { type ImageProps } from "next/image";
import type { ReactNode } from "react";

/** Shared page width. */
export const WRAP = "mx-auto w-full max-w-[1120px] px-5 sm:px-8";

export function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
  tinted = false,
}: {
  id: string;
  eyebrow: string;
  title: string;
  intro?: string;
  children: ReactNode;
  /** Alternate background band to separate long pages into clear blocks. */
  tinted?: boolean;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={tinted ? "border-y border-line bg-surface-2" : undefined}
    >
      <div className={`${WRAP} py-20 md:py-24`}>
        <p className="label">{eyebrow}</p>
        <h2 id={`${id}-title`} className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-[2.1rem]">
          {title}
        </h2>
        {intro && <p className="mt-4 max-w-[62ch] text-lg leading-relaxed text-muted">{intro}</p>}
        <div className="mt-12">{children}</div>
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
