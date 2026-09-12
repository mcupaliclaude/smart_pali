"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit2,
  Trash2,
  Building2,
  BookOpen,
  Users,
  CheckCircle2,
  Search,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import {
  DataTable,
  type DataTableColumn,
  RowMenuItem,
  StatusPill,
  LiyonCard,
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonField,
  LiyonSwitchRow,
} from "@/shared/components/liyon";
import type { DepartmentWithCountsDto } from "@/features/curriculum";
import {
  createDepartmentAction,
  updateDepartmentAction,
  deleteDepartmentAction,
} from "@/features/curriculum/actions";

interface DepartmentsClientProps {
  initialDepartments: DepartmentWithCountsDto[];
  canManage: boolean;
  canCreate: boolean;
}

export function DepartmentsClient({
  initialDepartments,
  canManage,
  canCreate,
}: DepartmentsClientProps) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const [departments, setDepartments] = useState<DepartmentWithCountsDto[]>(initialDepartments);
  const [isPending, startTransition] = useTransition();

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // Modal Dialogs
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DepartmentWithCountsDto | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<DepartmentWithCountsDto | null>(null);

  // Form States
  const [formCode, setFormCode] = useState("");
  const [formNameTh, setFormNameTh] = useState("");
  const [formNameEn, setFormNameEn] = useState("");
  const [formSeq, setFormSeq] = useState("1");
  const [formIsActive, setFormIsActive] = useState(true);

  // Statistics Summary
  const stats = useMemo(() => {
    const total = departments.length;
    const active = departments.filter((d) => d.isActive).length;
    const totalPrograms = departments.reduce((acc, d) => acc + d.programCount, 0);
    const totalStaff = departments.reduce((acc, d) => acc + d.staffCount, 0);
    return { total, active, totalPrograms, totalStaff };
  }, [departments]);

  // Filtered List
  const filteredDepartments = useMemo(() => {
    return departments.filter((d) => {
      if (statusFilter === "ACTIVE" && !d.isActive) return false;
      if (statusFilter === "INACTIVE" && d.isActive) return false;
      if (search.trim()) {
        const query = search.toLowerCase().trim();
        const matchCode = d.code.toLowerCase().includes(query);
        const matchTh = d.nameTh.toLowerCase().includes(query);
        const matchEn = d.nameEn.toLowerCase().includes(query);
        if (!matchCode && !matchTh && !matchEn) return false;
      }
      return true;
    });
  }, [departments, search, statusFilter]);

  function handleOpenCreate() {
    setEditingItem(null);
    setFormCode("");
    setFormNameTh("");
    setFormNameEn("");
    setFormSeq(String(departments.length + 1));
    setFormIsActive(true);
    setModalOpen(true);
  }

  function handleOpenEdit(item: DepartmentWithCountsDto) {
    setEditingItem(item);
    setFormCode(item.code);
    setFormNameTh(item.nameTh);
    setFormNameEn(item.nameEn);
    setFormSeq(String(item.seq));
    setFormIsActive(item.isActive);
    setModalOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formCode.trim() || !formNameTh.trim() || !formNameEn.trim()) {
      toast.error(t("common.requiredField"));
      return;
    }

    startTransition(async () => {
      if (editingItem) {
        const res = await updateDepartmentAction({
          id: editingItem.id,
          code: formCode.trim(),
          nameTh: formNameTh.trim(),
          nameEn: formNameEn.trim(),
          seq: Number(formSeq) || 0,
          isActive: formIsActive,
        });

        if (res.ok) {
          setDepartments((prev) =>
            prev.map((d) => (d.id === res.data.id ? res.data : d))
          );
          setModalOpen(false);
          toast.success(t("curriculum.departments.saved"));
          router.refresh();
        } else {
          toast.error(res.error.message || t("common.error"));
        }
      } else {
        const res = await createDepartmentAction({
          code: formCode.trim(),
          nameTh: formNameTh.trim(),
          nameEn: formNameEn.trim(),
          seq: Number(formSeq) || 0,
          isActive: formIsActive,
        });

        if (res.ok) {
          setDepartments((prev) => [...prev, res.data].sort((a, b) => a.seq - b.seq));
          setModalOpen(false);
          toast.success(t("curriculum.departments.saved"));
          router.refresh();
        } else {
          toast.error(res.error.message || t("common.error"));
        }
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const res = await deleteDepartmentAction(id);
      if (res.ok) {
        setDepartments((prev) => prev.filter((d) => d.id !== id));
        setDeleteConfirmItem(null);
        toast.success(t("curriculum.departments.deleted"));
        router.refresh();
      } else {
        toast.error(res.error.message || t("common.error"));
      }
    });
  }

  const columns: DataTableColumn<DepartmentWithCountsDto>[] = [
    {
      key: "code",
      header: t("curriculum.departments.code"),
      render: (row: DepartmentWithCountsDto) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <span className="font-mono font-semibold text-sm">{row.code}</span>
        </div>
      ),
      sortable: true,
      className: "w-[160px]",
    },
    {
      key: "name",
      header: t("curriculum.departments.nameTh"),
      render: (row: DepartmentWithCountsDto) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">
            {locale === "th" ? row.nameTh : row.nameEn}
          </span>
          <span className="text-xs text-muted-foreground">
            {locale === "th" ? row.nameEn : row.nameTh}
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      key: "programs",
      header: t("curriculum.departments.programsCount"),
      render: (row: DepartmentWithCountsDto) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/curriculum?dept=${row.id}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 transition-colors"
            title={t("curriculum.departments.viewPrograms")}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>
              {row.programCount}{" "}
              {locale === "th" ? "หลักสูตร" : "programs"}
            </span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
          </Link>
        </div>
      ),
      className: "w-[160px]",
    },
    {
      key: "staff",
      header: t("curriculum.departments.staffCount"),
      render: (row: DepartmentWithCountsDto) => (
        <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="w-3.5 h-3.5 text-muted-foreground/70" />
          <span>
            {row.staffCount} {locale === "th" ? "ท่าน" : "members"}
          </span>
        </div>
      ),
      className: "w-[130px]",
    },
    {
      key: "seq",
      header: t("curriculum.departments.seq"),
      render: (row: DepartmentWithCountsDto) => (
        <span className="text-sm font-mono text-muted-foreground">{row.seq}</span>
      ),
      className: "w-[80px] text-center",
    },
    {
      key: "status",
      header: t("curriculum.departments.status"),
      render: (row: DepartmentWithCountsDto) => (
        <StatusPill tone={row.isActive ? "ok" : "off"}>
          {row.isActive
            ? t("curriculum.departments.active")
            : t("curriculum.departments.inactive")}
        </StatusPill>
      ),
      className: "w-[110px]",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Link
          href="/curriculum"
          className="px-4 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors inline-flex items-center gap-2"
        >
          <BookOpen className="w-4 h-4" />
          <span>{t("curriculum.tab.programs")}</span>
        </Link>
        <Link
          href="/curriculum/departments"
          className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary/10 text-primary inline-flex items-center gap-2 shadow-xs"
        >
          <Building2 className="w-4 h-4" />
          <span>{t("curriculum.tab.departments")}</span>
        </Link>
      </div>

      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            <span>{t("curriculum.departments.title")}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("curriculum.departments.subtitle")}
          </p>
        </div>
        {(canCreate || canManage) && (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t("curriculum.departments.create")}</span>
          </button>
        )}
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <LiyonCard className="p-4 border border-border/80 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {t("curriculum.departments.stat.total")}
              </p>
              <p className="text-2xl font-bold text-foreground mt-0.5">{stats.total}</p>
            </div>
          </div>
        </LiyonCard>

        <LiyonCard className="p-4 border border-border/80 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {t("curriculum.departments.stat.active")}
              </p>
              <p className="text-2xl font-bold text-foreground mt-0.5">{stats.active}</p>
            </div>
          </div>
        </LiyonCard>

        <LiyonCard className="p-4 border border-border/80 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {t("curriculum.departments.stat.programs")}
              </p>
              <p className="text-2xl font-bold text-foreground mt-0.5">{stats.totalPrograms}</p>
            </div>
          </div>
        </LiyonCard>

        <LiyonCard className="p-4 border border-border/80 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {t("curriculum.departments.stat.staff")}
              </p>
              <p className="text-2xl font-bold text-foreground mt-0.5">{stats.totalStaff}</p>
            </div>
          </div>
        </LiyonCard>
      </div>

      {/* Filter and Search Bar */}
      <LiyonCard className="p-4 border border-border/80 shadow-xs">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("curriculum.departments.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-input bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                statusFilter === "ALL"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted"
              }`}
            >
              {t("curriculum.allStatuses")}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("ACTIVE")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                statusFilter === "ACTIVE"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted"
              }`}
            >
              {t("curriculum.departments.active")}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("INACTIVE")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                statusFilter === "INACTIVE"
                  ? "bg-muted-foreground text-white shadow-xs"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted"
              }`}
            >
              {t("curriculum.departments.inactive")}
            </button>
          </div>
        </div>
      </LiyonCard>

      {/* Departments Table */}
      <LiyonCard>
        <DataTable<DepartmentWithCountsDto>
          headHeading={<span className="font-semibold text-sm">{t("curriculum.departments.title")}</span>}
          state={filteredDepartments.length === 0 ? "empty" : "data"}
          rows={filteredDepartments}
          columns={columns}
          getRowId={(item) => item.id}
          renderRowMenu={
            canManage
              ? (row) => (
                  <>
                    <RowMenuItem
                      onSelect={() => handleOpenEdit(row)}
                      icon={<Edit2 className="h-4 w-4" />}
                    >
                      {t("curriculum.departments.edit")}
                    </RowMenuItem>
                    <RowMenuItem
                      onSelect={() => router.push(`/curriculum?dept=${row.id}`)}
                      icon={<BookOpen className="h-4 w-4 text-sky-600" />}
                    >
                      {t("curriculum.departments.viewPrograms")}
                    </RowMenuItem>
                    <RowMenuItem
                      danger
                      onSelect={() => setDeleteConfirmItem(row)}
                      icon={<Trash2 className="h-4 w-4" />}
                    >
                      {t("curriculum.departments.delete")}
                    </RowMenuItem>
                  </>
                )
              : undefined
          }
          empty={{
            icon: <Building2 className="h-10 w-10 text-muted-foreground/50" />,
            title: t("curriculum.departments.empty"),
            description: t("curriculum.departments.subtitle"),
          }}
          error={{
            icon: <AlertCircle className="h-10 w-10 text-destructive" />,
            title: t("common.error"),
          }}
        />
      </LiyonCard>

      {/* Modal Dialog for Create / Edit Department */}
      <LiyonDialog open={modalOpen} onOpenChange={setModalOpen}>
        <form onSubmit={handleSubmit}>
          <LiyonDialogHeader
            title={
              editingItem
                ? t("curriculum.departments.edit")
                : t("curriculum.departments.create")
            }
            description={t("curriculum.departments.subtitle")}
          />
          <LiyonDialogBody className="space-y-4 py-4">
            <LiyonField
              label={
                <span>
                  {t("curriculum.departments.code")}{" "}
                  <span className="text-destructive">*</span>
                </span>
              }
              hint={t("curriculum.departments.codeHint")}
            >
              <input
                type="text"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                placeholder="buddhist_studies"
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </LiyonField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LiyonField
                label={
                  <span>
                    {t("curriculum.departments.nameTh")}{" "}
                    <span className="text-destructive">*</span>
                  </span>
                }
              >
                <input
                  type="text"
                  value={formNameTh}
                  onChange={(e) => setFormNameTh(e.target.value)}
                  placeholder="ภาควิชาพระพุทธศาสนา"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </LiyonField>

              <LiyonField
                label={
                  <span>
                    {t("curriculum.departments.nameEn")}{" "}
                    <span className="text-destructive">*</span>
                  </span>
                }
              >
                <input
                  type="text"
                  value={formNameEn}
                  onChange={(e) => setFormNameEn(e.target.value)}
                  placeholder="Department of Buddhist Studies"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-2">
              <LiyonField label={t("curriculum.departments.seq")}>
                <input
                  type="number"
                  min="0"
                  value={formSeq}
                  onChange={(e) => setFormSeq(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </LiyonField>

              <div className="pt-2">
                <LiyonSwitchRow
                  id="form-department-is-active"
                  label={t("curriculum.departments.status")}
                  description={
                    formIsActive
                      ? t("curriculum.departments.active")
                      : t("curriculum.departments.inactive")
                  }
                  checked={formIsActive}
                  onCheckedChange={setFormIsActive}
                />
              </div>
            </div>
          </LiyonDialogBody>
          <LiyonDialogFooter className="flex justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors cursor-pointer"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50"
            >
              {isPending ? t("common.saving") : t("common.save")}
            </button>
          </LiyonDialogFooter>
        </form>
      </LiyonDialog>

      {/* Modal Dialog for Delete Confirmation with Safety Guard */}
      <LiyonDialog
        open={Boolean(deleteConfirmItem)}
        onOpenChange={(open) => !open && setDeleteConfirmItem(null)}
      >
        <LiyonDialogHeader
          title={t("curriculum.departments.delete")}
          description={t("curriculum.departments.deleteConfirm")}
        />
        <LiyonDialogBody className="space-y-4 py-4">
          {deleteConfirmItem && (
            <div className="p-3.5 rounded-xl bg-muted/60 border border-border/80">
              <p className="font-semibold text-foreground">
                {locale === "th" ? deleteConfirmItem.nameTh : deleteConfirmItem.nameEn} (
                <span className="font-mono text-xs">{deleteConfirmItem.code}</span>)
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                <span>
                  {t("curriculum.departments.programsCount")}:{" "}
                  <strong>{deleteConfirmItem.programCount}</strong>
                </span>
                <span>
                  {t("curriculum.departments.staffCount")}:{" "}
                  <strong>{deleteConfirmItem.staffCount}</strong>
                </span>
              </div>
            </div>
          )}

          {/* Warning block if department has associated programs or staff */}
          {deleteConfirmItem &&
            (deleteConfirmItem.programCount > 0 || deleteConfirmItem.staffCount > 0) && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-sm flex gap-3 items-start">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">
                    {deleteConfirmItem.programCount > 0
                      ? t("curriculum.departments.deleteHasPrograms")
                      : t("curriculum.departments.deleteHasStaff")}
                  </p>
                  <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-1">
                    {locale === "th"
                      ? "กรุณาย้ายหรือลบข้อมูลที่สังกัดภาควิชานี้ออกก่อน หรือสามารถเลือกปิดการใช้งาน (Inactive) แทนการลบได้"
                      : "Please reassign or remove associated records before deleting, or set the status to Inactive instead."}
                  </p>
                </div>
              </div>
            )}
        </LiyonDialogBody>
        <LiyonDialogFooter className="flex justify-end gap-2 pt-3 border-t border-border">
          <button
            type="button"
            onClick={() => setDeleteConfirmItem(null)}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors cursor-pointer"
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            disabled={
              isPending ||
              (deleteConfirmItem
                ? deleteConfirmItem.programCount > 0 || deleteConfirmItem.staffCount > 0
                : false)
            }
            onClick={() => deleteConfirmItem && handleDelete(deleteConfirmItem.id)}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? t("common.deleting") : t("common.delete")}
          </button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}
