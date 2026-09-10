import Link from "next/link";
import { GraduationCap, LogIn, Newspaper, BookOpen, Users, Calendar, Sparkles, Award } from "lucide-react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { getLocale } from "@/shared/lib/i18n/server";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Banner */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/portal/news" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <span className="font-bold text-base sm:text-lg tracking-tight block leading-tight">
                {locale === "en" ? "Faculty Platform" : "แพลตฟอร์มคณะวิชาการ"}
              </span>
              <span className="text-xs text-muted-foreground block">
                {locale === "en" ? "Academic & Research Portal" : "ศูนย์ข่าวสารและบริการการศึกษา"}
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              href="/portal/news"
              className="px-3 py-1.5 rounded-lg text-primary bg-primary/5 hover:bg-primary/10 transition-colors flex items-center gap-1.5"
            >
              <Newspaper className="h-4 w-4" />
              {locale === "en" ? "News & PR" : "ข่าวประชาสัมพันธ์"}
            </Link>
            <Link
              href="/portal/curriculum"
              className="px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              <BookOpen className="h-3.5 w-3.5" />
              {locale === "en" ? "Programs" : "หลักสูตร"}
            </Link>
            <Link
              href="/portal/staff"
              className="px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              <Users className="h-3.5 w-3.5" />
              {locale === "en" ? "Faculty" : "บุคลากร"}
            </Link>
            <Link
              href="/portal/reservations"
              className="px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              <Calendar className="h-3.5 w-3.5" />
              {locale === "en" ? "Reservations" : "จองห้องและยานพาหนะ"}
            </Link>
            <Link
              href="/portal/meditation"
              className="px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {locale === "en" ? "Meditation" : "วิปัสสนาธุระ"}
            </Link>
            <Link
              href="/portal/alumni"
              className="px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              <Award className="h-3.5 w-3.5" />
              {locale === "en" ? "Alumni" : "ศิษย์เก่า"}
            </Link>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher className="rounded-lg border border-slate-200 dark:border-slate-800" />
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90 transition-opacity"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{locale === "en" ? "Admin Console" : "ระบบหลังบ้าน"}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-10 mt-12 text-sm text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">
              {locale === "en" ? "Faculty Academic Portal" : "เว็บไซต์คณะและระบบสารสนเทศ"}
            </span>
          </div>
          <p className="text-xs">
            © {new Date().getFullYear()} Faculty Management System. Built with VibeCore Framework.
          </p>
        </div>
      </footer>
    </div>
  );
}
