import Image from "next/image";
import { site } from "@/lib/site";

/**
 * Proof the operator can genuinely claim, shown near booking: their own TripAdvisor rating and review count (linked, so
 * anyone can check it), the years since they started, and the memberships whose logos they already show. Nothing here
 * is borrowed from another operator.
 */
const SHOWN = ["ATTA", "TATO", "MKPS"];

export function TrustStrip({ tone = "light", className = "" }: { tone?: "light" | "dark"; className?: string }) {
  const r = site.reviews;
  const years = new Date().getFullYear() - site.established;
  const dark = tone === "dark";
  const members = site.members.filter((m) => SHOWN.includes(m.name));
  return (
    <div className={`flex flex-wrap items-center gap-x-6 gap-y-4 ${className}`}>
      <a href={r.url} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3">
        <span className="flex text-brand" aria-hidden="true">
          {"★★★★★".slice(0, r.rating)}
        </span>
        <span className={`text-sm ${dark ? "text-glacier/85" : "text-basalt"}`}>
          <span className="font-semibold">{r.rating.toFixed(1)}</span> on {r.platform} ·{" "}
          <span className="underline decoration-current/30 underline-offset-4 group-hover:decoration-current">{r.count} reviews</span>
        </span>
      </a>
      <span className={`text-sm ${dark ? "text-glacier/70" : "text-scree"}`}>
        {years > 1 ? `${years} years climbing from Moshi` : "Based in Moshi"}
      </span>
      <ul className="flex items-center gap-3" aria-label="Member of">
        {members.map((m) => (
          <li key={m.name} title={m.full} className={`grid h-10 place-items-center rounded-lg px-2 ${dark ? "bg-glacier" : "bg-white ring-1 ring-mist"}`}>
            <Image src={m.logo} alt={`Member of ${m.full}`} width={m.w} height={m.h} className="h-8 w-auto" sizes="64px" />
          </li>
        ))}
      </ul>
    </div>
  );
}
