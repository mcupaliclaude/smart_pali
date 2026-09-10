import Link from "next/link";
import { BookOpen, Search, Clock, Award, ChevronRight, Building2, Layers } from "lucide-react";
import { getLocale } from "@/shared/lib/i18n/server";
import { listPublicPrograms } from "@/features/curriculum/server";
import { listStaffDepartments } from "@/features/staff/server";
import { prisma } from "@/shared/lib/infra/prisma";

interface CurriculumPortalPageProps {
  searchParams: Promise<{ level?: string; dept?: string; q?: string }>;
}

export default async function CurriculumPortalPage({ searchParams }: CurriculumPortalPageProps) {
  const locale = await getLocale();
  const params = await searchParams;
  const currentLevel = params.level;
  const currentDept = params.dept;
  const searchQuery = params.q;

  // Get demo tenant ID
  const demoTenant = await prisma.tenant.findUnique({
    where: { code: "DEMO" },
    select: { id: true },
  });
  const tenantId = demoTenant?.id ?? "";

  const [programs, departments] = await Promise.all([
    listPublicPrograms(tenantId, {
      level: currentLevel,
      departmentCode: currentDept,
      search: searchQuery,
    }),
    listStaffDepartments(tenantId),
  ]);

  return (
    <div className="space-y-10">
      {/* Hero Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
          <BookOpen className="h-3.5 w-3.5" />
          {locale === "en" ? "Academic Programs" : "หลักสูตรการศึกษา"}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          {locale === "en" ? "Curriculum & Degrees" : "หลักสูตรระดับปริญญาและประกาศนียบัตร"}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          {locale === "en"
            ? "Explore undergraduate, graduate, and professional programs designed for academic and spiritual excellence."
            : "หลักสูตรคุณภาพมาตรฐานระดับสากล บูรณาการพุทธธรรมโบราณและเทคโนโลยีร่วมสมัย"}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4 border-b border-border pb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Level Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <Link
              href={`/portal/curriculum${currentDept ? `?dept=${currentDept}` : ""}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                !currentLevel
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {locale === "en" ? "All Levels" : "ทุกระดับการศึกษา"}
            </Link>
            <Link
              href={`/portal/curriculum?level=BACHELOR${currentDept ? `&dept=${currentDept}` : ""}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                currentLevel === "BACHELOR"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {locale === "en" ? "Bachelor's" : "ปริญญาตรี"}
            </Link>
            <Link
              href={`/portal/curriculum?level=MASTER${currentDept ? `&dept=${currentDept}` : ""}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                currentLevel === "MASTER"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {locale === "en" ? "Master's" : "ปริญญาโท"}
            </Link>
            <Link
              href={`/portal/curriculum?level=CERTIFICATE${currentDept ? `&dept=${currentDept}` : ""}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                currentLevel === "CERTIFICATE"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {locale === "en" ? "Certificate" : "ประกาศนียบัตร"}
            </Link>
          </div>

          {/* Search Bar */}
          <form method="GET" action="/portal/curriculum" className="w-full md:w-72 flex items-center relative">
            {currentLevel && <input type="hidden" name="level" value={currentLevel} />}
            {currentDept && <input type="hidden" name="dept" value={currentDept} />}
            <Search className="h-4 w-4 absolute left-3 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              name="q"
              defaultValue={searchQuery ?? ""}
              placeholder={locale === "en" ? "Search programs..." : "ค้นหาหลักสูตร..."}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </form>
        </div>

        {/* Department Filters */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1 scrollbar-none">
          <span className="text-muted-foreground font-medium shrink-0">
            {locale === "en" ? "Department:" : "ภาควิชา:"}
          </span>
          <Link
            href={`/portal/curriculum${currentLevel ? `?level=${currentLevel}` : ""}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors ${
              !currentDept ? "bg-slate-200 dark:bg-slate-800 font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {locale === "en" ? "All" : "ทุกภาควิชา"}
          </Link>
          {departments.map((d) => {
            const active = currentDept === d.code;
            return (
              <Link
                key={d.id}
                href={`/portal/curriculum?dept=${d.code}${currentLevel ? `&level=${currentLevel}` : ""}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`}
                className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors ${
                  active ? "bg-slate-200 dark:bg-slate-800 font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {locale === "en" ? d.nameEn : d.nameTh}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Program Grid */}
      {programs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <div
              key={program.id}
              className="group rounded-xl border border-border/60 bg-card p-6 flex flex-col justify-between transition-all hover:shadow-md hover:border-primary/40"
            >
              <div className="space-y-4">
                {/* Header: Code & Level */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground">
                    {program.code}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      program.level === "BACHELOR"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                        : program.level === "MASTER"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : program.level === "DOCTORATE"
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    }`}
                  >
                    {program.level === "BACHELOR"
                      ? locale === "en"
                        ? "Bachelor"
                        : "ปริญญาตรี"
                      : program.level === "MASTER"
                      ? locale === "en"
                        ? "Master"
                        : "ปริญญาโท"
                      : program.level === "DOCTORATE"
                      ? locale === "en"
                        ? "Doctorate"
                        : "ปริญญาเอก"
                      : locale === "en"
                      ? "Certificate"
                      : "ประกาศนียบัตร"}
                  </span>
                </div>

                {/* Title and Degree */}
                <div>
                  <h3 className="font-bold text-base text-foreground leading-snug group-hover:text-primary transition-colors">
                    <Link href={`/portal/curriculum/${program.id}`}>
                      {locale === "en" ? program.nameEn : program.nameTh}
                    </Link>
                  </h3>
                  <p className="text-xs text-primary font-medium mt-1">
                    {locale === "en" ? program.degreeEn : program.degreeTh}
                  </p>
                </div>

                {/* Meta details */}
                <div className="space-y-1.5 text-xs text-muted-foreground pt-1 border-t border-border/40">
                  <div className="flex items-center gap-1.5 text-foreground">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">
                      {locale === "en" ? program.departmentNameEn : program.departmentNameTh}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground pt-1">
                    <span className="flex items-center gap-1">
                      <Award className="h-3.5 w-3.5" />
                      {program.totalCredits} {locale === "en" ? "credits" : "หน่วยกิต"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {program.durationYears} {locale === "en" ? "years" : "ปี"}
                    </span>
                  </div>
                </div>

                {/* Excerpt */}
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {locale === "en" ? program.descriptionEn : program.descriptionTh}
                </p>
              </div>

              {/* Footer */}
              <div className="pt-4 mt-4 border-t border-border/50 flex items-center justify-between text-xs">
                <span className="text-[11px] text-muted-foreground truncate max-w-[65%]">
                  {locale === "en"
                    ? program.tuitionFeeNoteEn || "Contact for tuition details"
                    : program.tuitionFeeNoteTh || "สอบถามค่าธรรมเนียม"}
                </span>
                <Link
                  href={`/portal/curriculum/${program.id}`}
                  className="font-semibold text-primary hover:underline inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform"
                >
                  <span>{locale === "en" ? "View Details" : "ดูหลักสูตร"}</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <Layers className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="text-base font-semibold">
            {locale === "en" ? "No Programs Found" : "ไม่พบข้อมูลหลักสูตร"}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {locale === "en"
              ? "Try selecting a different degree level or department."
              : "ลองเปลี่ยนระดับการศึกษาหรือเลือกภาควิชาอื่น"}
          </p>
        </div>
      )}
    </div>
  );
}
