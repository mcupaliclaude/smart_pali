"use client";

import { useState, useTransition, useMemo } from "react";
import Image from "next/image";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Car,
  Building2,
  CheckCircle2,
  Plus,
  Send,
  X,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/shared/lib/i18n/client";
import type { ReservableResourceDto, ResourceReservationDto } from "@/features/reservations";
import { createReservationAction } from "@/features/reservations/actions";

interface PortalReservationsClientProps {
  initialResources: ReservableResourceDto[];
  initialReservations: ResourceReservationDto[];
  locale: string;
}

export function PortalReservationsClient({
  initialResources,
  initialReservations,
  locale,
}: PortalReservationsClientProps) {
  const t = useT();
  const [resources] = useState<ReservableResourceDto[]>(initialResources);
  const [reservations, setReservations] = useState<ResourceReservationDto[]>(initialReservations);
  const [activeTab, setActiveTab] = useState<"ALL" | "FACILITY" | "VEHICLE" | "CALENDAR">("ALL");
  const [isPending, startTransition] = useTransition();

  // Booking Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState<string>(resources[0]?.id ?? "");

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formApplicantName, setFormApplicantName] = useState("");
  const [formApplicantEmail, setFormApplicantEmail] = useState("");
  const [formApplicantPhone, setFormApplicantPhone] = useState("");
  const [formDepartmentName, setFormDepartmentName] = useState("");
  const [formStartTime, setFormStartTime] = useState("");
  const [formEndTime, setFormEndTime] = useState("");
  const [formAttendeeCount, setFormAttendeeCount] = useState("10");
  const [formPurpose, setFormPurpose] = useState("");
  const [formNeedDriver, setFormNeedDriver] = useState(false);
  const [formSpecialRequests, setFormSpecialRequests] = useState("");

  const selectedResource = useMemo(
    () => resources.find((r) => r.id === selectedResourceId),
    [resources, selectedResourceId]
  );

  const filteredResources = useMemo(() => {
    if (activeTab === "ALL" || activeTab === "CALENDAR") return resources;
    return resources.filter((r) => r.type === activeTab);
  }, [resources, activeTab]);

  function openBookingModal(resourceId?: string) {
    if (resourceId) setSelectedResourceId(resourceId);
    setModalOpen(true);
  }

  function handleBookingSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedResourceId) {
      toast.error("กรุณาเลือกสถานที่หรือยานพาหนะ");
      return;
    }
    if (!formStartTime || !formEndTime) {
      toast.error("กรุณาระบุวันและเวลาเริ่มต้นและสิ้นสุด");
      return;
    }
    if (new Date(formEndTime) <= new Date(formStartTime)) {
      toast.error("เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่มต้น");
      return;
    }

    startTransition(async () => {
      const res = await createReservationAction({
        resourceId: selectedResourceId,
        title: formTitle.trim(),
        applicantName: formApplicantName.trim(),
        applicantEmail: formApplicantEmail.trim(),
        applicantPhone: formApplicantPhone.trim(),
        departmentName: formDepartmentName.trim(),
        startTime: new Date(formStartTime),
        endTime: new Date(formEndTime),
        attendeeCount: Number(formAttendeeCount) || 1,
        purpose: formPurpose.trim(),
        needDriver: selectedResource?.type === "VEHICLE" ? formNeedDriver : false,
        specialRequests: formSpecialRequests.trim() || null,
      });

      if (res.ok) {
        toast.success(t("reservations.successCreated"));
        setReservations((prev) => [res.data, ...prev]);
        setModalOpen(false);
        // Reset form
        setFormTitle("");
        setFormApplicantName("");
        setFormApplicantEmail("");
        setFormApplicantPhone("");
        setFormDepartmentName("");
        setFormStartTime("");
        setFormEndTime("");
        setFormPurpose("");
        setFormSpecialRequests("");
      } else {
        if (res.error.message.includes("conflict")) {
          toast.error(t("reservations.conflictError"));
        } else {
          toast.error(res.error.message);
        }
      }
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-600/10 via-amber-600/5 to-transparent border-b border-slate-200 dark:border-slate-800 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t("reservations.title")}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              {t("reservations.title")}
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              {t("reservations.publicSubtitle")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => openBookingModal()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-600/20 transition-all hover:shadow-lg"
              >
                <Plus className="h-4 w-4" />
                <span>{t("reservations.requestReservation")}</span>
              </button>
              <button
                onClick={() => setActiveTab("CALENDAR")}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                <Calendar className="h-4 w-4 text-amber-500" />
                <span>ตรวจสอบตารางการใช้งาน</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 pb-6 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === "ALL"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
            }`}
          >
            ทั้งหมด ({resources.length})
          </button>
          <button
            onClick={() => setActiveTab("FACILITY")}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === "FACILITY"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>ห้องประชุม / อาคาร ({resources.filter((r) => r.type === "FACILITY").length})</span>
          </button>
          <button
            onClick={() => setActiveTab("VEHICLE")}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === "VEHICLE"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
            }`}
          >
            <Car className="h-4 w-4" />
            <span>ยานพาหนะบริการ ({resources.filter((r) => r.type === "VEHICLE").length})</span>
          </button>
          <button
            onClick={() => setActiveTab("CALENDAR")}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === "CALENDAR"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>ตารางการใช้งาน / ปฏิทิน</span>
          </button>
        </div>

        {/* Content View: Calendar / Schedule */}
        {activeTab === "CALENDAR" ? (
          <div className="mt-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-amber-600" />
                <span>ตารางการใช้สถานที่และยานพาหนะที่ได้รับอนุมัติแล้ว</span>
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                รายการจองที่ผ่านการอนุมัติและยืนยันการใช้สถานที่/รถยนต์คณะ
              </p>
            </div>

            {reservations.filter((r) => r.status === "APPROVED").length === 0 ? (
              <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500">
                <Calendar className="h-12 w-12 mx-auto text-slate-400 mb-3" />
                <p className="font-medium">ยังไม่มีรายการจองที่ได้รับการอนุมัติในช่วงเวลานี้</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reservations
                  .filter((r) => r.status === "APPROVED")
                  .map((resv) => (
                    <div
                      key={resv.id}
                      className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between hover:border-amber-400 transition"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>อนุมัติแล้ว</span>
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            {resv.reservationNo}
                          </span>
                        </div>

                        <h3 className="font-bold text-slate-900 dark:text-white text-base line-clamp-2">
                          {resv.title}
                        </h3>

                        <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300 pt-1">
                          <div className="flex items-center gap-2 font-medium text-amber-600 dark:text-amber-400">
                            {resv.resourceType === "FACILITY" ? (
                              <Building2 className="h-4 w-4 shrink-0" />
                            ) : (
                              <Car className="h-4 w-4 shrink-0" />
                            )}
                            <span>{locale === "th" ? resv.resourceNameTh : resv.resourceNameEn}</span>
                          </div>

                          <div className="flex items-center gap-2 text-slate-500">
                            <Clock className="h-3.5 w-3.5 shrink-0" />
                            <span>
                              {new Date(resv.startTime).toLocaleString(locale === "th" ? "th-TH" : "en-US", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}{" "}
                              -{" "}
                              {new Date(resv.endTime).toLocaleString(locale === "th" ? "th-TH" : "en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-slate-500">
                            <Users className="h-3.5 w-3.5 shrink-0" />
                            <span>จำนวน {resv.attendeeCount} คน ({resv.departmentName})</span>
                          </div>
                        </div>
                      </div>

                      {resv.driverName && (
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                          พนักงานขับรถ: <strong className="text-slate-700 dark:text-slate-200">{resv.driverName}</strong>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        ) : (
          /* Content View: Resources Cards Grid */
          <div className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((res) => (
                <div
                  key={res.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
                >
                  <div>
                    {/* Image Header */}
                    <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      {res.imageUrl ? (
                        <Image
                          src={res.imageUrl}
                          alt={res.nameTh}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-slate-400">
                          {res.type === "FACILITY" ? (
                            <Building2 className="h-12 w-12" />
                          ) : (
                            <Car className="h-12 w-12" />
                          )}
                        </div>
                      )}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white/90 text-slate-900 dark:bg-slate-900/90 dark:text-white backdrop-blur shadow-xs">
                          {res.type === "FACILITY" ? "ห้องประชุม" : "ยานพาหนะ"}
                        </span>
                        {res.status === "AVAILABLE" ? (
                          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500 text-white shadow-xs">
                            พร้อมใช้งาน
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500 text-white shadow-xs">
                            ซ่อมบำรุง
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-5 space-y-3">
                      <div>
                        <div className="text-xs font-mono text-amber-600 dark:text-amber-400 font-semibold mb-1">
                          {res.code}
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-snug">
                          {locale === "th" ? res.nameTh : res.nameEn}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {locale === "th" ? res.nameEn : res.nameTh}
                        </p>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                          <span>{res.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-slate-400 shrink-0" />
                          <span>รองรับได้สูงสุด {res.capacity} {t("reservations.capacityUnit")}</span>
                        </div>
                      </div>

                      {/* Amenities Chips */}
                      {res.amenities.length > 0 && (
                        <div className="pt-2 flex flex-wrap gap-1.5">
                          {res.amenities.map((item, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="p-5 pt-0">
                    <button
                      onClick={() => openBookingModal(res.id)}
                      disabled={res.status !== "AVAILABLE"}
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-4 w-4" />
                      <span>{t("reservations.requestReservation")}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reservation Request Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t("reservations.requestReservation")}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  กรอกข้อมูลเพื่อขอรับบริการจองสถานที่หรือยานพาหนะ
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleBookingSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Select Resource */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  เลือกห้องประชุมหรือยานพาหนะ *
                </label>
                <select
                  value={selectedResourceId}
                  onChange={(e) => setSelectedResourceId(e.target.value)}
                  className="w-full p-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                >
                  {resources.map((r) => (
                    <option key={r.id} value={r.id}>
                      [{r.type === "FACILITY" ? "ห้อง" : "รถ"}] {locale === "th" ? r.nameTh : r.nameEn} ({r.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Title / Subject */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t("reservations.titleSubject")} *
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="เช่น การสัมมนาทางวิชาการพระพุทธศาสนา ประจำปี 2570..."
                  className="w-full p-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              {/* Applicant Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t("reservations.applicantName")} *
                  </label>
                  <input
                    type="text"
                    value={formApplicantName}
                    onChange={(e) => setFormApplicantName(e.target.value)}
                    placeholder="เช่น พระมหาสมชาย สุทฺธิญาโณ / ดร. ปิยะวัฒน์"
                    className="w-full p-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t("reservations.applicantEmail")} *
                  </label>
                  <input
                    type="email"
                    value={formApplicantEmail}
                    onChange={(e) => setFormApplicantEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full p-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t("reservations.applicantPhone")} *
                  </label>
                  <input
                    type="tel"
                    value={formApplicantPhone}
                    onChange={(e) => setFormApplicantPhone(e.target.value)}
                    placeholder="081-234-5678"
                    className="w-full p-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t("reservations.department")} *
                  </label>
                  <input
                    type="text"
                    value={formDepartmentName}
                    onChange={(e) => setFormDepartmentName(e.target.value)}
                    placeholder="เช่น ภาควิชาภาษาบาลีและสันสกฤต"
                    className="w-full p-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>

              {/* Time and Attendees */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t("reservations.startTime")} *
                  </label>
                  <input
                    type="datetime-local"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full p-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t("reservations.endTime")} *
                  </label>
                  <input
                    type="datetime-local"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full p-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t("reservations.attendeeCount")}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formAttendeeCount}
                    onChange={(e) => setFormAttendeeCount(e.target.value)}
                    className="w-full p-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t("reservations.purpose")} *
                </label>
                <textarea
                  rows={3}
                  value={formPurpose}
                  onChange={(e) => setFormPurpose(e.target.value)}
                  placeholder="ระบุรายละเอียดการใช้งาน เช่น วัตถุประสงค์ กำหนดการ หรือกิจกรรม..."
                  className="w-full p-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              {/* Vehicle specific */}
              {selectedResource?.type === "VEHICLE" && (
                <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formNeedDriver}
                      onChange={(e) => setFormNeedDriver(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                      {t("reservations.needDriver")} (คณะจัดสรรพนักงานขับรถให้)
                    </span>
                  </label>
                </div>
              )}

              {/* Special Requests */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t("reservations.specialRequests")}
                </label>
                <input
                  type="text"
                  value={formSpecialRequests}
                  onChange={(e) => setFormSpecialRequests(e.target.value)}
                  placeholder="เช่น ขอไมโครโฟนไร้สาย 2 ตัว, ขอเปิดเครื่องปรับอากาศก่อนเริ่ม 30 นาที..."
                  className="w-full p-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 shadow-md transition disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>{isPending ? "กำลังบันทึก..." : "ส่งคำขอจอง"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
