"use client";
import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Upload,
  ImageIcon,
  Trash2,
  Loader2,
  Mail,
  Send,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiyonCard, LiyonField, PalettePicker } from "@/shared/components/liyon";
import { useT } from "@/shared/lib/i18n/client";
import type { PaletteId } from "@/shared/lib/palette";
import type { TenantSettings } from "@/features/identity";
import { updateSettingsAction, uploadLogoAction, testSmtpAction } from "@/features/identity/actions";

export function SettingsForm({ initial }: { initial: TenantSettings }) {
  const t = useT();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    nameTh: initial.nameTh,
    nameEn: initial.nameEn,
    logoUrl: initial.logoUrl ?? "",
    palette: initial.palette as PaletteId,
    smtp: {
      enabled: initial.smtp?.enabled ?? false,
      user: initial.smtp?.user ?? "",
      pass: "",
      fromName: initial.smtp?.fromName ?? "",
      fromEmail: initial.smtp?.fromEmail ?? "",
    },
  });
  const [showPass, setShowPass] = useState(false);
  const [testTo, setTestTo] = useState(initial.smtp?.user ?? "");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, start] = useTransition();
  const [uploading, setUploading] = useState(false);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      toast.error(t("settings.invalidFileType"));
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error(t("settings.fileTooLarge"));
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadLogoAction(fd);
      if (!res.ok) {
        toast.error(res.error.fieldErrors?.file?.[0] || t("settings.uploadFailed"));
        return;
      }
      setForm((prev) => ({ ...prev, logoUrl: res.data.url }));
      setErrors((prev) => ({ ...prev, logoUrl: [] }));
      toast.success(t("settings.uploadSuccess"));
    } catch {
      toast.error(t("settings.uploadFailed"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleTestEmail() {
    if (!form.smtp.user.trim()) {
      toast.error(t("settings.smtpTestMissingUser"));
      return;
    }
    if (!form.smtp.pass.trim() && !initial.smtp?.hasPassword) {
      toast.error(t("settings.smtpTestMissingPass"));
      return;
    }
    if (!testTo.trim()) {
      toast.error(t("settings.smtpTestMissingTo"));
      return;
    }

    setTesting(true);
    setTestResult(null);
    try {
      const res = await testSmtpAction({
        user: form.smtp.user.trim(),
        pass: form.smtp.pass.trim() || undefined,
        to: testTo.trim(),
        fromName: form.smtp.fromName.trim() || undefined,
        fromEmail: form.smtp.fromEmail.trim() || undefined,
      });

      if (res.ok) {
        setTestResult({ success: true, message: t("settings.smtpTestSuccess") });
        toast.success(t("settings.smtpTestSuccess"));
      } else {
        const errorMsg =
          res.error.fieldErrors?._form?.[0] ||
          res.error.fieldErrors?.pass?.[0] ||
          res.error.fieldErrors?.user?.[0] ||
          res.error.fieldErrors?.to?.[0] ||
          t("settings.smtpTestFail");
        setTestResult({ success: false, message: errorMsg });
        toast.error(errorMsg);
      }
    } catch {
      const msg = t("settings.smtpTestFail");
      setTestResult({ success: false, message: msg });
      toast.error(msg);
    } finally {
      setTesting(false);
    }
  }

  function save() {
    start(async () => {
      const r = await updateSettingsAction(form);
      if (!r.ok) {
        setErrors(r.error.fieldErrors ?? {});
        if (!r.error.fieldErrors) toast.error(t(`error.${r.error.code}`));
        return;
      }
      setErrors({});
      toast.success(t("settings.saveOk"));
      router.refresh();
    });
  }

  return (
    <>
      <header className="ph"><h1>{t("settings.title")}</h1></header>
      <div className="set-cards">
        <LiyonCard>
          <h2>{t("settings.orgTitle")}</h2>
          <div className="fields">
            <LiyonField label={t("settings.nameTh")} htmlFor="s-name-th" error={errors.nameTh?.[0]}><input id="s-name-th" value={form.nameTh} onChange={(e) => setForm({ ...form, nameTh: e.target.value })} /></LiyonField>
            <LiyonField label={t("settings.nameEn")} htmlFor="s-name-en" error={errors.nameEn?.[0]}><input id="s-name-en" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} /></LiyonField>
            <LiyonField label={t("settings.logoUrl")} htmlFor="s-logo" hint={t("settings.uploadHint")} error={errors.logoUrl?.[0]}>
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-4">
                  {form.logoUrl ? (
                    <div className="relative group w-16 h-16 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center p-1.5 overflow-hidden shadow-xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={form.logoUrl} alt="Logo preview" className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-6 w-6 stroke-1" />
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploading || pending}
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>{t("settings.uploading")}</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-3.5 w-3.5" />
                          <span>{form.logoUrl ? t("settings.changeLogo") : t("settings.uploadLogo")}</span>
                        </>
                      )}
                    </Button>

                    {form.logoUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={uploading || pending}
                        onClick={() => setForm({ ...form, logoUrl: "" })}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 inline-flex items-center gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>{t("settings.removeLogo")}</span>
                      </Button>
                    )}
                  </div>
                </div>

                <input
                  id="s-logo"
                  type="text"
                  placeholder="https://... หรือ /uploads/..."
                  value={form.logoUrl}
                  onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                  className="font-mono text-xs"
                />
              </div>
            </LiyonField>
          </div>
        </LiyonCard>

        {/* Gmail SMTP Settings Card */}
        <LiyonCard>
          <h2>{t("settings.smtpTitle")}</h2>
          <p>{t("settings.smtpDesc")}</p>

          <div className="fields space-y-4 pt-2">
            <div className="flex items-center gap-2.5 pb-2">
              <input
                id="s-smtp-enabled"
                type="checkbox"
                checked={form.smtp.enabled}
                onChange={(e) => setForm({ ...form, smtp: { ...form.smtp, enabled: e.target.checked } })}
                className="rounded border-slate-300 w-4 h-4 text-primary focus:ring-primary cursor-pointer"
              />
              <label htmlFor="s-smtp-enabled" className="text-sm font-medium cursor-pointer select-none">
                {t("settings.smtpEnabled")}
              </label>
            </div>

            {form.smtp.enabled && (
              <div className="space-y-4 pt-1">
                {/* How to generate App Password guide */}
                <div className="rounded-lg border border-sky-200 dark:border-sky-900/50 bg-sky-50/60 dark:bg-sky-950/30 p-3.5 text-xs text-sky-900 dark:text-sky-200 space-y-2">
                  <div className="font-semibold flex items-center gap-1.5">
                    <KeyRound className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                    <span>{t("settings.smtpAppPassHelp")}</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-sky-800 dark:text-sky-300">
                    <li>{t("settings.smtpAppPassStep1")}</li>
                    <li>{t("settings.smtpAppPassStep2")}</li>
                    <li>{t("settings.smtpAppPassStep3")}</li>
                  </ol>
                  <a
                    href="https://myaccount.google.com/apppasswords"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline font-medium pt-1 text-xs"
                  >
                    <span>{t("settings.smtpAppPassLink")}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <LiyonField
                  label={t("settings.smtpUser")}
                  htmlFor="s-smtp-user"
                  error={errors["smtp.user"]?.[0] || errors.user?.[0]}
                >
                  <input
                    id="s-smtp-user"
                    type="email"
                    placeholder={t("settings.smtpUserPh")}
                    value={form.smtp.user}
                    onChange={(e) => {
                      const val = e.target.value;
                      setForm({ ...form, smtp: { ...form.smtp, user: val } });
                      if (!testTo) setTestTo(val);
                    }}
                  />
                </LiyonField>

                <LiyonField
                  label={t("settings.smtpPass")}
                  htmlFor="s-smtp-pass"
                  hint={t("settings.smtpPassHint")}
                  error={errors["smtp.pass"]?.[0] || errors.pass?.[0]}
                >
                  <div className="relative">
                    <input
                      id="s-smtp-pass"
                      type={showPass ? "text" : "password"}
                      placeholder={initial.smtp?.hasPassword ? t("settings.smtpPassExisting") : t("settings.smtpPassPh")}
                      value={form.smtp.pass}
                      onChange={(e) => setForm({ ...form, smtp: { ...form.smtp, pass: e.target.value } })}
                      className="pr-10 font-mono text-sm"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-1"
                      tabIndex={-1}
                      title={showPass ? "Hide password" : "Show password"}
                    >
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </LiyonField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <LiyonField
                    label={t("settings.smtpFromName")}
                    htmlFor="s-smtp-from-name"
                    error={errors["smtp.fromName"]?.[0]}
                  >
                    <input
                      id="s-smtp-from-name"
                      type="text"
                      placeholder={t("settings.smtpFromNamePh")}
                      value={form.smtp.fromName}
                      onChange={(e) => setForm({ ...form, smtp: { ...form.smtp, fromName: e.target.value } })}
                    />
                  </LiyonField>

                  <LiyonField
                    label={t("settings.smtpFromEmail")}
                    htmlFor="s-smtp-from-email"
                    error={errors["smtp.fromEmail"]?.[0]}
                  >
                    <input
                      id="s-smtp-from-email"
                      type="email"
                      placeholder={t("settings.smtpFromEmailPh")}
                      value={form.smtp.fromEmail}
                      onChange={(e) => setForm({ ...form, smtp: { ...form.smtp, fromEmail: e.target.value } })}
                    />
                  </LiyonField>
                </div>

                {/* Test Email Section */}
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-primary" />
                    <span>{t("settings.smtpTestTitle")}</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">{t("settings.smtpTestDesc")}</p>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                    <input
                      type="email"
                      placeholder={t("settings.smtpTestToPh")}
                      value={testTo}
                      onChange={(e) => setTestTo(e.target.value)}
                      className="text-sm max-w-sm"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={testing || pending}
                      onClick={handleTestEmail}
                      className="inline-flex items-center gap-1.5 shrink-0"
                    >
                      {testing ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>{t("settings.smtpTesting")}</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          <span>{t("settings.smtpTestBtn")}</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {testResult && (
                    <div
                      className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                        testResult.success
                          ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900"
                          : "bg-destructive/10 text-destructive border border-destructive/20"
                      }`}
                    >
                      {testResult.success ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-destructive" />
                      )}
                      <span className="leading-relaxed">{testResult.message}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </LiyonCard>

        <LiyonCard>
          <h2>{t("settings.brandTitle")}</h2>
          <p>{t("settings.brandDesc")}</p>
          <PalettePicker value={form.palette} onChange={(p) => setForm({ ...form, palette: p })} label={t("settings.paletteLabel")} />
          {form.palette === "coral" && <p className="warn" role="note">{t("settings.coralWarn")}</p>}
        </LiyonCard>

        <div className="savebar"><Button type="button" onClick={save} disabled={pending}>{t("common.save")}</Button></div>
      </div>
    </>
  );
}

