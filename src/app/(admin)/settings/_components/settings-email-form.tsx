"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
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
import { LiyonCard, LiyonField } from "@/shared/components/liyon";
import { useT } from "@/shared/lib/i18n/client";
import type { TenantSettings } from "@/features/identity";
import { updateSettingsAction, testSmtpAction } from "@/features/identity/actions";
import { SettingsTabs } from "./settings-tabs";

export function SettingsEmailForm({ initial }: { initial: TenantSettings }) {
  const t = useT();
  const router = useRouter();
  const [form, setForm] = useState({
    enabled: initial.smtp?.enabled ?? false,
    user: initial.smtp?.user ?? "",
    pass: "",
    fromName: initial.smtp?.fromName ?? "",
    fromEmail: initial.smtp?.fromEmail ?? "",
  });
  const [showPass, setShowPass] = useState(false);
  const [testTo, setTestTo] = useState(initial.smtp?.user ?? "");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, start] = useTransition();

  async function handleTestEmail() {
    if (!testTo) {
      toast.error(t("settings.smtpTestToRequired"));
      return;
    }
    setTesting(true);
    setTestResult(null);

    try {
      const res = await testSmtpAction({
        user: form.user,
        pass: form.pass,
        to: testTo,
        fromName: form.fromName,
        fromEmail: form.fromEmail,
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
      const r = await updateSettingsAction({
        nameTh: initial.nameTh,
        nameEn: initial.nameEn,
        logoUrl: initial.logoUrl ?? "",
        palette: initial.palette,
        smtp: form,
      });
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
      <header className="ph">
        <div>
          <h1>{t("settings.title")}</h1>
          <p className="sub">{t("settings.smtpTitle")}</p>
        </div>
        <div className="acts">
          <Button disabled={pending} onClick={save}>
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                <span>{t("common.loading")}</span>
              </>
            ) : (
              t("common.save")
            )}
          </Button>
        </div>
      </header>

      <SettingsTabs />

      <div className="set-cards">
        <LiyonCard>
          <h2>{t("settings.smtpTitle")}</h2>
          <p>{t("settings.smtpDesc")}</p>

          <div className="fields space-y-4 pt-2">
            <div className="flex items-center gap-2.5 pb-2">
              <input
                id="s-smtp-enabled"
                type="checkbox"
                checked={form.enabled}
                onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                className="rounded border-slate-300 w-4 h-4 text-primary focus:ring-primary cursor-pointer"
              />
              <label htmlFor="s-smtp-enabled" className="text-sm font-medium cursor-pointer select-none">
                {t("settings.smtpEnabled")}
              </label>
            </div>

            {form.enabled && (
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
                    value={form.user}
                    onChange={(e) => {
                      const val = e.target.value;
                      setForm({ ...form, user: val });
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
                      value={form.pass}
                      onChange={(e) => setForm({ ...form, pass: e.target.value })}
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
                      value={form.fromName}
                      onChange={(e) => setForm({ ...form, fromName: e.target.value })}
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
                      value={form.fromEmail}
                      onChange={(e) => setForm({ ...form, fromEmail: e.target.value })}
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
                          ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50"
                          : "bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50"
                      }`}
                    >
                      {testResult.success ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <div>{testResult.message}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </LiyonCard>
      </div>
    </>
  );
}
