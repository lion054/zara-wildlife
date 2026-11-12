import type { ReactNode } from "react";

/** Inline: [text](url) and **bold**. */
function inline(s: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(s))) {
    if (m.index > last) parts.push(s.slice(last, m.index));
    if (m[1]) {
      const internal = m[2].replace(/^https?:\/\/tanzaniawildlifeadventures\.com/, "");
      parts.push(
        <a key={i++} href={internal} className="text-tanzanite underline underline-offset-4">
          {m[1]}
        </a>,
      );
    } else parts.push(<strong key={i++}>{m[3]}</strong>);
    last = m.index + m[0].length;
  }
  if (last < s.length) parts.push(s.slice(last));
  return parts;
}

/** Small markdown renderer for the carried-over policy text. */
export function Prose({ md }: { md: string }) {
  const blocks = md.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  // The page supplies its own <h1>; drop a repeated title at the top.
  while (blocks.length > 1 && (blocks[0].startsWith("# ") || blocks[0] === blocks[1].replace(/^#+\s*/, "") || blocks[0].replace(/^#+\s*/, "") === blocks[1].replace(/^#+\s*/, ""))) {
    blocks.shift();
  }
  const out: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (!list.length) return;
    out.push(
      <ul key={`l${out.length}`} className="ml-5 list-disc space-y-2 marker:text-tanzanite">
        {list.map((x) => (
          <li key={x}>{inline(x)}</li>
        ))}
      </ul>,
    );
    list = [];
  };
  blocks.forEach((b) => {
    if (b.startsWith("- ")) {
      list.push(...b.split("\n").map((x) => x.replace(/^-\s*/, "").trim()).filter(Boolean));
      return;
    }
    flush();
    const h = b.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      out.push(
        <h2 key={out.length} className="mt-10 font-display text-2xl text-basalt first:mt-0">
          {inline(h[2])}
        </h2>,
      );
    } else if (b.length < 70 && !/[.:!?]$/.test(b) && !b.includes("\n")) {
      out.push(
        <h2 key={out.length} className="mt-10 font-display text-2xl text-basalt">
          {b}
        </h2>,
      );
    } else {
      out.push(<p key={out.length}>{inline(b)}</p>);
    }
  });
  flush();
  return <div className="space-y-4 text-lg leading-relaxed text-scree">{out}</div>;
}
