/** Per-person price for a party of `guests`, read from a tour's price ladder. */
export function perPerson(ladder: { size: string; price: number | null }[], guests: number): number | null {
  for (const r of ladder) {
    if (!r.price) continue;
    const n = r.size.match(/\d+/g)?.map(Number) ?? [];
    if (!n.length) return r.price; // "Per person, any group size"
    const plus = /\+/.test(r.size);
    const lo = n[0];
    const hi = plus ? Infinity : (n[1] ?? n[0]);
    if (guests >= lo && guests <= hi) return r.price;
  }
  // Bigger than the largest row: the largest group's rate.
  const last = [...ladder].reverse().find((r) => r.price);
  return last?.price ?? null;
}
