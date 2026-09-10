"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Calendar,
  Clock,
  Car,
  Building2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Search,
  Eye,
  Trash2,
  Edit2,
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
import type { ReservableResourceDto, ResourceReservationDto } from "@/features/reservations";
import {
  createResourceAction,
  updateResourceAction,
  deleteResourceAction,
  reviewReservationAction,
  cancelReservationAction,
} from "@/features/reservations/actions";

interface ReservationsClientProps {
  initialReservations: ResourceReservationDto[];
  initialResources: ReservableResourceDto[];
  canReview: boolean;
  canManage: boolean;
  canCreate: boolean;
}

export function ReservationsClient({
  initialReservations,
  initialResources,
  canReview,
  canManage,
  canCreate: _canCreate,
}: ReservationsClientProps) {
  const t = useT();
  const locale = useLocale();
  const [reservations, setReservations] = useState<ResourceReservationDto[]>(initialReservations);
  const [resources, setResources] = useState<ReservableResourceDto[]>(initialResources);
  const [activeTab, setActiveTab] = useState<"allReservations" | "pending" | "resources">("pending");
  const [isPending, startTransition] = useTransition();

  // Search & Filter
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // Review Dialog
  const [reviewTarget, setReviewTarget] = useState<ResourceReservationDto | null>(null);
  const [reviewStatus, setReviewStatus] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [reviewDriverName, setReviewDriverName] = useState("");
  const [reviewNote, setReviewNote] = useState("");

  // Resource Dialog (Create / Edit)
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<ReservableResourceDto | null>(null);
  const [deleteResourceTarget, setDeleteResourceTarget] = useState<ReservableResourceDto | null>(null);

  // Resource Form States
  const [resType, setResType] = useState<"FACILITY" | "VEHICLE">("FACILITY");
  const [resCode, setResCode] = useState("");
  const [resNameTh, setResNameTh] = useState("");
  const [resNameEn, setResNameEn] = useState("");
  const [resCapacity, setResCapacity] = useState("30");
  const [resLocation, setResLocation] = useState("");
  const [resAmenities, setResAmenities] = useState("");
  const [resImageUrl, setResImageUrl] = useState("");
  const [resStatus, setResStatus] = useState<"AVAILABLE" | "MAINTENANCE" | "UNAVAILABLE">("AVAILABLE");
  const [resSeq, setResSeq] = useState("1");

  // Stats
  const stats = useMemo(() => {
    return {
      pending: reservations.filter((r) => r.status === "PENDING").length,
      approved: reservations.filter((r) => r.status === "APPROVED").length,
      facilities: resources.filter((r) => r.type === "FACILITY").length,
      vehicles: resources.filter((r) => r.type === "VEHICLE").length,
    };
  }, [reservations, resources]);

  // Filtered Reservations
  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      if (activeTab === "pending" && r.status !== "PENDING") return false;

      const matchSearch =
        search === "" ||
        r.reservationNo.toLowerCase().includes(search.toLowerCase()) ||
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.applicantName.toLowerCase().includes(search.toLowerCase()) ||
        r.departmentName.toLowerCase().includes(search.toLowerCase()) ||
        r.resourceCode.toLowerCase().includes(search.toLowerCase());

      const matchType = filterType === "ALL" || r.resourceType === filterType;
      const matchStatus =
        activeTab === "pending" || filterStatus === "ALL" || r.status === filterStatus;

      return matchSearch && matchType && matchStatus;
    });
  }, [reservations, activeTab, search, filterType, filterStatus]);

  // Filtered Resources
  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      const matchSearch =
        search === "" ||
        r.code.toLowerCase().includes(search.toLowerCase()) ||
        r.nameTh.toLowerCase().includes(search.toLowerCase()) ||
        r.nameEn.toLowerCase().includes(search.toLowerCase()) ||
        r.location.toLowerCase().includes(search.toLowerCase());

      const matchType = filterType === "ALL" || r.type === filterType;
      return matchSearch && matchType;
    });
  }, [resources, search, filterType]);

  // Handle Review Submit
  function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewTarget) return;

    startTransition(async () => {
      const res = await reviewReservationAction({
        reservationId: reviewTarget.id,
        status: reviewStatus,
        driverName: reviewTarget.resourceType === "VEHICLE" ? reviewDriverName.trim() || null : null,
        reviewNote: reviewNote.trim() || null,
      });

      if (res.ok) {
        toast.success(t("reservations.successReviewed"));
        const updated = res.data;
        setReservations((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        setReviewTarget(null);
      } else {
        toast.error(res.error.message);
      }
    });
  }

  // Open Create Resource Modal
  function openCreateResourceModal() {
    setEditingResource(null);
    setResType("FACILITY");
    setResCode("");
    setResNameTh("");
    setResNameEn("");
    setResCapacity("30");
    setResLocation("");
    setResAmenities("");
    setResImageUrl("");
    setResStatus("AVAILABLE");
    setResSeq(String(resources.length + 1));
    setResourceModalOpen(true);
  }

  // Open Edit Resource Modal
  function openEditResourceModal(res: ReservableResourceDto) {
    setEditingResource(res);
    setResType(res.type);
    setResCode(res.code);
    setResNameTh(res.nameTh);
    setResNameEn(res.nameEn);
    setResCapacity(String(res.capacity));
    setResLocation(res.location);
    setResAmenities(res.amenities.join(", "));
    setResImageUrl(res.imageUrl ?? "");
    setResStatus(res.status);
    setResSeq(String(res.seq));
    setResourceModalOpen(true);
  }

  // Handle Save Resource
  function handleSaveResource(e: React.FormEvent) {
    e.preventDefault();
    if (!resCode.trim() || !resNameTh.trim() || !resNameEn.trim() || !resLocation.trim()) {
      toast.error("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return;
    }

    const amenitiesArray = resAmenities
      .split(/[,、\n]/)
      .map((s) => s.trim())
      .filter(Boolean);

    startTransition(async () => {
      if (editingResource) {
        const res = await updateResourceAction({
          id: editingResource.id,
          type: resType,
          code: resCode.trim(),
          nameTh: resNameTh.trim(),
          nameEn: resNameEn.trim(),
          capacity: Number(resCapacity) || 1,
          location: resLocation.trim(),
          amenities: amenitiesArray,
          imageUrl: resImageUrl.trim() || null,
          status: resStatus,
          requiresApproval: true,
          seq: Number(resSeq) || 1,
        });

        if (res.ok) {
          toast.success(t("reservations.successResourceSaved"));
          setResources((prev) => prev.map((r) => (r.id === res.data.id ? res.data : r)));
          setResourceModalOpen(false);
        } else {
          toast.error(res.error.message);
        }
      } else {
        const res = await createResourceAction({
          type: resType,
          code: resCode.trim(),
          nameTh: resNameTh.trim(),
          nameEn: resNameEn.trim(),
          capacity: Number(resCapacity) || 1,
          location: resLocation.trim(),
          amenities: amenitiesArray,
          imageUrl: resImageUrl.trim() || null,
          status: resStatus,
          requiresApproval: true,
          seq: Number(resSeq) || 1,
        });

        if (res.ok) {
          toast.success(t("reservations.successResourceSaved"));
          setResources((prev) => [...prev, res.data]);
          setResourceModalOpen(false);
        } else {
          toast.error(res.error.message);
        }
      }
    });
  }

  // Handle Delete Resource
  function handleDeleteResource() {
    if (!deleteResourceTarget) return;

    startTransition(async () => {
      const res = await deleteResourceAction(deleteResourceTarget.id);
      if (res.ok) {
        toast.success("ลบรายการทรัพยากรเรียบร้อยแล้ว");
        setResources((prev) => prev.filter((r) => r.id !== deleteResourceTarget.id));
        setDeleteResourceTarget(null);
      } else {
        toast.error(res.error.message);
      }
    });
  }

  // Handle Cancel Reservation
  function handleCancelReservation(id: string) {
    startTransition(async () => {
      const res = await cancelReservationAction(id);
      if (res.ok) {
        toast.success("ยกเลิกการจองเรียบร้อยแล้ว");
        setReservations((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: "CANCELLED" as const } : r))
        );
      } else {
        toast.error(res.error.message);
      }
    });
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case "APPROVED": return t("reservations.status.approved");
      case "PENDING": return t("reservations.status.pending");
      case "REJECTED": return t("reservations.status.rejected");
      case "CANCELLED": return t("reservations.status.cancelled");
      default: return status;
    }
  }

  function getStatusTone(status: string): "ok" | "warn" | "bad" | "info" | "off" {
    switch (status) {
      case "APPROVED": return "ok";
      case "PENDING": return "warn";
      case "REJECTED": return "bad";
      default: return "off";
    }
  }

  // Reservation Columns
  const reservationColumns: DataTableColumn<ResourceReservationDto>[] = [
    {
      key: "reservationNo",
      header: t("reservations.reservationNo"),
      render: (row) => (
        <div>
          <span className="font-mono font-bold text-foreground block">
            {row.reservationNo}
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
      key: "title",
      header: t("reservations.titleSubject"),
      render: (row) => (
        <div className="max-w-md">
          <div className="font-semibold text-foreground line-clamp-1">{row.title}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{row.departmentName}</div>
        </div>
      ),
    },
    {
      key: "resource",
      header: t("reservations.resourceType"),
      render: (row) => (
        <div className="text-xs">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            {row.resourceType === "FACILITY" ? (
              <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
            ) : (
              <Car className="w-3.5 h-3.5 text-primary shrink-0" />
            )}
            <span>{locale === "th" ? row.resourceNameTh : row.resourceNameEn}</span>
          </div>
          <div className="text-muted-foreground mt-0.5 font-mono">{row.resourceCode}</div>
        </div>
      ),
    },
    {
      key: "timeSlot",
      header: t("reservations.timeSlot"),
      render: (row) => (
        <div className="text-xs">
          <div className="font-medium text-foreground">
            {new Date(row.startTime).toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
          <div className="text-muted-foreground">
            {new Date(row.startTime).toLocaleTimeString(locale === "th" ? "th-TH" : "en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            -{" "}
            {new Date(row.endTime).toLocaleTimeString(locale === "th" ? "th-TH" : "en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      ),
    },
    {
      key: "applicant",
      header: t("reservations.applicant"),
      render: (row) => (
        <div className="text-xs">
          <div className="font-medium text-foreground">{row.applicantName}</div>
          <div className="text-muted-foreground">{row.applicantPhone}</div>
        </div>
      ),
    },
    {
      key: "status",
      header: "สถานะ",
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
        <div className="flex items-center justify-end gap-1.5">
          {canReview && row.status === "PENDING" && (
            <button
              onClick={() => {
                setReviewTarget(row);
                setReviewStatus("APPROVED");
                setReviewDriverName(row.driverName ?? "");
                setReviewNote("");
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t("reservations.reviewAction")}</span>
            </button>
          )}
          {canManage && (
            <button
              onClick={() => {
                setReviewTarget(row);
                setReviewStatus(row.status === "REJECTED" ? "REJECTED" : "APPROVED");
                setReviewDriverName(row.driverName ?? "");
                setReviewNote(row.reviewNote ?? "");
              }}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-md"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  // Resource Columns
  const resourceColumns: DataTableColumn<ReservableResourceDto>[] = [
    {
      key: "code",
      header: t("reservations.code"),
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.type === "FACILITY" ? (
            <Building2 className="w-4 h-4 text-primary" />
          ) : (
            <Car className="w-4 h-4 text-primary" />
          )}
          <span className="font-mono font-bold text-foreground">{row.code}</span>
        </div>
      ),
    },
    {
      key: "name",
      header: "ชื่อทรัพยากร",
      render: (row) => (
        <div>
          <div className="font-semibold text-foreground">
            {locale === "th" ? row.nameTh : row.nameEn}
          </div>
          <div className="text-xs text-muted-foreground">
            {locale === "th" ? row.nameEn : row.nameTh}
          </div>
        </div>
      ),
    },
    {
      key: "capacity",
      header: t("reservations.capacity"),
      render: (row) => (
        <span className="text-xs font-medium text-foreground">
          {row.capacity} {t("reservations.capacityUnit")}
        </span>
      ),
    },
    {
      key: "location",
      header: t("reservations.location"),
      render: (row) => (
        <span className="text-xs text-muted-foreground">{row.location}</span>
      ),
    },
    {
      key: "status",
      header: "ความพร้อม",
      render: (row) => (
        <StatusPill tone={row.status === "AVAILABLE" ? "ok" : row.status === "MAINTENANCE" ? "warn" : "off"}>
          {row.status === "AVAILABLE" ? "พร้อมใช้งาน" : row.status === "MAINTENANCE" ? "ซ่อมบำรุง" : "งดให้บริการ"}
        </StatusPill>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {canManage && (
            <>
              <button
                onClick={() => openEditResourceModal(row)}
                className="p-1.5 text-muted-foreground hover:text-primary rounded-md"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeleteResourceTarget(row)}
                className="p-1.5 text-muted-foreground hover:text-destructive rounded-md"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("reservations.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("reservations.subtitle")}
          </p>
        </div>

        {canManage && (
          <button
            onClick={openCreateResourceModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t("reservations.createResource")}</span>
          </button>
        )}
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <LiyonCard className="p-4 flex items-center gap-4 border-l-4 border-l-amber-500">
          <div className="p-3 bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{stats.pending}</div>
            <div className="text-xs font-medium text-muted-foreground">
              {t("reservations.stat.pending")}
            </div>
          </div>
        </LiyonCard>

        <LiyonCard className="p-4 flex items-center gap-4 border-l-4 border-l-emerald-500">
          <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{stats.approved}</div>
            <div className="text-xs font-medium text-muted-foreground">
              {t("reservations.stat.approved")}
            </div>
          </div>
        </LiyonCard>

        <LiyonCard className="p-4 flex items-center gap-4 border-l-4 border-l-blue-500">
          <div className="p-3 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{stats.facilities}</div>
            <div className="text-xs font-medium text-muted-foreground">
              {t("reservations.stat.facilities")}
            </div>
          </div>
        </LiyonCard>

        <LiyonCard className="p-4 flex items-center gap-4 border-l-4 border-l-purple-500">
          <div className="p-3 bg-purple-500/10 rounded-lg text-purple-600 dark:text-purple-400">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{stats.vehicles}</div>
            <div className="text-xs font-medium text-muted-foreground">
              {t("reservations.stat.vehicles")}
            </div>
          </div>
        </LiyonCard>
      </div>

      {/* Main Tabs */}
      <div className="flex border-b border-border space-x-1">
        <button
          onClick={() => setActiveTab("pending")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition ${
            activeTab === "pending"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>{t("reservations.tab.pending")}</span>
          {stats.pending > 0 && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">
              {stats.pending}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("allReservations")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition ${
            activeTab === "allReservations"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>{t("reservations.tab.allReservations")}</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
            {reservations.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("resources")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition ${
            activeTab === "resources"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>{t("reservations.tab.resources")}</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
            {resources.length}
          </span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <LiyonCard className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาตามรหัส, ชื่อ หรือผู้ขอใช้..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="ALL">— ประเภท: ทั้งหมด —</option>
            <option value="FACILITY">ห้องประชุม / อาคารสถานที่</option>
            <option value="VEHICLE">ยานพาหนะบริการ</option>
          </select>

          {activeTab !== "resources" && (
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="ALL">— สถานะ: ทั้งหมด —</option>
              <option value="PENDING">{t("reservations.status.pending")}</option>
              <option value="APPROVED">{t("reservations.status.approved")}</option>
              <option value="REJECTED">{t("reservations.status.rejected")}</option>
              <option value="CANCELLED">{t("reservations.status.cancelled")}</option>
            </select>
          )}
        </div>
      </LiyonCard>

      {/* Table Section */}
      {activeTab === "resources" ? (
        <LiyonCard>
          <DataTable<ReservableResourceDto>
            headHeading={<span className="font-semibold text-sm">{t("reservations.tab.resources")}</span>}
            state={filteredResources.length > 0 ? "data" : "empty"}
            rows={filteredResources}
            columns={resourceColumns}
            getRowId={(row) => row.id}
            empty={{
              icon: <Building2 className="h-10 w-10 text-muted-foreground/50" />,
              title: t("reservations.empty"),
              description: "ไม่มีข้อมูลทรัพยากรที่ค้นหา",
            }}
            error={{
              icon: <AlertCircle className="h-10 w-10 text-destructive" />,
              title: t("common.error"),
            }}
          />
        </LiyonCard>
      ) : (
        <LiyonCard>
          <DataTable<ResourceReservationDto>
            headHeading={
              <span className="font-semibold text-sm">
                {activeTab === "pending"
                  ? t("reservations.tab.pending")
                  : t("reservations.tab.allReservations")}
              </span>
            }
            state={filteredReservations.length > 0 ? "data" : "empty"}
            rows={filteredReservations}
            columns={reservationColumns}
            getRowId={(row) => row.id}
            renderRowMenu={(row) => (
              <>
                {canReview && row.status === "PENDING" && (
                  <RowMenuItem
                    onSelect={() => {
                      setReviewTarget(row);
                      setReviewStatus("APPROVED");
                      setReviewDriverName(row.driverName ?? "");
                      setReviewNote("");
                    }}
                    icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  >
                    {t("reservations.reviewAction")}
                  </RowMenuItem>
                )}
                {canManage && row.status !== "CANCELLED" && (
                  <RowMenuItem
                    onSelect={() => handleCancelReservation(row.id)}
                    danger
                    icon={<Trash2 className="w-4 h-4" />}
                  >
                    {t("reservations.cancelAction")}
                  </RowMenuItem>
                )}
              </>
            )}
            empty={{
              icon: <Calendar className="h-10 w-10 text-muted-foreground/50" />,
              title: t("reservations.empty"),
              description: "ไม่มีรายการจองในเงื่อนไขที่เลือก",
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
        <LiyonDialogHeader title={t("reservations.reviewAction")} />
        {reviewTarget && (
          <form onSubmit={handleReviewSubmit}>
            <LiyonDialogBody className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              {/* Target Details Box */}
              <div className="p-3.5 rounded-lg border border-border bg-muted/40 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-foreground">
                    {reviewTarget.reservationNo}
                  </span>
                  <StatusPill tone={getStatusTone(reviewTarget.status)}>
                    {getStatusLabel(reviewTarget.status)}
                  </StatusPill>
                </div>
                <div className="font-semibold text-sm text-foreground">
                  {reviewTarget.title}
                </div>
                <div className="text-muted-foreground">
                  ทรัพยากร: {locale === "th" ? reviewTarget.resourceNameTh : reviewTarget.resourceNameEn} ({reviewTarget.resourceCode})
                </div>
                <div className="text-muted-foreground">
                  วันเวลา: {new Date(reviewTarget.startTime).toLocaleString(locale === "th" ? "th-TH" : "en-US")} - {new Date(reviewTarget.endTime).toLocaleString(locale === "th" ? "th-TH" : "en-US")}
                </div>
                <div className="text-muted-foreground">
                  ผู้ขอ: {reviewTarget.applicantName} ({reviewTarget.departmentName}) โทร: {reviewTarget.applicantPhone}
                </div>
                <div className="text-foreground pt-1 border-t border-border">
                  วัตถุประสงค์: {reviewTarget.purpose}
                </div>
                {reviewTarget.specialRequests && (
                  <div className="text-amber-600 dark:text-amber-400">
                    คำขอพิเศษ: {reviewTarget.specialRequests}
                  </div>
                )}
              </div>

              {/* Decision Radio */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground block">
                  ผลการพิจารณา *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="reviewDecision"
                      value="APPROVED"
                      checked={reviewStatus === "APPROVED"}
                      onChange={() => setReviewStatus("APPROVED")}
                      className="text-primary focus:ring-ring"
                    />
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t("reservations.approveAction")}</span>
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="reviewDecision"
                      value="REJECTED"
                      checked={reviewStatus === "REJECTED"}
                      onChange={() => setReviewStatus("REJECTED")}
                      className="text-primary focus:ring-ring"
                    />
                    <span className="text-sm font-medium text-destructive flex items-center gap-1">
                      <XCircle className="w-4 h-4" />
                      <span>{t("reservations.rejectAction")}</span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Driver Assignment if Vehicle and Approved */}
              {reviewTarget.resourceType === "VEHICLE" && reviewStatus === "APPROVED" && (
                <LiyonField label={t("reservations.driverName")}>
                  <input
                    type="text"
                    value={reviewDriverName}
                    onChange={(e) => setReviewDriverName(e.target.value)}
                    placeholder="เช่น นายประสิทธิ์ ขับขี่ดี"
                    className="w-full text-sm p-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </LiyonField>
              )}

              {/* Review Note */}
              <LiyonField label={t("reservations.reviewNote")}>
                <textarea
                  rows={3}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="ระบุหมายเหตุ การจัดเตรียมอุปกรณ์ หรือเหตุผลการปฏิเสธ..."
                  className="w-full text-sm p-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </LiyonField>
            </LiyonDialogBody>

            <LiyonDialogFooter>
              <button
                type="button"
                onClick={() => setReviewTarget(null)}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-input bg-background hover:bg-accent transition"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isPending}
                className={`px-4 py-2 text-sm font-medium rounded-lg text-white shadow transition disabled:opacity-60 ${
                  reviewStatus === "APPROVED"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-destructive hover:bg-destructive/90"
                }`}
              >
                {isPending ? "กำลังบันทึก..." : "ยืนยันผลการพิจารณา"}
              </button>
            </LiyonDialogFooter>
          </form>
        )}
      </LiyonDialog>

      {/* Resource Create / Edit Dialog */}
      <LiyonDialog open={resourceModalOpen} onOpenChange={setResourceModalOpen}>
        <LiyonDialogHeader
          title={
            editingResource
              ? t("reservations.editResource")
              : t("reservations.createResource")
          }
        />
        <form onSubmit={handleSaveResource}>
          <LiyonDialogBody className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <LiyonField label={t("reservations.resourceType")}>
                <select
                  value={resType}
                  onChange={(e) => setResType(e.target.value as "FACILITY" | "VEHICLE")}
                  className="w-full p-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="FACILITY">{t("reservations.resourceType.facility")}</option>
                  <option value="VEHICLE">{t("reservations.resourceType.vehicle")}</option>
                </select>
              </LiyonField>

              <LiyonField label={t("reservations.code")}>
                <input
                  type="text"
                  value={resCode}
                  onChange={(e) => setResCode(e.target.value)}
                  placeholder="เช่น ROOM-VIP / VAN-01"
                  className="w-full text-sm p-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <LiyonField label={t("reservations.nameTh")}>
                <input
                  type="text"
                  value={resNameTh}
                  onChange={(e) => setResNameTh(e.target.value)}
                  placeholder="ชื่อภาษาไทย..."
                  className="w-full text-sm p-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </LiyonField>

              <LiyonField label={t("reservations.nameEn")}>
                <input
                  type="text"
                  value={resNameEn}
                  onChange={(e) => setResNameEn(e.target.value)}
                  placeholder="English Name..."
                  className="w-full text-sm p-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <LiyonField label={t("reservations.capacity")}>
                <input
                  type="number"
                  min={1}
                  value={resCapacity}
                  onChange={(e) => setResCapacity(e.target.value)}
                  className="w-full text-sm p-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </LiyonField>

              <LiyonField label={t("reservations.resourceStatus")}>
                <select
                  value={resStatus}
                  onChange={(e) => setResStatus(e.target.value as "AVAILABLE" | "MAINTENANCE" | "UNAVAILABLE")}
                  className="w-full p-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="AVAILABLE">{t("reservations.resourceStatus.available")}</option>
                  <option value="MAINTENANCE">{t("reservations.resourceStatus.maintenance")}</option>
                  <option value="UNAVAILABLE">{t("reservations.resourceStatus.unavailable")}</option>
                </select>
              </LiyonField>

              <LiyonField label="ลำดับแสดงผล">
                <input
                  type="number"
                  min={1}
                  value={resSeq}
                  onChange={(e) => setResSeq(e.target.value)}
                  className="w-full text-sm p-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </LiyonField>
            </div>

            <LiyonField label={t("reservations.location")}>
              <input
                type="text"
                value={resLocation}
                onChange={(e) => setResLocation(e.target.value)}
                placeholder="เช่น อาคารสมเด็จพระพุฒาจารย์ ชั้น 2"
                className="w-full text-sm p-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </LiyonField>

            <LiyonField label={t("reservations.amenities")}>
              <input
                type="text"
                value={resAmenities}
                onChange={(e) => setResAmenities(e.target.value)}
                placeholder="คั่นด้วยเครื่องหมายจุลภาค เช่น โปรเจกเตอร์, WiFi, ไมโครโฟน..."
                className="w-full text-sm p-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </LiyonField>

            <LiyonField label="รูปภาพประกอบ (URL)">
              <input
                type="text"
                value={resImageUrl}
                onChange={(e) => setResImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full text-sm p-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </LiyonField>
          </LiyonDialogBody>

          <LiyonDialogFooter>
            <button
              type="button"
              onClick={() => setResourceModalOpen(false)}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-input bg-background hover:bg-accent transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 transition disabled:opacity-60"
            >
              {isPending ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </button>
          </LiyonDialogFooter>
        </form>
      </LiyonDialog>

      {/* Delete Resource Confirmation Dialog */}
      <LiyonDialog
        open={Boolean(deleteResourceTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteResourceTarget(null);
        }}
      >
        <LiyonDialogHeader title="ยืนยันการลบทรัพยากร" />
        {deleteResourceTarget && (
          <LiyonDialogBody>
            <p className="text-sm text-muted-foreground">
              คุณต้องการลบทรัพยากร <strong className="text-foreground">{deleteResourceTarget.nameTh} ({deleteResourceTarget.code})</strong> ใช่หรือไม่?
            </p>
          </LiyonDialogBody>
        )}
        <LiyonDialogFooter>
          <button
            onClick={() => setDeleteResourceTarget(null)}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-input bg-background hover:bg-accent transition"
          >
            ไม่ลบ
          </button>
          <button
            onClick={handleDeleteResource}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium rounded-lg text-destructive-foreground bg-destructive hover:bg-destructive/90 transition disabled:opacity-60"
          >
            {isPending ? "กำลังลบ..." : "ยืนยันการลบ"}
          </button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}
