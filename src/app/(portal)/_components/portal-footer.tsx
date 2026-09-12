"use client";

import * as React from "react";
import Link from "next/link";
import {
  GraduationCap,
  Home,
  Newspaper,
  BookOpen,
  Users,
  Calendar,
  Sparkles,
  Award,
  LogIn,
  MapPin,
  Clock,
  Phone,
  Mail,
} from "lucide-react";
import { useT } from "@/shared/lib/i18n/client";
import type { TenantContact } from "@/features/identity";

export interface PortalFooterProps {
  brandLogoUrl?: string | null;
  brandName?: string | null;
  brandTagline?: string | null;
  contact?: TenantContact | null;
}

export function PortalFooter({
  brandLogoUrl,
  brandName,
  brandTagline,
  contact,
}: PortalFooterProps) {
  const t = useT();
  const currentYear = new Date().getFullYear();

  const displayName = brandName || t("home.hero.title");
  const displayTagline = brandTagline || t("home.hero.badge");

  return (
    <footer className="relative bg-[var(--glass)] backdrop-blur-xl border-t border-[var(--glass-border)] shadow-xs mt-16 text-[var(--text)] transition-colors overflow-hidden">
      {/* Decorative top gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--brand)] to-transparent opacity-75" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Col 1 & 2: Brand Information & Mission */}
          <div className="lg:col-span-2 flex flex-col items-start gap-3.5">
            <Link href="/portal" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-[var(--r-sm)] bg-[var(--brand)] text-[var(--on-brand)] flex items-center justify-center font-bold text-xl overflow-hidden shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                {brandLogoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={brandLogoUrl}
                    alt={displayName}
                    className="w-full h-full object-contain p-0.5 rounded-[inherit]"
                  />
                ) : (
                  <GraduationCap className="w-5 h-5" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-base sm:text-lg tracking-tight leading-tight truncate">
                  {displayName}
                </h3>
                <span className="text-xs text-[var(--text-muted)] block truncate">
                  {displayTagline}
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-[var(--text-2)] leading-relaxed max-w-sm mt-1">
              {t("home.hero.subtitle")}
            </p>

            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--glass-strong)] border border-[var(--glass-border)] text-[var(--text-2)] shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate">{t("portal.brand.title")}</span>
            </div>
          </div>

          {/* Col 3: Quick Navigation Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-4">
              {t("portal.footer.quickLinks")}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/portal"
                  className="text-[var(--text-2)] hover:text-[var(--brand-ink)] hover:translate-x-0.5 transition-all inline-flex items-center gap-2"
                >
                  <Home className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <span>{t("portal.nav.home")}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/portal/news"
                  className="text-[var(--text-2)] hover:text-[var(--brand-ink)] hover:translate-x-0.5 transition-all inline-flex items-center gap-2"
                >
                  <Newspaper className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <span>{t("portal.nav.news")}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/portal/curriculum"
                  className="text-[var(--text-2)] hover:text-[var(--brand-ink)] hover:translate-x-0.5 transition-all inline-flex items-center gap-2"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <span>{t("portal.nav.curriculum")}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/portal/staff"
                  className="text-[var(--text-2)] hover:text-[var(--brand-ink)] hover:translate-x-0.5 transition-all inline-flex items-center gap-2"
                >
                  <Users className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <span>{t("portal.nav.staff")}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/portal/contact"
                  className="text-[var(--text-2)] hover:text-[var(--brand-ink)] hover:translate-x-0.5 transition-all inline-flex items-center gap-2"
                >
                  <MapPin className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <span>{t("portal.nav.contact")}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Digital Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-4">
              {t("portal.footer.services")}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/portal/reservations"
                  className="text-[var(--text-2)] hover:text-[var(--brand-ink)] hover:translate-x-0.5 transition-all inline-flex items-center gap-2"
                >
                  <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <span>{t("portal.nav.reservations")}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/portal/meditation"
                  className="text-[var(--text-2)] hover:text-[var(--brand-ink)] hover:translate-x-0.5 transition-all inline-flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <span>{t("portal.nav.meditation")}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/portal/alumni"
                  className="text-[var(--text-2)] hover:text-[var(--brand-ink)] hover:translate-x-0.5 transition-all inline-flex items-center gap-2"
                >
                  <Award className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <span>{t("portal.nav.alumni")}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-[var(--text-2)] hover:text-[var(--brand-ink)] hover:translate-x-0.5 transition-all inline-flex items-center gap-2"
                >
                  <LogIn className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <span>{t("portal.nav.adminConsole")}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Contact & Location */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-4">
              {t("portal.footer.contact")}
            </h4>
            <div className="space-y-3 text-xs text-[var(--text-2)]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {contact?.mapUrl ? (
                    <a
                      href={contact.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors hover:underline"
                    >
                      {contact.addressTh || contact.addressEn || t("home.contact.address")}
                    </a>
                  ) : (
                    contact?.addressTh || contact?.addressEn || t("home.contact.address")
                  )}
                </span>
              </div>
              {contact?.phone && (
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <a href={`tel:${contact.phone}`} className="hover:text-primary transition-colors">
                    {contact.phone}
                  </a>
                </div>
              )}
              {contact?.email && (
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <a href={`mailto:${contact.email}`} className="hover:text-primary transition-colors truncate">
                    {contact.email}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-primary shrink-0" />
                <span>{contact?.hoursTh || contact?.hoursEn || t("home.contact.hours")}</span>
              </div>
              <div className="pt-1.5">
                <Link
                  href="/portal/contact"
                  className="inline-flex items-center gap-1 font-semibold text-primary hover:underline text-[11px]"
                >
                  <span>{t("portal.contact.title")}</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Footer Bottom Bar */}
        <div className="border-t border-[var(--glass-border)] pt-6 mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span>
              © {currentYear} {displayName}. {t("portal.footer.rights")}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Operational Status Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--glass-strong)] border border-[var(--glass-border)] font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{t("portal.footer.operational")}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
