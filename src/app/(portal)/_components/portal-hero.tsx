"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookOpen,
  Sparkles,
  ArrowRight,
  Newspaper,
  ChevronDown,
} from "lucide-react";
import { useT } from "@/shared/lib/i18n/client";

export function PortalHero() {
  const t = useT();

  const handleScrollDown = () => {
    const servicesSection = document.getElementById("portal-services");
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollBy({ top: 600, behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-[76vh] sm:min-h-[82vh] flex flex-col items-center justify-center text-center overflow-hidden rounded-3xl sm:rounded-[2.5rem] bg-white/40 dark:bg-slate-900/30 border border-[var(--glass-border)] px-4 sm:px-8 py-16 sm:py-24 shadow-xs transition-colors">
      {/* ═══ Ambient Aurora Gradient Mesh (Inspired by MotionSites AI) ═══ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="relative w-full max-w-4xl h-[420px] sm:h-[540px] opacity-80 dark:opacity-65">
          {/* Luminous Purple / Indigo Orb */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[500px] h-[300px] sm:h-[440px] rounded-full bg-gradient-to-tr from-purple-600 via-indigo-500 to-fuchsia-500 blur-[85px] sm:blur-[130px] animate-pulse" />

          {/* Radiant Amber / Orange Swirl */}
          <div className="absolute top-1/3 left-1/3 -translate-x-1/4 -translate-y-1/4 w-[300px] sm:w-[450px] h-[260px] sm:h-[390px] rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 blur-[75px] sm:blur-[115px]" />

          {/* Tranquil Sky Blue Counter-accent */}
          <div className="absolute bottom-1/4 right-1/4 translate-x-1/4 translate-y-1/4 w-[280px] sm:w-[420px] h-[240px] sm:h-[350px] rounded-full bg-gradient-to-tl from-sky-400 via-blue-500 to-teal-400 blur-[70px] sm:blur-[105px]" />

          {/* Subtle Radial Vignette */}
          <div className="absolute inset-0 bg-radial from-transparent via-transparent to-white/40 dark:to-slate-950/50" />
        </div>
      </div>

      {/* ═══ Hero Typography & Interactive Elements ═══ */}
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-[var(--glass-strong)] border border-[var(--glass-border)] text-[var(--text-2)] backdrop-blur-md shadow-2xs mb-6 sm:mb-8 hover:scale-105 transition-transform cursor-default">
          <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
          <span>{t("home.hero.badge")}</span>
        </div>

        {/* Editorial High-Impact Heading */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-foreground leading-[1.05] sm:leading-[1.02] text-center select-none">
          <span className="block font-serif italic font-light tracking-tight text-foreground/90">
            {t("home.hero.sloganA")}
          </span>
          <span className="block font-sans font-black tracking-tighter bg-gradient-to-r from-[var(--brand)] via-purple-600 to-orange-500 bg-clip-text text-transparent pb-1">
            {t("home.hero.sloganB")}
          </span>
        </h1>

        {/* Faculty Title */}
        <div className="text-lg sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground/90 mt-4 sm:mt-5 text-center">
          {t("home.hero.title")}
        </div>

        {/* Mission Statement Description */}
        <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mt-3 sm:mt-4 text-center font-normal">
          {t("home.hero.subtitle")}
        </p>

        {/* CTA Pill Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-8 sm:pt-10">
          <Link
            href="/portal/curriculum"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-[var(--brand)] text-[var(--on-brand)] hover:opacity-95 shadow-md hover:scale-105 transition-all"
          >
            <BookOpen className="h-4 w-4" />
            <span>{t("home.hero.btnPrograms")}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/portal/meditation"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-[var(--glass-strong)] border border-[var(--glass-border)] text-foreground hover:bg-[var(--glass-hover)] backdrop-blur-md shadow-xs hover:scale-105 transition-all"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span>{t("home.hero.btnMeditation")}</span>
          </Link>

          <Link
            href="/portal/news"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium text-[var(--text-2)] hover:text-foreground hover:bg-[var(--glass-hover)] transition-all"
          >
            <Newspaper className="h-4 w-4" />
            <span>{t("home.news.viewAll")}</span>
          </Link>
        </div>

        {/* Animated Scroll Cue (MotionSites Style) */}
        <button
          type="button"
          onClick={handleScrollDown}
          className="mt-12 sm:mt-16 inline-flex flex-col items-center gap-1.5 text-[var(--text-muted)] hover:text-foreground transition-all group cursor-pointer"
          aria-label={t("home.hero.scrollCue")}
        >
          <span className="text-[11px] font-medium tracking-widest uppercase opacity-75 group-hover:opacity-100 transition-opacity">
            {t("home.hero.scrollCue")}
          </span>
          <ChevronDown className="h-4 w-4 animate-bounce text-primary/70 group-hover:text-primary transition-colors" />
        </button>
      </div>
    </section>
  );
}
