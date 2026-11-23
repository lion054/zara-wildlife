"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { COMMON, COUNTRIES, flag, guessCountry, splitIntl } from "@/lib/countries";

/**
 * A phone number with its country: a picker (flag and dialling code) beside the number. The form receives the full
 * international number as `phone` ("+44 7700 900123") and the country's name as `country`, so a separate country
 * field is not needed. Pasting a number that starts with + picks the country by itself.
 */
export function PhoneField({
  id,
  label = "Phone or WhatsApp",
  fieldClass,
  labelClass,
  required = false,
}: {
  id: string;
  label?: string;
  fieldClass: string;
  labelClass: string;
  required?: boolean;
}) {
  const [iso, setIso] = useState("TZ");
  const [num, setNum] = useState("");
  const [chosen, setChosen] = useState(false); // once the visitor picks (or pastes) a country, nothing overrides it
  // Default: where the visitor is (their IP's country, from the host), else a guess from time zone and language.
  useEffect(() => {
    const g = guessCountry();
    if (g) setIso(g);
    let live = true;
    fetch("/api/geo")
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { country?: string | null } | null) => {
        const c = j?.country;
        if (live && c && COUNTRIES.some((x) => x[0] === c)) setIso((now) => (chosenRef.current ? now : c));
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);
  const chosenRef = useRef(false);
  chosenRef.current = chosen;

  const byIso = useMemo(() => new Map(COUNTRIES.map((c) => [c[0], c])), []);
  const c = byIso.get(iso) ?? byIso.get("TZ")!;
  const common = COMMON.map((k) => byIso.get(k)).filter(Boolean) as typeof COUNTRIES;
  const local = num.replace(/^0+/, "").trim(); // a leading 0 is dropped after the country code
  const full = local ? `+${c[2]} ${local}` : "";

  return (
    <div>
      <label className={labelClass} htmlFor={id}>
        {label}
      </label>
      <div className="flex">
        <div className="relative shrink-0">
          <select
            aria-label="Country code"
            value={iso}
            onChange={(e) => {
              setChosen(true);
              setIso(e.target.value);
            }}
            className={`${fieldClass.replace(/(^|\s)w-full(?=\s|$)/g, " ")} w-[6.5rem] cursor-pointer appearance-none rounded-r-none border-r-0 pr-6 pl-3`}
          >
            <optgroup label="Common">
              {common.map(([k, name, dial]) => (
                <option key={`c-${k}`} value={k}>
                  {flag(k)} +{dial} {name}
                </option>
              ))}
            </optgroup>
            <optgroup label="All countries">
              {COUNTRIES.map(([k, name, dial]) => (
                <option key={k} value={k}>
                  {flag(k)} +{dial} {name}
                </option>
              ))}
            </optgroup>
          </select>
          {/* The closed picker shows only the flag and code; the open list has the names. */}
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-3 right-6 flex items-center bg-white text-sm text-basalt">
            {flag(c[0])} <span className="ml-1.5">+{c[2]}</span>
          </span>
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-xs text-scree">
            ▾
          </span>
        </div>
        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          required={required}
          value={num}
          placeholder="Number"
          onChange={(e) => {
            const v = e.target.value;
            const s = v.trim().startsWith("+") ? splitIntl(v) : null;
            if (s) {
              setChosen(true);
              setIso(s.iso);
              setNum(s.rest);
            } else setNum(v);
          }}
          className={`${fieldClass} min-w-0 flex-1 rounded-l-none`}
        />
      </div>
      <input type="hidden" name="phone" value={full} />
      {/* The country goes with the number only: a guess is never sent on its own. */}
      <input type="hidden" name="country" value={local ? c[1] : ""} />
    </div>
  );
}
