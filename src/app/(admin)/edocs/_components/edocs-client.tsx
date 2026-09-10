"use client";

import { useState, useTransition, useMemo } from "react";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Plus,
  Search,
  Send,
  Eye,
  Trash2,
  ExternalLink,
  ShieldAlert,
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
import type { EDocumentDto, ApproverOptionDto } from "@/features/edocs";
import type { StaffDepartmentDto } from "@/features/staff";
import {
  createEDocumentAction,
  decideApprovalStepAction,
  cancelEDocumentAction,
} from "@/features/edocs/actions";

interface EdocsClientProps {
  currentUserId: string;
  initialAllDocs: EDocumentDto[];
  initialMyDocs: EDocumentDto[];
  initialPendingDocs: EDocumentDto[];
  departments: StaffDepartmentDto[];
  approvers: ApproverOptionDto[];
  canCreate: boolean;
  canApprove: boolean;
  canManage: boolean;
}

export function EdocsClient({
  currentUserId,
  initialAllDocs,
  initialMyDocs,
  initialPendingDocs,
  departments,
  approvers,
  canCreate,
  canApprove,
  canManage,
}: EdocsClientProps) {
  const t = useT();
  const locale = useLocale();
  const [allDocs, setAllDocs] = useState<EDocumentDto[]>(initialAllDocs);
  const [myDocs, setMyDocs] = useState<EDocumentDto[]>(initialMyDocs);
  const [pendingDocs, setPendingDocs] = useState<EDocumentDto[]>(initialPendingDocs);
  const [activeTab, setActiveTab] = useState<"pending" | "myDocs" | "allDocs">("pending");
  const [isPending, startTransition] = useTransition();

  // Filters
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedPriority, setSelectedPriority] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Modals
  const [viewDoc, setViewDoc] = useState<EDocumentDto | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<EDocumentDto | null>(null);

  // Review Form
  const [decisionChoice, setDecisionChoice] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [decisionComment, setDecisionComment] = useState("");

  // Create Form
  const [formTitle, setFormTitle] = useState("");
  const [formDocType, setFormDocType] = useState<"MEMO" | "PROJECT_PROPOSAL" | "PURCHASE_REQ" | "OFFICIAL_LETTER">("MEMO");
  const [formPriority, setFormPriority] = useState<"NORMAL" | "URGENT" | "VERY_URGENT">("NORMAL");
  const [formDeptId, setFormDeptId] = useState(departments[0]?.id ?? "");
  const [formContent, setFormContent] = useState("");
  const [formAttachmentUrl, setFormAttachmentUrl] = useState("");
  const [formSteps, setFormSteps] = useState<Array<{ approverId: string; approverRole: string }>>([
    { approverId: approvers[0]?.id ?? "", approverRole: "หัวหน้าภาควิชา / คณบดี" },
  ]);

  // Overall Stats
  const stats = useMemo(() => {
    return {
      pending: pendingDocs.length,
      inReview: allDocs.filter((d) => d.status === "IN_REVIEW" || d.status === "SUBMITTED").length,
      approved: allDocs.filter((d) => d.status === "APPROVED").length,
      total: allDocs.length,
    };
  }, [pendingDocs, allDocs]);

  // Active list based on active tab
  const activeList = useMemo(() => {
    if (activeTab === "pending") return pendingDocs;
    if (activeTab === "myDocs") return myDocs;
    return allDocs;
  }, [activeTab, pendingDocs, myDocs, allDocs]);

  // Filtered List
  const filteredDocs = useMemo(() => {
    return activeList.filter((doc) => {
      const matchSearch =
        search === "" ||
        doc.docNo.toLowerCase().includes(search.toLowerCase()) ||
        doc.title.toLowerCase().includes(search.toLowerCase()) ||
        doc.submitterName.toLowerCase().includes(search.toLowerCase());

      const matchType = selectedType === "ALL" || doc.docType === selectedType;
      const matchPriority = selectedPriority === "ALL" || doc.priority === selectedPriority;
      const matchStatus = selectedStatus === "ALL" || doc.status === selectedStatus;

      return matchSearch && matchType && matchPriority && matchStatus;
    });
  }, [activeList, search, selectedType, selectedPriority, selectedStatus]);

  // Check if current user has a pending review step in the selected doc
  const userPendingStep = useMemo(() => {
    if (!viewDoc) return null;
    const pendingStepIdx = viewDoc.approvalSteps.findIndex(
      (s) => s.decision === "PENDING" && s.approverId === currentUserId
    );
    if (pendingStepIdx === -1) return null;
    for (let i = 0; i < pendingStepIdx; i++) {
      if (viewDoc.approvalSteps[i].decision !== "APPROVED") return null;
    }
    return viewDoc.approvalSteps[pendingStepIdx];
  }, [viewDoc, currentUserId]);

  function getDocTypeLabel(type: string): string {
    switch (type) {
      case "MEMO": return t("edocs.docType.memo");
      case "PROJECT_PROPOSAL": return t("edocs.docType.project_proposal");
      case "PURCHASE_REQ": return t("edocs.docType.purchase_req");
      case "OFFICIAL_LETTER": return t("edocs.docType.official_letter");
      default: return type;
    }
  }

  function getPriorityLabel(priority: string): string {
    switch (priority) {
      case "NORMAL": return t("edocs.priority.normal");
      case "URGENT": return t("edocs.priority.urgent");
      case "VERY_URGENT": return t("edocs.priority.very_urgent");
      default: return priority;
    }
  }

  function getStatusLabel(status: string): string {
    switch (status) {
      case "DRAFT": return t("edocs.status.draft");
      case "SUBMITTED": return t("edocs.status.submitted");
      case "IN_REVIEW": return t("edocs.status.in_review");
      case "APPROVED": return t("edocs.status.approved");
      case "REJECTED": return t("edocs.status.rejected");
      case "CANCELLED": return t("edocs.status.cancelled");
      default: return status;
    }
  }

  function getStatusTone(status: string): "ok" | "warn" | "bad" | "info" | "off" {
    switch (status) {
      case "APPROVED": return "ok";
      case "IN_REVIEW": return "warn";
      case "SUBMITTED": return "info";
      case "REJECTED": return "bad";
      default: return "off";
    }
  }

  function getPriorityTone(priority: string): "ok" | "warn" | "bad" | "info" | "off" {
    switch (priority) {
      case "VERY_URGENT": return "bad";
      case "URGENT": return "warn";
      default: return "off";
    }
  }

  // Handle Create Step Builder
  function handleAddStep() {
    if (formSteps.length >= 5) {
      toast.error("สูงสุดไม่เกิน 5 ลำดับขั้น");
      return;
    }
    setFormSteps((prev) => [
      ...prev,
      { approverId: approvers[0]?.id ?? "", approverRole: `ผู้ลงนามลำดับที่ ${prev.length + 1}` },
    ]);
  }

  function handleRemoveStep(idx: number) {
    if (formSteps.length <= 1) {
      toast.error("ต้องมีผู้ลงนามอย่างน้อย 1 ลำดับ");
      return;
    }
    setFormSteps((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleStepChange(idx: number, field: "approverId" | "approverRole", value: string) {
    setFormSteps((prev) =>
      prev.map((step, i) => (i === idx ? { ...step, [field]: value } : step))
    );
  }

  // Handle Form Submission
  function handleCreateDoc(e: React.FormEvent) {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error("กรุณากรอกชื่อเรื่องเอกสาร");
      return;
    }
    if (!formContent.trim()) {
      toast.error("กรุณากรอกรายละเอียดเอกสาร");
      return;
    }
    if (!formDeptId) {
      toast.error("กรุณาเลือกภาควิชา / หน่วยงาน");
      return;
    }

    startTransition(async () => {
      const res = await createEDocumentAction({
        title: formTitle.trim(),
        docType: formDocType,
        priority: formPriority,
        departmentId: formDeptId,
        content: formContent.trim(),
        attachmentUrl: formAttachmentUrl.trim() || null,
        steps: formSteps,
      });

      if (res.ok) {
        toast.success(t("edocs.createdSuccess"));
        setAllDocs((prev) => [res.data, ...prev]);
        setMyDocs((prev) => [res.data, ...prev]);
        setCreateModalOpen(false);
        // Reset form
        setFormTitle("");
        setFormContent("");
        setFormAttachmentUrl("");
        setFormSteps([{ approverId: approvers[0]?.id ?? "", approverRole: "หัวหน้าภาควิชา / คณบดี" }]);
      } else {
        toast.error(res.error.message);
      }
    });
  }

  // Handle Decision
  function handleDecideStep() {
    if (!userPendingStep) return;

    startTransition(async () => {
      const res = await decideApprovalStepAction({
        stepId: userPendingStep.id,
        decision: decisionChoice,
        comment: decisionComment.trim() || null,
      });

      if (res.ok) {
        toast.success(t("edocs.decidedSuccess"));
        const updated = res.data;
        // Update states
        setAllDocs((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
        setMyDocs((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
        setPendingDocs((prev) => prev.filter((d) => d.id !== updated.id));
        setViewDoc(updated);
        setDecisionComment("");
      } else {
        toast.error(res.error.message);
      }
    });
  }

  // Handle Cancel Doc
  function handleCancelDoc() {
    if (!cancelTarget) return;

    startTransition(async () => {
      const res = await cancelEDocumentAction(cancelTarget.id);
      if (res.ok) {
        toast.success(t("edocs.cancelledSuccess"));
        const markCancelled = (d: EDocumentDto) =>
          d.id === cancelTarget.id ? { ...d, status: "CANCELLED" as const } : d;
        setAllDocs((prev) => prev.map(markCancelled));
        setMyDocs((prev) => prev.map(markCancelled));
        setPendingDocs((prev) => prev.filter((d) => d.id !== cancelTarget.id));
        setCancelTarget(null);
      } else {
        toast.error(res.error.message);
      }
    });
  }

  // Table Columns Definition
  const columns: DataTableColumn<EDocumentDto>[] = [
    {
      key: "docNo",
      header: t("edocs.docNo"),
      render: (row) => (
        <div>
          <div className="font-semibold text-foreground flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span>{row.docNo}</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <StatusPill tone={getPriorityTone(row.priority)}>
              {getPriorityLabel(row.priority)}
            </StatusPill>
          </div>
        </div>
      ),
    },
    {
      key: "title",
      header: t("edocs.docTitle"),
      render: (row) => (
        <div className="max-w-md">
          <div className="font-medium text-foreground line-clamp-1">
            {row.title}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {locale === "th" ? row.departmentNameTh : row.departmentNameEn}
          </div>
        </div>
      ),
    },
    {
      key: "docType",
      header: t("edocs.docType"),
      render: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-foreground">
          {getDocTypeLabel(row.docType)}
        </span>
      ),
    },
    {
      key: "submitter",
      header: t("edocs.submitter"),
      render: (row) => (
        <div>
          <div className="text-sm font-medium text-foreground">
            {row.submitterName}
          </div>
          <div className="text-xs text-muted-foreground">
            {new Date(row.createdAt).toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
        </div>
      ),
    },
    {
      key: "workflow",
      header: t("edocs.approvalSteps"),
      render: (row) => {
        const approvedCount = row.approvalSteps.filter((s) => s.decision === "APPROVED").length;
        const currentActiveStep = row.approvalSteps.find((s) => s.decision === "PENDING");
        return (
          <div className="text-xs">
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <span>{`ขั้นที่ ${row.status === "APPROVED" ? row.totalSteps : row.currentStepOrder}/${row.totalSteps}`}</span>
              <span className="text-muted-foreground">({approvedCount} ผ่านแล้ว)</span>
            </div>
            {currentActiveStep && row.status !== "REJECTED" && (
              <div className="text-muted-foreground mt-0.5 truncate max-w-[180px]">
                รอ: {currentActiveStep.approverRole}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      header: t("edocs.status"),
      render: (row) => (
        <StatusPill tone={getStatusTone(row.status)}>
          {getStatusLabel(row.status)}
        </StatusPill>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (row) => (
        <button
          onClick={() => {
            setViewDoc(row);
            setDecisionComment("");
            setDecisionChoice("APPROVED");
          }}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md bg-amber-50 text-amber-900 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-200 border border-amber-200 dark:border-amber-800 transition"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{t("edocs.viewDetail")}</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("edocs.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("edocs.subtitle")}
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t("edocs.create")}</span>
          </button>
        )}
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <LiyonCard className="p-4 flex items-center gap-4 border-l-4 border-l-amber-500">
          <div className="p-3 bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">
              {stats.pending}
            </div>
            <div className="text-xs font-medium text-muted-foreground">
              {t("edocs.stat.pending")}
            </div>
          </div>
        </LiyonCard>

        <LiyonCard className="p-4 flex items-center gap-4 border-l-4 border-l-blue-500">
          <div className="p-3 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">
              {stats.inReview}
            </div>
            <div className="text-xs font-medium text-muted-foreground">
              {t("edocs.stat.inReview")}
            </div>
          </div>
        </LiyonCard>

        <LiyonCard className="p-4 flex items-center gap-4 border-l-4 border-l-emerald-500">
          <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">
              {stats.approved}
            </div>
            <div className="text-xs font-medium text-muted-foreground">
              {t("edocs.stat.approved")}
            </div>
          </div>
        </LiyonCard>

        <LiyonCard className="p-4 flex items-center gap-4 border-l-4 border-l-slate-400">
          <div className="p-3 bg-muted rounded-lg text-muted-foreground">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">
              {stats.total}
            </div>
            <div className="text-xs font-medium text-muted-foreground">
              {t("edocs.stat.total")}
            </div>
          </div>
        </LiyonCard>
      </div>

      {/* View Tabs */}
      <div className="flex border-b border-border space-x-1">
        <button
          onClick={() => setActiveTab("pending")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition ${
            activeTab === "pending"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>{t("edocs.tab.pending")}</span>
          {pendingDocs.length > 0 && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">
              {pendingDocs.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("myDocs")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition ${
            activeTab === "myDocs"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>{t("edocs.tab.myDocs")}</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
            {myDocs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("allDocs")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition ${
            activeTab === "allDocs"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>{t("edocs.tab.allDocs")}</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
            {allDocs.length}
          </span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <LiyonCard className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t("edocs.docTitle") + " / " + t("edocs.docNo")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="ALL">— {t("edocs.docType")}: ทั้งหมด —</option>
            <option value="MEMO">{t("edocs.docType.memo")}</option>
            <option value="PROJECT_PROPOSAL">{t("edocs.docType.project_proposal")}</option>
            <option value="PURCHASE_REQ">{t("edocs.docType.purchase_req")}</option>
            <option value="OFFICIAL_LETTER">{t("edocs.docType.official_letter")}</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="ALL">— {t("edocs.priority")}: ทั้งหมด —</option>
            <option value="NORMAL">{t("edocs.priority.normal")}</option>
            <option value="URGENT">{t("edocs.priority.urgent")}</option>
            <option value="VERY_URGENT">{t("edocs.priority.very_urgent")}</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="ALL">— {t("edocs.status")}: ทั้งหมด —</option>
            <option value="SUBMITTED">{t("edocs.status.submitted")}</option>
            <option value="IN_REVIEW">{t("edocs.status.in_review")}</option>
            <option value="APPROVED">{t("edocs.status.approved")}</option>
            <option value="REJECTED">{t("edocs.status.rejected")}</option>
            <option value="CANCELLED">{t("edocs.status.cancelled")}</option>
          </select>
        </div>
      </LiyonCard>

      {/* Main DataTable */}
      <LiyonCard>
        <DataTable<EDocumentDto>
          headHeading={<span className="font-semibold text-sm">{t("edocs.title")}</span>}
          state={filteredDocs.length > 0 ? "data" : "empty"}
          rows={filteredDocs}
          columns={columns}
          getRowId={(row) => row.id}
          renderRowMenu={(row) => (
            <>
              <RowMenuItem
                onSelect={() => {
                  setViewDoc(row);
                  setDecisionComment("");
                  setDecisionChoice("APPROVED");
                }}
                icon={<Eye className="w-4 h-4" />}
              >
                {t("edocs.viewDetail")}
              </RowMenuItem>
              {(row.submitterId === currentUserId || canManage) &&
                row.status !== "APPROVED" &&
                row.status !== "CANCELLED" && (
                  <RowMenuItem
                    onSelect={() => setCancelTarget(row)}
                    danger
                    icon={<Trash2 className="w-4 h-4" />}
                  >
                    {t("edocs.cancelAction")}
                  </RowMenuItem>
                )}
            </>
          )}
          empty={{
            icon: <FileText className="h-10 w-10 text-muted-foreground/50" />,
            title: t("edocs.empty"),
            description: "ไม่มีเอกสารที่ตรงกับเงื่อนไขการค้นหา",
          }}
          error={{
            icon: <AlertCircle className="h-10 w-10 text-destructive" />,
            title: t("common.error"),
          }}
        />
      </LiyonCard>

      {/* View Detail & Workflow Modal */}
      <LiyonDialog
        open={Boolean(viewDoc)}
        onOpenChange={(open) => {
          if (!open) setViewDoc(null);
        }}
      >
        <LiyonDialogHeader title={viewDoc?.title ?? t("edocs.viewDetail")} />

        {viewDoc && (
          <LiyonDialogBody className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-lg bg-muted/40 border border-border text-sm">
              <div>
                <span className="text-muted-foreground block text-xs">
                  {t("edocs.docNo")}
                </span>
                <span className="font-mono font-bold text-foreground">
                  {viewDoc.docNo}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">
                  {t("edocs.priority")} / {t("edocs.status")}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <StatusPill tone={getPriorityTone(viewDoc.priority)}>
                    {getPriorityLabel(viewDoc.priority)}
                  </StatusPill>
                  <StatusPill tone={getStatusTone(viewDoc.status)}>
                    {getStatusLabel(viewDoc.status)}
                  </StatusPill>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">
                  {t("edocs.submitter")}
                </span>
                <span className="font-medium text-foreground">
                  {viewDoc.submitterName} ({viewDoc.submitterEmail})
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">
                  {t("edocs.department")}
                </span>
                <span className="font-medium text-foreground">
                  {locale === "th" ? viewDoc.departmentNameTh : viewDoc.departmentNameEn}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">
                  {t("edocs.docType")}
                </span>
                <span className="font-medium text-foreground">
                  {getDocTypeLabel(viewDoc.docType)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">วันที่ยื่นเอกสาร</span>
                <span className="font-medium text-foreground">
                  {new Date(viewDoc.createdAt).toLocaleString(locale === "th" ? "th-TH" : "en-US")}
                </span>
              </div>
            </div>

            {/* Document Content */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">
                {t("edocs.content")}
              </h3>
              <div className="p-3.5 rounded-lg border border-border bg-background text-sm whitespace-pre-wrap leading-relaxed text-foreground">
                {viewDoc.content}
              </div>
              {viewDoc.attachmentUrl && (
                <div className="pt-1">
                  <a
                    href={viewDoc.attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{t("edocs.attachment")}: {viewDoc.attachmentUrl}</span>
                  </a>
                </div>
              )}
            </div>

            {/* Visual Approval Timeline */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>{t("edocs.approvalSteps")}</span>
              </h3>

              <div className="space-y-2.5">
                {viewDoc.approvalSteps.map((step, idx) => {
                  const isApproved = step.decision === "APPROVED";
                  const isRejected = step.decision === "REJECTED";
                  const isPendingStep = step.decision === "PENDING";
                  const isCurrentActive =
                    isPendingStep &&
                    (idx === 0 || viewDoc.approvalSteps[idx - 1].decision === "APPROVED");

                  return (
                    <div
                      key={step.id}
                      className={`p-3 rounded-lg border transition ${
                        isApproved
                          ? "border-emerald-500/40 bg-emerald-500/5"
                          : isRejected
                          ? "border-destructive/40 bg-destructive/5"
                          : isCurrentActive
                          ? "border-amber-500/60 bg-amber-500/10 shadow-sm"
                          : "border-border bg-muted/20 text-muted-foreground"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                              isApproved
                                ? "bg-emerald-600 text-white"
                                : isRejected
                                ? "bg-destructive text-destructive-foreground"
                                : isCurrentActive
                                ? "bg-amber-600 text-white"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {isApproved ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : isRejected ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              step.stepOrder
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-foreground">
                              {step.approverRole}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {step.approverName} ({step.approverEmail})
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <StatusPill
                            tone={
                              isApproved ? "ok" : isRejected ? "bad" : isCurrentActive ? "warn" : "off"
                            }
                          >
                            {isApproved
                              ? t("edocs.decision.approved")
                              : isRejected
                              ? t("edocs.decision.rejected")
                              : isCurrentActive
                              ? "รอลงนามในขั้นตอนนี้"
                              : t("edocs.decision.pending")}
                          </StatusPill>
                          {step.decidedAt && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(step.decidedAt).toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </div>
                      </div>

                      {step.comment && (
                        <div className="mt-2 pt-2 border-t border-border/60 text-xs text-foreground">
                          <span className="font-medium text-muted-foreground mr-1">ความเห็น:</span>
                          {step.comment}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Approver Action Panel (Visible only when it is user's turn) */}
            {canApprove && userPendingStep && (
              <div className="p-4 rounded-xl border-2 border-amber-500/70 bg-amber-500/10 space-y-3">
                <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                  <ShieldAlert className="w-5 h-5 text-amber-600" />
                  <span>การลงนามของคุณ ({userPendingStep.approverRole})</span>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="decision"
                      value="APPROVED"
                      checked={decisionChoice === "APPROVED"}
                      onChange={() => setDecisionChoice("APPROVED")}
                      className="text-primary focus:ring-ring"
                    />
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t("edocs.approveAction")}</span>
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="decision"
                      value="REJECTED"
                      checked={decisionChoice === "REJECTED"}
                      onChange={() => setDecisionChoice("REJECTED")}
                      className="text-primary focus:ring-ring"
                    />
                    <span className="text-sm font-medium text-destructive flex items-center gap-1">
                      <XCircle className="w-4 h-4" />
                      <span>{t("edocs.rejectAction")}</span>
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    {t("edocs.comment")}
                  </label>
                  <textarea
                    rows={2}
                    value={decisionComment}
                    onChange={(e) => setDecisionComment(e.target.value)}
                    placeholder="ระบุข้อเสนอแนะ ความเห็นประกอบ หรือเหตุผล (ถ้ามี)..."
                    className="w-full text-sm p-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleDecideStep}
                    disabled={isPending}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white shadow transition ${
                      decisionChoice === "APPROVED"
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-destructive hover:bg-destructive/90"
                    } ${isPending ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {isPending
                        ? "กำลังบันทึก..."
                        : decisionChoice === "APPROVED"
                        ? t("edocs.approveAction")
                        : t("edocs.rejectAction")}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </LiyonDialogBody>
        )}

        <LiyonDialogFooter>
          <button
            onClick={() => setViewDoc(null)}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-input bg-background hover:bg-accent transition"
          >
            ปิดหน้าต่าง
          </button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* Create Document Modal */}
      <LiyonDialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <LiyonDialogHeader title={t("edocs.create")} />
        <form onSubmit={handleCreateDoc}>
          <LiyonDialogBody className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            <LiyonField label={t("edocs.docTitle")}>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="เช่น ขออนุมัติจัดโครงการอบรมพระบาลีไวยากรณ์..."
                className="w-full text-sm p-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </LiyonField>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <LiyonField label={t("edocs.docType")}>
                <select
                  value={formDocType}
                  onChange={(e) => setFormDocType(e.target.value as "MEMO" | "PROJECT_PROPOSAL" | "PURCHASE_REQ" | "OFFICIAL_LETTER")}
                  className="w-full p-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="MEMO">{t("edocs.docType.memo")}</option>
                  <option value="PROJECT_PROPOSAL">{t("edocs.docType.project_proposal")}</option>
                  <option value="PURCHASE_REQ">{t("edocs.docType.purchase_req")}</option>
                  <option value="OFFICIAL_LETTER">{t("edocs.docType.official_letter")}</option>
                </select>
              </LiyonField>

              <LiyonField label={t("edocs.priority")}>
                <select
                  value={formPriority}
                  onChange={(e) => setFormPriority(e.target.value as "NORMAL" | "URGENT" | "VERY_URGENT")}
                  className="w-full p-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="NORMAL">{t("edocs.priority.normal")}</option>
                  <option value="URGENT">{t("edocs.priority.urgent")}</option>
                  <option value="VERY_URGENT">{t("edocs.priority.very_urgent")}</option>
                </select>
              </LiyonField>

              <LiyonField label={t("edocs.department")}>
                <select
                  value={formDeptId}
                  onChange={(e) => setFormDeptId(e.target.value)}
                  className="w-full p-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {locale === "th" ? d.nameTh : d.nameEn}
                    </option>
                  ))}
                </select>
              </LiyonField>
            </div>

            <LiyonField label={t("edocs.content")}>
              <textarea
                rows={4}
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="ระบุข้อความ วัตถุประสงค์ หรือรายละเอียดโครงการที่ต้องการขออนุมัติ..."
                className="w-full text-sm p-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </LiyonField>

            <LiyonField label={t("edocs.attachment")}>
              <input
                type="text"
                value={formAttachmentUrl}
                onChange={(e) => setFormAttachmentUrl(e.target.value)}
                placeholder="https://example.com/docs/file.pdf"
                className="w-full text-sm p-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </LiyonField>

            {/* Approval Steps Builder */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground">
                  {t("edocs.approvalSteps")}
                </label>
                <button
                  type="button"
                  onClick={handleAddStep}
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่มขั้นตอนพิจารณา</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {formSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border bg-muted/20"
                  >
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <select
                        value={step.approverId}
                        onChange={(e) => handleStepChange(idx, "approverId", e.target.value)}
                        className="w-full p-1.5 text-xs rounded border border-input bg-background"
                      >
                        {approvers.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name} ({a.email})
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={step.approverRole}
                        onChange={(e) => handleStepChange(idx, "approverRole", e.target.value)}
                        placeholder="บทบาท / ตำแหน่ง (เช่น รองคณบดี, คณบดี)"
                        className="w-full text-xs p-1.5 rounded border border-input bg-background"
                        required
                      />
                    </div>

                    {formSteps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(idx)}
                        className="p-1.5 text-muted-foreground hover:text-destructive transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </LiyonDialogBody>

          <LiyonDialogFooter>
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-input bg-background hover:bg-accent transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 transition disabled:opacity-60"
            >
              {isPending ? "กำลังบันทึก..." : "ยื่นเอกสารเข้าระบบ"}
            </button>
          </LiyonDialogFooter>
        </form>
      </LiyonDialog>

      {/* Cancel Confirmation Dialog */}
      <LiyonDialog
        open={Boolean(cancelTarget)}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null);
        }}
      >
        <LiyonDialogHeader title={t("edocs.cancelAction")} />
        {cancelTarget && (
          <LiyonDialogBody>
            <p className="text-sm text-muted-foreground">
              คุณต้องการยกเลิกเอกสารเลขที่ <strong className="text-foreground">{cancelTarget.docNo}</strong> ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
            </p>
          </LiyonDialogBody>
        )}
        <LiyonDialogFooter>
          <button
            onClick={() => setCancelTarget(null)}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-input bg-background hover:bg-accent transition"
          >
            ไม่ยกเลิก
          </button>
          <button
            onClick={handleCancelDoc}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium rounded-lg text-destructive-foreground bg-destructive hover:bg-destructive/90 transition disabled:opacity-60"
          >
            {isPending ? "กำลังดำเนินการ..." : "ยืนยันการยกเลิก"}
          </button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}
