"use client";

import { useState, useTransition, useMemo } from "react";
import Image from "next/image";
import {
  GraduationCap,
  Award,
  Search,
  BookOpen,
  Briefcase,
  Quote,
  Heart,
  Plus,
  Send,
  X,
  Sparkles,
  Building2,
  Mail,
  Phone,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/shared/lib/i18n/client";
import type { AlumniMemberDto, AlumniStoryDto } from "@/features/alumni";
import { createAlumniMemberAction } from "@/features/alumni/actions";

interface PortalAlumniClientProps {
  initialMembers: AlumniMemberDto[];
  initialStories: AlumniStoryDto[];
  initialSpotlight: AlumniMemberDto[];
  locale: string;
}

export function PortalAlumniClient({
  initialMembers,
  initialStories,
  initialSpotlight,
  locale,
}: PortalAlumniClientProps) {
  const t = useT();
  const [members] = useState<AlumniMemberDto[]>(initialMembers);
  const [stories] = useState<AlumniStoryDto[]>(initialStories);
  const [spotlight] = useState<AlumniMemberDto[]>(initialSpotlight);

  const [activeTab, setActiveTab] = useState<"directory" | "spotlight" | "giving">("directory");
  const [search, setSearch] = useState("");
  const [degreeFilter, setDegreeFilter] = useState<string>("ALL");
  const [yearFilter, setYearFilter] = useState<string>("ALL");
  const [isPending, startTransition] = useTransition();

  // Registration Modal State
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [fullNameTh, setFullNameTh] = useState("");
  const [fullNameEn, setFullNameEn] = useState("");
  const [studentId, setStudentId] = useState("");
  const [graduationYearBe, setGraduationYearBe] = useState(String(new Date().getFullYear() + 543 - 2));
  const [degreeLevel, setDegreeLevel] = useState<"BACHELOR" | "MASTER" | "DOCTORAL" | "DIPLOMA">("BACHELOR");
  const [majorTh, setMajorTh] = useState("สาขาวิชาพระพุทธศาสนา");
  const [majorEn, setMajorEn] = useState("");
  const [currentWorkplace, setCurrentWorkplace] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  // Selected story for full modal read
  const [selectedStory, setSelectedStory] = useState<AlumniStoryDto | null>(null);

  // Filtered members
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchSearch =
        search === "" ||
        m.fullNameTh.toLowerCase().includes(search.toLowerCase()) ||
        (m.fullNameEn && m.fullNameEn.toLowerCase().includes(search.toLowerCase())) ||
        m.majorTh.toLowerCase().includes(search.toLowerCase()) ||
        (m.currentWorkplace && m.currentWorkplace.toLowerCase().includes(search.toLowerCase())) ||
        (m.jobTitle && m.jobTitle.toLowerCase().includes(search.toLowerCase())) ||
        String(m.graduationYearBe).includes(search);

      const matchDegree = degreeFilter === "ALL" || m.degreeLevel === degreeFilter;
      const matchYear = yearFilter === "ALL" || String(m.graduationYearBe) === yearFilter;

      return matchSearch && matchDegree && matchYear;
    });
  }, [members, search, degreeFilter, yearFilter]);

  // Unique graduation years for filter dropdown
  const uniqueYears = useMemo(() => {
    const years = Array.from(new Set(members.map((m) => m.graduationYearBe))).sort((a, b) => b - a);
    return years;
  }, [members]);

  function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullNameTh.trim() || !majorTh.trim()) {
      toast.error(locale === "th" ? "กรุณากรอกชื่อและสาขาวิชาให้ครบถ้วน" : "Please fill in required fields");
      return;
    }

    startTransition(async () => {
      const res = await createAlumniMemberAction({
        fullNameTh: fullNameTh.trim(),
        fullNameEn: fullNameEn.trim() || null,
        studentId: studentId.trim() || null,
        graduationYearBe: Number(graduationYearBe) || 2560,
        degreeLevel,
        majorTh: majorTh.trim(),
        majorEn: majorEn.trim() || null,
        currentWorkplace: currentWorkplace.trim() || null,
        jobTitle: jobTitle.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        avatarUrl: avatarUrl.trim() || null,
        isPublic,
        status: "PENDING",
      });

      if (res.ok) {
        toast.success(t("alumni.registeredSuccess"));
        setRegisterModalOpen(false);
        // Reset form
        setFullNameTh("");
        setFullNameEn("");
        setStudentId("");
        setCurrentWorkplace("");
        setJobTitle("");
        setPhone("");
        setEmail("");
        setAvatarUrl("");
      } else {
        toast.error(res.error.message);
      }
    });
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-950 via-slate-900 to-slate-950 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-medium mb-6">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>{locale === "th" ? "สมาคมและเครือข่ายศิษย์เก่า คณะพุทธศาสตร์" : "Faculty of Buddhism Alumni Network"}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-6">
            {t("alumni.title")}
          </h1>

          <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
            {t("alumni.publicSubtitle")}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setRegisterModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-900/30 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>{t("alumni.registerMember")}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("giving")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-semibold backdrop-blur-sm transition-colors"
            >
              <Heart className="w-4 h-4 text-rose-400" />
              <span>{t("alumni.giving")}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 -mt-8">
        {/* Navigation Tabs Bar */}
        <div className="bg-white dark:bg-card rounded-2xl shadow-md border border-neutral-200/90 dark:border-border p-4 sm:p-5 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("directory")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === "directory"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted/80"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{t("alumni.directory")} ({members.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("spotlight")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === "spotlight"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted/80"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{t("alumni.spotlight")} ({stories.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("giving")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === "giving"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted/80"
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>{t("alumni.giving")}</span>
              </button>
            </div>

            {/* Quick search input (only for directory tab) */}
            {activeTab === "directory" && (
              <div className="relative w-full md:w-80">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("alumni.searchPlaceholder")}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-neutral-300 dark:border-border bg-neutral-50 dark:bg-muted/50 text-neutral-900 dark:text-foreground placeholder:text-neutral-400 focus:bg-white dark:focus:bg-card focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                />
              </div>
            )}
          </div>

          {/* Directory Filter Sub-bar */}
          {activeTab === "directory" && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 mt-3.5 border-t border-neutral-100 dark:border-border text-xs text-neutral-600 dark:text-muted-foreground">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-neutral-500 dark:text-muted-foreground">{locale === "th" ? "ระดับ:" : "Degree:"}</span>
                  <select
                    value={degreeFilter}
                    onChange={(e) => setDegreeFilter(e.target.value)}
                    aria-label={locale === "th" ? "เลือกระดับปริญญา" : "Select degree level"}
                    className="text-xs rounded-lg border-neutral-300 dark:border-border bg-neutral-50 dark:bg-muted/50 px-2.5 py-1 text-neutral-700 dark:text-foreground focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="ALL">{locale === "th" ? "ทุกระดับปริญญา" : "All Degrees"}</option>
                    <option value="BACHELOR">{t("alumni.degree.bachelor")}</option>
                    <option value="MASTER">{t("alumni.degree.master")}</option>
                    <option value="DOCTORAL">{t("alumni.degree.doctoral")}</option>
                    <option value="DIPLOMA">{t("alumni.degree.diploma")}</option>
                  </select>
                </div>

                {uniqueYears.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-neutral-500 dark:text-muted-foreground">{locale === "th" ? "ปีที่จบ:" : "Year (B.E.):"}</span>
                    <select
                      value={yearFilter}
                      onChange={(e) => setYearFilter(e.target.value)}
                      aria-label={locale === "th" ? "เลือกปีที่สำเร็จการศึกษา" : "Select graduation year"}
                      className="text-xs rounded-lg border-neutral-300 dark:border-border bg-neutral-50 dark:bg-muted/50 px-2.5 py-1 text-neutral-700 dark:text-foreground focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="ALL">{locale === "th" ? "ทุกปีการศึกษา" : "All Years"}</option>
                      {uniqueYears.map((yr) => (
                        <option key={yr} value={String(yr)}>
                          พ.ศ. {yr}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="text-xs text-neutral-500 dark:text-muted-foreground font-medium">
                {locale === "th" ? `พบศิษย์เก่า ${filteredMembers.length} ท่าน` : `Showing ${filteredMembers.length} members`}
              </div>
            </div>
          )}
        </div>

        {/* TAB 1: DIRECTORY */}
        {activeTab === "directory" && (
          <div>
            {filteredMembers.length === 0 ? (
              <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
                <GraduationCap className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-600 font-medium">{t("alumni.empty")}</p>
                <p className="text-xs text-neutral-400 mt-1">
                  {locale === "th"
                    ? "คุณสามารถเป็นคนแรกในรุ่นที่ลงทะเบียนเพื่อสร้างทำเนียบศิษย์เก่า"
                    : "Be the first to register and build your batch roster"}
                </p>
                <button
                  type="button"
                  onClick={() => setRegisterModalOpen(true)}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t("alumni.registerMember")}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMembers.map((m) => (
                  <div
                    key={m.id}
                    className="bg-white rounded-2xl border border-neutral-200/90 shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between group relative overflow-hidden"
                  >
                    {m.isSpotlight && (
                      <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-bl-xl uppercase tracking-wider flex items-center gap-1 shadow-sm">
                        <Sparkles className="w-3 h-3" />
                        <span>Spotlight</span>
                      </div>
                    )}

                    <div>
                      {/* Avatar & Header */}
                      <div className="flex items-start gap-3.5 mb-3.5">
                        <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-blue-50 border border-blue-100 shrink-0">
                          {m.avatarUrl ? (
                            <Image
                              src={m.avatarUrl}
                              alt={m.fullNameTh}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-blue-600 font-bold text-lg">
                              {m.fullNameTh.slice(0, 1)}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 pr-8">
                          <h2 className="text-sm font-bold text-neutral-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                            {m.fullNameTh}
                          </h2>
                          {m.fullNameEn && (
                            <p className="text-xs text-neutral-400 line-clamp-1">{m.fullNameEn}</p>
                          )}
                          <div className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                            <GraduationCap className="w-3 h-3" />
                            <span>รุ่น พ.ศ. {m.graduationYearBe}</span>
                          </div>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-1.5 text-xs text-neutral-600 border-t border-neutral-100 pt-3">
                        <div className="flex items-start gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span className="font-medium text-neutral-800 line-clamp-1">
                            {locale === "th" ? m.majorTh : m.majorEn || m.majorTh}
                          </span>
                        </div>

                        {m.currentWorkplace && (
                          <div className="flex items-start gap-2">
                            <Building2 className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{m.currentWorkplace}</span>
                          </div>
                        )}

                        {m.jobTitle && (
                          <div className="flex items-start gap-2">
                            <Briefcase className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-1 text-neutral-500">{m.jobTitle}</span>
                          </div>
                        )}

                        {m.spotlightQuoteTh && (
                          <div className="mt-3 p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60 text-[11px] text-amber-900 italic line-clamp-2">
                            &quot;{m.spotlightQuoteTh}&quot;
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contact footer */}
                    <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-400">
                      <span className="text-[11px]">
                        {m.degreeLevel === "BACHELOR"
                          ? "ปริญญาตรี"
                          : m.degreeLevel === "MASTER"
                          ? "ปริญญาโท"
                          : m.degreeLevel === "DOCTORAL"
                          ? "ปริญญาเอก"
                          : "ประกาศนียบัตร"}
                      </span>

                      <div className="flex items-center gap-2">
                        {m.phone && (
                          <a
                            href={`tel:${m.phone}`}
                            className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-blue-600 transition-colors"
                            title={m.phone}
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {m.email && (
                          <a
                            href={`mailto:${m.email}`}
                            className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-blue-600 transition-colors"
                            title={m.email}
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SPOTLIGHT & SUCCESS STORIES */}
        {activeTab === "spotlight" && (
          <div className="space-y-8">
            {/* Spotlight Quotes Banner */}
            {spotlight.length > 0 && (
              <div className="bg-gradient-to-tr from-amber-950 via-stone-900 to-amber-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4">
                  <Sparkles className="w-4 h-4" />
                  <span>{locale === "th" ? "เสียงสะท้อนและคำนิยมจากศิษย์เก่าดีเด่น" : "Voices of Distinguished Alumni"}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {spotlight.map((s) => (
                    <div
                      key={s.id}
                      className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4 flex flex-col justify-between"
                    >
                      <Quote className="w-5 h-5 text-amber-400/60 mb-2" />
                      <p className="text-xs text-neutral-200 leading-relaxed italic mb-4">
                        &quot;{s.spotlightQuoteTh}&quot;
                      </p>
                      <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-amber-500/20 shrink-0 relative">
                          {s.avatarUrl ? (
                            <Image src={s.avatarUrl} alt={s.fullNameTh} fill className="object-cover" />
                          ) : (
                            <span className="w-full h-full flex items-center justify-center text-xs font-bold text-amber-300">
                              {s.fullNameTh[0]}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate">{s.fullNameTh}</p>
                          <p className="text-[10px] text-amber-300/80 truncate">
                            รุ่น พ.ศ. {s.graduationYearBe} • {s.jobTitle}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stories Grid */}
            <div>
              <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                <span>{t("alumni.tab.stories")}</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stories.map((story) => (
                  <div
                    key={story.id}
                    className="bg-white rounded-2xl border border-neutral-200/90 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group"
                  >
                    {story.imageUrl && (
                      <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                        <Image
                          src={story.imageUrl}
                          alt={story.titleTh}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-2.5 left-3 text-white text-xs font-medium">
                          {story.alumniName} (พ.ศ. {story.graduationYearBe})
                        </div>
                      </div>
                    )}

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-base font-bold text-neutral-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                          {locale === "th" ? story.titleTh : story.titleEn}
                        </h3>
                        <p className="text-xs text-neutral-500 line-clamp-3 leading-relaxed mb-4">
                          {locale === "th" ? story.summaryTh : story.summaryEn}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedStory(story)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors pt-2 border-t border-neutral-100"
                      >
                        <span>{locale === "th" ? "อ่านบทความฉบับเต็ม" : "Read Full Story"}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GIVING & ENDOWMENT */}
        {activeTab === "giving" && (
          <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-sm p-6 sm:p-10 space-y-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold mb-3">
                <Heart className="w-3.5 h-3.5" />
                <span>{locale === "th" ? "กองทุนพัฒนาคณะและทุนการศึกษา" : "Endowment & Scholarships"}</span>
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-3">
                {locale === "th" ? "ร่วมเป็นพลังสืบสานการศึกษาพระพุทธศาสนาสู่สากล" : "Support Buddhist Studies for Generations to Come"}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                {locale === "th"
                  ? "คณะพุทธศาสตร์ ขอเชิญศิษย์เก่าและผู้มีจิตศรัทธา ร่วมสมทบทุนเพื่อสนับสนุนการศึกษาของพระภิกษุ-สามเณร และนิสิตคฤหัสถ์ผู้ขาดแคลนทุนทรัพย์ ตลอดจนการพัฒนาคลังตำราคัมภีร์และเทคโนโลยีสารสนเทศเพื่อการเผยแผ่พระธรรม"
                  : "Join us in supporting monk and student scholarships, ancient Pali text preservation, and digital academic infrastructure."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80">
                <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center font-bold mb-3">
                  1
                </div>
                <h3 className="text-sm font-bold text-amber-950 mb-1">
                  {locale === "th" ? "ทุนการศึกษาภิกษุ-สามเณร" : "Monastic Scholarships"}
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {locale === "th"
                    ? "สนับสนุนค่าธรรมเนียมการศึกษา ตำราเรียน และภัตตาหารแก่นิสิตบรรพชิต"
                    : "Tuition support, study textbooks, and daily provisions for monastic students."}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200/80">
                <div className="w-10 h-10 rounded-xl bg-blue-200 text-blue-900 flex items-center justify-center font-bold mb-3">
                  2
                </div>
                <h3 className="text-sm font-bold text-blue-950 mb-1">
                  {locale === "th" ? "กองทุนวิจัยคัมภีร์พระไตรปิฎก" : "Tipitaka Research Fund"}
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {locale === "th"
                    ? "สนับสนุนการตรวจชำระคัมภีร์ใบลาน การแปลพระไตรปิฎก และการตีพิมพ์วิชาการระดับสากล"
                    : "Palm-leaf manuscript preservation, translations, and international journal publications."}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
                <div className="w-10 h-10 rounded-xl bg-emerald-200 text-emerald-900 flex items-center justify-center font-bold mb-3">
                  3
                </div>
                <h3 className="text-sm font-bold text-emerald-950 mb-1">
                  {locale === "th" ? "กองทุนพัฒนาวิปัสสนาธุระ" : "Meditation Retreat Center"}
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {locale === "th"
                    ? "บำรุงรักษากุฏิที่พัก อาคารปฏิบัติธรรม และภัตตาหารแก่ผู้ปฏิบัติธรรมโดยไม่คิดมูลค่า"
                    : "Maintenance of retreat facilities, private kutis, and free meals for meditation practitioners."}
                </p>
              </div>
            </div>

            {/* Bank details card */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  {locale === "th" ? "ช่องทางการร่วมบริจาค (สามารถนำไปลดหย่อนภาษีได้ 2 เท่า)" : "Direct Bank Transfer (Tax-deductible)"}
                </p>
                <p className="text-xl font-bold">
                  {locale === "th" ? "ธนาคารกรุงไทย จำกัด (มหาชน)" : "Krungthai Bank (KTB)"}
                </p>
                <p className="text-xs text-slate-300">
                  {locale === "th" ? "ชื่อบัญชี: กองทุนพัฒนาคณะพุทธศาสตร์และศิษย์เก่าสัมพันธ์" : "Account Name: Faculty of Buddhism Development Fund"}
                </p>
                <p className="font-mono text-xl sm:text-2xl font-bold text-amber-300 tracking-wider">
                  096-0-12345-6
                </p>
              </div>

              <div className="text-center sm:text-right shrink-0">
                <div className="inline-block p-3 bg-white rounded-2xl text-slate-900 text-xs font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  <span>e-Donation อัตโนมัติ</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  ส่งหลักฐานการโอนได้ที่: finance@buddhism.ac.th
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Self-Service Registration Modal */}
      {registerModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-300" />
                  <h3 className="text-base font-bold">
                    {t("alumni.registerMember")}
                  </h3>
                </div>
                <p className="text-xs text-blue-200/80 mt-0.5">
                  {locale === "th"
                    ? "ร่วมเป็นส่วนหนึ่งของทำเนียบเกียรติยศและเครือข่ายศิษย์เก่าพุทธศาสตร์"
                    : "Join the official alumni roster and directory"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRegisterModalOpen(false)}
                className="p-1 rounded-lg text-neutral-300 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {t("alumni.fullNameTh")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullNameTh}
                    onChange={(e) => setFullNameTh(e.target.value)}
                    placeholder="เช่น พระมหาสมชาย ญาณสิทฺธิ หรือ นายอนุชา ปัญญาดี"
                    className="w-full text-xs rounded-lg border-neutral-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {t("alumni.fullNameEn")}
                  </label>
                  <input
                    type="text"
                    value={fullNameEn}
                    onChange={(e) => setFullNameEn(e.target.value)}
                    placeholder="e.g. Phra Maha Somchai or Mr. Anucha Panyadee"
                    className="w-full text-xs rounded-lg border-neutral-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {t("alumni.studentId")}
                  </label>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="เช่น 6001010025 (หากจำไม่ได้ให้เว้นว่าง)"
                    className="w-full text-xs rounded-lg border-neutral-300 px-3 py-2 font-mono focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {t("alumni.gradYear")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="2450"
                    max="2650"
                    value={graduationYearBe}
                    onChange={(e) => setGraduationYearBe(e.target.value)}
                    placeholder="เช่น 2562"
                    className="w-full text-xs rounded-lg border-neutral-300 px-3 py-2 font-mono focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {t("alumni.degreeLevel")} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={degreeLevel}
                    onChange={(e) => setDegreeLevel(e.target.value as "BACHELOR" | "MASTER" | "DOCTORAL" | "DIPLOMA")}
                    className="w-full text-xs rounded-lg border-neutral-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="BACHELOR">{t("alumni.degree.bachelor")}</option>
                    <option value="MASTER">{t("alumni.degree.master")}</option>
                    <option value="DOCTORAL">{t("alumni.degree.doctoral")}</option>
                    <option value="DIPLOMA">{t("alumni.degree.diploma")}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {t("alumni.major")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={majorTh}
                    onChange={(e) => setMajorTh(e.target.value)}
                    placeholder="เช่น สาขาวิชาพระพุทธศาสนา, ภาษาบาลี, พุทธจิตวิทยา"
                    className="w-full text-xs rounded-lg border-neutral-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    สาขาวิชา (ภาษาอังกฤษ)
                  </label>
                  <input
                    type="text"
                    value={majorEn}
                    onChange={(e) => setMajorEn(e.target.value)}
                    placeholder="e.g. Buddhist Studies, Pali Language"
                    className="w-full text-xs rounded-lg border-neutral-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {t("alumni.workplace")}
                  </label>
                  <input
                    type="text"
                    value={currentWorkplace}
                    onChange={(e) => setCurrentWorkplace(e.target.value)}
                    placeholder="เช่น วัด..., มหาวิทยาลัย..., บริษัท..."
                    className="w-full text-xs rounded-lg border-neutral-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {t("alumni.jobTitle")}
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="เช่น เจ้าอาวาส, อาจารย์, ผู้จัดการ, นักวิจัย"
                    className="w-full text-xs rounded-lg border-neutral-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {t("alumni.phone")}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08X-XXX-XXXX"
                    className="w-full text-xs rounded-lg border-neutral-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {t("alumni.email")}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alumni@example.com"
                    className="w-full text-xs rounded-lg border-neutral-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  URL รูปถ่าย / โปรไฟล์ (ไม่บังคับ)
                </label>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full text-xs rounded-lg border-neutral-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-700">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>ยินยอมให้แสดงข้อมูลในทำเนียบศิษย์เก่าสาธารณะบนเว็บไซต์</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setRegisterModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                >
                  {locale === "th" ? "ยกเลิก" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isPending ? (locale === "th" ? "กำลังบันทึก..." : "Saving...") : t("alumni.registerMember")}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Story Full View Modal */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
            {selectedStory.imageUrl && (
              <div className="relative h-56 w-full bg-slate-100">
                <Image
                  src={selectedStory.imageUrl}
                  alt={selectedStory.titleTh}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-6">
              <div className="flex items-center justify-between text-xs text-blue-600 font-semibold mb-2">
                <span>{selectedStory.alumniName} (พ.ศ. {selectedStory.graduationYearBe})</span>
                <button
                  type="button"
                  onClick={() => setSelectedStory(null)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">
                {locale === "th" ? selectedStory.titleTh : selectedStory.titleEn}
              </h3>
              <div className="text-xs text-neutral-500 italic mb-4 pb-3 border-b border-neutral-100">
                {locale === "th" ? selectedStory.summaryTh : selectedStory.summaryEn}
              </div>
              <div className="text-xs sm:text-sm text-neutral-700 leading-relaxed whitespace-pre-line space-y-3">
                {locale === "th" ? selectedStory.contentTh : selectedStory.contentEn}
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedStory(null)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                >
                  {locale === "th" ? "ปิด" : "Close"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
