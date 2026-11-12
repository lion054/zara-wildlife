import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-32 text-center">
      <p className="metric text-tanzanite">404 · off route</p>
      <h1 className="mt-4 font-display text-5xl">
        There is no path here.
      </h1>
      <p className="mt-5 text-base leading-relaxed text-scree">
        Head back to the routes, or price a trip.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link
          href="/kilimanjaro"
          className="rounded-full border border-mist bg-glacier px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-tanzanite shadow-[0_10px_25px_0_rgba(74,85,104,0.15)] transition-all hover:border-brand hover:bg-brand hover:text-basalt"
        >
          Kilimanjaro routes
        </Link>
        <Link
          href="/plan"
          className="rounded-full bg-brand px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-basalt transition-all hover:bg-brand-bright hover:shadow-[0_2px_20px_0_rgba(157,171,31,0.5)]"
        >
          Plan my trip
        </Link>
      </div>
    </div>
  );
}
