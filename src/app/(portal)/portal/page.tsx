import Link from "next/link";
import {
  BookOpen,
  Calendar,
  Users,
  Sparkles,
  Award,
  ArrowRight,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  Quote,
  Newspaper,
  Compass,
  GraduationCap,
} from "lucide-react";
import { getLocale, getT } from "@/i18n/server";
import { formatDate } from "@/shared/lib/format";
import { resolvePublicTenantId } from "@/shared/lib/tenant";
import { listPublishedNews } from "@/features/news/server";
import { listPublicPrograms } from "@/features/curriculum/server";
import { listPublicCourses } from "@/features/meditation/server";
import { listSpotlightAlumni } from "@/features/alumni/server";

export default async function PortalHomePage() {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const tenantId = await resolvePublicTenantId();

  // Parallel server fetch of featured data across modules
  const [newsList, programs, meditationCourses, spotlightAlumni] = await Promise.all([
    listPublishedNews(tenantId, { limit: 3 }).catch(() => []),
    listPublicPrograms(tenantId).catch(() => []),
    listPublicCourses(tenantId).catch(() => []),
    listSpotlightAlumni(tenantId).catch(() => []),
  ]);

  // Take top 3 programs and top 2 upcoming courses
  const topPrograms = programs.slice(0, 3);
  const openCourses = meditationCourses
    .filter((c) => c.status === "OPEN" || c.status === "DRAFT")
    .slice(0, 2);

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/20 p-8 sm:p-12 lg:p-16">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-primary/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/25">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t("home.hero.badge")}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            {t("home.hero.title")}
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {t("home.hero.subtitle")}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/portal/curriculum"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 shadow-xs transition-all"
            >
              <BookOpen className="h-4 w-4" />
              <span>{t("home.hero.btnPrograms")}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/portal/meditation"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-white dark:bg-slate-900 text-foreground hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span>{t("home.hero.btnMeditation")}</span>
            </Link>

            <Link
              href="/portal/news"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Newspaper className="h-4 w-4" />
              <span>{t("home.news.viewAll")}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. DIGITAL SERVICES TILES */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {t("home.services.title")}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("home.services.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Link
            href="/portal/curriculum"
            className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                {t("portal.nav.curriculum")}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {t("home.services.curriculum")}
              </p>
            </div>
            <div className="flex items-center text-xs font-semibold text-primary gap-1 pt-4 mt-auto">
              <span>{locale === "en" ? "Explore" : "เข้าใช้งาน"}</span>
              <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/portal/staff"
            className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                {t("portal.nav.staff")}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {t("home.services.staff")}
              </p>
            </div>
            <div className="flex items-center text-xs font-semibold text-primary gap-1 pt-4 mt-auto">
              <span>{locale === "en" ? "Explore" : "เข้าใช้งาน"}</span>
              <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/portal/reservations"
            className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                {t("portal.nav.reservations")}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {t("home.services.reservations")}
              </p>
            </div>
            <div className="flex items-center text-xs font-semibold text-primary gap-1 pt-4 mt-auto">
              <span>{locale === "en" ? "Explore" : "เข้าใช้งาน"}</span>
              <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/portal/meditation"
            className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                {t("portal.nav.meditation")}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {t("home.services.meditation")}
              </p>
            </div>
            <div className="flex items-center text-xs font-semibold text-primary gap-1 pt-4 mt-auto">
              <span>{locale === "en" ? "Explore" : "เข้าใช้งาน"}</span>
              <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/portal/alumni"
            className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Award className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                {t("portal.nav.alumni")}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {t("home.services.alumni")}
              </p>
            </div>
            <div className="flex items-center text-xs font-semibold text-primary gap-1 pt-4 mt-auto">
              <span>{locale === "en" ? "Explore" : "เข้าใช้งาน"}</span>
              <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* 3. LATEST NEWS & ANNOUNCEMENTS */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {t("home.news.title")}
            </h2>
          </div>
          <Link
            href="/portal/news"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:underline"
          >
            <span>{t("home.news.viewAll")}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {newsList.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm">
            {locale === "en" ? "No published news yet." : "ยังไม่มีข่าวประชาสัมพันธ์ในขณะนี้"}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {newsList.map((article) => {
              const title = locale === "en" && article.titleEn ? article.titleEn : article.titleTh;
              const excerpt = locale === "en" && article.excerptEn ? article.excerptEn : article.excerptTh;
              const dateStr = formatDate(new Date(article.publishedAt || article.createdAt), locale);

              return (
                <Link
                  key={article.id}
                  href={`/portal/news/${article.slug}`}
                  className="group flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="aspect-video w-full bg-slate-100 dark:bg-slate-800 relative overflow-hidden flex items-center justify-center">
                    {article.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={article.coverImageUrl}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary/40">
                        <Newspaper className="h-10 w-10" />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs text-foreground shadow-xs">
                      {locale === "en" ? article.categoryNameEn : article.categoryNameTh}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <span className="text-xs text-muted-foreground block">{dateStr}</span>
                      <h3 className="font-bold text-base text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                        {title}
                      </h3>
                      {excerpt && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {excerpt}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 flex items-center text-xs font-semibold text-primary gap-1">
                      <span>{locale === "en" ? "Read more" : "อ่านรายละเอียด"}</span>
                      <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. FEATURED ACADEMIC PROGRAMS */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {t("home.programs.title")}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t("home.programs.subtitle")}
            </p>
          </div>
          <Link
            href="/portal/curriculum"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            <span>{t("home.programs.viewAll")}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topPrograms.map((prog) => {
            const name = locale === "en" && prog.nameEn ? prog.nameEn : prog.nameTh;
            const desc = locale === "en" && prog.descriptionEn ? prog.descriptionEn : prog.descriptionTh;

            return (
              <Link
                key={prog.id}
                href={`/portal/curriculum/${prog.id}`}
                className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
                      {prog.level}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {prog.code}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                    {name}
                  </h3>

                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {desc}
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span>{prog.totalCredits} {locale === "en" ? "Credits" : "หน่วยกิต"}</span>
                    <span>•</span>
                    <span>{prog.durationYears} {locale === "en" ? "Years" : "ปี"}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 5. UPCOMING MEDITATION RETREATS */}
      {openCourses.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                {t("home.meditation.title")}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t("home.meditation.subtitle")}
              </p>
            </div>
            <Link
              href="/portal/meditation"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:underline"
            >
              <span>{t("home.meditation.viewAll")}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {openCourses.map((course) => {
              const title = locale === "en" && course.titleEn ? course.titleEn : course.titleTh;
              const dateRange = `${formatDate(new Date(course.startDate), locale)} - ${formatDate(new Date(course.endDate), locale)}`;
              const filledRatio = Math.min(100, Math.round((course.confirmedCount / (course.maxParticipants || 1)) * 100));

              return (
                <div
                  key={course.id}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                        {course.format === "RESIDENTIAL" ? (locale === "en" ? "Residential" : "พักค้างคืน") : (locale === "en" ? "One Day" : "ไป-กลับ")}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {course.level}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-foreground leading-snug">
                      {title}
                    </h3>

                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        <span>{dateRange}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        <span>{course.location}</span>
                      </div>
                    </div>

                    {/* Progress seats */}
                    <div className="pt-2 space-y-1.5">
                      <div className="flex justify-between text-xs font-medium text-muted-foreground">
                        <span>{locale === "en" ? "Registered Seats" : "ที่นั่งที่ลงทะเบียนแล้ว"}</span>
                        <span className="font-semibold text-foreground">
                          {course.confirmedCount} / {course.maxParticipants} ({filledRatio}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${filledRatio}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/portal/meditation/${course.id}`}
                    className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                  >
                    <span>{t("home.meditation.apply")}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 6. ALUMNI SPOTLIGHT */}
      {spotlightAlumni.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                {t("home.alumni.title")}
              </h2>
            </div>
            <Link
              href="/portal/alumni"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:underline"
            >
              <span>{t("home.alumni.viewAll")}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {spotlightAlumni.slice(0, 2).map((alumnus) => {
              const quote = locale === "en" && alumnus.spotlightQuoteEn ? alumnus.spotlightQuoteEn : alumnus.spotlightQuoteTh;
              const name = locale === "en" && alumnus.fullNameEn ? alumnus.fullNameEn : alumnus.fullNameTh;

              return (
                <div
                  key={alumnus.id}
                  className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/5 via-amber-500/0 to-transparent border border-amber-500/20 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <Quote className="h-6 w-6 text-amber-500/50" />
                    {quote && (
                      <p className="text-sm italic text-foreground leading-relaxed">
                        &quot;{quote}&quot;
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-amber-500/15">
                    <div className="w-11 h-11 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {alumnus.jobTitle || (locale === "en" ? "Alumnus" : "ศิษย์เก่า")} • พ.ศ. {alumnus.graduationYearBe}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 7. FACULTY IN NUMBERS (STATISTICS) */}
      <section className="p-8 sm:p-12 rounded-3xl bg-slate-900 text-white dark:bg-slate-900 border border-slate-800 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t("home.stats.title")}
          </h2>
          <p className="text-sm text-slate-400">
            {locale === "en"
              ? "Excellence in academic research, scriptural studies, and meditation training."
              : "ความเป็นเลิศด้านการวิจัยทางวิชาการ การศึกษาพระคัมภีร์ และการปฏิบัติวิปัสสนาธุระ"}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-primary">50+</span>
            <p className="text-xs sm:text-sm text-slate-300">{t("home.stats.faculty")}</p>
          </div>
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-primary">12</span>
            <p className="text-xs sm:text-sm text-slate-300">{t("home.stats.programs")}</p>
          </div>
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-primary">1,500+</span>
            <p className="text-xs sm:text-sm text-slate-300">{t("home.stats.trainees")}</p>
          </div>
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-primary">10,000+</span>
            <p className="text-xs sm:text-sm text-slate-300">{t("home.stats.alumni")}</p>
          </div>
        </div>
      </section>

      {/* 8. CAMPUS CONTACT & LOCATION */}
      <section className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold bg-primary/10 text-primary">
            <Compass className="h-3.5 w-3.5" />
            <span>{t("home.contact.title")}</span>
          </div>

          <h3 className="text-2xl font-bold text-foreground">
            {locale === "en" ? "Visit Our Faculty & Retreat Center" : "สำนักงานคณบดีและศูนย์วิปัสสนาธุระ"}
          </h3>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-primary mt-1 shrink-0" />
              <span>{t("home.contact.address")}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-primary shrink-0" />
              <span>{t("home.contact.hours")}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-primary shrink-0" />
              <span>035-248-000 ต่อ 8100-8105</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-primary shrink-0" />
              <span>buddhism@mcu.ac.th</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
          <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>{locale === "en" ? "Online Consultation & Inquiries" : "ช่องทางสอบถามข้อมูลการศึกษาและบริการ"}</span>
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {locale === "en"
              ? "For admissions, retreat reservations, and general inquiries, you can reach out via online portal or visit in person during office hours."
              : "สำหรับผู้สนใจสมัครเข้าศึกษาต่อ การจองห้องปฏิบัติธรรม หรือติดต่อราชการ สามารถติดต่อผ่านระบบออนไลน์หรือเดินทางมา ณ สำนักงานคณะในวันและเวลาราชการ"}
          </p>
          <div className="pt-2 flex flex-wrap gap-2">
            <Link
              href="/portal/reservations"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-foreground hover:border-primary/50 transition-colors"
            >
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span>{t("portal.nav.reservations")}</span>
            </Link>
            <Link
              href="/portal/meditation"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-foreground hover:border-primary/50 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>{t("portal.nav.meditation")}</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
