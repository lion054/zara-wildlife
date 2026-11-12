"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/primitives";
import { photo } from "@/lib/photos";

type Slide = {
  key: string;
  imageKey: string;
  eyebrow: string;
  title: string;
  text: string;
  ctas: { label: string; href: string; variant?: "primary" | "light" }[];
};

const INTERVAL = 7000;

/**
 * Homepage hero: three slides, one per thing the company sells first.
 *
 * No on-screen controls. It plays through once and stops, never moves on its
 * own for anyone who asked for reduced motion, holds while the pointer or
 * keyboard focus is inside it, and can be swiped or steered with the arrow
 * keys. Slides that are not showing are removed from the tab order and from
 * screen readers rather than just made transparent.
 */
export function HeroSlider({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const touchX = useRef<number | null>(null);
  const [held, setHeld] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const go = useCallback(
    (n: number) => setI((n + slides.length) % slides.length),
    [slides.length],
  );

  /* Plays through once and stops on the last slide, so nothing keeps moving
     on its own. Swipe or the arrow keys move it by hand. */
  const running = !held && !reduced && i < slides.length - 1;
  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => go(i + 1), INTERVAL);
    return () => clearTimeout(t);
  }, [running, i, go]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured trips"
      className="on-dark relative isolate flex min-h-[36rem] items-center justify-center overflow-hidden bg-basalt md:min-h-[calc(100svh-6rem)]"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1));
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(i + 1);
        if (e.key === "ArrowLeft") go(i - 1);
      }}
    >
      {slides.map((s, n) => {
        const img = photo(s.imageKey);
        const active = n === i;
        const Heading = n === 0 ? "h1" : "h2";
        return (
          <div
            key={s.key}
            role="group"
            aria-roledescription="slide"
            aria-label={`${n + 1} of ${slides.length}`}
            aria-hidden={!active}
            className={`absolute inset-0 flex items-center justify-center px-6 pb-40 pt-12 text-center md:pb-44 transition-[opacity,visibility] duration-700 ${
              active ? "visible opacity-100" : "invisible opacity-0"
            }`}
          >
            {img && (
              <Image
                src={img.src}
                alt=""
                fill
                priority={n === 0}
                sizes="100vw"
                className={`-z-20 object-cover transition-transform duration-[9000ms] ease-out ${
                  active && !reduced ? "scale-105" : "scale-100"
                }`}
              />
            )}
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-basalt/55" />
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(20,19,12,0.55)_0%,rgba(20,19,12,0)_70%)]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-gradient-to-t from-basalt/70 via-transparent to-basalt/25"
            />

            <div className="mx-auto max-w-4xl">
              <p className="label mb-4 text-brand">{s.eyebrow}</p>
              <Heading className="font-display text-4xl sm:text-5xl md:text-6xl">{s.title}</Heading>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-glacier/90 md:mt-6 md:text-lg">
                {s.text}
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3 md:mt-9">
                {s.ctas.map((c) => (
                  <Button key={c.href} href={c.href} variant={c.variant}>
                    {c.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      <div aria-hidden="true" className="torn torn-bottom" />

      {/* Politely announces the slide only when the user is steering it. */}
      <p className="sr-only" aria-live={running ? "off" : "polite"}>
        Slide {i + 1} of {slides.length}: {slides[i].eyebrow}
      </p>
    </section>
  );
}
