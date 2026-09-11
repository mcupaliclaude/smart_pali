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
      className="group relative min-h-[82vh] sm:min-h-[88vh] flex flex-col lg:flex-row items-center justify-between py-10 sm:py-16 lg:py-20 select-none overflow-hidden"
    >
      {/* ═══ Ambient Sunrise Spotlight Glow (Interactive Mouse Tracking) ═══ */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-60 transition-opacity duration-700"
        style={{
          background: isHovered
            ? `radial-gradient(850px circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(245, 158, 11, 0.18), transparent 70%)`
            : "radial-gradient(900px circle at 70% 50%, rgba(245, 158, 11, 0.12), transparent 75%)",
          transition: "background 0.3s ease-out",
        }}
      />

      {/* ═══ Meditation Background Artwork (Right Side on Desktop, Stacked on Mobile, Soft Faded Edges, No Frame) ═══ */}
      <div
        className="w-full lg:w-[58%] xl:w-[55%] relative lg:absolute lg:right-0 lg:top-0 lg:bottom-0 h-[340px] sm:h-[440px] lg:h-full mt-8 lg:mt-0 overflow-hidden flex items-center justify-center order-2 lg:order-none pointer-events-none"
        style={{
          maskImage:
            "radial-gradient(ellipse 80% 75% at 55% 50%, black 35%, rgba(0,0,0,0.6) 65%, transparent 96%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 75% at 55% 50%, black 35%, rgba(0,0,0,0.6) 65%, transparent 96%)",
        }}
      >
        <div
          className="w-full h-full"
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
            className="w-full h-full object-cover object-[62%_center] brightness-[0.96] contrast-[1.02]"
          />
        </div>

        {/* Soft feathered edge fades on all 4 sides into page background */}
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-slate-50 dark:from-slate-950 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 left-0 w-24 sm:w-32 bg-gradient-to-r from-slate-50 dark:from-slate-950 via-slate-50/80 dark:via-slate-950/80 to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent pointer-events-none" />
      </div>

      {/* ═══ Left Column: Typography & CTAs (Completely Clear of Image, No Overlap) ═══ */}
      <div className="relative z-10 w-full max-w-xl lg:max-w-2xl flex flex-col items-start text-left px-2 sm:px-4 lg:px-6 order-1">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/25 dark:border-amber-400/25 text-amber-800 dark:text-amber-200 backdrop-blur-xs shadow-xs mb-6 sm:mb-8 hover:bg-amber-500/15 dark:hover:bg-amber-400/20 hover:scale-105 transition-all cursor-default">
          <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 animate-pulse" />
          <span>{t("home.hero.badge")}</span>
        </div>

        {/* Editorial High-Impact Heading */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-7xl xl:text-8xl tracking-tight leading-[1.05] sm:leading-[1.02] text-left drop-shadow-xs">
          <span className="block font-serif italic font-light tracking-tight text-amber-900/90 dark:text-amber-100/95 drop-shadow-xs">
            {t("home.hero.sloganA")}
          </span>
          <span className="block font-sans font-black tracking-tighter bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 dark:from-amber-300 dark:via-orange-200 dark:to-white bg-clip-text text-transparent pb-1">
            {t("home.hero.sloganB")}
          </span>
        </h1>

        {/* Faculty Title */}
        <div className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white drop-shadow-xs mt-4 sm:mt-5 text-left">
          {t("home.hero.title")}
        </div>

        {/* Mission Statement Description */}
        <p className="max-w-xl text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mt-3 sm:mt-4 text-left font-normal">
          {t("home.hero.subtitle")}
        </p>

        {/* CTA Pill Buttons */}
        <div className="flex flex-wrap items-center justify-start gap-3.5 pt-8 sm:pt-10">
          <Link
            href="/portal/curriculum"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:brightness-110 shadow-lg shadow-orange-950/20 hover:scale-105 transition-all"
          >
            <BookOpen className="h-4 w-4" />
            <span>{t("home.hero.btnPrograms")}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/portal/meditation"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 text-slate-800 dark:text-white backdrop-blur-md border border-slate-200 dark:border-white/20 shadow-xs hover:scale-105 transition-all"
          >
            <Sparkles className="h-4 w-4 text-amber-500 dark:text-amber-300" />
            <span>{t("home.hero.btnMeditation")}</span>
          </Link>

          <Link
            href="/portal/news"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10 transition-all"
          >
            <Newspaper className="h-4 w-4" />
            <span>{t("home.news.viewAll")}</span>
          </Link>
        </div>

        {/* Animated Scroll Cue (MotionSites Style) */}
        <button
          type="button"
          onClick={handleScrollDown}
          className="mt-10 sm:mt-14 inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all group/cue cursor-pointer"
          aria-label={t("home.hero.scrollCue")}
        >
          <span className="text-[11px] font-medium tracking-widest uppercase opacity-80 group-hover/cue:opacity-100 transition-opacity">
            {t("home.hero.scrollCue")}
          </span>
          <ChevronDown className="h-4 w-4 animate-bounce text-amber-600 dark:text-amber-300/90 group-hover/cue:text-amber-600 dark:group-hover/cue:text-amber-300 transition-colors" />
        </button>
      </div>
    </section>
  );
}
