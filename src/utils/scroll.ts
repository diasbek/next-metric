/** Jump to the top instantly — used on every client-side route change. */
export function resetScrollPosition(): void {
  if (typeof window === "undefined") return;

  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

/** Re-apply after layout/paint so Next.js cannot restore the previous offset. */
export function resetScrollPositionAfterPaint(): void {
  resetScrollPosition();
  requestAnimationFrame(() => {
    resetScrollPosition();
    requestAnimationFrame(resetScrollPosition);
  });
}
