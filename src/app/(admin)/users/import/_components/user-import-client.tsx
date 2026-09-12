"use client";

import { useState, useRef, useTransition, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { LiyonCard, StatusPill, useBreadcrumbTail } from "@/shared/components/liyon";
import { useT } from "@/shared/lib/i18n/client";
import {
  getUserImportTemplateAction,
  validateUsersImportAction,
  executeUsersImportAction,
} from "@/features/identity/actions";
import type {
  UserImportValidationResult,
  UserImportExecutionResult,
} from "@/features/identity";


export function UserImportClient() {
  const t = useT();

  useBreadcrumbTail([
    { label: t("users.title"), href: "/users" },
    { label: t("users.importTitle") },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<UserImportValidationResult | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "valid" | "invalid">("all");
  const [skipErrors, setSkipErrors] = useState(true);
  const [sendEmail, setSendEmail] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [importResult, setImportResult] = useState<UserImportExecutionResult | null>(null);
  const [copiedLinkIndex, setCopiedLinkIndex] = useState<number | null>(null);

  // Handle template download
  async function handleDownloadTemplate() {
    try {
      const res = await getUserImportTemplateAction();
      if (!res.ok) {
        toast.error(t("common.error"));
        return;
      }
      const blob = new Blob([res.data.content], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast.error(t("common.error"));
    }
  }

  // Handle file reading and validation
  function handleFileSelected(selectedFile: File) {
    if (!selectedFile.name.endsWith(".csv")) {
      toast.error("กรุณาเลือกไฟล์ที่มีนามสกุล .csv");
      return;
    }

    setFile(selectedFile);
    setIsValidating(true);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const res = await validateUsersImportAction(text);
        if (!res.ok) {
          toast.error(res.error.message || t("common.error"));
          setValidationResult(null);
          return;
        }
        setValidationResult(res.data);
        if (res.data.totalRows === 0) {
          toast.warning("ไม่พบข้อมูลแถวในไฟล์ CSV");
        } else if (res.data.invalidCount > 0) {
          toast.warning(`พบข้อผิดพลาด ${res.data.invalidCount} แถว`);
        } else {
          toast.success(`ตรวจสอบข้อมูลสำเร็จ ทั้งหมด ${res.data.validCount} แถวพร้อมนำเข้า`);
        }
      } catch {
        toast.error("เกิดข้อผิดพลาดในการอ่านไฟล์");
      } finally {
        setIsValidating(false);
      }
    };
    reader.onerror = () => {
      toast.error("ไม่สามารถอ่านไฟล์ได้");
      setIsValidating(false);
    };
    reader.readAsText(selectedFile, "UTF-8");
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  }

  function handleReset() {
    setFile(null);
    setValidationResult(null);
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // Filter preview rows by active tab
  const filteredRows = useMemo(() => {
    if (!validationResult) return [];
    if (activeTab === "valid") return validationResult.rows.filter((r) => r.valid);
    if (activeTab === "invalid") return validationResult.rows.filter((r) => !r.valid);
    return validationResult.rows;
  }, [validationResult, activeTab]);

  // Handle execution
  function handleConfirmImport() {
    if (!validationResult) return;

    const rowsToImport = skipErrors
      ? validationResult.rows.filter((r) => r.valid)
      : validationResult.rows;

    if (rowsToImport.length === 0) {
      toast.error(t("users.noValidRows"));
      return;
    }

    startTransition(async () => {
      const res = await executeUsersImportAction({
        rows: rowsToImport,
        sendEmail,
      });

      if (!res.ok) {
        toast.error(res.error.message || "การนำเข้าล้มเหลว");
        return;
      }

      setImportResult(res.data);
      toast.success(t("users.importDone"));
    });
  }

  function copyToClipboard(text: string, index: number) {
    navigator.clipboard.writeText(text);
    setCopiedLinkIndex(index);
    setTimeout(() => setCopiedLinkIndex(null), 2000);
    toast.info("คัดลอกลิงก์แล้ว");
  }

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button variant="ghost" size="xs" asChild>
              <Link href="/users" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="size-3.5" />
                <span>{t("users.importBack")}</span>
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("users.importTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("users.importSubtitle")}</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="shrink-0">
          <Download className="mr-1.5 size-4" />
          {t("users.downloadTemplate")}
        </Button>
      </div>

      {/* When completed, show results view */}
      {importResult ? (
        <LiyonCard className="p-6 space-y-6">
          <div className="flex items-start gap-4 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="size-6 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-emerald-900 dark:text-emerald-200">
                {t("users.importResultTitle")}
              </h2>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                {t("users.importSuccessCount", { n: importResult.successCount })}
                {importResult.failCount > 0 && ` (${t("users.importFailCount", { n: importResult.failCount })})`}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">รายการที่ดำเนินการ</h3>
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                  <tr>
                    <th className="p-3 font-medium">#</th>
                    <th className="p-3 font-medium">{t("users.colName")}</th>
                    <th className="p-3 font-medium">{t("users.email")}</th>
                    <th className="p-3 font-medium">{t("common.colStatus")}</th>
                    <th className="p-3 font-medium">ลิงก์ตั้งรหัสผ่าน (Setup Link)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {importResult.results.map((r, idx) => (
                    <tr key={idx} className="hover:bg-muted/30">
                      <td className="p-3 text-muted-foreground">{r.rowNumber}</td>
                      <td className="p-3 font-medium">{r.name}</td>
                      <td className="p-3 text-muted-foreground">{r.email}</td>
                      <td className="p-3">
                        {r.success ? (
                          <StatusPill tone="ok">{t("status.active")}</StatusPill>
                        ) : (
                          <StatusPill tone="bad">{r.error || t("common.error")}</StatusPill>
                        )}
                      </td>
                      <td className="p-3">
                        {r.link ? (
                          <div className="flex items-center gap-2 max-w-xs">
                            <span className="truncate text-xs font-mono text-muted-foreground">{r.link}</span>
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => copyToClipboard(r.link!, idx)}
                              title="คัดลอกลิงก์"
                            >
                              {copiedLinkIndex === idx ? (
                                <Check className="size-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="size-3.5" />
                              )}
                            </Button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="mr-2 size-4" />
              {t("users.importAnother")}
            </Button>
            <Button asChild>
              <Link href="/users">
                <ArrowLeft className="mr-2 size-4" />
                {t("users.importBack")}
              </Link>
            </Button>
          </div>
        </LiyonCard>
      ) : (
        <>
          {/* Instructions Card */}
          <LiyonCard className="p-5 space-y-3">
            <h2 className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <FileSpreadsheet className="size-4 text-primary" />
              {t("users.importInstructionsTitle")}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("users.importInstructions")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="p-2.5 rounded bg-muted/50 border border-border">
                <span className="font-semibold text-foreground">name / ชื่อ *</span>
                <p className="text-muted-foreground mt-0.5">ชื่อ-นามสกุลของผู้ใช้งาน</p>
              </div>
              <div className="p-2.5 rounded bg-muted/50 border border-border">
                <span className="font-semibold text-foreground">email / อีเมล *</span>
                <p className="text-muted-foreground mt-0.5">ที่อยู่อีเมล (ไม่ซ้ำในระบบ)</p>
              </div>
              <div className="p-2.5 rounded bg-muted/50 border border-border">
                <span className="font-semibold text-foreground">role / บทบาท</span>
                <p className="text-muted-foreground mt-0.5">ADMIN, STAFF, VIEWER</p>
              </div>
              <div className="p-2.5 rounded bg-muted/50 border border-border">
                <span className="font-semibold text-foreground">status / สถานะ</span>
                <p className="text-muted-foreground mt-0.5">active หรือ inactive</p>
              </div>
            </div>
          </LiyonCard>

          {/* Upload Dropzone Card */}
          <LiyonCard className="p-6">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelected(e.target.files[0]);
                }
              }}
            />

            {!file ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-border hover:border-primary/60 rounded-xl p-8 text-center transition-colors flex flex-col items-center justify-center gap-3 bg-muted/20 hover:bg-muted/40"
              >
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Upload className="size-6" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">{t("users.dropzoneTitle")}</div>
                  <div className="text-xs text-muted-foreground mt-1">{t("users.dropzoneHint")}</div>
                </div>
                <Button type="button" variant="secondary" size="sm" className="mt-1">
                  เลือกไฟล์ .csv
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/40 border border-border">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="size-8 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  {t("users.changeFile")}
                </Button>
              </div>
            )}
          </LiyonCard>

          {/* Validation & Preview Section */}
          {isValidating && (
            <div className="p-8 text-center text-sm text-muted-foreground animate-pulse">
              <RefreshCw className="size-5 animate-spin mx-auto mb-2 text-primary" />
              {t("users.readingFile")}
            </div>
          )}

          {validationResult && (
            <LiyonCard className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <h2 className="text-base font-semibold text-foreground">{t("users.previewTitle")}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ตรวจสอบความถูกต้องของข้อมูลก่อนนำเข้าสู่ระบบ
                  </p>
                </div>

                {/* Counters */}
                <div className="flex items-center gap-2 text-xs font-medium">
                  <span className="px-2.5 py-1 rounded bg-muted text-muted-foreground border border-border">
                    {t("users.statTotal", { n: validationResult.totalRows })}
                  </span>
                  <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {t("users.statValid", { n: validationResult.validCount })}
                  </span>
                  {validationResult.invalidCount > 0 && (
                    <span className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                      {t("users.statInvalid", { n: validationResult.invalidCount })}
                    </span>
                  )}
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-2 border-b border-border pb-2 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    activeTab === "all"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t("users.tabAll")} ({validationResult.totalRows})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("valid")}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    activeTab === "valid"
                      ? "bg-emerald-600 text-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t("users.tabValid")} ({validationResult.validCount})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("invalid")}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    activeTab === "invalid"
                      ? "bg-rose-600 text-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t("users.tabInvalid")} ({validationResult.invalidCount})
                </button>
              </div>

              {/* Preview Table */}
              <div className="overflow-x-auto rounded-md border border-border max-h-96">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 text-muted-foreground border-b border-border sticky top-0">
                    <tr>
                      <th className="p-3 font-medium">{t("users.colRow")}</th>
                      <th className="p-3 font-medium">{t("users.colError")}</th>
                      <th className="p-3 font-medium">{t("users.colName")}</th>
                      <th className="p-3 font-medium">{t("users.email")}</th>
                      <th className="p-3 font-medium">{t("users.colRoles")}</th>
                      <th className="p-3 font-medium">{t("common.colStatus")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredRows.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-muted-foreground text-xs">
                          ไม่มีข้อมูลในหมวดนี้
                        </td>
                      </tr>
                    ) : (
                      filteredRows.map((r) => (
                        <tr
                          key={r.rowNumber}
                          className={r.valid ? "hover:bg-muted/30" : "bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-50/60"}
                        >
                          <td className="p-3 text-muted-foreground">{r.rowNumber}</td>
                          <td className="p-3">
                            {r.valid ? (
                              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                <CheckCircle2 className="size-3.5" />
                                {t("users.rowReady")}
                              </span>
                            ) : (
                              <div className="space-y-0.5">
                                {r.errors.map((err, i) => (
                                  <div
                                    key={i}
                                    className="inline-flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 font-medium"
                                  >
                                    <XCircle className="size-3 shrink-0" />
                                    <span>{err}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="p-3 font-medium">{r.name || "-"}</td>
                          <td className="p-3 text-muted-foreground font-mono text-xs">{r.email || "-"}</td>
                          <td className="p-3">
                            <span className="text-xs px-2 py-0.5 rounded bg-muted border border-border">
                              {r.roleName}
                            </span>
                          </td>
                          <td className="p-3">
                            <StatusPill tone={r.status === "active" ? "ok" : "bad"}>
                              {r.status === "active" ? t("status.active") : t("status.inactive")}
                            </StatusPill>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Execution Options and Actions */}
              <div className="space-y-4 pt-2 border-t border-border">
                {validationResult.invalidCount > 0 && (
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <Checkbox
                      checked={skipErrors}
                      onCheckedChange={(c) => setSkipErrors(Boolean(c))}
                    />
                    <span>{t("users.skipErrors")}</span>
                  </label>
                )}

                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <Checkbox
                    checked={sendEmail}
                    onCheckedChange={(c) => setSendEmail(Boolean(c))}
                  />
                  <span>{t("users.sendInviteEmail")}</span>
                </label>

                <div className="flex items-center justify-between pt-3">
                  <Button variant="outline" onClick={handleReset} disabled={isPending}>
                    ยกเลิก
                  </Button>
                  <Button
                    onClick={handleConfirmImport}
                    disabled={
                      isPending ||
                      validationResult.validCount === 0 ||
                      (!skipErrors && validationResult.invalidCount > 0)
                    }
                  >
                    {isPending ? (
                      <>
                        <RefreshCw className="mr-2 size-4 animate-spin" />
                        {t("users.importing")}
                      </>
                    ) : (
                      t("users.confirmImport", {
                        n: skipErrors ? validationResult.validCount : validationResult.totalRows,
                      })
                    )}
                  </Button>
                </div>
              </div>
            </LiyonCard>
          )}
        </>
      )}
    </div>
  );
}
