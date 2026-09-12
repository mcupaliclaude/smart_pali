"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, ImageIcon, Trash2, Loader2, Sparkles, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiyonCard, LiyonField, PalettePicker } from "@/shared/components/liyon";
import { useT } from "@/shared/lib/i18n/client";
import type { PaletteId } from "@/shared/lib/palette";
import type { TenantSettings } from "@/features/identity";
import { updateSettingsAction, uploadLogoAction, testGeminiApiAction } from "@/features/identity/actions";
import { SettingsTabs } from "./settings-tabs";

export function SettingsForm({ initial }: { initial: TenantSettings }) {
  const t = useT();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    nameTh: initial.nameTh,
    nameEn: initial.nameEn,
    logoUrl: initial.logoUrl ?? "",
    palette: initial.palette as PaletteId,
    contact: {
      addressTh: initial.contact?.addressTh ?? "",
      addressEn: initial.contact?.addressEn ?? "",
      phone: initial.contact?.phone ?? "",
      email: initial.contact?.email ?? "",
      hoursTh: initial.contact?.hoursTh ?? "",
      hoursEn: initial.contact?.hoursEn ?? "",
      facebook: initial.contact?.facebook ?? "",
      line: initial.contact?.line ?? "",
      mapUrl: initial.contact?.mapUrl ?? "",
    },
    ai: {
      geminiApiKey: "",
      geminiModel: initial.ai?.geminiModel || "gemini-2.5-flash",
    },
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, start] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingAi, setIsTestingAi] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [hasApiKeyConfigured, setHasApiKeyConfigured] = useState(Boolean(initial.ai?.hasGeminiApiKey));

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
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadLogoAction(formData);
      if (res.ok) {
        if (res.data?.url) setForm((prev) => ({ ...prev, logoUrl: res.data.url }));
        toast.success(t("settings.uploadSuccess"));
      } else {
        toast.error(res.error.message || t("settings.uploadFailed"));
      }
    } catch {
      toast.error(t("settings.uploadFailed"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function save() {
    start(async () => {
      const r = await updateSettingsAction({
        nameTh: form.nameTh,
        nameEn: form.nameEn,
        logoUrl: form.logoUrl,
        palette: form.palette,
        contact: form.contact,
        ai: {
          geminiApiKey: form.ai.geminiApiKey,
          geminiModel: form.ai.geminiModel,
        },
        smtp: initial.smtp
          ? {
              enabled: initial.smtp.enabled,
              user: initial.smtp.user,
              pass: "",
              fromName: initial.smtp.fromName,
              fromEmail: initial.smtp.fromEmail,
            }
          : undefined,
      });
      if (!r.ok) {
        setErrors(r.error.fieldErrors ?? {});
        if (!r.error.fieldErrors) toast.error(t(`error.${r.error.code}`));
        return;
      }
      setErrors({});
      if (form.ai.geminiApiKey) {
        setHasApiKeyConfigured(true);
      }
      toast.success(t("settings.saveOk"));
      router.refresh();
    });
  }

  async function handleTestAi() {
    setIsTestingAi(true);
    setTestResult(null);
    try {
      const res = await testGeminiApiAction({
        apiKey: form.ai.geminiApiKey.trim() || undefined,
        model: form.ai.geminiModel,
      });
      if (res.ok) {
        toast.success(res.data.message || t("settings.testAiOk"));
        setTestResult({ ok: true, message: res.data.message || t("settings.testAiOk") });
      } else {
        const msg = res.error?.fieldErrors?._form?.[0] || res.error?.fieldErrors?.apiKey?.[0] || res.error?.message || t("settings.testAiFail");
        toast.error(msg);
        setTestResult({ ok: false, message: msg });
      }
    } catch {
      toast.error(t("settings.testAiFail"));
      setTestResult({ ok: false, message: t("settings.testAiFail") });
    } finally {
      setIsTestingAi(false);
    }
  }

  return (
    <>
      <header className="ph">
        <div>
          <h1>{t("settings.title")}</h1>
          <p className="sub">{t("settings.orgTitle")}</p>
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

      <div className="set-cards space-y-6">
        {/* Organization Information Card */}
        <LiyonCard>
          <h2>{t("settings.orgTitle")}</h2>
          <div className="fields space-y-4">
            <LiyonField label={t("settings.nameTh")} htmlFor="s-name-th" error={errors.nameTh?.[0]}>
              <input
                id="s-name-th"
                value={form.nameTh}
                onChange={(e) => setForm({ ...form, nameTh: e.target.value })}
              />
            </LiyonField>
            <LiyonField label={t("settings.nameEn")} htmlFor="s-name-en" error={errors.nameEn?.[0]}>
              <input
                id="s-name-en"
                value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
              />
            </LiyonField>
            <LiyonField
              label={t("settings.logoUrl")}
              htmlFor="s-logo"
              hint={t("settings.uploadHint")}
              error={errors.logoUrl?.[0]}
            >
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

        {/* Contact Information Card */}
        <LiyonCard>
          <h2>{t("settings.contactTitle")}</h2>
          <p>{t("settings.contactDesc")}</p>

          <div className="fields space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LiyonField
                label={t("settings.contactAddressTh")}
                htmlFor="c-address-th"
                error={errors["contact.addressTh"]?.[0]}
              >
                <textarea
                  id="c-address-th"
                  rows={3}
                  placeholder={t("settings.contactAddressThPh")}
                  value={form.contact.addressTh}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      contact: { ...form.contact, addressTh: e.target.value },
                    })
                  }
                  className="w-full text-sm rounded-md border border-input bg-background px-3 py-2"
                />
              </LiyonField>

              <LiyonField
                label={t("settings.contactAddressEn")}
                htmlFor="c-address-en"
                error={errors["contact.addressEn"]?.[0]}
              >
                <textarea
                  id="c-address-en"
                  rows={3}
                  placeholder={t("settings.contactAddressEnPh")}
                  value={form.contact.addressEn}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      contact: { ...form.contact, addressEn: e.target.value },
                    })
                  }
                  className="w-full text-sm rounded-md border border-input bg-background px-3 py-2"
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LiyonField
                label={t("settings.contactPhone")}
                htmlFor="c-phone"
                error={errors["contact.phone"]?.[0]}
              >
                <input
                  id="c-phone"
                  type="text"
                  placeholder={t("settings.contactPhonePh")}
                  value={form.contact.phone}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      contact: { ...form.contact, phone: e.target.value },
                    })
                  }
                />
              </LiyonField>

              <LiyonField
                label={t("settings.contactEmail")}
                htmlFor="c-email"
                error={errors["contact.email"]?.[0]}
              >
                <input
                  id="c-email"
                  type="email"
                  placeholder={t("settings.contactEmailPh")}
                  value={form.contact.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      contact: { ...form.contact, email: e.target.value },
                    })
                  }
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LiyonField
                label={t("settings.contactHoursTh")}
                htmlFor="c-hours-th"
                error={errors["contact.hoursTh"]?.[0]}
              >
                <input
                  id="c-hours-th"
                  type="text"
                  placeholder={t("settings.contactHoursThPh")}
                  value={form.contact.hoursTh}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      contact: { ...form.contact, hoursTh: e.target.value },
                    })
                  }
                />
              </LiyonField>

              <LiyonField
                label={t("settings.contactHoursEn")}
                htmlFor="c-hours-en"
                error={errors["contact.hoursEn"]?.[0]}
              >
                <input
                  id="c-hours-en"
                  type="text"
                  placeholder={t("settings.contactHoursEnPh")}
                  value={form.contact.hoursEn}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      contact: { ...form.contact, hoursEn: e.target.value },
                    })
                  }
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <LiyonField
                label={t("settings.contactFacebook")}
                htmlFor="c-facebook"
                error={errors["contact.facebook"]?.[0]}
              >
                <input
                  id="c-facebook"
                  type="text"
                  placeholder={t("settings.contactFacebookPh")}
                  value={form.contact.facebook}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      contact: { ...form.contact, facebook: e.target.value },
                    })
                  }
                />
              </LiyonField>

              <LiyonField
                label={t("settings.contactLine")}
                htmlFor="c-line"
                error={errors["contact.line"]?.[0]}
              >
                <input
                  id="c-line"
                  type="text"
                  placeholder={t("settings.contactLinePh")}
                  value={form.contact.line}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      contact: { ...form.contact, line: e.target.value },
                    })
                  }
                />
              </LiyonField>

              <LiyonField
                label={t("settings.contactMapUrl")}
                htmlFor="c-map"
                error={errors["contact.mapUrl"]?.[0]}
              >
                <input
                  id="c-map"
                  type="text"
                  placeholder={t("settings.contactMapUrlPh")}
                  value={form.contact.mapUrl}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      contact: { ...form.contact, mapUrl: e.target.value },
                    })
                  }
                />
              </LiyonField>
            </div>
          </div>
        </LiyonCard>

        {/* Google Gemini AI Connection Card */}
        <LiyonCard>
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold">{t("settings.aiTitle")}</h2>
                <p className="text-xs text-muted-foreground">{t("settings.aiDesc")}</p>
              </div>
            </div>
            <div>
              {hasApiKeyConfigured ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t("settings.aiConfigured")}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{t("settings.aiNotConfigured")}</span>
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <LiyonField
              label={t("settings.geminiApiKey")}
              htmlFor="c-gemini-key"
              error={errors["ai.geminiApiKey"]?.[0]}
            >
              <div className="relative flex items-center">
                <input
                  id="c-gemini-key"
                  type={showApiKey ? "text" : "password"}
                  className="inp font-mono pr-10"
                  placeholder={hasApiKeyConfigured ? (initial.ai?.geminiApiKeyMasked || "••••••••••••••••••••••••••••••") : t("settings.geminiApiKeyPh")}
                  value={form.ai.geminiApiKey}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      ai: { ...form.ai, geminiApiKey: e.target.value },
                    })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2.5 text-muted-foreground hover:text-foreground p-1 transition-colors"
                  title={showApiKey ? "Hide Key" : "Show Key"}
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t("settings.geminiApiKeyHelp")}
              </p>
            </LiyonField>

            <LiyonField
              label={t("settings.geminiModel")}
              htmlFor="c-gemini-model"
              error={errors["ai.geminiModel"]?.[0]}
            >
              <select
                id="c-gemini-model"
                className="inp"
                value={form.ai.geminiModel}
                onChange={(e) =>
                  setForm({
                    ...form,
                    ai: { ...form.ai, geminiModel: e.target.value },
                  })
                }
              >
                <option value="gemini-2.5-flash">{t("settings.geminiModel25Flash")}</option>
                <option value="gemini-2.0-flash">{t("settings.geminiModel20Flash")}</option>
                <option value="gemini-1.5-flash">{t("settings.geminiModel15Flash")}</option>
              </select>
            </LiyonField>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border mt-4">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestAi}
                disabled={isTestingAi}
                className="gap-2"
              >
                {isTestingAi ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{t("settings.testingAi")}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    <span>{t("settings.testAi")}</span>
                  </>
                )}
              </Button>
              {form.ai.geminiApiKey && (
                <button
                  type="button"
                  onClick={() => {
                    setForm({ ...form, ai: { ...form.ai, geminiApiKey: "" } });
                  }}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors underline"
                >
                  {t("settings.aiClearKey")}
                </button>
              )}
            </div>

            {testResult && (
              <div
                className={`text-xs px-3 py-1.5 rounded-md flex items-center gap-1.5 ${
                  testResult.ok
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                    : "bg-destructive/10 text-destructive border border-destructive/20"
                }`}
              >
                {testResult.ok ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>
        </LiyonCard>

        {/* Color Palette Card */}
        <LiyonCard>
          <h2>{t("settings.brandTitle")}</h2>
          <p>{t("settings.brandDesc")}</p>
          <PalettePicker
            value={form.palette}
            onChange={(p) => setForm({ ...form, palette: p })}
            label={t("settings.paletteLabel")}
          />
          {form.palette === "coral" && (
            <p className="warn" role="note">
              {t("settings.coralWarn")}
            </p>
          )}
        </LiyonCard>

        <div className="savebar">
          <Button type="button" onClick={save} disabled={pending}>
            {pending ? t("common.loading") : t("common.save")}
          </Button>
        </div>
      </div>
    </>
  );
}
