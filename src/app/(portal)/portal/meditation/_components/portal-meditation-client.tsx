"use client";

import { useState, useTransition, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Users,
  Sparkles,
  CheckCircle2,
  X,
  Send,
  HeartHandshake,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Flower2,
} from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/shared/lib/i18n/client";
import type { MeditationCourseDto } from "@/features/meditation";
import { createMeditationRegistrationAction } from "@/features/meditation/actions";

interface PortalMeditationClientProps {
  initialCourses: MeditationCourseDto[];
  locale: string;
}

export function PortalMeditationClient({
  initialCourses,
  locale,
}: PortalMeditationClientProps) {
  const t = useT();
  const [courses] = useState<MeditationCourseDto[]>(initialCourses);
  const [formatFilter, setFormatFilter] = useState<string>("ALL");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [isPending, startTransition] = useTransition();

  // Registration Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<MeditationCourseDto | null>(null);

  // Form state
  const [fullNameTh, setFullNameTh] = useState("");
  const [fullNameEn, setFullNameEn] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [gender, setGender] = useState("FEMALE");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [occupation, setOccupation] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [medicalConditions, setMedicalConditions] = useState("");
  const [dietaryRequirements, setDietaryRequirements] = useState("ปกติ (ทั่วไป)");
  const [experience, setExperience] = useState("");

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchFormat = formatFilter === "ALL" || c.format === formatFilter;
      const matchLevel = levelFilter === "ALL" || c.level === levelFilter;
      return matchFormat && matchLevel;
    });
  }, [courses, formatFilter, levelFilter]);

  function openRegisterModal(course: MeditationCourseDto) {
    setSelectedCourse(course);
    setModalOpen(true);
  }

  function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCourse) return;
    if (!fullNameTh.trim() || !phone.trim() || !email.trim()) {
      toast.error(locale === "th" ? "กรุณากรอกข้อมูลสำคัญให้ครบถ้วน" : "Please fill in all required fields");
      return;
    }
    if (!emergencyContactName.trim() || !emergencyContactPhone.trim()) {
      toast.error(
        locale === "th"
          ? "กรุณาระบุชื่อและเบอร์ติดต่อผู้ติดต่อฉุกเฉิน"
          : "Please specify emergency contact name and phone"
      );
      return;
    }

    startTransition(async () => {
      const res = await createMeditationRegistrationAction({
        courseId: selectedCourse.id,
        fullNameTh: fullNameTh.trim(),
        fullNameEn: fullNameEn.trim() || null,
        nationalId: nationalId.trim() || null,
        gender,
        age: age ? parseInt(age, 10) : null,
        phone: phone.trim(),
        email: email.trim(),
        occupation: occupation.trim() || null,
        address: address.trim() || null,
        emergencyContactName: emergencyContactName.trim(),
        emergencyContactPhone: emergencyContactPhone.trim(),
        medicalConditions: medicalConditions.trim() || null,
        dietaryRequirements: dietaryRequirements.trim() || null,
        experience: experience.trim() || null,
      });

      if (res.ok) {
        toast.success(
          locale === "th"
            ? "ลงทะเบียนสำเร็จ! คณะกรรมการจะแจ้งผลการยืนยันสิทธิ์ทางอีเมล"
            : "Registration submitted successfully! We will contact you via email."
        );
        setModalOpen(false);
        // Reset form
        setFullNameTh("");
        setFullNameEn("");
        setNationalId("");
        setAge("");
        setPhone("");
        setEmail("");
        setOccupation("");
        setAddress("");
        setEmergencyContactName("");
        setEmergencyContactPhone("");
        setMedicalConditions("");
        setExperience("");
      } else {
        toast.error(res.error.message || "Failed to register");
      }
    });
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-950 via-stone-900 to-stone-950 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/20 text-amber-300 text-xs font-medium mb-6">
            <Flower2 className="w-3.5 h-3.5" />
            <span>{locale === "th" ? "ศูนย์พัฒนาการปฏิบัติวิปัสสนาธุระ คณะพุทธศาสตร์" : "Center for Vipassana Meditation Development"}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-6">
            {t("meditation.title")}
          </h1>

          <p className="max-w-2xl mx-auto text-neutral-300 text-sm sm:text-base leading-relaxed mb-8">
            {t("meditation.publicSubtitle")}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-neutral-400">{locale === "th" ? "พระวิปัสสนาจารย์" : "Certified"}</p>
                <p className="text-xs font-semibold text-white">{locale === "th" ? "สายสติปัฏฐาน 4" : "Vipassana Masters"}</p>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-neutral-400">{locale === "th" ? "ค่าใช้จ่าย" : "Tuition"}</p>
                <p className="text-xs font-semibold text-white">{locale === "th" ? "ไม่มีค่าใช้จ่าย (ให้เปล่า)" : "Free (Donation-based)"}</p>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-neutral-400">{locale === "th" ? "สถานที่ปฏิบัติ" : "Accommodations"}</p>
                <p className="text-xs font-semibold text-white">{locale === "th" ? "กุฏิเดี่ยว/เรือนนอนสัปปายะ" : "Private Kuti & Hall"}</p>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-neutral-400">{locale === "th" ? "การรับรองผล" : "Recognition"}</p>
                <p className="text-xs font-semibold text-white">{locale === "th" ? "มีวุฒิบัตรรับรอง" : "Retreat Certificate"}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* Filters Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200/80 p-4 sm:p-5 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">
                {locale === "th" ? "รูปแบบ:" : "Format:"}
              </span>
              <button
                type="button"
                onClick={() => setFormatFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  formatFilter === "ALL"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {locale === "th" ? "ทั้งหมด" : "All"}
              </button>
              <button
                type="button"
                onClick={() => setFormatFilter("RESIDENTIAL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  formatFilter === "RESIDENTIAL"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {locale === "th" ? "พักค้างคืน (Residential)" : "Residential"}
              </button>
              <button
                type="button"
                onClick={() => setFormatFilter("ONE_DAY")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  formatFilter === "ONE_DAY"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {locale === "th" ? "วันเดียว (One-Day)" : "One-Day"}
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">
                {locale === "th" ? "ระดับ:" : "Level:"}
              </span>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                aria-label={locale === "th" ? "เลือกระดับการอบรม" : "Select training level"}
                className="text-xs rounded-lg border-neutral-300 bg-neutral-50 px-3 py-1.5 text-neutral-700 focus:border-amber-500 focus:ring-amber-500"
              >
                <option value="ALL">{locale === "th" ? "ทุกระดับความรู้" : "All Levels"}</option>
                <option value="BEGINNER">{t("meditation.level.beginner")}</option>
                <option value="INTERMEDIATE">{t("meditation.level.intermediate")}</option>
                <option value="ADVANCED">{t("meditation.level.advanced")}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Courses Listing */}
        {filteredCourses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
            <Flower2 className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-600 font-medium">{t("meditation.empty")}</p>
            <p className="text-xs text-neutral-400 mt-1">
              {locale === "th" ? "โปรดติดตามประกาศคอร์สอบรมรุ่นถัดไปในเร็วๆ นี้" : "Please check back soon for upcoming sessions"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const startDateFormatted = new Date(course.startDate).toLocaleDateString(
                locale === "th" ? "th-TH" : "en-US",
                { day: "numeric", month: "short", year: "numeric" }
              );
              const endDateFormatted = new Date(course.endDate).toLocaleDateString(
                locale === "th" ? "th-TH" : "en-US",
                { day: "numeric", month: "short", year: "numeric" }
              );
              const remainingSeats = Math.max(0, course.maxParticipants - course.confirmedCount);
              const isFull = remainingSeats === 0;
              const isClosed = course.status === "CLOSED" || isFull;

              return (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl border border-neutral-200/90 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group"
                >
                  {/* Image banner */}
                  <div className="relative h-44 w-full bg-stone-100 overflow-hidden">
                    {course.imageUrl ? (
                      <Image
                        src={course.imageUrl}
                        alt={course.titleTh}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-amber-900/40 to-stone-800 text-amber-200/60">
                        <Flower2 className="w-16 h-16 opacity-40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                    {/* Format Badge */}
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide bg-amber-500 text-white shadow-sm">
                        {course.format === "RESIDENTIAL"
                          ? locale === "th"
                            ? "พักค้างคืน"
                            : "Residential"
                          : locale === "th"
                          ? "วันเดียว"
                          : "1-Day"}
                      </span>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide bg-black/60 backdrop-blur-sm text-neutral-200 border border-white/10">
                        {course.level === "BEGINNER"
                          ? locale === "th" ? "เบื้องต้น" : "Beginner"
                          : course.level === "INTERMEDIATE"
                          ? locale === "th" ? "ระดับกลาง" : "Intermediate"
                          : locale === "th" ? "เข้มข้น" : "Advanced"}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      {isClosed ? (
                        <span className="px-2 py-1 rounded-md text-[11px] font-medium bg-red-500/90 text-white">
                          {locale === "th" ? "เต็ม / ปิดรับ" : "Closed"}
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-md text-[11px] font-medium bg-emerald-500/90 text-white">
                          {locale === "th" ? "เปิดรับสมัคร" : "Open"}
                        </span>
                      )}
                    </div>

                    {/* Course Code on bottom banner */}
                    <div className="absolute bottom-2.5 left-3 text-white/90 text-xs font-mono font-medium">
                      {course.code}
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h2 className="text-base font-bold text-neutral-900 line-clamp-1 mb-1 group-hover:text-amber-700 transition-colors">
                        {locale === "th" ? course.titleTh : course.titleEn}
                      </h2>
                      <p className="text-xs text-neutral-500 line-clamp-2 mb-4 leading-relaxed">
                        {locale === "th" ? course.descriptionTh : course.descriptionEn}
                      </p>

                      <div className="space-y-2 border-t border-neutral-100 pt-3 text-xs text-neutral-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>
                            {startDateFormatted} — {endDateFormatted}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="truncate">{course.location}</span>
                        </div>
                        {course.instructors.length > 0 && (
                          <div className="flex items-start gap-2">
                            <BookOpen className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <span className="truncate">{course.instructors.join(", ")}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Seat progress and actions */}
                    <div className="mt-5 pt-3 border-t border-neutral-100">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-neutral-500">{locale === "th" ? "ที่นั่งว่างคงเหลือ" : "Seats Remaining"}</span>
                        <span className="font-semibold text-neutral-800">
                          {remainingSeats} / {course.maxParticipants}{" "}
                          <span className="text-neutral-400 font-normal">
                            ({locale === "th" ? "ท่าน" : "seats"})
                          </span>
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden mb-4">
                        <div
                          className={`h-full rounded-full ${
                            isFull ? "bg-red-500" : "bg-amber-600"
                          }`}
                          style={{
                            width: `${Math.min(
                              100,
                              (course.confirmedCount / course.maxParticipants) * 100
                            )}%`,
                          }}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/portal/meditation/${course.id}`}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors"
                        >
                          <span>{locale === "th" ? "รายละเอียด" : "Details"}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>

                        <button
                          type="button"
                          disabled={isClosed}
                          onClick={() => openRegisterModal(course)}
                          className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white transition-colors shadow-sm ${
                            isClosed
                              ? "bg-neutral-300 cursor-not-allowed text-neutral-500"
                              : "bg-amber-700 hover:bg-amber-800"
                          }`}
                        >
                          <Flower2 className="w-3.5 h-3.5" />
                          <span>{t("meditation.registerNow")}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Quick Registration Modal */}
      {modalOpen && selectedCourse && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-900 to-stone-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-amber-300 font-mono">{selectedCourse.code}</p>
                <h3 className="text-base font-bold">
                  {locale === "th" ? selectedCourse.titleTh : selectedCourse.titleEn}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-neutral-300 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-900">
                <p className="font-semibold mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600" />
                  {locale === "th" ? "แนวปฏิบัติก่อนสมัคร" : "Registration Notice"}
                </p>
                <p className="text-neutral-600">
                  {locale === "th"
                    ? "หลักสูตรนี้จัดขึ้นเพื่อส่งเสริมการเจริญสติภาวนา กรุณากรอกข้อมูลส่วนบุคคลและข้อมูลสุขภาพตามความเป็นจริง เพื่อการดูแลอย่างถูกต้องและเหมาะสม"
                    : "Please fill out personal and medical details accurately to ensure appropriate accommodation and care."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {t("meditation.fullNameTh")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullNameTh}
                    onChange={(e) => setFullNameTh(e.target.value)}
                    placeholder="เช่น นายพงศกร สว่างธรรม"
                    className="w-full text-xs rounded-lg border-neutral-300 px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {t("meditation.fullNameEn")}
                  </label>
                  <input
                    type="text"
                    value={fullNameEn}
                    onChange={(e) => setFullNameEn(e.target.value)}
                    placeholder="e.g. Mr. Pongsakorn Swangtham"
                    className="w-full text-xs rounded-lg border-neutral-300 px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {t("meditation.gender")} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full text-xs rounded-lg border-neutral-300 px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="MALE">{t("meditation.gender.male")}</option>
                    <option value="FEMALE">{t("meditation.gender.female")}</option>
                    <option value="OTHER">{t("meditation.gender.other")}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {t("meditation.age")}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="เช่น 35"
                    className="w-full text-xs rounded-lg border-neutral-300 px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {t("meditation.phone")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08X-XXX-XXXX"
                    className="w-full text-xs rounded-lg border-neutral-300 px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {t("meditation.email")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="applicant@example.com"
                    className="w-full text-xs rounded-lg border-neutral-300 px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {t("meditation.occupation")}
                  </label>
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="เช่น อาจารย์ / ข้าราชการ / นักศึกษา"
                    className="w-full text-xs rounded-lg border-neutral-300 px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {t("meditation.dietaryRequirements")}
                  </label>
                  <select
                    value={dietaryRequirements}
                    onChange={(e) => setDietaryRequirements(e.target.value)}
                    className="w-full text-xs rounded-lg border-neutral-300 px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="ปกติ (ทั่วไป)">ปกติ (ทั่วไป)</option>
                    <option value="มังสวิรัติ (Vegetarian)">มังสวิรัติ (Vegetarian)</option>
                    <option value="เจ (Vegan)">เจ (Vegan)</option>
                    <option value="ฮาลาล (Halal)">ฮาลาล (Halal)</option>
                  </select>
                </div>
              </div>

              {/* Emergency contact */}
              <div className="border-t border-neutral-200 pt-3">
                <h4 className="text-xs font-bold text-neutral-800 mb-2">
                  {t("meditation.emergencyContact")} <span className="text-red-500">*</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-600 mb-1">
                      {t("meditation.emergencyName")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={emergencyContactName}
                      onChange={(e) => setEmergencyContactName(e.target.value)}
                      placeholder="ชื่อ-สกุล ผู้ติดต่อฉุกเฉิน (เช่น ญาติสนิท)"
                      className="w-full text-xs rounded-lg border-neutral-300 px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-600 mb-1">
                      {t("meditation.emergencyPhone")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={emergencyContactPhone}
                      onChange={(e) => setEmergencyContactPhone(e.target.value)}
                      placeholder="08X-XXX-XXXX"
                      className="w-full text-xs rounded-lg border-neutral-300 px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Health & Prior Experience */}
              <div className="border-t border-neutral-200 pt-3 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {t("meditation.medicalConditions")}
                  </label>
                  <input
                    type="text"
                    value={medicalConditions}
                    onChange={(e) => setMedicalConditions(e.target.value)}
                    placeholder="เช่น โรคความดัน, ภูมิแพ้, ข้อเข่าเสื่อม (หากไม่มีให้เว้นว่าง)"
                    className="w-full text-xs rounded-lg border-neutral-300 px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {t("meditation.experience")}
                  </label>
                  <textarea
                    rows={2}
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="เช่น เคยเข้าอบรม 7 วันที่สำนักสงฆ์..., หรือไม่เคยมีประสบการณ์มาก่อน"
                    className="w-full text-xs rounded-lg border-neutral-300 px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                >
                  {locale === "th" ? "ยกเลิก" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isPending ? (locale === "th" ? "กำลังส่งข้อมูล..." : "Submitting...") : t("meditation.registerNow")}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
