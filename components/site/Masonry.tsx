"use client";
import { Children, useEffect, useRef, useState, type ReactNode } from "react";

const ROW = 8; // px, grid-auto-rows unit
const GAP = 24; // px, matches gap-6

/**
 * Row-major masonry built on CSS grid. Items keep DOM order (so keyboard and
 * screen-reader order matches reading order) while each one spans just enough
 * rows for its measured height. Before hydration it renders as a normal grid.
 */
export default function Masonry({
  children,
  className = "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const grid = ref.current;
    if (!grid) return;
    const items = Array.from(grid.children) as HTMLElement[];
    const layout = () => {
      // Single column: no spanning needed.
      const cols = getComputedStyle(grid).gridTemplateColumns.split(" ").length;
      for (const item of items) {
        const inner = item.firstElementChild as HTMLElement | null;
        const h = inner?.getBoundingClientRect().height ?? 0;
        item.style.gridRowEnd = cols > 1 ? `span ${Math.ceil((h + GAP) / (ROW + GAP))}` : "";
      }
      setReady(true);
    };
    const ro = new ResizeObserver(layout);
    ro.observe(grid);
    items.forEach((i) => i.firstElementChild && ro.observe(i.firstElementChild));
    // ResizeObserver fires once on observe, which runs the first layout.
    return () => ro.disconnect();
  }, [children]);

  return (
    <div
      ref={ref}
      className={`grid gap-6 ${ready ? "items-start md:[grid-auto-rows:8px]" : ""} ${className}`}
    >
      {Children.map(children, (child) => (
        <div>{child}</div>
      ))}
    </div>
  );
}
