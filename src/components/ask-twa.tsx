"use client";

/**
 * Opens the assistant from anywhere, without threading state through the tree.
 *
 * The assistant lives in the root layout; the action bars live in page files.
 * Wiring them together would otherwise mean a context provider wrapping the
 * whole site so that two components could share one boolean. A DOM event is
 * the smaller thing: the bar shouts, the panel listens, and neither imports
 * the other.
 */

export const TWA_OPEN = "twa:open";

export function AskTwaCell({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent(TWA_OPEN))}
      className={className}
    >
      <span aria-hidden className="mr-2 inline-block size-[7px] rounded-full bg-lime align-middle" />
      Ask TWA
    </button>
  );
}
