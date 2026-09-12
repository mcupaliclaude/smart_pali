import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ExternalLink,
  Navigation,
  Building2,
  Calendar,
  Sparkles,
  BookOpen,
  Users,
  CheckCircle2,
  Share2,
  ChevronRight,
  Home,
} from "lucide-react";
import { getLocale } from "@/shared/lib/i18n/server";
import { resolvePublicTenantId } from "@/shared/lib/tenant";
import { getTenantSettings } from "@/features/identity/server";
import { ContactInquiryForm } from "./_components/contact-inquiry-form";

export default async function ContactPortalPage() {
  const locale = await getLocale();
  const tenantId = await resolvePublicTenantId().catch(() => "");
  const tenant = tenantId ? await getTenantSettings(tenantId).catch(() => null) : null;
  const contact = tenant?.contact;

  const displayName = locale === "en" ? tenant?.nameEn || tenant?.nameTh : tenant?.nameTh;
  const address =
    locale === "en" && contact?.addressEn
      ? contact.addressEn
      : contact?.addressTh || "79 หมู่ที่ 3 ตำบลลำไทร อำเภอวังน้อย จังหวัดพระนครศรีอยุธยา 13170";
  const hours =
    locale === "en" && contact?.hoursEn
      ? contact.hoursEn
      : contact?.hoursTh || "วันจันทร์ - ศุกร์: 08:30 - 16:30 น.";
  const phone = contact?.phone || "035-248-000 ต่อ 8851";
  const email = contact?.email || "contact.pali@mcu.ac.th";
  const mapUrl = contact?.mapUrl || "https://maps.google.com/?q=Mahachulalongkornrajavidyalaya+University";

  return (
    <div className="space-y-10 animate-in fade-in duration-200">
      {/* Breadcrumb & Hero Header */}
      <div className="space-y-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/portal" className="hover:text-foreground inline-flex items-center gap-1 transition-colors">
            <Home className="w-3.5 h-3.5" />
            <span>{locale === "en" ? "Home" : "หน้าแรก"}</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 opacity-50" />
          <span className="text-foreground font-semibold">
            {locale === "en" ? "Contact Us" : "ติดต่อเรา"}
          </span>
        </nav>

        <div className="text-center max-w-2xl mx-auto space-y-3 pt-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-2xs">
            <MapPin className="h-3.5 w-3.5" />
            {locale === "en" ? "Contact & Location" : "ข้อมูลการติดต่อและแผนที่"}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            {locale === "en" ? "Contact Faculty & Campus" : "ติดต่อคณะและสำนักงาน"}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            {locale === "en"
              ? "Get in touch with our faculty office for academic programs, retreat reservations, official inquiries, or visit our campus."
              : "ช่องทางการติดต่อ สอบถามข้อมูลการศึกษา การรับสมัคร บริการวิชาการ การจองห้องปฏิบัติธรรม หรือเดินทางมายังสถาบัน"}
          </p>
        </div>
      </div>

      {/* 4 Primary Highlight Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Address */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-primary/40 transition-all">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {locale === "en" ? "Campus Location" : "ที่ตั้งและสถานที่"}
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                {address}
              </p>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              <span>{locale === "en" ? "Open Google Maps" : "เปิด Google Maps นำทาง"}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Card 2: Phone */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-primary/40 transition-all">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {locale === "en" ? "Telephone" : "โทรศัพท์ติดต่อ"}
              </h3>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1.5">
                <a href={`tel:${phone}`} className="hover:text-primary transition-colors">
                  {phone}
                </a>
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                {locale === "en" ? "Available during office hours" : "ติดต่อในวันและเวลาราชการ"}
              </p>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            <a
              href={`tel:${phone}`}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              <span>{locale === "en" ? "Call Now" : "กดโทรออกทันที"}</span>
              <Phone className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Card 3: Email */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-primary/40 transition-all">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {locale === "en" ? "Email Address" : "อีเมลติดต่อกลาง"}
              </h3>
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-1.5 truncate">
                <a href={`mailto:${email}`} className="hover:text-primary transition-colors">
                  {email}
                </a>
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                {locale === "en" ? "Replies in 1-2 business days" : "ตอบกลับภายใน 1-2 วันทำการ"}
              </p>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            <a
              href={`mailto:${email}`}
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1 truncate"
            >
              <span>{locale === "en" ? "Send Email" : "ส่งอีเมลถึงสำนักงาน"}</span>
              <Mail className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Card 4: Operating Hours */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-primary/40 transition-all">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {locale === "en" ? "Operating Hours" : "วันและเวลาทำการ"}
              </h3>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-1.5 leading-relaxed">
                {hours}
              </p>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{locale === "en" ? "Office Open" : "เปิดให้บริการตามเวลาทำการ"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Social Media & Online Communication Channels Card */}
      {(contact?.facebook || contact?.line) && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-purple-50/50 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-900 p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              {locale === "en" ? "Online & Social" : "ช่องทางออนไลน์และโซเชียลมีเดีย"}
            </span>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              {locale === "en" ? "Follow Us & Chat Directly" : "ติดตามข่าวสารและติดต่อผ่านสื่อสังคมออนไลน์"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {locale === "en"
                ? "Official channels for updates, live broadcasts, and real-time chat with faculty coordinators."
                : "ช่องทางอย่างเป็นทางการสำหรับการประชาสัมพันธ์ การถ่ายทอดสด และการสอบถามข้อมูลแบบเรียลไทม์"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {contact?.facebook && (
              <a
                href={
                  contact.facebook.startsWith("http")
                    ? contact.facebook
                    : `https://facebook.com/${contact.facebook.replace("@", "")}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#1877F2] text-white hover:bg-[#1877F2]/90 transition-colors shadow-xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Facebook Page</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            )}

            {contact?.line && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#06C755] text-white shadow-xs">
                <span>LINE Official:</span>
                <span className="font-mono">{contact.line}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2-Column Section: Inquiry Form (Left) & Directions / Map Guide (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Inquiry Form (7 cols) */}
        <div className="lg:col-span-7">
          <ContactInquiryForm targetEmail={contact?.email || undefined} />
        </div>

        {/* Right Column: Travel Directions & Campus Directory (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Map Preview & Location Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {locale === "en" ? "Campus Map & Navigation" : "แผนที่สถาบันและการนำทาง"}
              </h3>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-video bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
                <MapPin className="w-6 h-6" />
              </div>
              <p className="font-bold text-xs text-foreground">{displayName}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 max-w-xs truncate">{address}</p>

              <div className="mt-3">
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
                >
                  <span>{locale === "en" ? "Open in Google Maps" : "เปิดแผนที่ Google Maps"}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Travel Directions */}
            <div className="space-y-3 pt-2">
              <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                {locale === "en" ? "Travel Directions" : "คำแนะนำการเดินทาง"}
              </h4>

              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-foreground">
                      {locale === "en" ? "By Car: " : "รถยนต์ส่วนบุคคล: "}
                    </strong>
                    {locale === "en"
                      ? "Take Phahonyothin Highway toward Wang Noi, Phra Nakhon Si Ayutthaya."
                      : "ใช้เส้นทางถนนพหลโยธิน มุ่งสู่อำเภอวังน้อย จังหวัดพระนครศรีอยุธยา เข้าสู่มหาวิทยาลัย"}
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-foreground">
                      {locale === "en" ? "By Van / Bus: " : "รถตู้ / รถโดยสาร: "}
                    </strong>
                    {locale === "en"
                      ? "Vans depart from Mo Chit 2 Terminal or Future Park Rangsit heading to Saraburi/Ayutthaya."
                      : "รถตู้สายสระบุรีหรืออยุธยา จากสถานีขนส่งหมอชิต 2 หรือฟิวเจอร์พาร์ครังสิต ลงหน้ามหาวิทยาลัย"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Departments Directory Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {locale === "en" ? "Internal Departments Directory" : "หน่วยงานภายในคณะ"}
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">
                    {locale === "en" ? "Dean's Office" : "สำนักงานคณบดี"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {locale === "en" ? "Administrative Leadership" : "งานบริหารทั่วไปและนโยบาย"}
                  </p>
                </div>
                <span className="font-mono text-xs text-primary font-semibold">ต่อ 8100</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">
                    {locale === "en" ? "Academic & Registrar Office" : "สำนักงานวิชาการและงานทะเบียน"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {locale === "en" ? "Admissions & Curriculum" : "หลักสูตรและรับสมัครนิสิต"}
                  </p>
                </div>
                <span className="font-mono text-xs text-primary font-semibold">ต่อ 8102</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">
                    {locale === "en" ? "Vipassana Retreat Center" : "ศูนย์วิปัสสนาธุระ"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {locale === "en" ? "Meditation & Retreats" : "คอร์สปฏิบัติธรรมและเจริญสติ"}
                  </p>
                </div>
                <span className="font-mono text-xs text-primary font-semibold">ต่อ 8851</span>
              </div>
            </div>

            {/* Quick Link Pills */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
              <Link
                href="/portal/curriculum"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-foreground hover:text-primary transition-colors"
              >
                <BookOpen className="w-3 h-3 text-primary" />
                <span>{locale === "en" ? "Programs" : "หลักสูตร"}</span>
              </Link>
              <Link
                href="/portal/staff"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-foreground hover:text-primary transition-colors"
              >
                <Users className="w-3 h-3 text-primary" />
                <span>{locale === "en" ? "Faculty" : "บุคลากร"}</span>
              </Link>
              <Link
                href="/portal/reservations"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-foreground hover:text-primary transition-colors"
              >
                <Calendar className="w-3 h-3 text-primary" />
                <span>{locale === "en" ? "Reservations" : "จองห้อง"}</span>
              </Link>
              <Link
                href="/portal/meditation"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-foreground hover:text-primary transition-colors"
              >
                <Sparkles className="w-3 h-3 text-primary" />
                <span>{locale === "en" ? "Meditation" : "วิปัสสนา"}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
