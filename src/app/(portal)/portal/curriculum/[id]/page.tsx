import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Award,
  Clock,
  Building2,
  CheckCircle2,
  Briefcase,
  FileText,
  ExternalLink,
  GraduationCap,
  UserCheck,
} from "lucide-react";
import { getLocale } from "@/shared/lib/i18n/server";
import { getProgramById, type CurriculumCourseDto } from "@/features/curriculum/server";
import { prisma } from "@/shared/lib/infra/prisma";

interface ProgramDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProgramDetailPage({ params }: ProgramDetailPageProps) {
  const locale = await getLocale();
  const { id } = await params;

  // Get demo tenant ID
  const demoTenant = await prisma.tenant.findUnique({
    where: { code: "DEMO" },
    select: { id: true },
  });
  const tenantId = demoTenant?.id ?? "";

  const program = await getProgramById(tenantId, id);
  if (!program) {
    notFound();
  }

  // Group courses by Year and Semester
  const coursesByPeriod: Record<string, CurriculumCourseDto[]> = {};
  for (const c of program.courses || []) {
    const key = `Year ${c.yearLevel} / Semester ${c.semester}`;
    if (!coursesByPeriod[key]) {
      coursesByPeriod[key] = [];
    }
    coursesByPeriod[key].push(c);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/portal/curriculum"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {locale === "en" ? "Back to All Programs" : "กลับหน้ารวมหลักสูตร"}
        </Link>
      </div>

      {/* Hero Header Card */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-muted text-foreground">
              {program.code}
            </span>
            <span
              className={`px-2.5 py-1 rounded text-xs font-semibold ${
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
                  ? "Bachelor's Degree"
                  : "หลักสูตรระดับปริญญาตรี"
                : program.level === "MASTER"
                ? locale === "en"
                  ? "Master's Degree"
                  : "หลักสูตรระดับปริญญาโท"
                : program.level === "DOCTORATE"
                ? locale === "en"
                  ? "Doctoral Degree"
                  : "หลักสูตรระดับปริญญาเอก"
                : locale === "en"
                ? "Certificate Program"
                : "หลักสูตรประกาศนียบัตร"}
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              {locale === "en" ? program.departmentNameEn : program.departmentNameTh}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight leading-snug">
            {locale === "en" ? program.nameEn : program.nameTh}
          </h1>
          <p className="text-sm font-semibold text-primary">
            {locale === "en" ? program.degreeEn : program.degreeTh}
          </p>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border/50">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Award className="h-3.5 w-3.5" />
              {locale === "en" ? "Total Credits" : "จำนวนหน่วยกิตรวม"}
            </span>
            <p className="text-lg font-bold text-foreground">
              {program.totalCredits} {locale === "en" ? "credits" : "หน่วยกิต"}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {locale === "en" ? "Duration" : "ระยะเวลาศึกษา"}
            </span>
            <p className="text-lg font-bold text-foreground">
              {program.durationYears} {locale === "en" ? "Years" : "ปี"}
            </p>
          </div>

          {(program.coordinatorNameTh || program.coordinatorNameEn) && (
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <UserCheck className="h-3.5 w-3.5" />
                {locale === "en" ? "Coordinator" : "อาจารย์ผู้รับผิดชอบ"}
              </span>
              <p className="text-xs font-semibold text-foreground leading-snug">
                {locale === "en" ? program.coordinatorNameEn || program.coordinatorNameTh : program.coordinatorNameTh}
              </p>
            </div>
          )}

          <div className="space-y-1 col-span-2 sm:col-span-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <GraduationCap className="h-3.5 w-3.5" />
              {locale === "en" ? "Tuition & Fees" : "ค่าธรรมเนียมการศึกษา"}
            </span>
            <p className="text-xs font-medium text-foreground leading-snug">
              {locale === "en"
                ? program.tuitionFeeNoteEn || "Contact faculty office"
                : program.tuitionFeeNoteTh || "ติดต่อสอบถามงานทะเบียน"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs shadow hover:bg-primary/90 transition-colors"
          >
            <GraduationCap className="h-4 w-4" />
            <span>{locale === "en" ? "Apply for Admission" : "สมัครเข้าศึกษา"}</span>
          </button>
          {program.brochureUrl && (
            <a
              href={program.brochureUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-border bg-background hover:bg-muted font-medium text-xs transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>{locale === "en" ? "Download Brochure (PDF)" : "ดาวน์โหลดแผ่นพับ"}</span>
            </a>
          )}
        </div>
      </div>

      {/* Program Description */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-2 text-foreground font-bold text-base border-b border-border pb-3">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2>{locale === "en" ? "Program Overview" : "ข้อมูลภาพรวมและจุดเด่นของหลักสูตร"}</h2>
        </div>
        <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line pt-2">
          {locale === "en" ? program.descriptionEn : program.descriptionTh}
        </div>
      </div>

      {/* Requirements & Careers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Admission Requirements */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-foreground font-bold text-base border-b border-border pb-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <h2>{locale === "en" ? "Admission Requirements" : "คุณสมบัติของผู้เข้าศึกษา"}</h2>
          </div>
          {program.admissionRequirements && program.admissionRequirements.length > 0 ? (
            <ul className="space-y-2.5">
              {program.admissionRequirements.map((req, index) => (
                <li key={index} className="flex items-start gap-2.5 text-xs text-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              {locale === "en" ? "No specific requirements listed." : "ไม่ได้ระบุคุณสมบัติเฉพาะ"}
            </p>
          )}
        </div>

        {/* Career Opportunities */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-foreground font-bold text-base border-b border-border pb-3">
            <Briefcase className="h-5 w-5 text-indigo-600" />
            <h2>{locale === "en" ? "Career Opportunities" : "อาชีพที่รองรับหลังสำเร็จการศึกษา"}</h2>
          </div>
          {program.careerProspects && program.careerProspects.length > 0 ? (
            <ul className="space-y-2.5">
              {program.careerProspects.map((career, index) => (
                <li key={index} className="flex items-start gap-2.5 text-xs text-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                  <span>{career}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              {locale === "en" ? "No careers listed." : "ไม่ได้ระบุสายงาน"}
            </p>
          )}
        </div>
      </div>

      {/* Courses List */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2 text-foreground font-bold text-base">
            <FileText className="h-5 w-5 text-primary" />
            <h2>{locale === "en" ? "Curriculum Course Structure" : "แผนการศึกษาและรายวิชา"}</h2>
          </div>
          <span className="text-xs text-muted-foreground">
            {program.courses?.length || 0} {locale === "en" ? "courses" : "รายวิชา"}
          </span>
        </div>

        {Object.keys(coursesByPeriod).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(coursesByPeriod).map(([period, courses]) => (
              <div key={period} className="space-y-3">
                <h3 className="text-xs font-bold text-primary tracking-wide uppercase">
                  {period}
                </h3>
                <div className="divide-y divide-border/60 rounded-xl border border-border/60 overflow-hidden">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      className="p-3.5 bg-card hover:bg-muted/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-muted text-foreground">
                            {course.code}
                          </span>
                          <span className="font-semibold text-sm text-foreground">
                            {locale === "en" ? course.nameEn : course.nameTh}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {locale === "en" ? course.nameTh : course.nameEn}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                        <span className="font-mono font-semibold text-foreground px-2 py-0.5 rounded bg-primary/10 text-primary">
                          {course.credits} {locale === "en" ? "credits" : "น.ก."}
                        </span>
                        <span className="text-[11px]">
                          ({course.lectureHours}-{course.labHours}-{course.selfStudyHours})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-muted-foreground italic">
            {locale === "en"
              ? "Course list is currently being prepared."
              : "อยู่ระหว่างการจัดทำรายละเอียดแผนการเรียนรายวิชา"}
          </div>
        )}
      </div>
    </div>
  );
}
