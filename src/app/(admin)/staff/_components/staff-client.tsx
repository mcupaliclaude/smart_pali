"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Users,
  GraduationCap,
  Briefcase,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  Search,
  AlertCircle,
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
import type { StaffProfileDto, StaffDepartmentDto } from "@/features/staff";
import {
  createStaffAction,
  updateStaffAction,
  deleteStaffAction,
} from "@/features/staff/actions";

interface StaffClientProps {
  initialStaff: StaffProfileDto[];
  departments: StaffDepartmentDto[];
  canManage: boolean;
  canCreate: boolean;
}

export function StaffClient({
  initialStaff,
  departments,
  canManage,
  canCreate,
}: StaffClientProps) {
  const t = useT();
  const locale = useLocale();
  const [staffList, setStaffList] = useState<StaffProfileDto[]>(initialStaff);
  const [isPending, startTransition] = useTransition();

  // Filter States
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Dialog State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StaffProfileDto | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<StaffProfileDto | null>(null);

  // Form States
  const [formPrefixTh, setFormPrefixTh] = useState("");
  const [formPrefixEn, setFormPrefixEn] = useState("");
  const [formFirstNameTh, setFormFirstNameTh] = useState("");
  const [formLastNameTh, setFormLastNameTh] = useState("");
  const [formFirstNameEn, setFormFirstNameEn] = useState("");
  const [formLastNameEn, setFormLastNameEn] = useState("");
  const [formStaffType, setFormStaffType] = useState<"ACADEMIC" | "SUPPORT">("ACADEMIC");
  const [formAcademicRank, setFormAcademicRank] = useState("");
  const [formAdminPosTh, setFormAdminPosTh] = useState("");
  const [formAdminPosEn, setFormAdminPosEn] = useState("");
  const [formDepartmentId, setFormDepartmentId] = useState(departments[0]?.id ?? "");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formRoomNo, setFormRoomNo] = useState("");
  const [formAvatarUrl, setFormAvatarUrl] = useState("");
  const [formSeq, setFormSeq] = useState("1");
  const [formStatus, setFormStatus] = useState<"ACTIVE" | "LEAVE" | "RETIRED">("ACTIVE");
  const [formEducationText, setFormEducationText] = useState("");
  const [formResearchText, setFormResearchText] = useState("");

  // Stats
  const stats = useMemo(() => ({
    total: staffList.length,
    academic: staffList.filter((s) => s.staffType === "ACADEMIC").length,
    support: staffList.filter((s) => s.staffType === "SUPPORT").length,
    active: staffList.filter((s) => s.status === "ACTIVE").length,
  }), [staffList]);

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      const matchSearch =
        !search ||
        s.fullNameTh.toLowerCase().includes(search.toLowerCase()) ||
        s.fullNameEn.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        (s.administrativePositionTh && s.administrativePositionTh.toLowerCase().includes(search.toLowerCase())) ||
        (s.administrativePositionEn && s.administrativePositionEn.toLowerCase().includes(search.toLowerCase()));

      const matchDept = selectedDept === "ALL" || s.departmentId === selectedDept;
      const matchType = selectedType === "ALL" || s.staffType === selectedType;
      const matchStatus = selectedStatus === "ALL" || s.status === selectedStatus;

      return matchSearch && matchDept && matchType && matchStatus;
    });
  }, [staffList, search, selectedDept, selectedType, selectedStatus]);

  function openCreateDialog() {
    setEditingItem(null);
    setFormPrefixTh("");
    setFormPrefixEn("");
    setFormFirstNameTh("");
    setFormLastNameTh("");
    setFormFirstNameEn("");
    setFormLastNameEn("");
    setFormStaffType("ACADEMIC");
    setFormAcademicRank("");
    setFormAdminPosTh("");
    setFormAdminPosEn("");
    setFormDepartmentId(departments[0]?.id ?? "");
    setFormEmail("");
    setFormPhone("");
    setFormRoomNo("");
    setFormAvatarUrl("");
    setFormSeq(String(staffList.length + 1));
    setFormStatus("ACTIVE");
    setFormEducationText("");
    setFormResearchText("");
    setModalOpen(true);
  }

  function openEditDialog(item: StaffProfileDto) {
    setEditingItem(item);
    setFormPrefixTh(item.prefixTh);
    setFormPrefixEn(item.prefixEn);
    setFormFirstNameTh(item.firstNameTh);
    setFormLastNameTh(item.lastNameTh);
    setFormFirstNameEn(item.firstNameEn);
    setFormLastNameEn(item.lastNameEn);
    setFormStaffType(item.staffType);
    setFormAcademicRank(item.academicRank || "");
    setFormAdminPosTh(item.administrativePositionTh || "");
    setFormAdminPosEn(item.administrativePositionEn || "");
    setFormDepartmentId(item.departmentId);
    setFormEmail(item.email);
    setFormPhone(item.phone || "");
    setFormRoomNo(item.roomNo || "");
    setFormAvatarUrl(item.avatarUrl || "");
    setFormSeq(String(item.seq));
    setFormStatus(item.status);
    setFormEducationText(item.education.join("\n"));
    setFormResearchText(item.researchInterests.join("\n"));
    setModalOpen(true);
  }

  function handleSave() {
    if (
      !formPrefixTh ||
      !formPrefixEn ||
      !formFirstNameTh ||
      !formLastNameTh ||
      !formFirstNameEn ||
      !formLastNameEn ||
      !formEmail ||
      !formDepartmentId
    ) {
      toast.error(t("error.validation"));
      return;
    }

    const education = formEducationText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const researchInterests = formResearchText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    startTransition(async () => {
      if (editingItem) {
        const res = await updateStaffAction({
          id: editingItem.id,
          prefixTh: formPrefixTh,
          prefixEn: formPrefixEn,
          firstNameTh: formFirstNameTh,
          lastNameTh: formLastNameTh,
          firstNameEn: formFirstNameEn,
          lastNameEn: formLastNameEn,
          staffType: formStaffType,
          academicRank: formAcademicRank || null,
          administrativePositionTh: formAdminPosTh || null,
          administrativePositionEn: formAdminPosEn || null,
          departmentId: formDepartmentId,
          email: formEmail,
          phone: formPhone || null,
          roomNo: formRoomNo || null,
          education,
          researchInterests,
          avatarUrl: formAvatarUrl || null,
          seq: parseInt(formSeq, 10) || 0,
          status: formStatus,
        });

        if (res.ok) {
          toast.success(t("staff.saved"));
          setStaffList((prev) => prev.map((s) => (s.id === res.data.id ? res.data : s)));
          setModalOpen(false);
        } else {
          toast.error(res.error.message || t("common.error"));
        }
      } else {
        const res = await createStaffAction({
          prefixTh: formPrefixTh,
          prefixEn: formPrefixEn,
          firstNameTh: formFirstNameTh,
          lastNameTh: formLastNameTh,
          firstNameEn: formFirstNameEn,
          lastNameEn: formLastNameEn,
          staffType: formStaffType,
          academicRank: formAcademicRank || null,
          administrativePositionTh: formAdminPosTh || null,
          administrativePositionEn: formAdminPosEn || null,
          departmentId: formDepartmentId,
          email: formEmail,
          phone: formPhone || null,
          roomNo: formRoomNo || null,
          education,
          researchInterests,
          avatarUrl: formAvatarUrl || null,
          seq: parseInt(formSeq, 10) || 0,
          status: formStatus,
        });

        if (res.ok) {
          toast.success(t("staff.saved"));
          setStaffList((prev) => [...prev, res.data]);
          setModalOpen(false);
        } else {
          toast.error(res.error.message || t("common.error"));
        }
      }
    });
  }

  function handleDelete(item: StaffProfileDto) {
    startTransition(async () => {
      const res = await deleteStaffAction(item.id);
      if (res.ok) {
        toast.success(t("staff.deleted"));
        setStaffList((prev) => prev.filter((s) => s.id !== item.id));
        setDeleteConfirmItem(null);
      } else {
        toast.error(res.error.message || t("common.error"));
      }
    });
  }

  const columns: DataTableColumn<StaffProfileDto>[] = [
    {
      key: "name",
      header: t("staff.nameTh"),
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={row.avatarUrl}
              alt={row.fullNameTh}
              className="h-10 w-10 rounded-full object-cover border border-border shrink-0"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0">
              {row.firstNameTh[0] || "U"}
            </div>
          )}
          <div className="space-y-0.5 min-w-0">
            <div className="font-medium text-foreground truncate">
              {locale === "en" ? row.fullNameEn : row.fullNameTh}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {locale === "en" ? row.fullNameTh : row.fullNameEn}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "department",
      header: t("staff.department"),
      className: "nowrap text-sm",
      render: (row) => (
        <div className="space-y-0.5">
          <div className="text-foreground font-medium">
            {locale === "en" ? row.departmentNameEn : row.departmentNameTh}
          </div>
          {(row.administrativePositionTh || row.administrativePositionEn) && (
            <div className="text-xs text-primary font-medium">
              {locale === "en"
                ? row.administrativePositionEn || row.administrativePositionTh
                : row.administrativePositionTh || row.administrativePositionEn}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "type",
      header: t("staff.type"),
      className: "nowrap text-sm",
      render: (row) => (
        <StatusPill tone={row.staffType === "ACADEMIC" ? "info" : "warn"}>
          {row.staffType === "ACADEMIC" ? t("staff.type.academic") : t("staff.type.support")}
        </StatusPill>
      ),
    },
    {
      key: "contact",
      header: t("staff.email"),
      className: "nowrap text-sm",
      render: (row) => (
        <div className="space-y-0.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1 text-foreground">
            <Mail className="h-3 w-3 text-muted-foreground" />
            <span>{row.email}</span>
          </div>
          {row.phone && (
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3 text-muted-foreground" />
              <span>{row.phone}</span>
            </div>
          )}
          {row.roomNo && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span>{t("staff.roomNo")}: {row.roomNo}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: t("staff.status"),
      className: "nowrap text-sm",
      render: (row) => {
        const tone = row.status === "ACTIVE" ? "ok" : row.status === "LEAVE" ? "warn" : "off";
        const labelKey = `staff.status.${row.status.toLowerCase()}` as const;
        return <StatusPill tone={tone}>{t(labelKey)}</StatusPill>;
      },
    },
    {
      key: "seq",
      header: t("staff.seq"),
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("staff.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("staff.subtitle")}</p>
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={openCreateDialog}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Plus className="h-4 w-4" />
            {t("staff.create")}
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <LiyonCard className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">{t("staff.stat.total")}</p>
            <p className="text-xl font-bold text-foreground">{stats.total}</p>
          </div>
        </LiyonCard>
        <LiyonCard className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">{t("staff.stat.academic")}</p>
            <p className="text-xl font-bold text-foreground">{stats.academic}</p>
          </div>
        </LiyonCard>
        <LiyonCard className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">{t("staff.stat.support")}</p>
            <p className="text-xl font-bold text-foreground">{stats.support}</p>
          </div>
        </LiyonCard>
        <LiyonCard className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">{t("staff.stat.active")}</p>
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
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="ALL">{t("staff.allDepartments")}</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {locale === "en" ? d.nameEn : d.nameTh}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="ALL">{t("staff.allTypes")}</option>
            <option value="ACADEMIC">{t("staff.type.academic")}</option>
            <option value="SUPPORT">{t("staff.type.support")}</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="ALL">{t("staff.allStatuses")}</option>
            <option value="ACTIVE">{t("staff.status.active")}</option>
            <option value="LEAVE">{t("staff.status.leave")}</option>
            <option value="RETIRED">{t("staff.status.retired")}</option>
          </select>
        </div>
      </LiyonCard>

      {/* Staff Table */}
      <LiyonCard>
        <DataTable<StaffProfileDto>
          headHeading={<span className="font-semibold text-sm">{t("staff.title")}</span>}
          state={filteredStaff.length === 0 ? "empty" : "data"}
          rows={filteredStaff}
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
            icon: <Users className="h-10 w-10 text-muted-foreground/50" />,
            title: t("staff.empty"),
            description: t("staff.subtitle"),
          }}
          error={{
            icon: <AlertCircle className="h-10 w-10 text-destructive" />,
            title: t("common.error"),
          }}
        />
      </LiyonCard>

      {/* Create / Edit Dialog */}
      <LiyonDialog open={modalOpen} onOpenChange={setModalOpen}>
        <LiyonDialogHeader title={editingItem ? t("staff.edit") : t("staff.create")} />
        <LiyonDialogBody className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Staff Type & Dept */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <LiyonField label={t("staff.type")}>
              <LiyonSelect
                value={formStaffType}
                onChange={(e) => setFormStaffType(e.target.value as "ACADEMIC" | "SUPPORT")}
              >
                <option value="ACADEMIC">{t("staff.type.academic")}</option>
                <option value="SUPPORT">{t("staff.type.support")}</option>
              </LiyonSelect>
            </LiyonField>

            <LiyonField label={t("staff.department")}>
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
          </div>

          {/* Thai Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <LiyonField label={t("staff.prefixTh")}>
              <input
                type="text"
                value={formPrefixTh}
                onChange={(e) => setFormPrefixTh(e.target.value)}
                placeholder="ผศ.ดร. / อาจารย์ / นาย"
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </LiyonField>
            <LiyonField label={t("staff.firstNameTh")}>
              <input
                type="text"
                value={formFirstNameTh}
                onChange={(e) => setFormFirstNameTh(e.target.value)}
                placeholder="ชื่อภาษาไทย"
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </LiyonField>
            <LiyonField label={t("staff.lastNameTh")}>
              <input
                type="text"
                value={formLastNameTh}
                onChange={(e) => setFormLastNameTh(e.target.value)}
                placeholder="นามสกุลภาษาไทย"
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </LiyonField>
          </div>

          {/* English Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <LiyonField label={t("staff.prefixEn")}>
              <input
                type="text"
                value={formPrefixEn}
                onChange={(e) => setFormPrefixEn(e.target.value)}
                placeholder="Asst. Prof. Dr. / Mr."
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </LiyonField>
            <LiyonField label={t("staff.firstNameEn")}>
              <input
                type="text"
                value={formFirstNameEn}
                onChange={(e) => setFormFirstNameEn(e.target.value)}
                placeholder="English First Name"
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </LiyonField>
            <LiyonField label={t("staff.lastNameEn")}>
              <input
                type="text"
                value={formLastNameEn}
                onChange={(e) => setFormLastNameEn(e.target.value)}
                placeholder="English Last Name"
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </LiyonField>
          </div>

          {/* Academic Rank & Admin Positions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <LiyonField label={t("staff.academicRank")}>
              <input
                type="text"
                value={formAcademicRank}
                onChange={(e) => setFormAcademicRank(e.target.value)}
                placeholder="เช่น ผู้ช่วยศาสตราจารย์"
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </LiyonField>
            <LiyonField label={t("staff.adminPositionTh")}>
              <input
                type="text"
                value={formAdminPosTh}
                onChange={(e) => setFormAdminPosTh(e.target.value)}
                placeholder="เช่น คณบดี, รองคณบดี"
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </LiyonField>
            <LiyonField label={t("staff.adminPositionEn")}>
              <input
                type="text"
                value={formAdminPosEn}
                onChange={(e) => setFormAdminPosEn(e.target.value)}
                placeholder="e.g. Dean of Faculty"
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </LiyonField>
          </div>

          {/* Email, Phone, Room */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <LiyonField label={t("staff.email")}>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="email@app.local"
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </LiyonField>
            <LiyonField label={t("staff.phone")}>
              <input
                type="text"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="02-123-4560"
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </LiyonField>
            <LiyonField label={t("staff.roomNo")}>
              <input
                type="text"
                value={formRoomNo}
                onChange={(e) => setFormRoomNo(e.target.value)}
                placeholder="401"
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </LiyonField>
          </div>

          {/* Avatar URL, Seq, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <LiyonField label={t("staff.avatar")}>
              <input
                type="url"
                value={formAvatarUrl}
                onChange={(e) => setFormAvatarUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </LiyonField>
            <LiyonField label={t("staff.seq")}>
              <input
                type="number"
                value={formSeq}
                onChange={(e) => setFormSeq(e.target.value)}
                min="0"
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </LiyonField>
            <LiyonField label={t("staff.status")}>
              <LiyonSelect
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as "ACTIVE" | "LEAVE" | "RETIRED")}
              >
                <option value="ACTIVE">{t("staff.status.active")}</option>
                <option value="LEAVE">{t("staff.status.leave")}</option>
                <option value="RETIRED">{t("staff.status.retired")}</option>
              </LiyonSelect>
            </LiyonField>
          </div>

          {/* Education Background */}
          <LiyonField label={`${t("staff.education")} (${locale === "en" ? "one per line" : "1 บรรทัดต่อ 1 วุฒิการศึกษา"})`}>
            <textarea
              rows={3}
              value={formEducationText}
              onChange={(e) => setFormEducationText(e.target.value)}
              placeholder={"ป.ธ.๙ (เปรียญธรรม ๙ ประโยค)\nศศ.ด. (พระพุทธศาสนา)"}
              className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </LiyonField>

          {/* Research Interests */}
          <LiyonField label={`${t("staff.research")} (${locale === "en" ? "one per line" : "1 บรรทัดต่อ 1 สาขา"})`}>
            <textarea
              rows={3}
              value={formResearchText}
              onChange={(e) => setFormResearchText(e.target.value)}
              placeholder={"Early Buddhist Philosophy\nPali Philology"}
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
      <LiyonDialog open={!!deleteConfirmItem} onOpenChange={() => setDeleteConfirmItem(null)}>
        <LiyonDialogHeader title={t("staff.delete")} />
        <LiyonDialogBody>
          <p className="text-sm text-muted-foreground">{t("staff.deleteConfirm")}</p>
          {deleteConfirmItem && (
            <p className="mt-2 text-sm font-semibold text-foreground">
              {locale === "en" ? deleteConfirmItem.fullNameEn : deleteConfirmItem.fullNameTh}
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
