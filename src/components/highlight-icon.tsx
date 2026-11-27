import type { Highlight } from "@/lib/route-facts";

/** Line icons for route highlights: a gate, a hut, a tent, a peak, a rest day. */
export function HighlightIcon({ icon, className = "h-5 w-5" }: { icon: Highlight["icon"]; className?: string }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {icon === "gate" && (
        <g {...p}>
          <path d="M4 21V7l3-3 3 3v14M14 21V7l3-3 3 3v14M10 10h4M10 14h4" />
        </g>
      )}
      {icon === "hut" && (
        <g {...p}>
          <path d="M3 11l9-7 9 7M5 9.5V20h14V9.5M10 20v-5h4v5" />
        </g>
      )}
      {icon === "tent" && (
        <g {...p}>
          <path d="M2 20h20M12 4L3 20M12 4l9 16M12 4v16M9 20l3-6 3 6" />
        </g>
      )}
      {icon === "peak" && (
        <g {...p}>
          <path d="M2 20l7-11 4 6 3-4 6 9H2zM7.5 11.5l1.5 1 1.5-1" />
        </g>
      )}
      {icon === "rest" && (
        <g {...p}>
          <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
        </g>
      )}
    </svg>
  );
}
