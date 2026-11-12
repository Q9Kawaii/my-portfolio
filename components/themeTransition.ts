type ViewTransitionDoc = Document & {
  startViewTransition?: (update: () => void) => { ready: Promise<void> };
};

/**
 * Theme switch animation: the new theme grows out of (x, y) as a circle until it covers the screen.
 * Uses the View Transitions API where available; elsewhere colours cross-fade for a moment.
 * `swap` must apply the new theme synchronously.
 */
export function themeTransition(x: number, y: number, swap: () => void) {
  const root = document.documentElement;
  const doc = document as ViewTransitionDoc;

  if (!doc.startViewTransition) {
    root.classList.add("theme-fade");
    swap();
    window.setTimeout(() => root.classList.remove("theme-fade"), 350);
    return;
  }

  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  const transition = doc.startViewTransition(swap);
  transition.ready
    .then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 560, easing: "cubic-bezier(0.4, 0, 0.2, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    })
    .catch(() => {});
}
