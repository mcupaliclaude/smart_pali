"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Plus,
  Search,
  Trash2,
  Edit2,
  Flower2,
} from "lucide-react";
import { toast } from "sonner";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import {
  DataTable,
  DataTableColumn,
  RowMenuItem,
  StatusPill,
  LiyonCard,
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonField,
} from "@/shared/components/liyon";
import type { MeditationCourseDto, MeditationRegistrationDto } from "@/features/meditation";
import {
  createMeditationCourseAction,
  updateMeditationCourseAction,
  deleteMeditationCourseAction,
  reviewMeditationRegistrationAction,
  cancelMeditationRegistrationAction,
} from "@/features/meditation/actions";

interface MeditationClientProps {
  initialCourses: MeditationCourseDto[];
  initialRegistrations: MeditationRegistrationDto[];
  canReview: boolean;
  canManage: boolean;
}

export function MeditationClient({
  initialCourses,
  initialRegistrations,
  canReview,
  canManage,
}: MeditationClientProps) {
  const t = useT();
  const locale = useLocale();

  const [courses, setCourses] = useState<MeditationCourseDto[]>(initialCourses);
  const [registrations, setRegistrations] = useState<MeditationRegistrationDto[]>(initialRegistrations);
  const [activeTab, setActiveTab] = useState<"pending" | "allRegistrations" | "courses">("pending");
  const [isPending, startTransition] = useTransition();

  // Filter & Search
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Review Dialog State
  const [reviewTarget, setReviewTarget] = useState<MeditationRegistrationDto | null>(null);
  const [reviewStatus, setReviewStatus] = useState<"CONFIRMED" | "WAITLIST" | "CANCELLED">("CONFIRMED");
  const [reviewRoomAssigned, setReviewRoomAssigned] = useState("");
  const [reviewNote, setReviewNote] = useState("");

  // Course Modal (Create / Edit)
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<MeditationCourseDto | null>(null);
  const [deleteCourseTarget, setDeleteCourseTarget] = useState<MeditationCourseDto | null>(null);

  // Course Form States
  const [courseCode, setCourseCode] = useState("");
  const [courseTitleTh, setCourseTitleTh] = useState("");
  const [courseTitleEn, setCourseTitleEn] = useState("");
  const [courseFormat, setCourseFormat] = useState<"RESIDENTIAL" | "ONE_DAY">("RESIDENTIAL");
  const [courseLevel, setCourseLevel] = useState<"BEGINNER" | "INTERMEDIATE" | "ADVANCED">("BEGINNER");
  const [courseStartDate, setCourseStartDate] = useState("");
  const [courseEndDate, setCourseEndDate] = useState("");
  const [courseLocation, setCourseLocation] = useState("");
  const [courseMaxParticipants, setCourseMaxParticipants] = useState("50");
  const [courseInstructors, setCourseInstructors] = useState("");
  const [courseDescriptionTh, setCourseDescriptionTh] = useState("");
  const [courseDescriptionEn, setCourseDescriptionEn] = useState("");
  const [courseGuidelines, setCourseGuidelines] = useState("");
  const [courseFeeNote, setCourseFeeNote] = useState("");
  const [courseImageUrl, setCourseImageUrl] = useState("");
  const [courseStatus, setCourseStatus] = useState<"DRAFT" | "OPEN" | "CLOSED" | "COMPLETED">("OPEN");
  const [courseSeq, setCourseSeq] = useState("1");

  // Stats
  const stats = useMemo(() => {
    return {
      openCourses: courses.filter((c) => c.status === "OPEN").length,
      totalRegs: registrations.length,
      confirmed: registrations.filter((r) => r.status === "CONFIRMED").length,
      pending: registrations.filter((r) => r.status === "PENDING").length,
    };
  }, [courses, registrations]);

  // Filtered registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((r) => {
      if (activeTab === "pending" && r.status !== "PENDING") return false;

      const matchSearch =
        search === "" ||
        r.registrationNo.toLowerCase().includes(search.toLowerCase()) ||
        r.fullNameTh.toLowerCase().includes(search.toLowerCase()) ||
        (r.fullNameEn && r.fullNameEn.toLowerCase().includes(search.toLowerCase())) ||
        r.courseCode.toLowerCase().includes(search.toLowerCase()) ||
        r.phone.includes(search) ||
        r.email.toLowerCase().includes(search.toLowerCase());

      const matchCourse = courseFilter === "ALL" || r.courseId === courseFilter;
      const matchStatus =
        activeTab === "pending" || statusFilter === "ALL" || r.status === statusFilter;

      return matchSearch && matchCourse && matchStatus;
    });
  }, [registrations, activeTab, search, courseFilter, statusFilter]);

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      if (search === "") return true;
      return (
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        c.titleTh.toLowerCase().includes(search.toLowerCase()) ||
        c.titleEn.toLowerCase().includes(search.toLowerCase()) ||
        c.location.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [courses, search]);

  // Handle Review Registration
  function handleReviewSubmit() {
    if (!reviewTarget) return;

    startTransition(async () => {
      const res = await reviewMeditationRegistrationAction({
        registrationId: reviewTarget.id,
        status: reviewStatus,
        roomAssigned: reviewRoomAssigned.trim() || null,
        reviewNote: reviewNote.trim() || null,
      });

      if (res.ok) {
        toast.success(t("meditation.reviewedSuccess"));
        setRegistrations((prev) =>
          prev.map((r) => (r.id === res.data.id ? res.data : r))
        );
        // Also update course confirmed count if confirmed
        setCourses((prev) =>
          prev.map((c) => {
            if (c.id === reviewTarget.courseId) {
              const diff =
                reviewStatus === "CONFIRMED" && reviewTarget.status !== "CONFIRMED"
                  ? 1
                  : reviewTarget.status === "CONFIRMED" && reviewStatus !== "CONFIRMED"
                  ? -1
                  : 0;
              return { ...c, confirmedCount: Math.max(0, c.confirmedCount + diff) };
            }
            return c;
          })
        );
        setReviewTarget(null);
      } else {
        toast.error(res.error.message);
      }
    });
  }

  // Handle Open Create / Edit Course
  function openCourseModal(course?: MeditationCourseDto) {
    if (course) {
      setEditingCourse(course);
      setCourseCode(course.code);
      setCourseTitleTh(course.titleTh);
      setCourseTitleEn(course.titleEn);
      setCourseFormat(course.format);
      setCourseLevel(course.level);
      setCourseStartDate(course.startDate.slice(0, 10));
      setCourseEndDate(course.endDate.slice(0, 10));
      setCourseLocation(course.location);
      setCourseMaxParticipants(String(course.maxParticipants));
      setCourseInstructors(course.instructors.join(", "));
      setCourseDescriptionTh(course.descriptionTh);
      setCourseDescriptionEn(course.descriptionEn);
      setCourseGuidelines(course.guidelines.join("\n"));
      setCourseFeeNote(course.feeNote ?? "");
      setCourseImageUrl(course.imageUrl ?? "");
      setCourseStatus(course.status);
      setCourseSeq(String(course.seq));
    } else {
      setEditingCourse(null);
      const nextSeq = courses.length + 1;
      const yearBe = new Date().getFullYear() + 543;
      setCourseCode(`MED-${yearBe}/${String(nextSeq).padStart(2, "0")}`);
      setCourseTitleTh("");
      setCourseTitleEn("");
      setCourseFormat("RESIDENTIAL");
      setCourseLevel("BEGINNER");
      setCourseStartDate(new Date().toISOString().slice(0, 10));
      setCourseEndDate(new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10));
      setCourseLocation("ศูนย์พัฒนาวิปัสสนาธุระ อาคารปฏิบัติธรรมเฉลิมพระเกียรติ");
      setCourseMaxParticipants("50");
      setCourseInstructors("");
      setCourseDescriptionTh("");
      setCourseDescriptionEn("");
      setCourseGuidelines("ถือศีล 8 ตลอดการอบรม\nงดใช้อุปกรณ์สื่อสาร\nแต่งกายชุดขาวสุภาพ\nรักษาความเงียบสงบ (Noble Silence)");
      setCourseFeeNote("ไม่มีค่าใช้จ่าย (ให้เปล่า)");
      setCourseImageUrl("");
      setCourseStatus("OPEN");
      setCourseSeq(String(nextSeq));
    }
    setCourseModalOpen(true);
  }

  // Handle Save Course
  function handleSaveCourse() {
    if (!courseCode.trim() || !courseTitleTh.trim() || !courseTitleEn.trim()) {
      toast.error("กรุณากรอกรหัสและชื่อคอร์สทั้งไทยและอังกฤษ");
      return;
    }
    if (!courseStartDate || !courseEndDate) {
      toast.error("กรุณาระบุวันเริ่มต้นและสิ้นสุด");
      return;
    }

    const instructors = courseInstructors
      .split(/[,,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const guidelines = courseGuidelines
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    startTransition(async () => {
      if (editingCourse) {
        const res = await updateMeditationCourseAction({
          id: editingCourse.id,
          code: courseCode.trim(),
          titleTh: courseTitleTh.trim(),
          titleEn: courseTitleEn.trim(),
          format: courseFormat,
          level: courseLevel,
          startDate: new Date(courseStartDate),
          endDate: new Date(courseEndDate),
          location: courseLocation.trim(),
          maxParticipants: Number(courseMaxParticipants) || 50,
          instructors,
          descriptionTh: courseDescriptionTh.trim(),
          descriptionEn: courseDescriptionEn.trim(),
          schedule: editingCourse.schedule,
          guidelines,
          feeNote: courseFeeNote.trim() || null,
          imageUrl: courseImageUrl.trim() || null,
          status: courseStatus,
          seq: Number(courseSeq) || 1,
        });

        if (res.ok) {
          toast.success(t("meditation.courseSavedSuccess"));
          setCourses((prev) =>
            prev.map((c) => (c.id === res.data.id ? res.data : c))
          );
          setCourseModalOpen(false);
        } else {
          toast.error(res.error.message);
        }
      } else {
        const res = await createMeditationCourseAction({
          code: courseCode.trim(),
          titleTh: courseTitleTh.trim(),
          titleEn: courseTitleEn.trim(),
          format: courseFormat,
          level: courseLevel,
          startDate: new Date(courseStartDate),
          endDate: new Date(courseEndDate),
          location: courseLocation.trim(),
          maxParticipants: Number(courseMaxParticipants) || 50,
          instructors,
          descriptionTh: courseDescriptionTh.trim(),
          descriptionEn: courseDescriptionEn.trim(),
          schedule: [
            { time: "04:30 - 05:30", activity: "ทำวัตรเช้า เจริญสติภาวนา" },
            { time: "05:30 - 06:30", activity: "ปฏิบัติเดินจงกรมและนั่งสมาธิ" },
            { time: "07:00 - 08:30", activity: "รับประทานอาหารเช้าอย่างมีสติ" },
            { time: "09:00 - 11:00", activity: "ฟังบรรยายธรรมและสอบอารมณ์" },
            { time: "11:30 - 13:00", activity: "รับประทานอาหารกลางวันและพักผ่อน" },
            { time: "13:30 - 16:30", activity: "ปฏิบัติธรรมภาคบ่าย" },
            { time: "17:00 - 18:00", activity: "ดื่มน้ำปานะ" },
            { time: "18:30 - 21:00", activity: "ทำวัตรเย็น สนทนาธรรม และสอบอารมณ์" },
          ],
          guidelines,
          feeNote: courseFeeNote.trim() || null,
          imageUrl: courseImageUrl.trim() || null,
          status: courseStatus,
          seq: Number(courseSeq) || 1,
        });

        if (res.ok) {
          toast.success(t("meditation.courseSavedSuccess"));
          setCourses((prev) => [...prev, res.data]);
          setCourseModalOpen(false);
        } else {
          toast.error(res.error.message);
        }
      }
    });
  }

  // Handle Delete Course
  function handleDeleteCourse() {
    if (!deleteCourseTarget) return;

    startTransition(async () => {
      const res = await deleteMeditationCourseAction(deleteCourseTarget.id);
      if (res.ok) {
        toast.success("ลบคอร์สปฏิบัติธรรมเรียบร้อยแล้ว");
        setCourses((prev) => prev.filter((c) => c.id !== deleteCourseTarget.id));
        setDeleteCourseTarget(null);
      } else {
        toast.error(res.error.message);
      }
    });
  }

  // Handle Cancel Registration
  function handleCancelRegistration(id: string) {
    startTransition(async () => {
      const res = await cancelMeditationRegistrationAction(id);
      if (res.ok) {
        toast.success("ยกเลิกใบสมัครเรียบร้อยแล้ว");
        setRegistrations((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: "CANCELLED" as const } : r))
        );
      } else {
        toast.error(res.error.message);
      }
    });
  }

  function getRegStatusLabel(status: string) {
    switch (status) {
      case "CONFIRMED": return t("meditation.regStatus.confirmed");
      case "PENDING": return t("meditation.regStatus.pending");
      case "WAITLIST": return t("meditation.regStatus.waitlist");
      case "CANCELLED": return t("meditation.regStatus.cancelled");
      default: return status;
    }
  }

  function getRegStatusTone(status: string): "ok" | "warn" | "bad" | "info" | "off" {
    switch (status) {
      case "CONFIRMED": return "ok";
      case "PENDING": return "warn";
      case "WAITLIST": return "info";
      case "CANCELLED": return "bad";
      default: return "off";
    }
  }

  // Registration Columns
  const registrationColumns: DataTableColumn<MeditationRegistrationDto>[] = [
    {
      key: "registrationNo",
      header: t("meditation.registrationNo"),
      render: (row) => (
        <div>
          <span className="font-mono font-bold text-foreground block">
            {row.registrationNo}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(row.createdAt).toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
              day: "numeric",
              month: "short",
            })}
          </span>
        </div>
      ),
    },
    {
      key: "fullName",
      header: t("meditation.fullName"),
      render: (row) => (
        <div>
          <span className="font-semibold text-foreground block">
            {row.fullNameTh}
          </span>
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <span>{row.phone}</span>
            <span>•</span>
            <span>{row.email}</span>
            {row.age && (
              <>
                <span>•</span>
                <span>{row.age} ปี</span>
              </>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "course",
      header: t("meditation.courseTitle"),
      render: (row) => (
        <div className="max-w-xs">
          <span className="font-mono text-xs font-semibold text-amber-600 block">
            {row.courseCode}
          </span>
          <span className="text-xs text-foreground line-clamp-1">
            {locale === "th" ? row.courseTitleTh : row.courseTitleEn}
          </span>
        </div>
      ),
    },
    {
      key: "medicalAndDiet",
      header: "ข้อมูลสุขภาพ / อาหาร",
      render: (row) => (
        <div className="text-xs space-y-0.5">
          {row.medicalConditions ? (
            <div className="text-amber-700 font-medium truncate max-w-[180px]">
              ⚠️ {row.medicalConditions}
            </div>
          ) : (
            <div className="text-muted-foreground">สุขภาพทั่วไปปกติ</div>
          )}
          <div className="text-muted-foreground truncate max-w-[180px]">
            🍽️ {row.dietaryRequirements || "ปกติ"}
          </div>
        </div>
      ),
    },
    {
      key: "roomAssigned",
      header: t("meditation.roomAssigned"),
      render: (row) => (
        <div className="text-xs">
          {row.roomAssigned ? (
            <span className="font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {row.roomAssigned}
            </span>
          ) : (
            <span className="text-muted-foreground italic">ยังไม่ได้จัดสรร</span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: t("meditation.status"),
      render: (row) => (
        <StatusPill tone={getRegStatusTone(row.status)}>
          {getRegStatusLabel(row.status)}
        </StatusPill>
      ),
    },
  ];

  // Course Columns
  const courseColumns: DataTableColumn<MeditationCourseDto>[] = [
    {
      key: "code",
      header: t("meditation.courseCode"),
      render: (row) => (
        <div>
          <span className="font-mono font-bold text-foreground block">{row.code}</span>
          <span className="text-xs text-muted-foreground">ลำดับที่ {row.seq}</span>
        </div>
      ),
    },
    {
      key: "title",
      header: t("meditation.courseTitle"),
      render: (row) => (
        <div className="max-w-sm">
          <div className="font-semibold text-foreground line-clamp-1">
            {locale === "th" ? row.titleTh : row.titleEn}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded">
              {row.format === "RESIDENTIAL" ? "พักค้างคืน" : "วันเดียว"}
            </span>
            <span className="text-[11px] font-medium bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded">
              {row.level === "BEGINNER" ? "เบื้องต้น" : row.level === "INTERMEDIATE" ? "กลาง" : "เข้มข้น"}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "dates",
      header: t("meditation.dates"),
      render: (row) => (
        <div className="text-xs">
          <div className="text-foreground font-medium">
            {new Date(row.startDate).toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
              day: "numeric",
              month: "short",
            })}{" "}
            —{" "}
            {new Date(row.endDate).toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
              day: "numeric",
              month: "short",
              year: "2-digit",
            })}
          </div>
          <div className="text-muted-foreground truncate max-w-[150px]">{row.location}</div>
        </div>
      ),
    },
    {
      key: "capacity",
      header: "ผู้เข้าร่วม / รับได้",
      render: (row) => (
        <div className="text-xs">
          <span className="font-bold text-foreground">
            {row.confirmedCount} / {row.maxParticipants}
          </span>{" "}
          <span className="text-muted-foreground">ท่าน</span>
          {row.pendingCount > 0 && (
            <span className="text-amber-600 font-medium block">
              (รอตรวจ {row.pendingCount})
            </span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: t("meditation.status"),
      render: (row) => {
        const tone =
          row.status === "OPEN"
            ? "ok"
            : row.status === "CLOSED"
            ? "bad"
            : row.status === "DRAFT"
            ? "warn"
            : "off";
        const label =
          row.status === "OPEN"
            ? t("meditation.status.open")
            : row.status === "CLOSED"
            ? t("meditation.status.closed")
            : row.status === "DRAFT"
            ? t("meditation.status.draft")
            : t("meditation.status.completed");
        return <StatusPill tone={tone}>{label}</StatusPill>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Flower2 className="w-7 h-7 text-amber-600" />
            <span>{t("meditation.title")}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t("meditation.subtitle")}</p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={() => openCourseModal()}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{t("meditation.addCourse")}</span>
          </button>
        )}
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <LiyonCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{t("meditation.stat.open")}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stats.openCourses}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Flower2 className="w-5 h-5" />
            </div>
          </div>
        </LiyonCard>

        <LiyonCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{t("meditation.stat.totalRegs")}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stats.totalRegs}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </LiyonCard>

        <LiyonCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{t("meditation.stat.confirmed")}</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.confirmed}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </LiyonCard>

        <LiyonCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{t("meditation.stat.pending")}</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pending}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </LiyonCard>
      </div>

      {/* Tabs & Controls */}
      <LiyonCard className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("pending")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === "pending"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {t("meditation.tab.pending")} ({stats.pending})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("allRegistrations")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === "allRegistrations"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {t("meditation.tab.registrations")} ({stats.totalRegs})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("courses")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === "courses"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {t("meditation.tab.courses")} ({courses.length})
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาตามชื่อ, เลขที่ใบสมัคร, รหัสคอร์ส, เบอร์โทร..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-input bg-background"
            />
          </div>

          {activeTab !== "courses" && (
            <>
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                aria-label="กรองตามคอร์สปฏิบัติธรรม"
                className="text-xs rounded-lg border border-input bg-background px-3 py-1.5 text-foreground"
              >
                <option value="ALL">ทุกลำดับคอร์ส</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.titleTh}
                  </option>
                ))}
              </select>

              {activeTab === "allRegistrations" && (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label="กรองตามสถานะใบสมัคร"
                  className="text-xs rounded-lg border border-input bg-background px-3 py-1.5 text-foreground"
                >
                  <option value="ALL">ทุกสถานะใบสมัคร</option>
                  <option value="PENDING">{t("meditation.regStatus.pending")}</option>
                  <option value="CONFIRMED">{t("meditation.regStatus.confirmed")}</option>
                  <option value="WAITLIST">{t("meditation.regStatus.waitlist")}</option>
                  <option value="CANCELLED">{t("meditation.regStatus.cancelled")}</option>
                </select>
              )}
            </>
          )}
        </div>
      </LiyonCard>

      {/* Table Section */}
      {activeTab === "courses" ? (
        <LiyonCard>
          <DataTable<MeditationCourseDto>
            headHeading={<span className="font-semibold text-sm">{t("meditation.tab.courses")}</span>}
            state={filteredCourses.length > 0 ? "data" : "empty"}
            rows={filteredCourses}
            columns={courseColumns}
            getRowId={(row) => row.id}
            renderRowMenu={(row) => (
              <>
                {canManage && (
                  <RowMenuItem
                    onSelect={() => openCourseModal(row)}
                    icon={<Edit2 className="w-4 h-4 text-blue-600" />}
                  >
                    {t("meditation.editCourse")}
                  </RowMenuItem>
                )}
                {canManage && (
                  <RowMenuItem
                    onSelect={() => setDeleteCourseTarget(row)}
                    icon={<Trash2 className="w-4 h-4 text-red-600" />}
                  >
                    {t("common.delete")}
                  </RowMenuItem>
                )}
              </>
            )}
            empty={{
              icon: <Flower2 className="h-10 w-10 text-muted-foreground/50" />,
              title: t("meditation.empty"),
              description: "ไม่มีรายการคอร์สปฏิบัติธรรมที่ค้นหา",
            }}
            error={{
              icon: <AlertCircle className="h-10 w-10 text-destructive" />,
              title: t("common.error"),
            }}
          />
        </LiyonCard>
      ) : (
        <LiyonCard>
          <DataTable<MeditationRegistrationDto>
            headHeading={
              <span className="font-semibold text-sm">
                {activeTab === "pending"
                  ? t("meditation.tab.pending")
                  : t("meditation.tab.registrations")}
              </span>
            }
            state={filteredRegistrations.length > 0 ? "data" : "empty"}
            rows={filteredRegistrations}
            columns={registrationColumns}
            getRowId={(row) => row.id}
            renderRowMenu={(row) => (
              <>
                {canReview && (
                  <RowMenuItem
                    onSelect={() => {
                      setReviewTarget(row);
                      setReviewStatus(row.status === "PENDING" ? "CONFIRMED" : (row.status as "CONFIRMED" | "WAITLIST" | "CANCELLED"));
                      setReviewRoomAssigned(row.roomAssigned ?? "");
                      setReviewNote(row.reviewNote ?? "");
                    }}
                    icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  >
                    {t("meditation.reviewAction")}
                  </RowMenuItem>
                )}
                {canManage && row.status !== "CANCELLED" && (
                  <RowMenuItem
                    onSelect={() => handleCancelRegistration(row.id)}
                    icon={<Trash2 className="w-4 h-4 text-red-600" />}
                  >
                    {t("meditation.cancelAction")}
                  </RowMenuItem>
                )}
              </>
            )}
            empty={{
              icon: <Users className="h-10 w-10 text-muted-foreground/50" />,
              title: t("meditation.empty"),
              description: "ไม่พบข้อมูลใบสมัครที่ค้นหา",
            }}
            error={{
              icon: <AlertCircle className="h-10 w-10 text-destructive" />,
              title: t("common.error"),
            }}
          />
        </LiyonCard>
      )}

      {/* Review Dialog */}
      <LiyonDialog
        open={Boolean(reviewTarget)}
        onOpenChange={(open) => {
          if (!open) setReviewTarget(null);
        }}
      >
        <LiyonDialogHeader
          title={reviewTarget ? `${t("meditation.reviewAction")} - ${reviewTarget.registrationNo}` : t("meditation.reviewAction")}
          description={reviewTarget ? `${reviewTarget.fullNameTh} (${reviewTarget.courseCode})` : undefined}
        />
        {reviewTarget && (
          <div>
            <LiyonDialogBody className="space-y-4">
              {/* Applicant Info Summary */}
              <div className="bg-muted/50 rounded-xl p-3.5 text-xs space-y-2 border border-border">
                <div className="flex justify-between">
                  <span className="font-semibold text-foreground">{reviewTarget.fullNameTh}</span>
                  <span className="text-muted-foreground">{reviewTarget.gender} • {reviewTarget.age ?? "-"} ปี</span>
                </div>
                <div className="text-muted-foreground">
                  โทร: {reviewTarget.phone} | อีเมล: {reviewTarget.email}
                </div>
                <div className="text-muted-foreground">
                  คอร์ส: <span className="font-medium text-foreground">{reviewTarget.courseCode} - {reviewTarget.courseTitleTh}</span>
                </div>
                {reviewTarget.emergencyContactName && (
                  <div className="text-muted-foreground border-t border-border pt-1">
                    ฉุกเฉิน: {reviewTarget.emergencyContactName} ({reviewTarget.emergencyContactPhone})
                  </div>
                )}
                {reviewTarget.medicalConditions && (
                  <div className="text-amber-700 font-medium">
                    ⚠️ ข้อจำกัดสุขภาพ: {reviewTarget.medicalConditions}
                  </div>
                )}
                {reviewTarget.experience && (
                  <div className="text-neutral-600 italic">
                    ประสบการณ์เดิม: {reviewTarget.experience}
                  </div>
                )}
              </div>

              {/* Status Decision */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  ผลการพิจารณา <span className="text-destructive">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewStatus("CONFIRMED")}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                      reviewStatus === "CONFIRMED"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-background border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    ยืนยันสิทธิ์ (Confirm)
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewStatus("WAITLIST")}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                      reviewStatus === "WAITLIST"
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-background border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    บัญชีสำรอง (Waitlist)
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewStatus("CANCELLED")}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                      reviewStatus === "CANCELLED"
                        ? "bg-red-600 text-white border-red-600 shadow-sm"
                        : "bg-background border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    สละสิทธิ์ / ไม่อนุมัติ
                  </button>
                </div>
              </div>

              {/* Room Assignment */}
              <LiyonField label={t("meditation.roomAssigned")} hint="เช่น กุฏิวิปัสสนาเดี่ยว A-102, ศาลาเรือนนอน 2">
                <input
                  type="text"
                  value={reviewRoomAssigned}
                  onChange={(e) => setReviewRoomAssigned(e.target.value)}
                  placeholder="ระบุห้องพักหรือกุฏิที่จัดสรรให้ผู้ปฏิบัติธรรม"
                  className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2"
                />
              </LiyonField>

              {/* Review Note */}
              <LiyonField label={t("meditation.reviewNote")} hint="บันทึกช่วยจำของเจ้าหน้าที่ (ไม่บังคับ)">
                <textarea
                  rows={2}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="เช่น ตรวจสอบสุขภาพเบื้องต้นผ่านแล้ว จัดให้อยู่ใกล้สุขา..."
                  className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2"
                />
              </LiyonField>
            </LiyonDialogBody>

            <LiyonDialogFooter className="flex justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setReviewTarget(null)}
                className="px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted rounded-lg"
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleReviewSubmit}
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg shadow-sm disabled:opacity-50"
              >
                {isPending ? "กำลังบันทึก..." : t("common.save")}
              </button>
            </LiyonDialogFooter>
          </div>
        )}
      </LiyonDialog>

      {/* Course Modal (Create / Edit) */}
      <LiyonDialog open={courseModalOpen} onOpenChange={setCourseModalOpen}>
        <LiyonDialogHeader
          title={editingCourse ? t("meditation.editCourse") : t("meditation.addCourse")}
          description="กรอกข้อมูลหลักสูตรปฏิบัติธรรมเพื่อเปิดรับสมัครออนไลน์"
        />
        <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
          <LiyonDialogBody className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField label={t("meditation.courseCode") + " *"}>
                <input
                  type="text"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  placeholder="เช่น MED-2570/01"
                  className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2 font-mono"
                />
              </LiyonField>

              <LiyonField label={t("meditation.status")}>
                <select
                  value={courseStatus}
                  onChange={(e) => setCourseStatus(e.target.value as "DRAFT" | "OPEN" | "CLOSED" | "COMPLETED")}
                  className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2"
                >
                  <option value="OPEN">{t("meditation.status.open")}</option>
                  <option value="CLOSED">{t("meditation.status.closed")}</option>
                  <option value="DRAFT">{t("meditation.status.draft")}</option>
                  <option value="COMPLETED">{t("meditation.status.completed")}</option>
                </select>
              </LiyonField>

              <LiyonField label="ชื่อคอร์ส (ภาษาไทย) *">
                <input
                  type="text"
                  value={courseTitleTh}
                  onChange={(e) => setCourseTitleTh(e.target.value)}
                  placeholder="เช่น คอร์สพัฒนาจิตให้เกิดปัญญาและสันติสุข"
                  className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2"
                />
              </LiyonField>

              <LiyonField label="ชื่อคอร์ส (ภาษาอังกฤษ) *">
                <input
                  type="text"
                  value={courseTitleEn}
                  onChange={(e) => setCourseTitleEn(e.target.value)}
                  placeholder="e.g. Insight Meditation & Mindfulness Retreat"
                  className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2"
                />
              </LiyonField>

              <LiyonField label={t("meditation.format")}>
                <select
                  value={courseFormat}
                  onChange={(e) => setCourseFormat(e.target.value as "RESIDENTIAL" | "ONE_DAY")}
                  className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2"
                >
                  <option value="RESIDENTIAL">{t("meditation.format.residential")}</option>
                  <option value="ONE_DAY">{t("meditation.format.one_day")}</option>
                </select>
              </LiyonField>

              <LiyonField label={t("meditation.level")}>
                <select
                  value={courseLevel}
                  onChange={(e) => setCourseLevel(e.target.value as "BEGINNER" | "INTERMEDIATE" | "ADVANCED")}
                  className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2"
                >
                  <option value="BEGINNER">{t("meditation.level.beginner")}</option>
                  <option value="INTERMEDIATE">{t("meditation.level.intermediate")}</option>
                  <option value="ADVANCED">{t("meditation.level.advanced")}</option>
                </select>
              </LiyonField>

              <LiyonField label={t("meditation.startDate") + " *"}>
                <input
                  type="date"
                  value={courseStartDate}
                  onChange={(e) => setCourseStartDate(e.target.value)}
                  className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2"
                />
              </LiyonField>

              <LiyonField label={t("meditation.endDate") + " *"}>
                <input
                  type="date"
                  value={courseEndDate}
                  onChange={(e) => setCourseEndDate(e.target.value)}
                  className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2"
                />
              </LiyonField>

              <LiyonField label={t("meditation.location") + " *"}>
                <input
                  type="text"
                  value={courseLocation}
                  onChange={(e) => setCourseLocation(e.target.value)}
                  placeholder="เช่น ศูนย์พัฒนาวิปัสสนาธุระ อาคารปฏิบัติธรรม"
                  className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2"
                />
              </LiyonField>

              <LiyonField label={t("meditation.maxParticipants")}>
                <input
                  type="number"
                  value={courseMaxParticipants}
                  onChange={(e) => setCourseMaxParticipants(e.target.value)}
                  min="1"
                  className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2"
                />
              </LiyonField>
            </div>

            <LiyonField label={t("meditation.instructors")} hint="คั่นด้วยเครื่องหมายจุลภาค (,)">
              <input
                type="text"
                value={courseInstructors}
                onChange={(e) => setCourseInstructors(e.target.value)}
                placeholder="เช่น พระราชภาวนาวชิราภรณ์, พระมหาประเสริฐ เตชธมฺโม"
                className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2"
              />
            </LiyonField>

            <LiyonField label="รายละเอียดภาษาไทย *">
              <textarea
                rows={3}
                value={courseDescriptionTh}
                onChange={(e) => setCourseDescriptionTh(e.target.value)}
                placeholder="วัตถุประสงค์และรายละเอียดคอร์ส..."
                className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2"
              />
            </LiyonField>

            <LiyonField label="รายละเอียดภาษาอังกฤษ *">
              <textarea
                rows={3}
                value={courseDescriptionEn}
                onChange={(e) => setCourseDescriptionEn(e.target.value)}
                placeholder="Course description in English..."
                className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2"
              />
            </LiyonField>

            <LiyonField label={t("meditation.guidelines")} hint="แต่ละข้อให้ขึ้นบรรทัดใหม่">
              <textarea
                rows={3}
                value={courseGuidelines}
                onChange={(e) => setCourseGuidelines(e.target.value)}
                placeholder="ระเบียบและข้อควรปฏิบัติ..."
                className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2"
              />
            </LiyonField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField label={t("meditation.feeNote")}>
                <input
                  type="text"
                  value={courseFeeNote}
                  onChange={(e) => setCourseFeeNote(e.target.value)}
                  placeholder="เช่น ไม่มีค่าใช้จ่าย หรือ ร่วมทำบุญตามศรัทธา"
                  className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2"
                />
              </LiyonField>

              <LiyonField label="URL รูปภาพหน้าปก">
                <input
                  type="text"
                  value={courseImageUrl}
                  onChange={(e) => setCourseImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2"
                />
              </LiyonField>
            </div>
          </LiyonDialogBody>

          <LiyonDialogFooter className="flex justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setCourseModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted rounded-lg"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={handleSaveCourse}
              className="px-4 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg shadow-sm disabled:opacity-50"
            >
              {isPending ? "กำลังบันทึก..." : t("common.save")}
            </button>
          </LiyonDialogFooter>
        </div>
      </LiyonDialog>

      {/* Delete Course Dialog */}
      <LiyonDialog
        open={Boolean(deleteCourseTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteCourseTarget(null);
        }}
      >
        <LiyonDialogHeader
          title="ยืนยันการลบคอร์สปฏิบัติธรรม"
          description={deleteCourseTarget ? `คุณแน่ใจหรือไม่ว่าต้องการลบคอร์ส "${deleteCourseTarget.code} - ${deleteCourseTarget.titleTh}"? การกระทำนี้ไม่สามารถย้อนกลับได้` : undefined}
        />
        <LiyonDialogFooter className="flex justify-end gap-2 pt-3">
          <button
            type="button"
            onClick={() => setDeleteCourseTarget(null)}
            className="px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted rounded-lg"
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={handleDeleteCourse}
            className="px-4 py-2 text-xs font-semibold text-white bg-destructive hover:bg-destructive/90 rounded-lg shadow-sm"
          >
            {isPending ? "กำลังลบ..." : t("common.delete")}
          </button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}
