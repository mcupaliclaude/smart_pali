"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Flower2,
  HeartHandshake,
  Send,
  X,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/shared/lib/i18n/client";
import type { MeditationCourseDto } from "@/features/meditation";
import { createMeditationRegistrationAction } from "@/features/meditation/actions";

interface CourseDetailClientProps {
  course: MeditationCourseDto;
  locale: string;
}

export function CourseDetailClient({ course, locale }: CourseDetailClientProps) {
  const t = useT();
  const [modalOpen, setModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Form states
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

  const startDateFormatted = new Date(course.startDate).toLocaleDateString(
    locale === "th" ? "th-TH" : "en-US",
    { day: "numeric", month: "long", year: "numeric" }
  );
  const endDateFormatted = new Date(course.endDate).toLocaleDateString(
    locale === "th" ? "th-TH" : "en-US",
    { day: "numeric", month: "long", year: "numeric" }
  );

  const remainingSeats = Math.max(0, course.maxParticipants - course.confirmedCount);
  const isFull = remainingSeats === 0;
  const isClosed = course.status === "CLOSED" || isFull;

  function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
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
        courseId: course.id,
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
        // Reset
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
      {/* Top Banner Navigation */}
      <div className="bg-stone-900 text-white border-b border-stone-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/portal/meditation"
            className="inline-flex items-center gap-2 text-xs text-neutral-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{locale === "th" ? "กลับหน้ารวมคอร์สปฏิบัติธรรม" : "Back to All Retreats"}</span>
          </Link>
        </div>
      </div>

      {/* Hero Header */}
      <div className="bg-gradient-to-b from-stone-900 via-stone-850 to-stone-900 text-white pt-8 pb-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500 text-white">
              {course.format === "RESIDENTIAL"
                ? locale === "th" ? "พักค้างคืนที่ศูนย์ (Residential)" : "Residential Retreat"
                : locale === "th" ? "ไป-กลับ วันเดียว (One-Day)" : "One-Day Workshop"}
            </span>
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white/10 text-neutral-200 border border-white/10">
              {course.level === "BEGINNER"
                ? locale === "th" ? "ระดับเบื้องต้น" : "Beginner"
                : course.level === "INTERMEDIATE"
                ? locale === "th" ? "ระดับกลาง" : "Intermediate"
                : locale === "th" ? "ระดับเข้มข้น" : "Advanced"}
            </span>
            <span className="px-2.5 py-1 rounded-md text-xs font-mono text-amber-300 bg-amber-500/10 border border-amber-400/20">
              {course.code}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-4">
            {locale === "th" ? course.titleTh : course.titleEn}
          </h1>

          <p className="text-neutral-300 text-sm sm:text-base max-w-3xl leading-relaxed">
            {locale === "th" ? course.descriptionTh : course.descriptionEn}
          </p>
        </div>
      </div>

      {/* Main Grid: Details + Sticky Registration Card */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Comprehensive Retreat Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image banner */}
            {course.imageUrl && (
              <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden shadow-sm border border-neutral-200">
                <Image
                  src={course.imageUrl}
                  alt={course.titleTh}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Retreat Details & Objectives */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-neutral-200/80">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <span>{locale === "th" ? "ข้อมูลและวัตถุประสงค์โครงการ" : "Course Overview & Objectives"}</span>
              </h2>
              <div className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line space-y-4">
                <p>{locale === "th" ? course.descriptionTh : course.descriptionEn}</p>
              </div>

              {/* Instructors */}
              {course.instructors.length > 0 && (
                <div className="mt-6 pt-6 border-t border-neutral-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-amber-600" />
                    <span>{t("meditation.instructors")}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {course.instructors.map((ins, idx) => (
                      <div
                        key={idx}
                        className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-3 flex items-center gap-3 text-xs font-medium text-amber-950"
                      >
                        <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center shrink-0 font-bold">
                          {idx + 1}
                        </div>
                        <span>{ins}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Daily Practice Schedule */}
            {course.schedule.length > 0 && (
              <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-neutral-200/80">
                <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <span>{t("meditation.schedule")}</span>
                </h2>
                <div className="space-y-3">
                  {course.schedule.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-4 p-3 rounded-xl bg-neutral-50 border border-neutral-100 text-xs"
                    >
                      <div className="w-24 shrink-0 font-mono font-bold text-amber-700 bg-amber-100/70 px-2.5 py-1 rounded-md text-center">
                        {item.time}
                      </div>
                      <div className="pt-0.5 text-neutral-800 font-medium">{item.activity}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Guidelines & Rules */}
            {course.guidelines.length > 0 && (
              <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-neutral-200/80">
                <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                  <span>{t("meditation.guidelines")}</span>
                </h2>
                <ul className="space-y-3 text-xs sm:text-sm text-neutral-700">
                  {course.guidelines.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right 1 Col: Sticky Course Summary & Quick Action Card */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-md border border-neutral-200/90 sticky top-6">
              <h3 className="text-base font-bold text-neutral-900 mb-4 pb-3 border-b border-neutral-100">
                {locale === "th" ? "ข้อมูลการรับสมัคร" : "Enrollment Summary"}
              </h3>

              <div className="space-y-3.5 text-xs text-neutral-600 mb-6">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-neutral-800 block">
                      {locale === "th" ? "วันจัดอบรม" : "Dates"}
                    </span>
                    <span>
                      {startDateFormatted} — {endDateFormatted}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-neutral-800 block">
                      {locale === "th" ? "สถานที่จัดปฏิบัติ" : "Venue"}
                    </span>
                    <span>{course.location}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-neutral-800 block">
                      {locale === "th" ? "จำนวนรับสมัคร" : "Capacity"}
                    </span>
                    <span>
                      {course.confirmedCount} / {course.maxParticipants} {locale === "th" ? "ท่าน" : "seats"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <HeartHandshake className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-neutral-800 block">
                      {locale === "th" ? "ค่าใช้จ่าย" : "Tuition & Sponsorship"}
                    </span>
                    <span className="text-emerald-700 font-medium">
                      {course.feeNote || (locale === "th" ? "ไม่มีค่าใช้จ่าย (ให้เปล่า)" : "Free of charge")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="bg-neutral-50 rounded-xl p-3.5 border border-neutral-100 mb-6">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-neutral-500">{locale === "th" ? "ที่นั่งว่างคงเหลือ" : "Seats Left"}</span>
                  <span className="font-bold text-neutral-800">
                    {remainingSeats} / {course.maxParticipants}
                  </span>
                </div>
                <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
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
              </div>

              {/* Big CTA button */}
              <button
                type="button"
                disabled={isClosed}
                onClick={() => setModalOpen(true)}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all ${
                  isClosed
                    ? "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                    : "bg-amber-700 hover:bg-amber-800 text-white"
                }`}
              >
                <Flower2 className="w-4 h-4" />
                <span>{isClosed ? (locale === "th" ? "ปิดรับสมัครแล้ว" : "Enrollment Closed") : t("meditation.registerNow")}</span>
              </button>

              <p className="text-[11px] text-neutral-400 text-center mt-3">
                {locale === "th"
                  ? "* เมื่อส่งใบสมัครแล้ว เจ้าหน้าที่จะติดต่อยืนยันสิทธิ์และแจ้งการจัดสรรกุฏิที่พัก"
                  : "* After submitting, staff will contact you to confirm room allocation."}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Registration Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-900 to-stone-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-amber-300 font-mono">{course.code}</p>
                <h3 className="text-base font-bold">
                  {locale === "th" ? course.titleTh : course.titleEn}
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
