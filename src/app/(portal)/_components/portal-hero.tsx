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
  const [mousePos, setMousePos] = React.useState({ x: 0.5, y: 0.5 });
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePos({ x, y });
  };

  const handleScrollDown = () => {
    const servicesSection = document.getElementById("portal-services");
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollBy({ top: 600, behavior: "smooth" });
    }
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: 0.5, y: 0.5 });
      }}
      className="group relative min-h-[82vh] sm:min-h-[88vh] flex flex-col items-center justify-center text-center overflow-hidden rounded-3xl sm:rounded-[2.5rem] px-4 sm:px-8 py-16 sm:py-24 shadow-2xl transition-all duration-700 select-none"
    >
      {/* ═══ Background Image with Hover Parallax & Smooth Zoom (No Border) ═══ */}
      <div
        className="absolute inset-0 z-0 overflow-hidden"
        style={{
          transform: isHovered
            ? `scale(1.045) translate(${(mousePos.x - 0.5) * -12}px, ${(mousePos.y - 0.5) * -10}px)`
            : "scale(1) translate(0px, 0px)",
          transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/hero-meditation.jpg"
          alt="Meditation in nature at sunrise"
          className="w-full h-full object-cover object-[70%_center] sm:object-center brightness-[0.88] contrast-[1.04] transition-all duration-700"
        />
      </div>

      {/* ═══ Artful Multi-layer Gradient Lighting & Scrim Overlays ═══ */}
      {/* Layer 1: Dark scrim to guarantee sharp contrast & readability for overlaid text */}
      <div className="absolute inset-0 z-1 bg-gradient-to-t from-black/85 via-black/45 to-black/35 sm:bg-radial-[ellipse_at_center] sm:from-black/45 sm:via-black/55 sm:to-black/80 pointer-events-none transition-opacity duration-700" />

      {/* Layer 2: Interactive golden sunrise glow matching the morning light & cursor */}
      <div
        className="absolute inset-0 z-1 pointer-events-none opacity-60 dark:opacity-80 transition-opacity duration-700"
        style={{
          background: isHovered
            ? `radial-gradient(700px circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(245, 158, 11, 0.22), transparent 70%)`
            : "radial-gradient(800px circle at 50% 50%, rgba(245, 158, 11, 0.15), transparent 75%)",
          transition: "background 0.3s ease-out",
        }}
      />

      {/* Layer 3: Soft ambient vignette on bottom to merge gracefully into next section */}
      <div className="absolute inset-x-0 bottom-0 h-32 z-1 bg-gradient-to-t from-slate-950/80 to-transparent pointer-events-none" />

      {/* ═══ Hero Typography & Interactive Elements ═══ */}
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-black/40 border border-white/20 text-amber-200 backdrop-blur-md shadow-md mb-6 sm:mb-8 hover:bg-black/50 hover:border-amber-400/40 hover:scale-105 transition-all cursor-default">
          <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
          <span>{t("home.hero.badge")}</span>
        </div>

        {/* Editorial High-Impact Heading with Glowing Contrast */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-white leading-[1.05] sm:leading-[1.02] text-center drop-shadow-lg">
          <span className="block font-serif italic font-light tracking-tight text-amber-100/95 drop-shadow-md">
            {t("home.hero.sloganA")}
          </span>
          <span className="block font-sans font-black tracking-tighter bg-gradient-to-r from-amber-300 via-orange-200 to-white bg-clip-text text-transparent drop-shadow-xl pb-1">
            {t("home.hero.sloganB")}
          </span>
        </h1>

        {/* Faculty Title */}
        <div className="text-lg sm:text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-md mt-4 sm:mt-5 text-center">
          {t("home.hero.title")}
        </div>

        {/* Mission Statement Description */}
        <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-slate-100/90 leading-relaxed mt-3 sm:mt-4 text-center font-normal drop-shadow-sm">
          {t("home.hero.subtitle")}
        </p>

        {/* CTA Pill Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-8 sm:pt-10">
          <Link
            href="/portal/curriculum"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:brightness-110 shadow-lg shadow-orange-950/30 hover:scale-105 transition-all"
          >
            <BookOpen className="h-4 w-4" />
            <span>{t("home.hero.btnPrograms")}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/portal/meditation"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/25 shadow-md hover:scale-105 transition-all"
          >
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span>{t("home.hero.btnMeditation")}</span>
          </Link>

          <Link
            href="/portal/news"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium text-slate-200 hover:text-white hover:bg-white/10 backdrop-blur-xs transition-all"
          >
            <Newspaper className="h-4 w-4" />
            <span>{t("home.news.viewAll")}</span>
          </Link>
        </div>

        {/* Animated Scroll Cue (MotionSites Style) */}
        <button
          type="button"
          onClick={handleScrollDown}
          className="mt-12 sm:mt-16 inline-flex flex-col items-center gap-1.5 text-slate-300/80 hover:text-white transition-all group/cue cursor-pointer"
          aria-label={t("home.hero.scrollCue")}
        >
          <span className="text-[11px] font-medium tracking-widest uppercase opacity-80 group-hover/cue:opacity-100 transition-opacity drop-shadow">
            {t("home.hero.scrollCue")}
          </span>
          <ChevronDown className="h-4 w-4 animate-bounce text-amber-300/90 group-hover/cue:text-amber-300 transition-colors" />
        </button>
      </div>
    </section>
  );
}
