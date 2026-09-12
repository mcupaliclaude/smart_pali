"use client";

import { useState, useTransition, useMemo, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  Building2,
  GraduationCap,
  Award,
  Layers,
  Search,
  AlertCircle,
  Clock,
  FileText,
  BookPlus,
  Loader2,
  Check,
  Download,
  Upload,
  FileCode,
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
import type { CurriculumProgramDto, CurriculumCourseDto, ImportCourseItem } from "@/features/curriculum";
import type { StaffDepartmentDto } from "@/features/staff";
import {
  createProgramAction,
  updateProgramAction,
  deleteProgramAction,
  addCourseAction,
  deleteCourseAction,
  syncProgramCoursesAction,
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
  const searchParams = useSearchParams();
  const deptParam = searchParams.get("dept");
  const [search, setSearch] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("ALL");
  const [selectedDeptOverride, setSelectedDeptOverride] = useState<string | null>(null);
  const selectedDept = selectedDeptOverride ?? (deptParam || "ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Dialog States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CurriculumProgramDto | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<CurriculumProgramDto | null>(null);

  // Course Management States
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [activeCourseProgram, setActiveCourseProgram] = useState<CurriculumProgramDto | null>(null);
  const [programCourses, setProgramCourses] = useState<CurriculumCourseDto[]>([]);
  const [showAddCourseForm, setShowAddCourseForm] = useState(false);
  const [courseFilterPeriod, setCourseFilterPeriod] = useState("ALL");
  const [isSubmittingCourse, setIsSubmittingCourse] = useState(false);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);

  // New Course Form States
  const [cCode, setCCode] = useState("");
  const [cNameTh, setCNameTh] = useState("");
  const [cNameEn, setCNameEn] = useState("");
  const [cCredits, setCCredits] = useState("3");
  const [cLecture, setCLecture] = useState("3");
  const [cLab, setCLab] = useState("0");
  const [cSelfStudy, setCSelfStudy] = useState("6");
  const [cCategory, setCCategory] = useState("COMPULSORY");
  const [cYear, setCYear] = useState("1");
  const [cSemester, setCSemester] = useState("1");
  const [cDescTh, setCDescTh] = useState("");
  const [cDescEn, setCDescEn] = useState("");

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

  // JSON Import/Export States
  const jsonFileInputRef = useRef<HTMLInputElement>(null);
  const [jsonPasteModalOpen, setJsonPasteModalOpen] = useState(false);
  const [jsonPasteContent, setJsonPasteContent] = useState("");
  const [importedCourses, setImportedCourses] = useState<ImportCourseItem[]>([]);

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
    setImportedCourses([]);
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
    setImportedCourses(
      item.courses?.map((c) => ({
        code: c.code,
        nameTh: c.nameTh,
        nameEn: c.nameEn,
        credits: c.credits,
        lectureHours: c.lectureHours,
        labHours: c.labHours,
        selfStudyHours: c.selfStudyHours,
        courseCategory: c.courseCategory,
        descriptionTh: c.descriptionTh,
        descriptionEn: c.descriptionEn,
        yearLevel: c.yearLevel,
        semester: c.semester,
        seq: c.seq,
      })) || []
    );
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

  function handleExportJson() {
    const matchedDept = departments.find((d) => d.id === formDepartmentId);
    const coursesToExport =
      importedCourses.length > 0
        ? importedCourses
        : editingItem?.courses?.map((c) => ({
            code: c.code,
            nameTh: c.nameTh,
            nameEn: c.nameEn,
            credits: c.credits,
            lectureHours: c.lectureHours,
            labHours: c.labHours,
            selfStudyHours: c.selfStudyHours,
            courseCategory: c.courseCategory,
            descriptionTh: c.descriptionTh,
            descriptionEn: c.descriptionEn,
            yearLevel: c.yearLevel,
            semester: c.semester,
            seq: c.seq,
          })) || [];

    const exportData = {
      $schema: "curriculum-program-v1",
      code: formCode || editingItem?.code || "",
      nameTh: formNameTh,
      nameEn: formNameEn,
      degreeTh: formDegreeTh,
      degreeEn: formDegreeEn,
      level: formLevel,
      departmentId: formDepartmentId,
      departmentCode: matchedDept?.code || "",
      departmentNameTh: matchedDept?.nameTh || "",
      departmentNameEn: matchedDept?.nameEn || "",
      totalCredits: parseInt(formTotalCredits, 10) || 0,
      durationYears: parseInt(formDurationYears, 10) || 4,
      tuitionFeeNoteTh: formTuitionTh || null,
      tuitionFeeNoteEn: formTuitionEn || null,
      descriptionTh: formDescTh,
      descriptionEn: formDescEn,
      careerProspects: formCareersText.split("\n").map((s) => s.trim()).filter(Boolean),
      admissionRequirements: formReqsText.split("\n").map((s) => s.trim()).filter(Boolean),
      brochureUrl: formBrochureUrl || null,
      seq: parseInt(formSeq, 10) || 1,
      status: formStatus,
      courses: coursesToExport,
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${formCode ? formCode.toLowerCase() : "curriculum"}-data.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("ส่งออกข้อมูลหลักสูตรเป็น JSON เรียบร้อยแล้ว");
  }

  function applyImportedJson(jsonText: string) {
    try {
      const data = JSON.parse(jsonText);
      if (!data || typeof data !== "object") {
        toast.error("รูปแบบ JSON ไม่ถูกต้อง");
        return false;
      }

      if (data.code) setFormCode(String(data.code).toUpperCase());
      if (data.nameTh) setFormNameTh(String(data.nameTh));
      if (data.nameEn) setFormNameEn(String(data.nameEn));
      if (data.degreeTh) setFormDegreeTh(String(data.degreeTh));
      if (data.degreeEn) setFormDegreeEn(String(data.degreeEn));
      if (data.level && ["BACHELOR", "MASTER", "DOCTORATE", "CERTIFICATE"].includes(data.level)) {
        setFormLevel(data.level);
      }

      // Match department
      if (data.departmentId && departments.some((d) => d.id === data.departmentId)) {
        setFormDepartmentId(data.departmentId);
      } else if (data.departmentCode) {
        const match = departments.find(
          (d) => d.code.toLowerCase() === String(data.departmentCode).toLowerCase()
        );
        if (match) setFormDepartmentId(match.id);
      } else if (data.departmentNameTh || data.departmentNameEn) {
        const match = departments.find(
          (d) =>
            (data.departmentNameTh && d.nameTh.includes(data.departmentNameTh)) ||
            (data.departmentNameEn && d.nameEn.toLowerCase().includes(data.departmentNameEn.toLowerCase()))
        );
        if (match) setFormDepartmentId(match.id);
      }

      if (data.totalCredits !== undefined) setFormTotalCredits(String(data.totalCredits));
      if (data.durationYears !== undefined) setFormDurationYears(String(data.durationYears));
      if (data.tuitionFeeNoteTh !== undefined) setFormTuitionTh(data.tuitionFeeNoteTh || "");
      if (data.tuitionFeeNoteEn !== undefined) setFormTuitionEn(data.tuitionFeeNoteEn || "");
      if (data.descriptionTh) setFormDescTh(String(data.descriptionTh));
      if (data.descriptionEn) setFormDescEn(String(data.descriptionEn));

      if (Array.isArray(data.careerProspects)) {
        setFormCareersText(data.careerProspects.join("\n"));
      } else if (typeof data.careerProspects === "string") {
        setFormCareersText(data.careerProspects);
      }

      if (Array.isArray(data.admissionRequirements)) {
        setFormReqsText(data.admissionRequirements.join("\n"));
      } else if (typeof data.admissionRequirements === "string") {
        setFormReqsText(data.admissionRequirements);
      }

      if (data.brochureUrl !== undefined) setFormBrochureUrl(data.brochureUrl || "");
      if (data.seq !== undefined) setFormSeq(String(data.seq));
      if (data.status && ["DRAFT", "ACTIVE", "REVISED", "PHASED_OUT"].includes(data.status)) {
        setFormStatus(data.status);
      }

      if (Array.isArray(data.courses) && data.courses.length > 0) {
        const parsedCourses: ImportCourseItem[] = data.courses
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((c: any, i: number) => ({
            code: String(c.code || "").trim(),
            nameTh: String(c.nameTh || "").trim(),
            nameEn: String(c.nameEn || c.nameTh || "").trim(),
            credits: typeof c.credits === "number" ? c.credits : parseInt(c.credits, 10) || 3,
            lectureHours: typeof c.lectureHours === "number" ? c.lectureHours : parseInt(c.lectureHours, 10) || 3,
            labHours: typeof c.labHours === "number" ? c.labHours : parseInt(c.labHours, 10) || 0,
            selfStudyHours: typeof c.selfStudyHours === "number" ? c.selfStudyHours : parseInt(c.selfStudyHours, 10) || 6,
            courseCategory: String(c.courseCategory || "COMPULSORY"),
            descriptionTh: c.descriptionTh ? String(c.descriptionTh) : null,
            descriptionEn: c.descriptionEn ? String(c.descriptionEn) : null,
            yearLevel: typeof c.yearLevel === "number" ? c.yearLevel : parseInt(c.yearLevel, 10) || 1,
            semester: typeof c.semester === "number" ? c.semester : parseInt(c.semester, 10) || 1,
            seq: typeof c.seq === "number" ? c.seq : i + 1,
          }))
          .filter((c: ImportCourseItem) => Boolean(c.code && c.nameTh));

        setImportedCourses(parsedCourses);
        toast.success(`นำเข้าข้อมูลจาก JSON สำเร็จ (พบ ${parsedCourses.length} รายวิชา)`);
      } else {
        toast.success("นำเข้าข้อมูลหลักสูตรจาก JSON สำเร็จ");
      }

      return true;
    } catch {
      toast.error("ไฟล์ JSON ผิดรูปแบบ หรือไม่สามารถอ่านได้");
      return false;
    }
  }

  function handleImportJsonFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        applyImportedJson(text);
      }
    };
    reader.onerror = () => {
      toast.error("ไม่สามารถอ่านไฟล์ได้");
    };
    reader.readAsText(file, "UTF-8");
    e.target.value = "";
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
          const updatedProgram = { ...res.data };
          if (importedCourses.length > 0) {
            const courseRes = await syncProgramCoursesAction({
              programId: res.data.id,
              courses: importedCourses,
            });
            if (courseRes.ok) {
              updatedProgram.courses = courseRes.data;
              updatedProgram.courseCount = courseRes.data.length;
            }
          }
          toast.success(t("curriculum.saved"));
          setPrograms((prev) => prev.map((p) => (p.id === updatedProgram.id ? updatedProgram : p)));
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
          const newProgram = { ...res.data };
          if (importedCourses.length > 0) {
            const courseRes = await syncProgramCoursesAction({
              programId: res.data.id,
              courses: importedCourses,
            });
            if (courseRes.ok) {
              newProgram.courses = courseRes.data;
              newProgram.courseCount = courseRes.data.length;
            }
          }
          toast.success(t("curriculum.saved"));
          setPrograms((prev) => [...prev, newProgram]);
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

  function openCourseManageDialog(program: CurriculumProgramDto) {
    setActiveCourseProgram(program);
    setProgramCourses(program.courses || []);
    setShowAddCourseForm(false);
    setCourseFilterPeriod("ALL");
    resetCourseForm();
    setCourseModalOpen(true);
  }

  function resetCourseForm() {
    setCCode("");
    setCNameTh("");
    setCNameEn("");
    setCCredits("3");
    setCLecture("3");
    setCLab("0");
    setCSelfStudy("6");
    setCCategory("COMPULSORY");
    setCYear("1");
    setCSemester("1");
    setCDescTh("");
    setCDescEn("");
  }

  async function handleAddCourse(e: React.FormEvent) {
    e.preventDefault();
    if (!activeCourseProgram) return;
    if (!cCode.trim() || !cNameTh.trim() || !cNameEn.trim()) {
      toast.error(locale === "en" ? "Please fill in course code and names" : "กรุณากรอกรหัสวิชาและชื่อวิชา");
      return;
    }

    setIsSubmittingCourse(true);
    try {
      const res = await addCourseAction({
        programId: activeCourseProgram.id,
        code: cCode.trim(),
        nameTh: cNameTh.trim(),
        nameEn: cNameEn.trim(),
        credits: parseInt(cCredits, 10) || 3,
        lectureHours: parseInt(cLecture, 10) || 3,
        labHours: parseInt(cLab, 10) || 0,
        selfStudyHours: parseInt(cSelfStudy, 10) || 6,
        courseCategory: cCategory,
        yearLevel: parseInt(cYear, 10) || 1,
        semester: parseInt(cSemester, 10) || 1,
        descriptionTh: cDescTh.trim() || undefined,
        descriptionEn: cDescEn.trim() || undefined,
        seq: programCourses.length + 1,
      });

      if (res.ok) {
        toast.success(t("curriculum.courses.saved"));
        const newCourse = res.data;
        const updatedCourses = [...programCourses, newCourse].sort((a, b) => {
          if (a.yearLevel !== b.yearLevel) return a.yearLevel - b.yearLevel;
          if (a.semester !== b.semester) return a.semester - b.semester;
          return a.code.localeCompare(b.code);
        });
        setProgramCourses(updatedCourses);

        setPrograms((prev) =>
          prev.map((p) =>
            p.id === activeCourseProgram.id
              ? {
                  ...p,
                  courseCount: p.courseCount + 1,
                  courses: updatedCourses,
                }
              : p
          )
        );
        resetCourseForm();
        setShowAddCourseForm(false);
      } else {
        toast.error(res.error?.message || t("common.error"));
      }
    } catch {
      toast.error(t("common.error"));
    } finally {
      setIsSubmittingCourse(false);
    }
  }

  async function handleDeleteCourse(course: CurriculumCourseDto) {
    if (!activeCourseProgram) return;
    if (!confirm(t("curriculum.courses.deleteConfirm"))) return;

    setDeletingCourseId(course.id);
    try {
      const res = await deleteCourseAction(course.id);
      if (res.ok) {
        toast.success(t("curriculum.courses.deleted"));
        const updatedCourses = programCourses.filter((c) => c.id !== course.id);
        setProgramCourses(updatedCourses);

        setPrograms((prev) =>
          prev.map((p) =>
            p.id === activeCourseProgram.id
              ? {
                  ...p,
                  courseCount: Math.max(0, p.courseCount - 1),
                  courses: updatedCourses,
                }
              : p
          )
        );
      } else {
        toast.error(res.error?.message || t("common.error"));
      }
    } catch {
      toast.error(t("common.error"));
    } finally {
      setDeletingCourseId(null);
    }
  }

  const filteredCourses = useMemo(() => {
    if (courseFilterPeriod === "ALL") return programCourses;
    const [y, s] = courseFilterPeriod.split("-").map(Number);
    return programCourses.filter((c) => c.yearLevel === y && c.semester === s);
  }, [programCourses, courseFilterPeriod]);

  const totalCourseCredits = useMemo(() => {
    return programCourses.reduce(
      (sum, c) => sum + (c.courseCategory === "NON_CREDIT" ? 0 : c.credits),
      0
    );
  }, [programCourses]);

  const availablePeriods = useMemo(() => {
    const set = new Set<string>();
    for (const c of programCourses) {
      set.add(`${c.yearLevel}-${c.semester}`);
    }
    return Array.from(set).sort();
  }, [programCourses]);

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
        <button
          type="button"
          onClick={() => openCourseManageDialog(row)}
          className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors shadow-2xs group"
          title={t("curriculum.courses.manage")}
        >
          <FileText className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
          <span>{row.courseCount} {locale === "en" ? "courses" : "รายวิชา"}</span>
        </button>
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
      {/* Top Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Link
          href="/curriculum"
          className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary/10 text-primary inline-flex items-center gap-2 shadow-xs"
        >
          <BookOpen className="w-4 h-4" />
          <span>{t("curriculum.tab.programs")}</span>
        </Link>
        <Link
          href="/curriculum/departments"
          className="px-4 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors inline-flex items-center gap-2"
        >
          <Building2 className="w-4 h-4" />
          <span>{t("curriculum.tab.departments")}</span>
        </Link>
      </div>

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
            onChange={(e) => setSelectedDeptOverride(e.target.value)}
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
                      onSelect={() => openCourseManageDialog(row)}
                      icon={<Layers className="h-4 w-4 text-primary" />}
                    >
                      {t("curriculum.courses.manage")}
                    </RowMenuItem>
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
      <LiyonDialog open={modalOpen} onOpenChange={setModalOpen} wide>
        <LiyonDialogHeader
          title={
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full pr-8">
              <span className="text-base font-semibold">
                {editingItem ? t("curriculum.edit") : t("curriculum.create")}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border border-input bg-background hover:bg-muted text-foreground transition-colors shadow-2xs cursor-pointer"
                  title="ส่งออกข้อมูลหลักสูตรและรายวิชาเป็นไฟล์ JSON"
                >
                  <Download className="h-3.5 w-3.5 text-primary" />
                  <span>ส่งออก JSON</span>
                </button>
                <button
                  type="button"
                  onClick={() => jsonFileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border border-input bg-background hover:bg-muted text-foreground transition-colors shadow-2xs cursor-pointer"
                  title="นำเข้าข้อมูลจากไฟล์ .json"
                >
                  <Upload className="h-3.5 w-3.5 text-primary" />
                  <span>นำเข้า JSON</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setJsonPasteContent("");
                    setJsonPasteModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border border-input bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shadow-2xs cursor-pointer"
                  title="วางโค้ดข้อความ JSON โดยตรง"
                >
                  <FileCode className="h-3.5 w-3.5" />
                  <span>วางโค้ด</span>
                </button>
                <input
                  ref={jsonFileInputRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleImportJsonFile}
                />
              </div>
            </div>
          }
        />
        <LiyonDialogBody className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Imported Courses Banner (if any) */}
          {importedCourses.length > 0 && (
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  พบ <strong>{importedCourses.length}</strong> รายวิชาจาก JSON ที่จะถูกบันทึกและซิงก์เข้าสู่หลักสูตรนี้เมื่อกดบันทึก
                </span>
              </div>
              <button
                type="button"
                onClick={() => setImportedCourses([])}
                className="text-xs text-muted-foreground hover:text-destructive underline ml-2 cursor-pointer"
              >
                ยกเลิกรายวิชา
              </button>
            </div>
          )}

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

      {/* JSON Paste Dialog */}
      <LiyonDialog open={jsonPasteModalOpen} onOpenChange={setJsonPasteModalOpen} wide>
        <LiyonDialogHeader
          title="นำเข้าข้อมูลหลักสูตรจาก JSON (Import JSON)"
          description="วางข้อความ JSON เพื่อกรอกข้อมูลลงในแบบฟอร์มแก้ไขหลักสูตรโดยอัตโนมัติ"
        />
        <LiyonDialogBody className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">ข้อความ JSON</label>
            <textarea
              rows={12}
              value={jsonPasteContent}
              onChange={(e) => setJsonPasteContent(e.target.value)}
              placeholder={'{\n  "code": "PHD-BPS",\n  "nameTh": "...",\n  "nameEn": "...",\n  "level": "DOCTORATE",\n  "totalCredits": 48,\n  "courses": [...]\n}'}
              className="w-full p-3 font-mono text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <button
            type="button"
            onClick={() => setJsonPasteModalOpen(false)}
            className="rounded-lg border border-input px-4 py-2 text-sm font-medium hover:bg-muted cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={() => {
              if (!jsonPasteContent.trim()) {
                toast.error("กรุณากรอกข้อความ JSON");
                return;
              }
              const ok = applyImportedJson(jsonPasteContent);
              if (ok) setJsonPasteModalOpen(false);
            }}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 cursor-pointer"
          >
            ปรับใช้ข้อมูล JSON
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

      {/* Course Management Dialog */}
      <LiyonDialog
        wide
        open={courseModalOpen}
        onOpenChange={(open) => {
          setCourseModalOpen(open);
          if (!open) {
            setShowAddCourseForm(false);
          }
        }}
      >
        <LiyonDialogHeader
          title={
            activeCourseProgram ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">
                  {activeCourseProgram.code}
                </span>
                <span className="text-base font-bold text-foreground">
                  {t("curriculum.courses.manage")}
                </span>
              </div>
            ) : (
              t("curriculum.courses.manage")
            )
          }
          description={
            activeCourseProgram
              ? locale === "en"
                ? activeCourseProgram.nameEn
                : activeCourseProgram.nameTh
              : undefined
          }
        />
        <LiyonDialogBody className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {activeCourseProgram && (
            <>
              {/* Summary Strip & Action Bar */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-foreground">
                    {t("curriculum.courses")}:
                  </span>
                  <span className="font-mono px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">
                    {programCourses.length} {locale === "en" ? "courses" : "รายวิชา"}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="font-semibold text-foreground">
                    {locale === "en" ? "Mapped Credits" : "หน่วยกิตในวิชา"}:
                  </span>
                  <span className="font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                    {totalCourseCredits} / {activeCourseProgram.totalCredits} {t("curriculum.credits")}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddCourseForm((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs"
                  >
                    <BookPlus className="w-3.5 h-3.5" />
                    <span>
                      {showAddCourseForm
                        ? locale === "en" ? "Close Form" : "ปิดฟอร์มเพิ่มวิชา"
                        : t("curriculum.courses.add")}
                    </span>
                  </button>
                </div>
              </div>

              {/* Add New Course Form Card (Collapsible) */}
              {showAddCourseForm && (
                <form
                  onSubmit={handleAddCourse}
                  className="p-4 rounded-xl border border-primary/30 bg-primary/2 dark:bg-primary/5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div className="flex items-center justify-between border-b border-primary/20 pb-2">
                    <h4 className="text-xs font-bold text-primary flex items-center gap-1.5">
                      <BookPlus className="w-3.5 h-3.5" />
                      <span>{t("curriculum.courses.add")}</span>
                    </h4>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {activeCourseProgram.code}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <LiyonField label={t("curriculum.courses.code")}>
                      <input
                        type="text"
                        required
                        value={cCode}
                        onChange={(e) => setCCode(e.target.value)}
                        placeholder="เช่น 606 202"
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-input bg-background font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </LiyonField>

                    <LiyonField label={t("curriculum.courses.category")}>
                      <LiyonSelect
                        value={cCategory}
                        onChange={(e) => setCCategory(e.target.value)}
                        className="text-xs"
                      >
                        <option value="COMPULSORY">{t("curriculum.courses.category.compulsory")}</option>
                        <option value="MAJOR">{t("curriculum.courses.category.major")}</option>
                        <option value="ELECTIVE">{t("curriculum.courses.category.elective")}</option>
                        <option value="THESIS">{t("curriculum.courses.category.thesis")}</option>
                        <option value="INDEPENDENT_STUDY">{t("curriculum.courses.category.independent_study")}</option>
                        <option value="NON_CREDIT">{t("curriculum.courses.category.non_credit")}</option>
                      </LiyonSelect>
                    </LiyonField>

                    <LiyonField label={t("curriculum.courses.year")}>
                      <LiyonSelect
                        value={cYear}
                        onChange={(e) => setCYear(e.target.value)}
                        className="text-xs"
                      >
                        <option value="1">{locale === "en" ? "Year 1" : "ปี 1"}</option>
                        <option value="2">{locale === "en" ? "Year 2" : "ปี 2"}</option>
                        <option value="3">{locale === "en" ? "Year 3" : "ปี 3"}</option>
                        <option value="4">{locale === "en" ? "Year 4" : "ปี 4"}</option>
                      </LiyonSelect>
                    </LiyonField>

                    <LiyonField label={t("curriculum.courses.semester")}>
                      <LiyonSelect
                        value={cSemester}
                        onChange={(e) => setCSemester(e.target.value)}
                        className="text-xs"
                      >
                        <option value="1">{locale === "en" ? "Semester 1" : "ภาคเรียนที่ 1"}</option>
                        <option value="2">{locale === "en" ? "Semester 2" : "ภาคเรียนที่ 2"}</option>
                        <option value="3">{locale === "en" ? "Summer" : "ภาคฤดูร้อน"}</option>
                      </LiyonSelect>
                    </LiyonField>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <LiyonField label={t("curriculum.courses.nameTh")}>
                      <input
                        type="text"
                        required
                        value={cNameTh}
                        onChange={(e) => setCNameTh(e.target.value)}
                        placeholder="เช่น สติปัฏฐานภาวนา"
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </LiyonField>
                    <LiyonField label={t("curriculum.courses.nameEn")}>
                      <input
                        type="text"
                        required
                        value={cNameEn}
                        onChange={(e) => setCNameEn(e.target.value)}
                        placeholder="e.g. Satipatthanabhavana"
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </LiyonField>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <LiyonField label={t("curriculum.courses.credits")}>
                      <input
                        type="number"
                        min="0"
                        value={cCredits}
                        onChange={(e) => setCCredits(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-input bg-background font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </LiyonField>
                    <LiyonField label={locale === "en" ? "Lecture (hrs)" : "บรรยาย (ชม.)"}>
                      <input
                        type="number"
                        min="0"
                        value={cLecture}
                        onChange={(e) => setCLecture(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-input bg-background font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </LiyonField>
                    <LiyonField label={locale === "en" ? "Lab / Practice (hrs)" : "ปฏิบัติ (ชม.)"}>
                      <input
                        type="number"
                        min="0"
                        value={cLab}
                        onChange={(e) => setCLab(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-input bg-background font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </LiyonField>
                    <LiyonField label={locale === "en" ? "Self Study (hrs)" : "ค้นคว้าเอง (ชม.)"}>
                      <input
                        type="number"
                        min="0"
                        value={cSelfStudy}
                        onChange={(e) => setCSelfStudy(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-input bg-background font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </LiyonField>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddCourseForm(false)}
                      className="px-3 py-1.5 rounded-lg border border-input text-xs font-medium hover:bg-muted"
                    >
                      {t("common.cancel")}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingCourse}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50"
                    >
                      {isSubmittingCourse ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>กำลังบันทึก...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>{t("common.save")}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Filter Pills by Period */}
              {availablePeriods.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  <span className="text-muted-foreground font-medium mr-1">
                    {locale === "en" ? "Filter by term:" : "กรองตามภาคเรียน:"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCourseFilterPeriod("ALL")}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      courseFilterPeriod === "ALL"
                        ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {locale === "en" ? "All Terms" : "ทุกภาคเรียน"} ({programCourses.length})
                  </button>
                  {availablePeriods.map((p) => {
                    const [y, s] = p.split("-");
                    const count = programCourses.filter((c) => `${c.yearLevel}-${c.semester}` === p).length;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setCourseFilterPeriod(p)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                          courseFilterPeriod === p
                            ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {locale === "en" ? `Y${y}/S${s}` : `ปี ${y} เทอม ${s}`} ({count})
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Courses Table / List */}
              {filteredCourses.length > 0 ? (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredCourses.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 bg-card hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-muted text-foreground">
                            {c.code}
                          </span>
                          {getCategoryPill(c.courseCategory, locale)}
                          <span className="text-[11px] text-muted-foreground">
                            {locale === "en" ? `Year ${c.yearLevel} / Term ${c.semester}` : `ปี ${c.yearLevel} ภาคเรียนที่ ${c.semester}`}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-foreground truncate">
                          {locale === "en" ? c.nameEn : c.nameTh}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {locale === "en" ? c.nameTh : c.nameEn}
                        </p>
                        {c.descriptionTh && (
                          <p className="text-[11px] text-muted-foreground line-clamp-1 pt-0.5">
                            {c.descriptionTh}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        <div className="text-right">
                          <span className="font-mono font-bold text-xs text-primary px-2 py-0.5 rounded bg-primary/10">
                            {c.credits} {t("curriculum.credits")}
                          </span>
                          <span className="block text-[11px] text-muted-foreground mt-0.5 font-mono">
                            ({c.lectureHours}-{c.labHours}-{c.selfStudyHours})
                          </span>
                        </div>

                        {canManage && (
                          <button
                            type="button"
                            disabled={deletingCourseId === c.id}
                            onClick={() => handleDeleteCourse(c)}
                            title={t("curriculum.courses.delete")}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                          >
                            {deletingCourseId === c.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-destructive" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center border border-dashed border-border rounded-xl space-y-2">
                  <FileText className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                  <p className="text-xs text-muted-foreground font-medium">
                    {t("curriculum.courses.empty")}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAddCourseForm(true)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t("curriculum.courses.add")}</span>
                  </button>
                </div>
              )}
            </>
          )}
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <button
            type="button"
            onClick={() => setCourseModalOpen(false)}
            className="rounded-lg border border-input px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            {t("common.close")}
          </button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}

function getCategoryPill(cat: string, locale: string) {
  switch (cat) {
    case "COMPULSORY":
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
          {locale === "en" ? "Compulsory" : "วิชาบังคับ"}
        </span>
      );
    case "MAJOR":
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          {locale === "en" ? "Major" : "วิชาเอก"}
        </span>
      );
    case "ELECTIVE":
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
          {locale === "en" ? "Elective" : "วิชาเลือก"}
        </span>
      );
    case "THESIS":
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          {locale === "en" ? "Thesis" : "วิทยานิพนธ์"}
        </span>
      );
    case "INDEPENDENT_STUDY":
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300">
          {locale === "en" ? "Indep. Study" : "สารนิพนธ์"}
        </span>
      );
    case "NON_CREDIT":
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {locale === "en" ? "Non-Credit" : "ไม่นับหน่วยกิต"}
        </span>
      );
    default:
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-muted text-muted-foreground">
          {cat}
        </span>
      );
  }
}
