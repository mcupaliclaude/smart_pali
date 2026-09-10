import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Award,
  Briefcase,
} from "lucide-react";
import { getLocale } from "@/shared/lib/i18n/server";
import { getStaffProfileById } from "@/features/staff/server";
import { prisma } from "@/shared/lib/infra/prisma";

interface StaffDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function StaffDetailPage({ params }: StaffDetailPageProps) {
  const locale = await getLocale();
  const { id } = await params;

  // Get demo tenant ID
  const demoTenant = await prisma.tenant.findUnique({
    where: { code: "DEMO" },
    select: { id: true },
  });
  const tenantId = demoTenant?.id ?? "";

  const staff = await getStaffProfileById(tenantId, id);
  if (!staff) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/portal/staff"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {locale === "en" ? "Back to Faculty Directory" : "กลับหน้าทำเนียบคณาจารย์และบุคลากร"}
        </Link>
      </div>

      {/* Main Profile Header Card */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
          {/* Avatar */}
          {staff.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={staff.avatarUrl}
              alt={staff.fullNameTh}
              className="h-32 w-32 sm:h-40 sm:w-40 rounded-2xl object-cover border-4 border-background shadow-md shrink-0"
            />
          ) : (
            <div className="h-32 w-32 sm:h-40 sm:w-40 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-4xl shadow-md shrink-0">
              {staff.firstNameTh[0] || "U"}
            </div>
          )}

          {/* Core Info */}
          <div className="flex-1 text-center sm:text-left space-y-3">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-primary/10 text-primary">
                {locale === "en" ? staff.departmentNameEn : staff.departmentNameTh}
              </span>
              <span
                className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                  staff.staffType === "ACADEMIC"
                    ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                }`}
              >
                {staff.staffType === "ACADEMIC"
                  ? locale === "en"
                    ? "Academic Faculty"
                    : "สายวิชาการ (คณาจารย์)"
                  : locale === "en"
                  ? "Support Staff"
                  : "สายสนับสนุน (เจ้าหน้าที่)"}
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {locale === "en" ? staff.fullNameEn : staff.fullNameTh}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {locale === "en" ? staff.fullNameTh : staff.fullNameEn}
              </p>
            </div>

            {(staff.administrativePositionTh || staff.administrativePositionEn) && (
              <div className="inline-flex items-center gap-1.5 text-sm font-medium text-primary bg-primary/5 px-3 py-1 rounded-lg border border-primary/15">
                <Briefcase className="h-4 w-4" />
                <span>
                  {locale === "en"
                    ? staff.administrativePositionEn || staff.administrativePositionTh
                    : staff.administrativePositionTh || staff.administrativePositionEn}
                </span>
              </div>
            )}

            {/* Direct Contact Buttons */}
            <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs">
              <a
                href={`mailto:${staff.email}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted font-medium transition-colors"
              >
                <Mail className="h-3.5 w-3.5 text-primary" />
                <span>{staff.email}</span>
              </a>
              {staff.phone && (
                <a
                  href={`tel:${staff.phone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted font-medium transition-colors"
                >
                  <Phone className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{staff.phone}</span>
                </a>
              )}
              {staff.roomNo && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted/40 font-medium text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-amber-600" />
                  <span>
                    {locale === "en" ? "Office Room" : "ห้องทำงาน"}: {staff.roomNo}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Education Background */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-foreground font-bold text-base border-b border-border pb-3">
            <GraduationCap className="h-5 w-5 text-primary" />
            <h2>{locale === "en" ? "Education Background" : "ประวัติการศึกษา"}</h2>
          </div>
          {staff.education && staff.education.length > 0 ? (
            <ul className="space-y-3">
              {staff.education.map((edu, index) => (
                <li key={index} className="flex items-start gap-3 text-sm text-foreground">
                  <span className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span>{edu}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              {locale === "en" ? "No education history specified." : "ไม่ได้ระบุข้อมูลการศึกษา"}
            </p>
          )}
        </div>

        {/* Research Interests & Expertise */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-foreground font-bold text-base border-b border-border pb-3">
            <Award className="h-5 w-5 text-primary" />
            <h2>{locale === "en" ? "Research Interests & Expertise" : "ความเชี่ยวชาญและงานวิจัย"}</h2>
          </div>
          {staff.researchInterests && staff.researchInterests.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {staff.researchInterests.map((interest, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 rounded-lg bg-muted text-foreground text-xs font-medium border border-border/50"
                >
                  {interest}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              {locale === "en" ? "No research interests listed." : "ไม่ได้ระบุความเชี่ยวชาญ"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
