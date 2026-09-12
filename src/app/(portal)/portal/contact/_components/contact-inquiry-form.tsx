"use client";

import * as React from "react";
import { Send, CheckCircle2, MessageSquare, Mail, AlertCircle } from "lucide-react";
import { useT } from "@/shared/lib/i18n/client";
import { Button } from "@/components/ui/button";

interface ContactInquiryFormProps {
  targetEmail?: string;
}

export function ContactInquiryForm({ targetEmail }: ContactInquiryFormProps) {
  const t = useT();
  const [name, setName] = React.useState("");
  const [contact, setContact] = React.useState("");
  const [topic, setTopic] = React.useState("general");
  const [message, setMessage] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError(t("portal.contact.formName") + " - กรุณาระบุข้อมูล");
      return;
    }
    if (!contact.trim()) {
      setError(t("portal.contact.formContact") + " - กรุณาระบุข้อมูล");
      return;
    }
    if (!message.trim()) {
      setError(t("portal.contact.formMsg") + " - กรุณาระบุข้อมูล");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 400);
  };

  const handleReset = () => {
    setName("");
    setContact("");
    setTopic("general");
    setMessage("");
    setSubmitted(false);
    setError("");
  };

  const mailtoHref = targetEmail
    ? `mailto:${targetEmail}?subject=${encodeURIComponent(`[สอบถามข้อมูล] ${topic}`)}&body=${encodeURIComponent(
        `ชื่อผู้ติดต่อ: ${name}\nช่องทางติดต่อกลับ: ${contact}\n\nข้อความ:\n${message}`
      )}`
    : undefined;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 sm:p-8">
      <div className="flex items-center gap-2.5 mb-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <MessageSquare className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {t("portal.contact.inquiryTitle")}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t("portal.contact.inquirySubtitle")}
          </p>
        </div>
      </div>

      {submitted ? (
        <div className="py-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
              {t("portal.contact.formSuccess")}
            </h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              ระบบได้บันทึกข้อความสอบถามของท่านเรียบร้อยแล้ว หรือสามารถติดต่อโดยตรงผ่านอีเมลกลาง
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
            >
              ส่งข้อความอื่นเพิ่มเติม
            </Button>
            {mailtoHref && (
              <a
                href={mailtoHref}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>เปิดในแอปเมล</span>
              </a>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="inq-name"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                {t("portal.contact.formName")} <span className="text-destructive">*</span>
              </label>
              <input
                id="inq-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น สมชาย ใจดี"
                className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="inq-contact"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                {t("portal.contact.formContact")} <span className="text-destructive">*</span>
              </label>
              <input
                id="inq-contact"
                type="text"
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="อีเมล หรือ เบอร์โทรศัพท์"
                className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="inq-topic"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              {t("portal.contact.formTopic")}
            </label>
            <select
              id="inq-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            >
              <option value="general">{t("portal.contact.topicGeneral")}</option>
              <option value="admissions">{t("portal.contact.topicAdmissions")}</option>
              <option value="meditation">{t("portal.contact.topicMeditation")}</option>
              <option value="reservations">{t("portal.contact.topicReservations")}</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="inq-msg"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              {t("portal.contact.formMsg")} <span className="text-destructive">*</span>
            </label>
            <textarea
              id="inq-msg"
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="ระบุข้อความ รายละเอียด หรือคำถามที่ต้องการติดต่อ..."
              className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <Button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? "กำลังส่ง..." : t("portal.contact.formSubmit")}</span>
            </Button>

            {targetEmail && (
              <a
                href={
                  mailtoHref ||
                  `mailto:${targetEmail}?subject=${encodeURIComponent("สอบถามข้อมูล")}`
                }
                className="text-xs text-muted-foreground hover:text-primary transition-colors text-center sm:text-right inline-flex items-center justify-center sm:justify-end gap-1"
              >
                <Mail className="w-3 h-3" />
                <span>หรือส่งอีเมลหาเราโดยตรง ({targetEmail})</span>
              </a>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
