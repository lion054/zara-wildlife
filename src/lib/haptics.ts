/**
 * Haptics.
 *
 * ⚠️ READ THIS BEFORE RELYING ON IT.
 *
 * The Vibration API is Android-only in practice. Chrome, Edge, Firefox and
 * Samsung Internet on Android implement `navigator.vibrate`; Safari on iOS
 * does not, and has never shipped it — no flag, no prefix, no polyfill. Any
 * iPhone visiting this site gets nothing from this module at all.
 *
 * So every call here is decoration on top of a visual state that already
 * exists — a chip that fills in, a message that appears. Nothing in the
 * interface is allowed to depend on a pulse to be understood. Roughly half
 * the operator's traffic is Android, which is the reason this is worth
 * having at all.
 *
 * Three further constraints:
 *
 *   · A vibration only fires after a real user gesture. Chrome drops calls
 *     made outside one, silently, so these are wired to handlers rather than
 *     to effects that might run on mount.
 *   · `prefers-reduced-motion` is honoured. Vestibular triggers are not the
 *     reason someone sets it, but the setting is the closest signal a browser
 *     gives for "stop moving things at me", and a buzzing phone is squarely
 *     in that category.
 *   · Durations are short. Anything past ~30ms on a phone motor stops reading
 *     as a tick and starts reading as a notification, which is a different
 *     message entirely.
 */

/**
 * The vocabulary. Three meanings, and deliberately not more.
 *
 * An earlier pass fired a pulse on every link, every nav item and every
 * submit — which is not feedback, it is a phone buzzing continuously while
 * somebody reads. A haptic should mark a state change the reader caused and
 * might otherwise miss. Navigating to a page is neither: the page arriving is
 * its own confirmation.
 *
 * So it fires in exactly two situations, both in the planner and the forms:
 * an option toggled, and an answer returned from the server. Durations are
 * near the floor of what a phone motor can render — a tick, not a buzz.
 */
export const HAPTIC = {
  /** A choice turned on: a planner chip. */
  select: 7,
  /** The same choice turned off. Lighter, so the two are distinguishable. */
  deselect: 4,
  /** The server answered — sent, or rejected. One tick either way. */
  reply: 10,
} as const;

export type HapticName = keyof typeof HAPTIC;

let reduced: boolean | null = null;

function prefersReduced(): boolean {
  if (typeof window === "undefined") return true;
  if (reduced === null) {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    reduced = mq?.matches ?? false;
    // The reader can change it mid-session; a stale `true` would silence the
    // site for the rest of the visit.
    mq?.addEventListener?.("change", (e) => { reduced = e.matches; });
  }
  return reduced;
}

/**
 * Fire a pulse. Safe to call anywhere — on the server, on iOS, in a browser
 * with no motor, or with the API present but permission-blocked. Returns
 * whether the pulse was actually dispatched, which is useful in tests and
 * useless in the interface, because nothing may branch on it.
 */
export function haptic(name: HapticName): boolean {
  if (typeof navigator === "undefined") return false;
  if (typeof navigator.vibrate !== "function") return false;
  if (prefersReduced()) return false;
  try {
    return navigator.vibrate(HAPTIC[name] as number | number[]);
  } catch {
    // Some WebViews throw rather than returning false when the motor is
    // unavailable or the page is backgrounded.
    return false;
  }
}

