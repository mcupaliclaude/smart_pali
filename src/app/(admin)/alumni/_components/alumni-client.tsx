"use client";

import { useState, useTransition, useMemo } from "react";
import Image from "next/image";
import {
  GraduationCap,
  Award,
  Users,
  CheckCircle2,
  Clock,
  Search,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/shared/lib/i18n/client";
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
import type { AlumniMemberDto, AlumniStoryDto } from "@/features/alumni";
import {
  createAlumniMemberAction,
  updateAlumniMemberAction,
  verifyAlumniMemberAction,
  deleteAlumniMemberAction,
  createAlumniStoryAction,
  updateAlumniStoryAction,
  deleteAlumniStoryAction,
} from "@/features/alumni/actions";

interface AlumniClientProps {
  initialMembers: AlumniMemberDto[];
  initialStories: AlumniStoryDto[];
  canVerify: boolean;
  canManage: boolean;
}

export function AlumniClient({
  initialMembers,
  initialStories,
  canVerify,
  canManage,
}: AlumniClientProps) {
  const t = useT();

  const [members, setMembers] = useState<AlumniMemberDto[]>(initialMembers);
  const [stories, setStories] = useState<AlumniStoryDto[]>(initialStories);
  const [activeTab, setActiveTab] = useState<"pending" | "allMembers" | "stories">("pending");
  const [isPending, startTransition] = useTransition();

  // Search & Filters
  const [search, setSearch] = useState("");
  const [degreeFilter, setDegreeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Verify Dialog State
  const [verifyTarget, setVerifyTarget] = useState<AlumniMemberDto | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<"VERIFIED" | "REJECTED">("VERIFIED");
  const [verifyIsSpotlight, setVerifyIsSpotlight] = useState(false);
  const [verifyQuoteTh, setVerifyQuoteTh] = useState("");

  // Member Modal State (Create / Edit)
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<AlumniMemberDto | null>(null);
  const [deleteMemberTarget, setDeleteMemberTarget] = useState<AlumniMemberDto | null>(null);

  // Member Form States
  const [memFullNameTh, setMemFullNameTh] = useState("");
  const [memFullNameEn, setMemFullNameEn] = useState("");
  const [memStudentId, setMemStudentId] = useState("");
  const [memGradYear, setMemGradYear] = useState("2562");
  const [memDegreeLevel, setMemDegreeLevel] = useState<"BACHELOR" | "MASTER" | "DOCTORAL" | "DIPLOMA">("BACHELOR");
  const [memMajorTh, setMemMajorTh] = useState("");
  const [memMajorEn, setMemMajorEn] = useState("");
  const [memWorkplace, setMemWorkplace] = useState("");
  const [memJobTitle, setMemJobTitle] = useState("");
  const [memPhone, setMemPhone] = useState("");
  const [memEmail, setMemEmail] = useState("");
  const [memAvatarUrl, setMemAvatarUrl] = useState("");
  const [memIsPublic, setMemIsPublic] = useState(true);
  const [memIsSpotlight, setMemIsSpotlight] = useState(false);
  const [memQuoteTh, setMemQuoteTh] = useState("");
  const [memStatus, setMemStatus] = useState<"PENDING" | "VERIFIED" | "REJECTED">("VERIFIED");

  // Story Modal State (Create / Edit)
  const [storyModalOpen, setStoryModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<AlumniStoryDto | null>(null);
  const [deleteStoryTarget, setDeleteStoryTarget] = useState<AlumniStoryDto | null>(null);

  // Story Form States
  const [storyTitleTh, setStoryTitleTh] = useState("");
  const [storyTitleEn, setStoryTitleEn] = useState("");
  const [storyAlumniName, setStoryAlumniName] = useState("");
  const [storyGradYear, setStoryGradYear] = useState("2560");
  const [storyDegreeLevel, setStoryDegreeLevel] = useState<"BACHELOR" | "MASTER" | "DOCTORAL" | "DIPLOMA">("MASTER");
  const [storySummaryTh, setStorySummaryTh] = useState("");
  const [storySummaryEn, setStorySummaryEn] = useState("");
  const [storyContentTh, setStoryContentTh] = useState("");
  const [storyContentEn, setStoryContentEn] = useState("");
  const [storyImageUrl, setStoryImageUrl] = useState("");
  const [storyPublished, setStoryPublished] = useState(true);
  const [storySeq, setStorySeq] = useState("1");

  // Stats
  const stats = useMemo(() => {
    return {
      total: members.length,
      verified: members.filter((m) => m.status === "VERIFIED").length,
      pending: members.filter((m) => m.status === "PENDING").length,
      stories: stories.length,
    };
  }, [members, stories]);

  // Filtered members
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      if (activeTab === "pending" && m.status !== "PENDING") return false;

      const matchSearch =
        search === "" ||
        m.fullNameTh.toLowerCase().includes(search.toLowerCase()) ||
        (m.fullNameEn && m.fullNameEn.toLowerCase().includes(search.toLowerCase())) ||
        (m.studentId && m.studentId.includes(search)) ||
        m.majorTh.toLowerCase().includes(search.toLowerCase()) ||
        (m.currentWorkplace && m.currentWorkplace.toLowerCase().includes(search.toLowerCase())) ||
        String(m.graduationYearBe).includes(search);

      const matchDegree = degreeFilter === "ALL" || m.degreeLevel === degreeFilter;
      const matchStatus =
        activeTab === "pending" || statusFilter === "ALL" || m.status === statusFilter;

      return matchSearch && matchDegree && matchStatus;
    });
  }, [members, activeTab, search, degreeFilter, statusFilter]);

  // Handle Verify Member
  function handleVerifySubmit() {
    if (!verifyTarget) return;

    startTransition(async () => {
      const res = await verifyAlumniMemberAction({
        id: verifyTarget.id,
        status: verifyStatus,
        isSpotlight: verifyIsSpotlight,
        spotlightQuoteTh: verifyQuoteTh.trim() || null,
      });

      if (res.ok) {
        toast.success("บันทึกการตรวจสอบเรียบร้อยแล้ว");
        setMembers((prev) =>
          prev.map((m) => (m.id === res.data.id ? res.data : m))
        );
        setVerifyTarget(null);
      } else {
        toast.error(res.error.message);
      }
    });
  }

  // Handle Open Member Modal
  function openMemberModal(m?: AlumniMemberDto) {
    if (m) {
      setEditingMember(m);
      setMemFullNameTh(m.fullNameTh);
      setMemFullNameEn(m.fullNameEn ?? "");
      setMemStudentId(m.studentId ?? "");
      setMemGradYear(String(m.graduationYearBe));
      setMemDegreeLevel(m.degreeLevel);
      setMemMajorTh(m.majorTh);
      setMemMajorEn(m.majorEn ?? "");
      setMemWorkplace(m.currentWorkplace ?? "");
      setMemJobTitle(m.jobTitle ?? "");
      setMemPhone(m.phone ?? "");
      setMemEmail(m.email ?? "");
      setMemAvatarUrl(m.avatarUrl ?? "");
      setMemIsPublic(m.isPublic);
      setMemIsSpotlight(m.isSpotlight);
      setMemQuoteTh(m.spotlightQuoteTh ?? "");
      setMemStatus(m.status);
    } else {
      setEditingMember(null);
      setMemFullNameTh("");
      setMemFullNameEn("");
      setMemStudentId("");
      setMemGradYear(String(new Date().getFullYear() + 543 - 2));
      setMemDegreeLevel("BACHELOR");
      setMemMajorTh("สาขาวิชาพระพุทธศาสนา");
      setMemMajorEn("");
      setMemWorkplace("");
      setMemJobTitle("");
      setMemPhone("");
      setMemEmail("");
      setMemAvatarUrl("");
      setMemIsPublic(true);
      setMemIsSpotlight(false);
      setMemQuoteTh("");
      setMemStatus("VERIFIED");
    }
    setMemberModalOpen(true);
  }

  // Handle Save Member
  function handleSaveMember() {
    if (!memFullNameTh.trim() || !memMajorTh.trim()) {
      toast.error("กรุณากรอกชื่อ-นามสกุลและสาขาวิชา");
      return;
    }

    startTransition(async () => {
      if (editingMember) {
        const res = await updateAlumniMemberAction({
          id: editingMember.id,
          fullNameTh: memFullNameTh.trim(),
          fullNameEn: memFullNameEn.trim() || null,
          studentId: memStudentId.trim() || null,
          graduationYearBe: Number(memGradYear) || 2560,
          degreeLevel: memDegreeLevel,
          majorTh: memMajorTh.trim(),
          majorEn: memMajorEn.trim() || null,
          currentWorkplace: memWorkplace.trim() || null,
          jobTitle: memJobTitle.trim() || null,
          phone: memPhone.trim() || null,
          email: memEmail.trim() || null,
          avatarUrl: memAvatarUrl.trim() || null,
          isPublic: memIsPublic,
          isSpotlight: memIsSpotlight,
          spotlightQuoteTh: memQuoteTh.trim() || null,
          status: memStatus,
        });

        if (res.ok) {
          toast.success(t("alumni.updatedSuccess"));
          setMembers((prev) =>
            prev.map((m) => (m.id === res.data.id ? res.data : m))
          );
          setMemberModalOpen(false);
        } else {
          toast.error(res.error.message);
        }
      } else {
        const res = await createAlumniMemberAction({
          fullNameTh: memFullNameTh.trim(),
          fullNameEn: memFullNameEn.trim() || null,
          studentId: memStudentId.trim() || null,
          graduationYearBe: Number(memGradYear) || 2560,
          degreeLevel: memDegreeLevel,
          majorTh: memMajorTh.trim(),
          majorEn: memMajorEn.trim() || null,
          currentWorkplace: memWorkplace.trim() || null,
          jobTitle: memJobTitle.trim() || null,
          phone: memPhone.trim() || null,
          email: memEmail.trim() || null,
          avatarUrl: memAvatarUrl.trim() || null,
          isPublic: memIsPublic,
          isSpotlight: memIsSpotlight,
          spotlightQuoteTh: memQuoteTh.trim() || null,
          status: memStatus,
        });

        if (res.ok) {
          toast.success("เพิ่มข้อมูลศิษย์เก่าเรียบร้อยแล้ว");
          setMembers((prev) => [res.data, ...prev]);
          setMemberModalOpen(false);
        } else {
          toast.error(res.error.message);
        }
      }
    });
  }

  // Handle Delete Member
  function handleDeleteMember() {
    if (!deleteMemberTarget) return;

    startTransition(async () => {
      const res = await deleteAlumniMemberAction(deleteMemberTarget.id);
      if (res.ok) {
        toast.success("ลบข้อมูลศิษย์เก่าเรียบร้อยแล้ว");
        setMembers((prev) => prev.filter((m) => m.id !== deleteMemberTarget.id));
        setDeleteMemberTarget(null);
      } else {
        toast.error(res.error.message);
      }
    });
  }

  // Handle Open Story Modal
  function openStoryModal(s?: AlumniStoryDto) {
    if (s) {
      setEditingStory(s);
      setStoryTitleTh(s.titleTh);
      setStoryTitleEn(s.titleEn);
      setStoryAlumniName(s.alumniName);
      setStoryGradYear(String(s.graduationYearBe));
      setStoryDegreeLevel(s.degreeLevel);
      setStorySummaryTh(s.summaryTh);
      setStorySummaryEn(s.summaryEn);
      setStoryContentTh(s.contentTh);
      setStoryContentEn(s.contentEn);
      setStoryImageUrl(s.imageUrl ?? "");
      setStoryPublished(s.published);
      setStorySeq(String(s.seq));
    } else {
      setEditingStory(null);
      setStoryTitleTh("");
      setStoryTitleEn("");
      setStoryAlumniName("");
      setStoryGradYear("2560");
      setStoryDegreeLevel("MASTER");
      setStorySummaryTh("");
      setStorySummaryEn("");
      setStoryContentTh("");
      setStoryContentEn("");
      setStoryImageUrl("");
      setStoryPublished(true);
      setStorySeq(String(stories.length + 1));
    }
    setStoryModalOpen(true);
  }

  // Handle Save Story
  function handleSaveStory() {
    if (!storyTitleTh.trim() || !storyAlumniName.trim() || !storyContentTh.trim()) {
      toast.error("กรุณากรอกหัวข้อ, ชื่อศิษย์เก่า และเนื้อหาเรื่องราว");
      return;
    }

    startTransition(async () => {
      if (editingStory) {
        const res = await updateAlumniStoryAction({
          id: editingStory.id,
          titleTh: storyTitleTh.trim(),
          titleEn: storyTitleEn.trim(),
          alumniName: storyAlumniName.trim(),
          graduationYearBe: Number(storyGradYear) || 2560,
          degreeLevel: storyDegreeLevel,
          summaryTh: storySummaryTh.trim(),
          summaryEn: storySummaryEn.trim(),
          contentTh: storyContentTh.trim(),
          contentEn: storyContentEn.trim(),
          imageUrl: storyImageUrl.trim() || null,
          published: storyPublished,
          seq: Number(storySeq) || 1,
        });

        if (res.ok) {
          toast.success("บันทึกเรื่องราวความสำเร็จเรียบร้อยแล้ว");
          setStories((prev) =>
            prev.map((s) => (s.id === res.data.id ? res.data : s))
          );
          setStoryModalOpen(false);
        } else {
          toast.error(res.error.message);
        }
      } else {
        const res = await createAlumniStoryAction({
          titleTh: storyTitleTh.trim(),
          titleEn: storyTitleEn.trim(),
          alumniName: storyAlumniName.trim(),
          graduationYearBe: Number(storyGradYear) || 2560,
          degreeLevel: storyDegreeLevel,
          summaryTh: storySummaryTh.trim(),
          summaryEn: storySummaryEn.trim(),
          contentTh: storyContentTh.trim(),
          contentEn: storyContentEn.trim(),
          imageUrl: storyImageUrl.trim() || null,
          published: storyPublished,
          seq: Number(storySeq) || 1,
        });

        if (res.ok) {
          toast.success("สร้างเรื่องราวความสำเร็จเรียบร้อยแล้ว");
          setStories((prev) => [...prev, res.data]);
          setStoryModalOpen(false);
        } else {
          toast.error(res.error.message);
        }
      }
    });
  }

  // Handle Delete Story
  function handleDeleteStory() {
    if (!deleteStoryTarget) return;

    startTransition(async () => {
      const res = await deleteAlumniStoryAction(deleteStoryTarget.id);
      if (res.ok) {
        toast.success("ลบเรื่องราวเรียบร้อยแล้ว");
        setStories((prev) => prev.filter((s) => s.id !== deleteStoryTarget.id));
        setDeleteStoryTarget(null);
      } else {
        toast.error(res.error.message);
      }
    });
  }

  function getStatusTone(status: string): "ok" | "warn" | "bad" | "info" | "off" {
    switch (status) {
      case "VERIFIED": return "ok";
      case "PENDING": return "warn";
      case "REJECTED": return "bad";
      default: return "off";
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case "VERIFIED": return t("alumni.status.verified");
      case "PENDING": return t("alumni.status.pending");
      case "REJECTED": return t("alumni.status.rejected");
      default: return status;
    }
  }

  // Member Columns
  const memberColumns: DataTableColumn<AlumniMemberDto>[] = [
    {
      key: "fullName",
      header: t("alumni.fullName"),
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
            {row.avatarUrl ? (
              <Image src={row.avatarUrl} alt={row.fullNameTh} fill className="object-cover" />
            ) : (
              row.fullNameTh[0]
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground">{row.fullNameTh}</span>
              {row.isSpotlight && (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded border border-amber-200">
                  Spotlight
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              {row.studentId && <span>{row.studentId}</span>}
              {row.fullNameEn && <span>• {row.fullNameEn}</span>}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "graduation",
      header: "การศึกษา",
      render: (row) => (
        <div className="text-xs">
          <div className="font-medium text-foreground">
            รุ่น พ.ศ. {row.graduationYearBe} (
            {row.degreeLevel === "BACHELOR"
              ? "ตรี"
              : row.degreeLevel === "MASTER"
              ? "โท"
              : row.degreeLevel === "DOCTORAL"
              ? "เอก"
              : "ป.บัณฑิต"}
            )
          </div>
          <div className="text-muted-foreground truncate max-w-[180px]">{row.majorTh}</div>
        </div>
      ),
    },
    {
      key: "workplace",
      header: "สังกัด / ตำแหน่งงาน",
      render: (row) => (
        <div className="text-xs">
          <div className="text-foreground truncate max-w-[180px]">{row.currentWorkplace || "-"}</div>
          <div className="text-muted-foreground truncate max-w-[180px]">{row.jobTitle || "-"}</div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "การติดต่อ",
      render: (row) => (
        <div className="text-xs text-muted-foreground space-y-0.5">
          {row.phone && <div>📞 {row.phone}</div>}
          {row.email && <div>✉️ {row.email}</div>}
          {!row.phone && !row.email && <div>-</div>}
        </div>
      ),
    },
    {
      key: "status",
      header: t("alumni.status"),
      render: (row) => (
        <StatusPill tone={getStatusTone(row.status)}>
          {getStatusLabel(row.status)}
        </StatusPill>
      ),
    },
  ];

  // Story Columns
  const storyColumns: DataTableColumn<AlumniStoryDto>[] = [
    {
      key: "title",
      header: "ชื่อเรื่องราว",
      render: (row) => (
        <div className="max-w-md">
          <div className="font-semibold text-foreground line-clamp-1">{row.titleTh}</div>
          <div className="text-xs text-muted-foreground line-clamp-1">{row.summaryTh}</div>
        </div>
      ),
    },
    {
      key: "alumni",
      header: "ศิษย์เก่า",
      render: (row) => (
        <div className="text-xs">
          <div className="font-medium text-foreground">{row.alumniName}</div>
          <div className="text-muted-foreground">พ.ศ. {row.graduationYearBe}</div>
        </div>
      ),
    },
    {
      key: "status",
      header: "สถานะ",
      render: (row) => (
        <StatusPill tone={row.published ? "ok" : "off"}>
          {row.published ? "เผยแพร่แล้ว" : "แบบร่าง"}
        </StatusPill>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <GraduationCap className="w-7 h-7 text-blue-600" />
            <span>{t("alumni.title")}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t("alumni.subtitle")}</p>
        </div>

        {canManage && (
          <div className="flex items-center gap-2">
            {activeTab === "stories" ? (
              <button
                type="button"
                onClick={() => openStoryModal()}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>{t("alumni.addStory")}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openMemberModal()}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>{t("alumni.addMember")}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <LiyonCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{t("alumni.stat.totalAlumni")}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stats.total}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </LiyonCard>

        <LiyonCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{t("alumni.stat.verified")}</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.verified}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </LiyonCard>

        <LiyonCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{t("alumni.stat.pending")}</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pending}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </LiyonCard>

        <LiyonCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{t("alumni.stat.stories")}</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{stats.stories}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </LiyonCard>
      </div>

      {/* Tabs & Filters */}
      <LiyonCard className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("pending")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === "pending"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {t("alumni.tab.pending")} ({stats.pending})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("allMembers")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === "allMembers"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {t("alumni.tab.members")} ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("stories")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === "stories"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {t("alumni.tab.stories")} ({stats.stories})
            </button>
          </div>
        </div>

        {/* Toolbar */}
        {activeTab !== "stories" && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาตามชื่อ, รหัสนักศึกษา, สาขาวิชา, สังกัด หรือปี พ.ศ. ที่จบ..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-input bg-background"
              />
            </div>

            <select
              value={degreeFilter}
              onChange={(e) => setDegreeFilter(e.target.value)}
              aria-label="กรองตามระดับปริญญา"
              className="text-xs rounded-lg border border-input bg-background px-3 py-1.5 text-foreground"
            >
              <option value="ALL">ทุกระดับปริญญา</option>
              <option value="BACHELOR">{t("alumni.degree.bachelor")}</option>
              <option value="MASTER">{t("alumni.degree.master")}</option>
              <option value="DOCTORAL">{t("alumni.degree.doctoral")}</option>
              <option value="DIPLOMA">{t("alumni.degree.diploma")}</option>
            </select>

            {activeTab === "allMembers" && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="กรองตามสถานะการตรวจสอบ"
                className="text-xs rounded-lg border border-input bg-background px-3 py-1.5 text-foreground"
              >
                <option value="ALL">ทุกสถานะ</option>
                <option value="VERIFIED">{t("alumni.status.verified")}</option>
                <option value="PENDING">{t("alumni.status.pending")}</option>
                <option value="REJECTED">{t("alumni.status.rejected")}</option>
              </select>
            )}
          </div>
        )}
      </LiyonCard>

      {/* Table Area */}
      {activeTab === "stories" ? (
        <LiyonCard>
          <DataTable<AlumniStoryDto>
            headHeading={<span className="font-semibold text-sm">{t("alumni.tab.stories")}</span>}
            state={stories.length > 0 ? "data" : "empty"}
            rows={stories}
            columns={storyColumns}
            getRowId={(row) => row.id}
            renderRowMenu={(row) => (
              <>
                {canManage && (
                  <RowMenuItem
                    onSelect={() => openStoryModal(row)}
                    icon={<Edit2 className="w-4 h-4 text-blue-600" />}
                  >
                    {t("alumni.editStory")}
                  </RowMenuItem>
                )}
                {canManage && (
                  <RowMenuItem
                    onSelect={() => setDeleteStoryTarget(row)}
                    icon={<Trash2 className="w-4 h-4 text-red-600" />}
                  >
                    {t("common.delete")}
                  </RowMenuItem>
                )}
              </>
            )}
            empty={{
              icon: <Award className="h-10 w-10 text-muted-foreground/50" />,
              title: "ไม่พบเรื่องราวความสำเร็จ",
              description: "กดปุ่มสร้างเรื่องราวเพื่อเพิ่มเรื่องราวความสำเร็จของศิษย์เก่า",
            }}
            error={{
              icon: <AlertCircle className="h-10 w-10 text-destructive" />,
              title: t("common.error"),
            }}
          />
        </LiyonCard>
      ) : (
        <LiyonCard>
          <DataTable<AlumniMemberDto>
            headHeading={
              <span className="font-semibold text-sm">
                {activeTab === "pending"
                  ? t("alumni.tab.pending")
                  : t("alumni.tab.members")}
              </span>
            }
            state={filteredMembers.length > 0 ? "data" : "empty"}
            rows={filteredMembers}
            columns={memberColumns}
            getRowId={(row) => row.id}
            renderRowMenu={(row) => (
              <>
                {canVerify && (
                  <RowMenuItem
                    onSelect={() => {
                      setVerifyTarget(row);
                      setVerifyStatus(row.status === "PENDING" ? "VERIFIED" : (row.status as "VERIFIED" | "REJECTED"));
                      setVerifyIsSpotlight(row.isSpotlight);
                      setVerifyQuoteTh(row.spotlightQuoteTh ?? "");
                    }}
                    icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  >
                    ตรวจสอบ / รับรองข้อมูล
                  </RowMenuItem>
                )}
                {canManage && (
                  <RowMenuItem
                    onSelect={() => openMemberModal(row)}
                    icon={<Edit2 className="w-4 h-4 text-blue-600" />}
                  >
                    {t("alumni.editMember")}
                  </RowMenuItem>
                )}
                {canManage && (
                  <RowMenuItem
                    onSelect={() => setDeleteMemberTarget(row)}
                    icon={<Trash2 className="w-4 h-4 text-red-600" />}
                  >
                    {t("common.delete")}
                  </RowMenuItem>
                )}
              </>
            )}
            empty={{
              icon: <GraduationCap className="h-10 w-10 text-muted-foreground/50" />,
              title: t("alumni.empty"),
              description: "ไม่พบข้อมูลศิษย์เก่าในระบบ",
            }}
            error={{
              icon: <AlertCircle className="h-10 w-10 text-destructive" />,
              title: t("common.error"),
            }}
          />
        </LiyonCard>
      )}

      {/* Verify Member Dialog */}
      <LiyonDialog
        open={Boolean(verifyTarget)}
        onOpenChange={(open) => {
          if (!open) setVerifyTarget(null);
        }}
      >
        <LiyonDialogHeader
          title="ตรวจสอบและรับรองข้อมูลศิษย์เก่า"
          description={verifyTarget ? `${verifyTarget.fullNameTh} (พ.ศ. ${verifyTarget.graduationYearBe})` : undefined}
        />
        {verifyTarget && (
          <div className="space-y-4">
            <LiyonDialogBody className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-xl text-xs space-y-1.5 border border-border">
                <div className="flex justify-between font-semibold text-foreground">
                  <span>{verifyTarget.fullNameTh}</span>
                  <span>รุ่น พ.ศ. {verifyTarget.graduationYearBe}</span>
                </div>
                <div className="text-muted-foreground">สาขาวิชา: {verifyTarget.majorTh}</div>
                <div className="text-muted-foreground">
                  สังกัด: {verifyTarget.currentWorkplace || "-"} ({verifyTarget.jobTitle || "-"})
                </div>
                <div className="text-muted-foreground">
                  โทร: {verifyTarget.phone || "-"} | อีเมล: {verifyTarget.email || "-"}
                </div>
              </div>

              {/* Status Decision */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  ผลการตรวจสอบ <span className="text-destructive">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setVerifyStatus("VERIFIED")}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                      verifyStatus === "VERIFIED"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-background border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    รับรองความถูกต้อง (Verified)
                  </button>
                  <button
                    type="button"
                    onClick={() => setVerifyStatus("REJECTED")}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                      verifyStatus === "REJECTED"
                        ? "bg-red-600 text-white border-red-600 shadow-sm"
                        : "bg-background border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    ปฏิเสธข้อมูล (Reject)
                  </button>
                </div>
              </div>

              {/* Spotlight toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-foreground">
                  <input
                    type="checkbox"
                    checked={verifyIsSpotlight}
                    onChange={(e) => setVerifyIsSpotlight(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span className="font-semibold text-amber-700 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    กำหนดให้เป็น &quot;ศิษย์เก่าดีเด่น (Featured Spotlight)&quot;
                  </span>
                </label>
              </div>

              {/* Spotlight quote */}
              {verifyIsSpotlight && (
                <LiyonField label="ข้อคิด / คติธรรมประจำใจ (สำหรับแสดงใน Spotlight)">
                  <textarea
                    rows={2}
                    value={verifyQuoteTh}
                    onChange={(e) => setVerifyQuoteTh(e.target.value)}
                    placeholder="เช่น ธรรมะคือศาสตร์แห่งการพัฒนาชีวิต..."
                    className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2"
                  />
                </LiyonField>
              )}
            </LiyonDialogBody>

            <LiyonDialogFooter className="flex justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setVerifyTarget(null)}
                className="px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted rounded-lg"
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleVerifySubmit}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50"
              >
                {isPending ? "กำลังบันทึก..." : t("common.save")}
              </button>
            </LiyonDialogFooter>
          </div>
        )}
      </LiyonDialog>

      {/* Member Modal (Create / Edit) */}
      <LiyonDialog open={memberModalOpen} onOpenChange={setMemberModalOpen}>
        <LiyonDialogHeader
          title={editingMember ? t("alumni.editMember") : t("alumni.addMember")}
          description="กรอกข้อมูลประวัติการศึกษาและการทำงานของศิษย์เก่า"
        />
        <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
          <LiyonDialogBody className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField label="ชื่อ-นามสกุล (ภาษาไทย) *">
                <input
                  type="text"
                  value={memFullNameTh}
                  onChange={(e) => setMemFullNameTh(e.target.value)}
                  placeholder="เช่น พระมหาสมชาย ญาณสิทฺธิ"
                  className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2"
                />
              </LiyonField>

              <LiyonField label="ชื่อ-นามสกุล (ภาษาอังกฤษ)">
                <input
                  type="text"
                  value={memFullNameEn}
                  onChange={(e) => setMemFullNameEn(e.target.value)}
                  placeholder="e.g. Phra Maha Somchai"
                  className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2"
                />
              </LiyonField>

              <LiyonField label={t("alumni.studentId")}>
                <input
                  type="text"
                  value={memStudentId}
                  onChange={(e) => setMemStudentId(e.target.value)}
                  placeholder="เช่น 6001010025"
                  className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2 font-mono"
                />
              </LiyonField>

              <LiyonField label={t("alumni.gradYear") + " *"}>
                <input
                  type="number"
                  value={memGradYear}
                  onChange={(e) => setMemGradYear(e.target.value)}
                  placeholder="เช่น 2562"
                  className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2 font-mono"
                />
              </LiyonField>

              <LiyonField label={t("alumni.degreeLevel")}>
                <select
                  value={memDegreeLevel}
                  onChange={(e) => setMemDegreeLevel(e.target.value as "BACHELOR" | "MASTER" | "DOCTORAL" | "DIPLOMA")}
                  className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2"
                >
                  <option value="BACHELOR">{t("alumni.degree.bachelor")}</option>
                  <option value="MASTER">{t("alumni.degree.master")}</option>
                  <option value="DOCTORAL">{t("alumni.degree.doctoral")}</option>
                  <option value="DIPLOMA">{t("alumni.degree.diploma")}</option>
                </select>
              </LiyonField>

              <LiyonField label={t("alumni.major") + " *"}>
                <input
                  type="text"
                  value={memMajorTh}
                  onChange={(e) => setMemMajorTh(e.target.value)}
                  placeholder="เช่น สาขาวิชาพระพุทธศาสนา"
                  className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2"
                />
              </LiyonField>

              <LiyonField label={t("alumni.workplace")}>
                <input
                  type="text"
                  value={memWorkplace}
                  onChange={(e) => setMemWorkplace(e.target.value)}
                  placeholder="เช่น วัด..., มหาวิทยาลัย..."
                  className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2"
                />
              </LiyonField>

              <LiyonField label={t("alumni.jobTitle")}>
                <input
                  type="text"
                  value={memJobTitle}
                  onChange={(e) => setMemJobTitle(e.target.value)}
                  placeholder="เช่น เจ้าอาวาส, อาจารย์, ผู้จัดการ"
                  className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2"
                />
              </LiyonField>

              <LiyonField label={t("alumni.phone")}>
                <input
                  type="tel"
                  value={memPhone}
                  onChange={(e) => setMemPhone(e.target.value)}
                  placeholder="08X-XXX-XXXX"
                  className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2"
                />
              </LiyonField>

              <LiyonField label={t("alumni.email")}>
                <input
                  type="email"
                  value={memEmail}
                  onChange={(e) => setMemEmail(e.target.value)}
                  placeholder="alumni@example.com"
                  className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2"
                />
              </LiyonField>
            </div>

            <LiyonField label="URL รูปโปรไฟล์">
              <input
                type="text"
                value={memAvatarUrl}
                onChange={(e) => setMemAvatarUrl(e.target.value)}
                placeholder="https://..."
                className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2"
              />
            </LiyonField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField label={t("alumni.status")}>
                <select
                  value={memStatus}
                  onChange={(e) => setMemStatus(e.target.value as "PENDING" | "VERIFIED" | "REJECTED")}
                  className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2"
                >
                  <option value="VERIFIED">{t("alumni.status.verified")}</option>
                  <option value="PENDING">{t("alumni.status.pending")}</option>
                  <option value="REJECTED">{t("alumni.status.rejected")}</option>
                </select>
              </LiyonField>

              <div className="flex items-center gap-4 pt-6">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={memIsPublic}
                    onChange={(e) => setMemIsPublic(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>เผยแพร่สาธารณะ</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={memIsSpotlight}
                    onChange={(e) => setMemIsSpotlight(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>ศิษย์เก่าดีเด่น (Spotlight)</span>
                </label>
              </div>
            </div>

            {memIsSpotlight && (
              <LiyonField label="ข้อคิด / คำนิยมศิษย์เก่าดีเด่น">
                <textarea
                  rows={2}
                  value={memQuoteTh}
                  onChange={(e) => setMemQuoteTh(e.target.value)}
                  placeholder="เช่น ธรรมะคือศาสตร์แห่งการพัฒนาชีวิต..."
                  className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2"
                />
              </LiyonField>
            )}
          </LiyonDialogBody>

          <LiyonDialogFooter className="flex justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setMemberModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted rounded-lg"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={handleSaveMember}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50"
            >
              {isPending ? "กำลังบันทึก..." : t("common.save")}
            </button>
          </LiyonDialogFooter>
        </div>
      </LiyonDialog>

      {/* Story Modal (Create / Edit) */}
      <LiyonDialog open={storyModalOpen} onOpenChange={setStoryModalOpen}>
        <LiyonDialogHeader
          title={editingStory ? t("alumni.editStory") : t("alumni.addStory")}
          description="เผยแพร่เรื่องราวความสำเร็จและแรงบันดาลใจของศิษย์เก่า"
        />
        <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
          <LiyonDialogBody className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField label="ชื่อเรื่อง (ภาษาไทย) *">
                <input
                  type="text"
                  value={storyTitleTh}
                  onChange={(e) => setStoryTitleTh(e.target.value)}
                  placeholder="เช่น จากบัณฑิตพุทธศาสตร์ สู่การขับเคลื่อนสันติภาพ..."
                  className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2"
                />
              </LiyonField>

              <LiyonField label="ชื่อเรื่อง (ภาษาอังกฤษ) *">
                <input
                  type="text"
                  value={storyTitleEn}
                  onChange={(e) => setStoryTitleEn(e.target.value)}
                  placeholder="e.g. From Graduate to International Mediator..."
                  className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2"
                />
              </LiyonField>

              <LiyonField label="ชื่อศิษย์เก่าเจ้าของเรื่อง *">
                <input
                  type="text"
                  value={storyAlumniName}
                  onChange={(e) => setStoryAlumniName(e.target.value)}
                  placeholder="เช่น ผศ.ดร.อรทัย รักษ์ศิริ"
                  className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2"
                />
              </LiyonField>

              <LiyonField label="ปีที่จบการศึกษา (พ.ศ.) *">
                <input
                  type="number"
                  value={storyGradYear}
                  onChange={(e) => setStoryGradYear(e.target.value)}
                  placeholder="เช่น 2561"
                  className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2 font-mono"
                />
              </LiyonField>
            </div>

            <LiyonField label="บทสรุปย่อ (ภาษาไทย) *">
              <textarea
                rows={2}
                value={storySummaryTh}
                onChange={(e) => setStorySummaryTh(e.target.value)}
                placeholder="สรุปย่อ 2-3 บรรทัด..."
                className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2"
              />
            </LiyonField>

            <LiyonField label="บทสรุปย่อ (ภาษาอังกฤษ) *">
              <textarea
                rows={2}
                value={storySummaryEn}
                onChange={(e) => setStorySummaryEn(e.target.value)}
                placeholder="Brief summary in English..."
                className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2"
              />
            </LiyonField>

            <LiyonField label="เนื้อหาฉบับเต็ม (ภาษาไทย) *">
              <textarea
                rows={4}
                value={storyContentTh}
                onChange={(e) => setStoryContentTh(e.target.value)}
                placeholder="เนื้อหาบทความฉบับเต็ม..."
                className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2"
              />
            </LiyonField>

            <LiyonField label="เนื้อหาฉบับเต็ม (ภาษาอังกฤษ) *">
              <textarea
                rows={4}
                value={storyContentEn}
                onChange={(e) => setStoryContentEn(e.target.value)}
                placeholder="Full story article in English..."
                className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2"
              />
            </LiyonField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField label="URL รูปภาพหน้าปก">
                <input
                  type="text"
                  value={storyImageUrl}
                  onChange={(e) => setStoryImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2"
                />
              </LiyonField>

              <div className="flex items-center gap-4 pt-6">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={storyPublished}
                    onChange={(e) => setStoryPublished(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>เผยแพร่เรื่องราวทันที</span>
                </label>
              </div>
            </div>
          </LiyonDialogBody>

          <LiyonDialogFooter className="flex justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setStoryModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted rounded-lg"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={handleSaveStory}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50"
            >
              {isPending ? "กำลังบันทึก..." : t("common.save")}
            </button>
          </LiyonDialogFooter>
        </div>
      </LiyonDialog>

      {/* Delete Member Dialog */}
      <LiyonDialog
        open={Boolean(deleteMemberTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteMemberTarget(null);
        }}
      >
        <LiyonDialogHeader
          title="ยืนยันการลบข้อมูลศิษย์เก่า"
          description={deleteMemberTarget ? `คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูล "${deleteMemberTarget.fullNameTh}"? การกระทำนี้ไม่สามารถย้อนกลับได้` : undefined}
        />
        <LiyonDialogFooter className="flex justify-end gap-2 pt-3">
          <button
            type="button"
            onClick={() => setDeleteMemberTarget(null)}
            className="px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted rounded-lg"
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={handleDeleteMember}
            className="px-4 py-2 text-xs font-semibold text-white bg-destructive hover:bg-destructive/90 rounded-lg shadow-sm"
          >
            {isPending ? "กำลังลบ..." : t("common.delete")}
          </button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* Delete Story Dialog */}
      <LiyonDialog
        open={Boolean(deleteStoryTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteStoryTarget(null);
        }}
      >
        <LiyonDialogHeader
          title="ยืนยันการลบเรื่องราวความสำเร็จ"
          description={deleteStoryTarget ? `คุณแน่ใจหรือไม่ว่าต้องการลบ "${deleteStoryTarget.titleTh}"? การกระทำนี้ไม่สามารถย้อนกลับได้` : undefined}
        />
        <LiyonDialogFooter className="flex justify-end gap-2 pt-3">
          <button
            type="button"
            onClick={() => setDeleteStoryTarget(null)}
            className="px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted rounded-lg"
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={handleDeleteStory}
            className="px-4 py-2 text-xs font-semibold text-white bg-destructive hover:bg-destructive/90 rounded-lg shadow-sm"
          >
            {isPending ? "กำลังลบ..." : t("common.delete")}
          </button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}
