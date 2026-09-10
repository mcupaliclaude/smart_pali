"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  GraduationCap,
  Award,
  Layers,
  Search,
  AlertCircle,
  Clock,
  FileText,
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
  LiyonSelect,
} from "@/shared/components/liyon";
import type { CurriculumProgramDto } from "@/features/curriculum";
import type { StaffDepartmentDto } from "@/features/staff";
import {
  createProgramAction,
  updateProgramAction,
  deleteProgramAction,
} from "@/features/curriculum/actions";

interface CurriculumClientProps {
  initialPrograms: CurriculumProgramDto[];
  departments: StaffDepartmentDto[];
  canManage: boolean;
  canCreate: boolean;
}

export function CurriculumClient({
  initialPrograms,
  departments,
  canManage,
  canCreate,
}: CurriculumClientProps) {
  const t = useT();
  const locale = useLocale();
  const [programs, setPrograms] = useState<CurriculumProgramDto[]>(initialPrograms);
  const [isPending, startTransition] = useTransition();

  // Filters
  const [search, setSearch] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("ALL");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Dialog States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CurriculumProgramDto | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<CurriculumProgramDto | null>(null);

  // Form States
  const [formCode, setFormCode] = useState("");
  const [formNameTh, setFormNameTh] = useState("");
  const [formNameEn, setFormNameEn] = useState("");
  const [formDegreeTh, setFormDegreeTh] = useState("");
  const [formDegreeEn, setFormDegreeEn] = useState("");
  const [formLevel, setFormLevel] = useState<"BACHELOR" | "MASTER" | "DOCTORATE" | "CERTIFICATE">("BACHELOR");
  const [formDepartmentId, setFormDepartmentId] = useState(departments[0]?.id ?? "");
  const [formTotalCredits, setFormTotalCredits] = useState("120");
  const [formDurationYears, setFormDurationYears] = useState("4");
  const [formTuitionTh, setFormTuitionTh] = useState("");
  const [formTuitionEn, setFormTuitionEn] = useState("");
  const [formDescTh, setFormDescTh] = useState("");
  const [formDescEn, setFormDescEn] = useState("");
  const [formCareersText, setFormCareersText] = useState("");
  const [formReqsText, setFormReqsText] = useState("");
  const [formBrochureUrl, setFormBrochureUrl] = useState("");
  const [formSeq, setFormSeq] = useState("1");
  const [formStatus, setFormStatus] = useState<"DRAFT" | "ACTIVE" | "REVISED" | "PHASED_OUT">("ACTIVE");

  // Stats
  const stats = useMemo(() => ({
    total: programs.length,
    bachelor: programs.filter((p) => p.level === "BACHELOR").length,
    graduate: programs.filter((p) => p.level === "MASTER" || p.level === "DOCTORATE").length,
    active: programs.filter((p) => p.status === "ACTIVE").length,
  }), [programs]);

  // Filtered List
  const filteredPrograms = useMemo(() => {
    return programs.filter((p) => {
      const matchSearch =
        !search ||
        p.code.toLowerCase().includes(search.toLowerCase()) ||
        p.nameTh.toLowerCase().includes(search.toLowerCase()) ||
        p.nameEn.toLowerCase().includes(search.toLowerCase()) ||
        p.degreeTh.toLowerCase().includes(search.toLowerCase()) ||
        p.degreeEn.toLowerCase().includes(search.toLowerCase());

      const matchLevel = selectedLevel === "ALL" || p.level === selectedLevel;
      const matchDept = selectedDept === "ALL" || p.departmentId === selectedDept;
      const matchStatus = selectedStatus === "ALL" || p.status === selectedStatus;

      return matchSearch && matchLevel && matchDept && matchStatus;
    });
  }, [programs, search, selectedLevel, selectedDept, selectedStatus]);

  function openCreateDialog() {
    setEditingItem(null);
    setFormCode("");
    setFormNameTh("");
    setFormNameEn("");
    setFormDegreeTh("");
    setFormDegreeEn("");
    setFormLevel("BACHELOR");
    setFormDepartmentId(departments[0]?.id ?? "");
    setFormTotalCredits("120");
    setFormDurationYears("4");
    setFormTuitionTh("");
    setFormTuitionEn("");
    setFormDescTh("");
    setFormDescEn("");
    setFormCareersText("");
    setFormReqsText("");
    setFormBrochureUrl("");
    setFormSeq(String(programs.length + 1));
    setFormStatus("ACTIVE");
    setModalOpen(true);
  }

  function openEditDialog(item: CurriculumProgramDto) {
    setEditingItem(item);
    setFormCode(item.code);
    setFormNameTh(item.nameTh);
    setFormNameEn(item.nameEn);
    setFormDegreeTh(item.degreeTh);
    setFormDegreeEn(item.degreeEn);
    setFormLevel(item.level);
    setFormDepartmentId(item.departmentId);
    setFormTotalCredits(String(item.totalCredits));
    setFormDurationYears(String(item.durationYears));
    setFormTuitionTh(item.tuitionFeeNoteTh || "");
    setFormTuitionEn(item.tuitionFeeNoteEn || "");
    setFormDescTh(item.descriptionTh);
    setFormDescEn(item.descriptionEn);
    setFormCareersText(item.careerProspects.join("\n"));
    setFormReqsText(item.admissionRequirements.join("\n"));
    setFormBrochureUrl(item.brochureUrl || "");
    setFormSeq(String(item.seq));
    setFormStatus(item.status);
    setModalOpen(true);
  }

  function handleSave() {
    if (
      !formCode ||
      !formNameTh ||
      !formNameEn ||
      !formDegreeTh ||
      !formDegreeEn ||
      !formDepartmentId ||
      !formDescTh ||
      !formDescEn
    ) {
      toast.error(t("error.validation"));
      return;
    }

    const careerProspects = formCareersText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const admissionRequirements = formReqsText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    startTransition(async () => {
      if (editingItem) {
        const res = await updateProgramAction({
          id: editingItem.id,
          code: formCode,
          nameTh: formNameTh,
          nameEn: formNameEn,
          degreeTh: formDegreeTh,
          degreeEn: formDegreeEn,
          level: formLevel,
          departmentId: formDepartmentId,
          totalCredits: parseInt(formTotalCredits, 10) || 0,
          durationYears: parseInt(formDurationYears, 10) || 4,
          tuitionFeeNoteTh: formTuitionTh || null,
          tuitionFeeNoteEn: formTuitionEn || null,
          descriptionTh: formDescTh,
          descriptionEn: formDescEn,
          careerProspects,
          admissionRequirements,
          brochureUrl: formBrochureUrl || null,
          seq: parseInt(formSeq, 10) || 0,
          status: formStatus,
        });

        if (res.ok) {
          toast.success(t("curriculum.saved"));
          setPrograms((prev) => prev.map((p) => (p.id === res.data.id ? res.data : p)));
          setModalOpen(false);
        } else {
          toast.error(res.error.message || t("common.error"));
        }
      } else {
        const res = await createProgramAction({
          code: formCode,
          nameTh: formNameTh,
          nameEn: formNameEn,
          degreeTh: formDegreeTh,
          degreeEn: formDegreeEn,
          level: formLevel,
          departmentId: formDepartmentId,
          totalCredits: parseInt(formTotalCredits, 10) || 0,
          durationYears: parseInt(formDurationYears, 10) || 4,
          tuitionFeeNoteTh: formTuitionTh || null,
          tuitionFeeNoteEn: formTuitionEn || null,
          descriptionTh: formDescTh,
          descriptionEn: formDescEn,
          careerProspects,
          admissionRequirements,
          brochureUrl: formBrochureUrl || null,
          seq: parseInt(formSeq, 10) || 0,
          status: formStatus,
        });

        if (res.ok) {
          toast.success(t("curriculum.saved"));
          setPrograms((prev) => [...prev, res.data]);
          setModalOpen(false);
        } else {
          toast.error(res.error.message || t("common.error"));
        }
      }
    });
  }

  function handleDelete(item: CurriculumProgramDto) {
    startTransition(async () => {
      const res = await deleteProgramAction(item.id);
      if (res.ok) {
        toast.success(t("curriculum.deleted"));
        setPrograms((prev) => prev.filter((p) => p.id !== item.id));
        setDeleteConfirmItem(null);
      } else {
        toast.error(res.error.message || t("common.error"));
      }
    });
  }

  const columns: DataTableColumn<CurriculumProgramDto>[] = [
    {
      key: "program",
      header: t("curriculum.nameTh"),
      render: (row) => {
        const levelBadgeTone =
          row.level === "BACHELOR"
            ? "info"
            : row.level === "MASTER"
            ? "ok"
            : row.level === "DOCTORATE"
            ? "warn"
            : "off";
        const levelKey = `curriculum.level.${row.level.toLowerCase()}` as const;

        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground">
                {row.code}
              </span>
              <StatusPill tone={levelBadgeTone}>{t(levelKey)}</StatusPill>
            </div>
            <div className="font-semibold text-foreground">
              {locale === "en" ? row.nameEn : row.nameTh}
            </div>
            <div className="text-xs text-muted-foreground">
              {locale === "en" ? row.degreeEn : row.degreeTh}
            </div>
          </div>
        );
      },
    },
    {
      key: "department",
      header: t("curriculum.department"),
      className: "nowrap text-sm",
      render: (row) => (
        <span className="text-foreground">
          {locale === "en" ? row.departmentNameEn : row.departmentNameTh}
        </span>
      ),
    },
    {
      key: "credits",
      header: t("curriculum.totalCredits"),
      className: "nowrap text-sm text-center",
      render: (row) => (
        <div className="space-y-0.5">
          <div className="font-semibold text-foreground">
            {row.totalCredits} {t("curriculum.credits")}
          </div>
          <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{row.durationYears} {t("curriculum.durationYearsUnit")}</span>
          </div>
        </div>
      ),
    },
    {
      key: "courses",
      header: t("curriculum.courses"),
      className: "nowrap text-sm text-center",
      render: (row) => (
        <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">
          <FileText className="h-3 w-3" />
          {row.courseCount}
        </span>
      ),
    },
    {
      key: "status",
      header: t("curriculum.status"),
      className: "nowrap text-sm",
      render: (row) => {
        const tone =
          row.status === "ACTIVE"
            ? "ok"
            : row.status === "DRAFT"
            ? "warn"
            : row.status === "REVISED"
            ? "info"
            : "off";
        const statusKey = `curriculum.status.${row.status.toLowerCase()}` as const;
        return <StatusPill tone={tone}>{t(statusKey)}</StatusPill>;
      },
    },
    {
      key: "seq",
      header: t("curriculum.seq"),
      className: "nowrap text-sm text-center",
      render: (row) => (
        <span className="font-mono text-xs text-muted-foreground">{row.seq}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("curriculum.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("curriculum.subtitle")}</p>
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={openCreateDialog}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Plus className="h-4 w-4" />
            {t("curriculum.create")}
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <LiyonCard className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">{t("curriculum.stat.total")}</p>
            <p className="text-xl font-bold text-foreground">{stats.total}</p>
          </div>
        </LiyonCard>
        <LiyonCard className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">{t("curriculum.stat.bachelor")}</p>
            <p className="text-xl font-bold text-foreground">{stats.bachelor}</p>
          </div>
        </LiyonCard>
        <LiyonCard className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">{t("curriculum.stat.graduate")}</p>
            <p className="text-xl font-bold text-foreground">{stats.graduate}</p>
          </div>
        </LiyonCard>
        <LiyonCard className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">{t("curriculum.stat.active")}</p>
            <p className="text-xl font-bold text-foreground">{stats.active}</p>
          </div>
        </LiyonCard>
      </div>

      {/* Filter Bar */}
      <LiyonCard className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("common.search")}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="ALL">{t("curriculum.allLevels")}</option>
            <option value="BACHELOR">{t("curriculum.level.bachelor")}</option>
            <option value="MASTER">{t("curriculum.level.master")}</option>
            <option value="DOCTORATE">{t("curriculum.level.doctorate")}</option>
            <option value="CERTIFICATE">{t("curriculum.level.certificate")}</option>
          </select>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="ALL">{t("curriculum.allDepartments")}</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {locale === "en" ? d.nameEn : d.nameTh}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="ALL">{t("curriculum.allStatuses")}</option>
            <option value="ACTIVE">{t("curriculum.status.active")}</option>
            <option value="DRAFT">{t("curriculum.status.draft")}</option>
            <option value="REVISED">{t("curriculum.status.revised")}</option>
            <option value="PHASED_OUT">{t("curriculum.status.phased_out")}</option>
          </select>
        </div>
      </LiyonCard>

      {/* Program Table */}
      <LiyonCard>
        <DataTable<CurriculumProgramDto>
          headHeading={<span className="font-semibold text-sm">{t("curriculum.title")}</span>}
          state={filteredPrograms.length === 0 ? "empty" : "data"}
          rows={filteredPrograms}
          columns={columns}
          getRowId={(row) => row.id}
          renderRowMenu={
            canManage
              ? (row) => (
                  <>
                    <RowMenuItem
                      onSelect={() => openEditDialog(row)}
                      icon={<Edit2 className="h-4 w-4" />}
                    >
                      {t("common.edit")}
                    </RowMenuItem>
                    <RowMenuItem
                      onSelect={() => setDeleteConfirmItem(row)}
                      danger
                      icon={<Trash2 className="h-4 w-4" />}
                    >
                      {t("common.delete")}
                    </RowMenuItem>
                  </>
                )
              : undefined
          }
          empty={{
            icon: <BookOpen className="h-10 w-10 text-muted-foreground/50" />,
            title: t("curriculum.empty"),
            description: t("curriculum.subtitle"),
          }}
          error={{
            icon: <AlertCircle className="h-10 w-10 text-destructive" />,
            title: t("common.error"),
          }}
        />
      </LiyonCard>

      {/* Create / Edit Dialog */}
      <LiyonDialog open={modalOpen} onOpenChange={setModalOpen}>
        <LiyonDialogHeader title={editingItem ? t("curriculum.edit") : t("curriculum.create")} />
        <LiyonDialogBody className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Program Code & Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <LiyonField label={t("curriculum.code")}>
              <input
                type="text"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                placeholder="เช่น BA-BUD"
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background font-mono focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </LiyonField>
            <LiyonField label={t("curriculum.level")}>
              <LiyonSelect
                value={formLevel}
                onChange={(e) =>
                  setFormLevel(
                    e.target.value as "BACHELOR" | "MASTER" | "DOCTORATE" | "CERTIFICATE"
                  )
                }
              >
                <option value="BACHELOR">{t("curriculum.level.bachelor")}</option>
                <option value="MASTER">{t("curriculum.level.master")}</option>
                <option value="DOCTORATE">{t("curriculum.level.doctorate")}</option>
                <option value="CERTIFICATE">{t("curriculum.level.certificate")}</option>
              </LiyonSelect>
            </LiyonField>
          </div>

          {/* Department & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <LiyonField label={t("curriculum.department")}>
              <LiyonSelect
                value={formDepartmentId}
                onChange={(e) => setFormDepartmentId(e.target.value)}
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {locale === "en" ? d.nameEn : d.nameTh}
                  </option>
                ))}
              </LiyonSelect>
            </LiyonField>
            <LiyonField label={t("curriculum.status")}>
              <LiyonSelect
                value={formStatus}
                onChange={(e) =>
                  setFormStatus(
                    e.target.value as "ACTIVE" | "DRAFT" | "REVISED" | "PHASED_OUT"
                  )
                }
              >
                <option value="ACTIVE">{t("curriculum.status.active")}</option>
                <option value="DRAFT">{t("curriculum.status.draft")}</option>
                <option value="REVISED">{t("curriculum.status.revised")}</option>
                <option value="PHASED_OUT">{t("curriculum.status.phased_out")}</option>
              </LiyonSelect>
            </LiyonField>
          </div>

          {/* Program Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <LiyonField label={t("curriculum.nameTh")}>
              <input
                type="text"
                value={formNameTh}
                onChange={(e) => setFormNameTh(e.target.value)}
                placeholder="หลักสูตรพุทธศาสตรบัณฑิต..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </LiyonField>
            <LiyonField label={t("curriculum.nameEn")}>
              <input
                type="text"
                value={formNameEn}
                onChange={(e) => setFormNameEn(e.target.value)}
                placeholder="Bachelor of Arts Program in..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </LiyonField>
          </div>

          {/* Degree Titles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <LiyonField label={t("curriculum.degreeTh")}>
              <input
                type="text"
                value={formDegreeTh}
                onChange={(e) => setFormDegreeTh(e.target.value)}
                placeholder="พุทธศาสตรบัณฑิต (พระพุทธศาสนา)"
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </LiyonField>
            <LiyonField label={t("curriculum.degreeEn")}>
              <input
                type="text"
                value={formDegreeEn}
                onChange={(e) => setFormDegreeEn(e.target.value)}
                placeholder="Bachelor of Arts (Buddhist Studies)"
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </LiyonField>
          </div>

          {/* Credits, Duration, Display Seq */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <LiyonField label={t("curriculum.totalCredits")}>
              <input
                type="number"
                value={formTotalCredits}
                onChange={(e) => setFormTotalCredits(e.target.value)}
                min="1"
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </LiyonField>
            <LiyonField label={t("curriculum.durationYears")}>
              <input
                type="number"
                value={formDurationYears}
                onChange={(e) => setFormDurationYears(e.target.value)}
                min="1"
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </LiyonField>
            <LiyonField label={t("curriculum.seq")}>
              <input
                type="number"
                value={formSeq}
                onChange={(e) => setFormSeq(e.target.value)}
                min="0"
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </LiyonField>
          </div>

          {/* Tuition Fee Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <LiyonField label={t("curriculum.tuitionNoteTh")}>
              <input
                type="text"
                value={formTuitionTh}
                onChange={(e) => setFormTuitionTh(e.target.value)}
                placeholder="ประมาณ 18,000 บาท ต่อภาคการศึกษา"
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </LiyonField>
            <LiyonField label={t("curriculum.tuitionNoteEn")}>
              <input
                type="text"
                value={formTuitionEn}
                onChange={(e) => setFormTuitionEn(e.target.value)}
                placeholder="Approx. 18,000 THB / semester"
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </LiyonField>
          </div>

          {/* Brochure URL */}
          <LiyonField label={t("curriculum.brochureUrl")}>
            <input
              type="url"
              value={formBrochureUrl}
              onChange={(e) => setFormBrochureUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </LiyonField>

          {/* Program Overview / Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <LiyonField label={t("curriculum.descTh")}>
              <textarea
                rows={3}
                value={formDescTh}
                onChange={(e) => setFormDescTh(e.target.value)}
                placeholder="คำอธิบายภาพรวม จุดเด่นของหลักสูตร..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </LiyonField>
            <LiyonField label={t("curriculum.descEn")}>
              <textarea
                rows={3}
                value={formDescEn}
                onChange={(e) => setFormDescEn(e.target.value)}
                placeholder="Overview and key highlights of the curriculum..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </LiyonField>
          </div>

          {/* Career Opportunities */}
          <LiyonField
            label={`${t("curriculum.careerProspects")} (${
              locale === "en" ? "one per line" : "1 บรรทัดต่อ 1 อาชีพ"
            })`}
          >
            <textarea
              rows={3}
              value={formCareersText}
              onChange={(e) => setFormCareersText(e.target.value)}
              placeholder={"อาจารย์/นักวิชาการ\nนักวิจัยและผู้เชี่ยวชาญ"}
              className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </LiyonField>

          {/* Admission Requirements */}
          <LiyonField
            label={`${t("curriculum.admissionRequirements")} (${
              locale === "en" ? "one per line" : "1 บรรทัดต่อ 1 ข้อ"
            })`}
          >
            <textarea
              rows={3}
              value={formReqsText}
              onChange={(e) => setFormReqsText(e.target.value)}
              placeholder={"สำเร็จการศึกษาระดับมัธยมศึกษาตอนปลาย (ม.๖) หรือเทียบเท่า\nเปรียญธรรม ๓ ประโยคขึ้นไป"}
              className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </LiyonField>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <button
            type="button"
            disabled={isPending}
            onClick={() => setModalOpen(false)}
            className="rounded-lg border border-input px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={handleSave}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending ? t("common.saving") : t("common.save")}
          </button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* Delete Confirmation Dialog */}
      <LiyonDialog
        open={!!deleteConfirmItem}
        onOpenChange={() => setDeleteConfirmItem(null)}
      >
        <LiyonDialogHeader title={t("curriculum.delete")} />
        <LiyonDialogBody>
          <p className="text-sm text-muted-foreground">{t("curriculum.deleteConfirm")}</p>
          {deleteConfirmItem && (
            <p className="mt-2 text-sm font-semibold text-foreground">
              {deleteConfirmItem.code}:{" "}
              {locale === "en" ? deleteConfirmItem.nameEn : deleteConfirmItem.nameTh}
            </p>
          )}
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <button
            type="button"
            disabled={isPending}
            onClick={() => setDeleteConfirmItem(null)}
            className="rounded-lg border border-input px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => deleteConfirmItem && handleDelete(deleteConfirmItem)}
            className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
          >
            {isPending ? t("common.deleting") : t("common.delete")}
          </button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}
