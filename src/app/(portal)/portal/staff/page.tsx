import Link from "next/link";
import { Users, Search, Mail, Phone, MapPin, GraduationCap, ChevronRight, BookOpen } from "lucide-react";
import { getLocale } from "@/shared/lib/i18n/server";
import { listPublicStaff, listStaffDepartments, type StaffProfileDto } from "@/features/staff/server";
import { prisma } from "@/shared/lib/infra/prisma";

interface StaffPortalPageProps {
  searchParams: Promise<{ dept?: string; type?: string; q?: string }>;
}

export default async function StaffPortalPage({ searchParams }: StaffPortalPageProps) {
  const locale = await getLocale();
  const params = await searchParams;
  const currentDept = params.dept;
  const currentType = params.type;
  const searchQuery = params.q;

  // Get demo tenant ID
  const demoTenant = await prisma.tenant.findUnique({
    where: { code: "DEMO" },
    select: { id: true },
  });
  const tenantId = demoTenant?.id ?? "";

  const [staffList, departments] = await Promise.all([
    listPublicStaff(tenantId, {
      departmentCode: currentDept,
      staffType: currentType,
      search: searchQuery,
    }),
    listStaffDepartments(tenantId),
  ]);

  // Separate executive / leadership members from general members if no specific filter
  const isFiltering = !!(currentDept || currentType || searchQuery);
  const leadershipStaff = !isFiltering
    ? staffList.filter((s) => s.administrativePositionTh || s.administrativePositionEn)
    : [];
  const otherStaff = !isFiltering
    ? staffList.filter((s) => !leadershipStaff.some((l) => l.id === s.id))
    : staffList;

  return (
    <div className="space-y-10">
      {/* Hero Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
          <Users className="h-3.5 w-3.5" />
          {locale === "en" ? "Faculty & Staff Directory" : "ทำเนียบคณาจารย์และบุคลากร"}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          {locale === "en" ? "Faculty Members & Staff" : "คณาจารย์และบุคลากรคณะ"}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          {locale === "en"
            ? "Directory of academic faculty members, administrative leadership, and support personnel."
            : "ข้อมูลคณาจารย์ประจำภาควิชา ผู้บริหาร และเจ้าหน้าที่สายสนับสนุนการศึกษา"}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4 border-b border-border pb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Department Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <Link
              href={`/portal/staff${currentType ? `?type=${currentType}` : ""}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                !currentDept
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {locale === "en" ? "All Departments" : "ทุกภาควิชา / หน่วยงาน"}
            </Link>
            {departments.map((d) => {
              const active = currentDept === d.code;
              return (
                <Link
                  key={d.id}
                  href={`/portal/staff?dept=${d.code}${currentType ? `&type=${currentType}` : ""}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {locale === "en" ? d.nameEn : d.nameTh}
                </Link>
              );
            })}
          </div>

          {/* Search Bar */}
          <form method="GET" action="/portal/staff" className="w-full md:w-72 flex items-center relative">
            {currentDept && <input type="hidden" name="dept" value={currentDept} />}
            {currentType && <input type="hidden" name="type" value={currentType} />}
            <Search className="h-4 w-4 absolute left-3 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              name="q"
              defaultValue={searchQuery ?? ""}
              placeholder={locale === "en" ? "Search name, title..." : "ค้นหาชื่อ, ตำแหน่ง..."}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </form>
        </div>

        {/* Staff Type Filters */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground font-medium mr-1">
            {locale === "en" ? "Filter by:" : "จำแนกตาม:"}
          </span>
          <Link
            href={`/portal/staff${currentDept ? `?dept=${currentDept}` : ""}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              !currentType ? "bg-slate-200 dark:bg-slate-800 font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {locale === "en" ? "All" : "ทั้งหมด"}
          </Link>
          <Link
            href={`/portal/staff?type=ACADEMIC${currentDept ? `&dept=${currentDept}` : ""}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              currentType === "ACADEMIC" ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-semibold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {locale === "en" ? "Academic Faculty" : "สายวิชาการ (อาจารย์)"}
          </Link>
          <Link
            href={`/portal/staff?type=SUPPORT${currentDept ? `?dept=${currentDept}` : ""}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              currentType === "SUPPORT" ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-semibold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {locale === "en" ? "Support Staff" : "สายสนับสนุน (เจ้าหน้าที่)"}
          </Link>
        </div>
      </div>

      {/* Leadership / Executive Section (if viewing all and leadership members exist) */}
      {leadershipStaff.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              {locale === "en" ? "Administrative Leadership" : "คณะผู้บริหาร"}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leadershipStaff.map((staff) => (
              <StaffCard key={staff.id} staff={staff} locale={locale} highlight />
            ))}
          </div>
        </section>
      )}

      {/* Main Staff Directory Grid */}
      <section className="space-y-4">
        {leadershipStaff.length > 0 && (
          <div className="flex items-center gap-2 pt-4">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              {locale === "en" ? "Faculty & Personnel" : "คณาจารย์และบุคลากร"}
            </h2>
          </div>
        )}

        {otherStaff.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherStaff.map((staff) => (
              <StaffCard key={staff.id} staff={staff} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-border rounded-xl">
            <Users className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="text-base font-semibold">
              {locale === "en" ? "No Personnel Found" : "ไม่พบข้อมูลบุคลากร"}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {locale === "en"
                ? "Try adjusting your search query or department filter."
                : "ลองเปลี่ยนคำค้นหาหรือเลือกภาควิชาอื่น"}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function StaffCard({
  staff,
  locale,
  highlight = false,
}: {
  staff: StaffProfileDto;
  locale: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`group rounded-xl border bg-card p-6 flex flex-col justify-between transition-all hover:shadow-md hover:border-primary/40 ${
        highlight ? "border-primary/30 bg-primary/2 dark:bg-primary/5" : "border-border/60"
      }`}
    >
      <div className="space-y-4">
        {/* Avatar & Badges */}
        <div className="flex items-start gap-4">
          {staff.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={staff.avatarUrl}
              alt={staff.fullNameTh}
              className="h-16 w-16 rounded-full object-cover border-2 border-border group-hover:border-primary/50 transition-colors shrink-0"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl shrink-0">
              {staff.firstNameTh[0] || "U"}
            </div>
          )}

          <div className="space-y-1 min-w-0">
            {/* Position badge */}
            {(staff.administrativePositionTh || staff.administrativePositionEn) && (
              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-primary/10 text-primary truncate max-w-full">
                {locale === "en"
                  ? staff.administrativePositionEn || staff.administrativePositionTh
                  : staff.administrativePositionTh || staff.administrativePositionEn}
              </span>
            )}
            <h3 className="font-bold text-base text-foreground leading-snug group-hover:text-primary transition-colors">
              <Link href={`/portal/staff/${staff.id}`}>
                {locale === "en" ? staff.fullNameEn : staff.fullNameTh}
              </Link>
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              {locale === "en" ? staff.fullNameTh : staff.fullNameEn}
            </p>
          </div>
        </div>

        {/* Dept & Staff Type */}
        <div className="space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <BookOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">
              {locale === "en" ? staff.departmentNameEn : staff.departmentNameTh}
            </span>
          </div>

          {/* Research tags (first 2) */}
          {staff.researchInterests && staff.researchInterests.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {staff.researchInterests.slice(0, 2).map((item: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-muted text-muted-foreground text-[10px] font-medium"
                >
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer: Contacts & Link */}
      <div className="pt-4 mt-4 border-t border-border/50 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <a
            href={`mailto:${staff.email}`}
            title={staff.email}
            className="p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors"
          >
            <Mail className="h-3.5 w-3.5" />
          </a>
          {staff.phone && (
            <a
              href={`tel:${staff.phone}`}
              title={staff.phone}
              className="p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors"
            >
              <Phone className="h-3.5 w-3.5" />
            </a>
          )}
          {staff.roomNo && (
            <span
              title={`Office: ${staff.roomNo}`}
              className="flex items-center gap-0.5 text-[11px]"
            >
              <MapPin className="h-3 w-3" />
              {staff.roomNo}
            </span>
          )}
        </div>

        <Link
          href={`/portal/staff/${staff.id}`}
          className="font-medium text-primary hover:underline inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform"
        >
          <span>{locale === "en" ? "Profile" : "ข้อมูล"}</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
