"use client";

import { useState, useTransition, useMemo } from "react";
import { Plus, Edit2, Trash2, Pin, PinOff, Newspaper, AlertCircle, Eye, Star, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { formatDate } from "@/shared/lib/format";
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
  LiyonSwitch,
  TinyEditor,
} from "@/shared/components/liyon";
import type { NewsArticleDto, NewsCategoryDto } from "@/features/news";
import {
  createNewsAction,
  updateNewsAction,
  deleteNewsAction,
  togglePinNewsAction,
  translateNewsWithGeminiAction,
} from "@/features/news/actions";

interface NewsClientProps {
  initialArticles: NewsArticleDto[];
  categories: NewsCategoryDto[];
  canManage: boolean;
  canPublish: boolean;
  canCreate: boolean;
}

export function NewsClient({
  initialArticles,
  categories,
  canManage,
  canPublish,
  canCreate,
}: NewsClientProps) {
  const t = useT();
  const locale = useLocale();
  const [articles, setArticles] = useState<NewsArticleDto[]>(initialArticles);
  const [isPending, startTransition] = useTransition();

  // Search & Filter States
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Dialog State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsArticleDto | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<NewsArticleDto | null>(null);

  // Form State
  const [formTitleTh, setFormTitleTh] = useState("");
  const [formTitleEn, setFormTitleEn] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formCategoryId, setFormCategoryId] = useState(categories[0]?.id ?? "");
  const [formStatus, setFormStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">("DRAFT");
  const [formCoverImageUrl, setFormCoverImageUrl] = useState("");
  const [formExcerptTh, setFormExcerptTh] = useState("");
  const [formExcerptEn, setFormExcerptEn] = useState("");
  const [formContentTh, setFormContentTh] = useState("");
  const [formContentEn, setFormContentEn] = useState("");
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [formIsFeatured, setFormIsFeatured] = useState(false);

  // Stats
  const stats = useMemo(() => ({
    total: articles.length,
    published: articles.filter((a) => a.status === "PUBLISHED").length,
    draft: articles.filter((a) => a.status === "DRAFT").length,
    pinned: articles.filter((a) => a.isPinned).length,
  }), [articles]);

  // Filtered Articles
  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      const matchSearch =
        !search ||
        a.titleTh.toLowerCase().includes(search.toLowerCase()) ||
        a.titleEn.toLowerCase().includes(search.toLowerCase()) ||
        a.slug.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCat === "ALL" || a.categoryId === selectedCat;
      const matchStatus = selectedStatus === "ALL" || a.status === selectedStatus;
      return matchSearch && matchCat && matchStatus;
    });
  }, [articles, search, selectedCat, selectedStatus]);

  function openCreateDialog() {
    setEditingItem(null);
    setFormTitleTh("");
    setFormTitleEn("");
    setFormSlug("");
    setFormCategoryId(categories[0]?.id ?? "");
    setFormStatus("DRAFT");
    setFormCoverImageUrl("");
    setFormExcerptTh("");
    setFormExcerptEn("");
    setFormContentTh("");
    setFormContentEn("");
    setFormIsPinned(false);
    setFormIsFeatured(false);
    setContentTab("th");
    setModalOpen(true);
  }

  function openEditDialog(item: NewsArticleDto) {
    setEditingItem(item);
    setFormTitleTh(item.titleTh);
    setFormTitleEn(item.titleEn);
    setFormSlug(item.slug);
    setFormCategoryId(item.categoryId);
    setFormStatus(item.status);
    setFormCoverImageUrl(item.coverImageUrl || "");
    setFormExcerptTh(item.excerptTh || "");
    setFormExcerptEn(item.excerptEn || "");
    setFormContentTh(item.contentTh);
    setFormContentEn(item.contentEn);
    setFormIsPinned(item.isPinned);
    setFormIsFeatured(item.isFeatured);
    setContentTab("th");
    setModalOpen(true);
  }

  const [contentTab, setContentTab] = useState<"th" | "en">("th");
  const [isTranslating, setIsTranslating] = useState(false);

  async function handleTranslateWithGemini() {
    if (!formTitleTh.trim()) {
      toast.error(t("news.aiRequireThai"));
      return;
    }

    setIsTranslating(true);
    try {
      const res = await translateNewsWithGeminiAction({
        titleTh: formTitleTh,
        excerptTh: formExcerptTh.trim() || undefined,
        contentTh: formContentTh.trim() || undefined,
      });

      if (res.ok) {
        toast.success(t("news.aiSuccess"));
        if (res.data.titleEn) setFormTitleEn(res.data.titleEn);
        if (res.data.excerptEn) setFormExcerptEn(res.data.excerptEn);
        if (res.data.contentEn) setFormContentEn(res.data.contentEn);
        if (res.data.slug && (!formSlug || formSlug === "" || formSlug === formTitleTh.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""))) {
          setFormSlug(res.data.slug);
        }
      } else {
        const msg = res.error?.fieldErrors?._form?.[0] || res.error?.message || t("common.error");
        toast.error(msg);
      }
    } catch {
      toast.error(t("common.error"));
    } finally {
      setIsTranslating(false);
    }
  }

  function handleSave() {
    if (!formTitleTh || !formTitleEn || !formSlug || !formCategoryId) {
      toast.error(t("error.validation"));
      return;
    }

    startTransition(async () => {
      if (editingItem) {
        const res = await updateNewsAction({
          id: editingItem.id,
          titleTh: formTitleTh,
          titleEn: formTitleEn,
          slug: formSlug,
          categoryId: formCategoryId,
          status: formStatus,
          coverImageUrl: formCoverImageUrl || null,
          excerptTh: formExcerptTh || null,
          excerptEn: formExcerptEn || null,
          contentTh: formContentTh,
          contentEn: formContentEn,
          isPinned: formIsPinned,
          isFeatured: formIsFeatured,
        });

        if (res.ok) {
          toast.success(t("news.saved"));
          setArticles((prev) => prev.map((a) => (a.id === res.data.id ? res.data : a)));
          setModalOpen(false);
        } else {
          toast.error(res.error.message || t("common.error"));
        }
      } else {
        const res = await createNewsAction({
          titleTh: formTitleTh,
          titleEn: formTitleEn,
          slug: formSlug,
          categoryId: formCategoryId,
          status: formStatus,
          coverImageUrl: formCoverImageUrl || null,
          excerptTh: formExcerptTh || null,
          excerptEn: formExcerptEn || null,
          contentTh: formContentTh,
          contentEn: formContentEn,
          isPinned: formIsPinned,
          isFeatured: formIsFeatured,
        });

        if (res.ok) {
          toast.success(t("news.saved"));
          setArticles((prev) => [res.data, ...prev]);
          setModalOpen(false);
        } else {
          toast.error(res.error.message || t("common.error"));
        }
      }
    });
  }

  function handleDelete(item: NewsArticleDto) {
    startTransition(async () => {
      const res = await deleteNewsAction(item.id);
      if (res.ok) {
        toast.success(t("news.deleted"));
        setArticles((prev) => prev.filter((a) => a.id !== item.id));
        setDeleteConfirmItem(null);
      } else {
        toast.error(res.error.message || t("common.error"));
      }
    });
  }

  function handleTogglePin(item: NewsArticleDto) {
    startTransition(async () => {
      const res = await togglePinNewsAction(item.id);
      if (res.ok) {
        setArticles((prev) =>
          prev.map((a) => (a.id === item.id ? { ...a, isPinned: res.data } : a))
        );
      } else {
        toast.error(res.error.message || t("common.error"));
      }
    });
  }

  const columns: DataTableColumn<NewsArticleDto>[] = [
    {
      key: "title",
      header: t("news.titleTh"),
      render: (row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {row.isPinned && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded">
                <Pin className="h-3 w-3" />
                {t("news.isPinned")}
              </span>
            )}
            {row.isFeatured && (
              <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded">
                <Star className="h-3 w-3" />
                {t("news.isFeatured")}
              </span>
            )}
            <span className="font-medium">{locale === "en" ? row.titleEn : row.titleTh}</span>
          </div>
          <p className="text-xs text-muted-foreground font-mono">/{row.slug}</p>
        </div>
      ),
    },
    {
      key: "category",
      header: t("news.category"),
      className: "nowrap text-sm",
      render: (row) => (
        <span className="text-muted-foreground">
          {locale === "en" ? row.categoryNameEn : row.categoryNameTh}
        </span>
      ),
    },
    {
      key: "status",
      header: t("news.status"),
      className: "nowrap",
      render: (row) => {
        const tone = row.status === "PUBLISHED" ? "ok" : row.status === "DRAFT" ? "warn" : "off";
        const labelKey =
          row.status === "PUBLISHED"
            ? "news.status.published"
            : row.status === "DRAFT"
            ? "news.status.draft"
            : "news.status.archived";
        return <StatusPill tone={tone}>{t(labelKey)}</StatusPill>;
      },
    },
    {
      key: "views",
      header: t("news.views"),
      className: "num nowrap text-sm text-muted-foreground",
      render: (row) => (
        <span className="inline-flex items-center gap-1">
          <Eye className="h-3.5 w-3.5" />
          {row.viewCount}
        </span>
      ),
    },
    {
      key: "publishedAt",
      header: t("news.publishedAt"),
      className: "nowrap text-xs text-muted-foreground",
      render: (row) => (
        <span>{row.publishedAt ? formatDate(new Date(row.publishedAt), locale) : "—"}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("news.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("news.subtitle")}</p>
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={openCreateDialog}
            className="btn pri gap-2 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            {t("news.create")}
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <LiyonCard className="p-4">
          <p className="text-xs text-muted-foreground">{t("news.stat.total")}</p>
          <p className="text-2xl font-bold mt-1">{stats.total}</p>
        </LiyonCard>
        <LiyonCard className="p-4">
          <p className="text-xs text-muted-foreground">{t("news.stat.published")}</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.published}</p>
        </LiyonCard>
        <LiyonCard className="p-4">
          <p className="text-xs text-muted-foreground">{t("news.stat.draft")}</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{stats.draft}</p>
        </LiyonCard>
        <LiyonCard className="p-4">
          <p className="text-xs text-muted-foreground">{t("news.stat.pinned")}</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.pinned}</p>
        </LiyonCard>
      </div>

      {/* Main Table Card */}
      <LiyonCard>
        <div className="p-4 border-b border-border flex flex-col md:flex-row gap-3">
          <input
            className="inp flex-1"
            placeholder={t("news.portal.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex gap-2">
            <LiyonSelect
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
            >
              <option value="ALL">{t("news.allCategories")}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {locale === "en" ? c.nameEn : c.nameTh}
                </option>
              ))}
            </LiyonSelect>
            <LiyonSelect
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="ALL">{t("news.allStatuses")}</option>
              <option value="PUBLISHED">{t("news.status.published")}</option>
              <option value="DRAFT">{t("news.status.draft")}</option>
              <option value="ARCHIVED">{t("news.status.archived")}</option>
            </LiyonSelect>
          </div>
        </div>

        <DataTable<NewsArticleDto>
          headHeading={<span className="font-semibold text-sm">{t("news.title")}</span>}
          state={filteredArticles.length === 0 ? "empty" : "data"}
          rows={filteredArticles}
          columns={columns}
          getRowId={(row) => row.id}
          renderRowMenu={
            canManage || canPublish
              ? (row) => (
                  <>
                    {canPublish && (
                      <RowMenuItem
                        onSelect={() => handleTogglePin(row)}
                        icon={row.isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                      >
                        {row.isPinned ? "ยกเลิกปักหมุด" : t("news.isPinned")}
                      </RowMenuItem>
                    )}
                    {canManage && (
                      <>
                        <RowMenuItem onSelect={() => openEditDialog(row)} icon={<Edit2 className="h-4 w-4" />}>
                          {t("news.edit")}
                        </RowMenuItem>
                        <RowMenuItem onSelect={() => setDeleteConfirmItem(row)} danger icon={<Trash2 className="h-4 w-4" />}>
                          {t("news.delete")}
                        </RowMenuItem>
                      </>
                    )}
                  </>
                )
              : undefined
          }
          empty={{
            icon: <Newspaper className="h-10 w-10 text-muted-foreground/50" />,
            title: t("news.empty"),
            description: t("news.subtitle"),
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
          title={editingItem ? t("news.edit") : t("news.create")}
          description={t("news.subtitle")}
        />
        <LiyonDialogBody>
          <div className="space-y-4 py-2">
            {/* AI Bilingual Assistant Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-purple-50/90 border border-blue-200/80 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-purple-950/40 dark:border-blue-800/60 shadow-xs">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
                    {t("news.aiHelperTitle")}
                  </h4>
                  <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                    {t("news.aiHelperDesc")}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleTranslateWithGemini}
                disabled={isTranslating || !formTitleTh.trim()}
                className="btn pri sm gap-1.5 text-xs shrink-0 self-end sm:self-center shadow-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                title={!formTitleTh.trim() ? t("news.aiRequireThai") : t("news.aiTranslate")}
              >
                {isTranslating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{t("news.aiTranslating")}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t("news.aiTranslate")}</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField label={t("news.titleTh")}>
                <input
                  className="inp"
                  value={formTitleTh}
                  onChange={(e) => {
                    setFormTitleTh(e.target.value);
                    if (!editingItem && !formSlug) {
                      setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
                    }
                  }}
                  placeholder="เช่น เปิดรับสมัครนักศึกษาใหม่ 2570"
                />
              </LiyonField>
              <LiyonField label={t("news.titleEn")}>
                <input
                  className="inp"
                  value={formTitleEn}
                  onChange={(e) => {
                    setFormTitleEn(e.target.value);
                    if (!editingItem && !formSlug) {
                      setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
                    }
                  }}
                  placeholder="e.g. Admission Open 2027"
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <LiyonField label={t("news.slug")}>
                <input
                  className="inp font-mono text-sm"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value.toLowerCase())}
                  placeholder="admission-open-2027"
                />
              </LiyonField>
              <LiyonField label={t("news.category")}>
                <LiyonSelect
                  value={formCategoryId}
                  onChange={(e) => setFormCategoryId(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {locale === "en" ? c.nameEn : c.nameTh}
                    </option>
                  ))}
                </LiyonSelect>
              </LiyonField>
              <LiyonField label={t("news.status")}>
                <LiyonSelect
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as "DRAFT" | "PUBLISHED" | "ARCHIVED")}
                >
                  <option value="DRAFT">{t("news.status.draft")}</option>
                  <option value="PUBLISHED">{t("news.status.published")}</option>
                  <option value="ARCHIVED">{t("news.status.archived")}</option>
                </LiyonSelect>
              </LiyonField>
            </div>

            <LiyonField label={t("news.coverImage")}>
              <input
                className="inp text-sm font-mono"
                value={formCoverImageUrl}
                onChange={(e) => setFormCoverImageUrl(e.target.value)}
                placeholder="https://example.com/cover.jpg"
              />
            </LiyonField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField label={t("news.excerptTh")}>
                <textarea
                  className="inp min-h-[70px]"
                  value={formExcerptTh}
                  onChange={(e) => setFormExcerptTh(e.target.value)}
                  placeholder="เนื้อหาย่อสำหรับแสดงในการ์ดข่าว..."
                />
              </LiyonField>
              <LiyonField label={t("news.excerptEn")}>
                <textarea
                  className="inp min-h-[70px]"
                  value={formExcerptEn}
                  onChange={(e) => setFormExcerptEn(e.target.value)}
                  placeholder="Short excerpt for news preview cards..."
                />
              </LiyonField>
            </div>

            {/* News Content with TinyEditor */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between border-b border-border pb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("news.content")}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-medium">
                    Tiny Editor
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setContentTab("th")}
                    className={`px-3 py-1 rounded-md transition-all ${
                      contentTab === "th"
                        ? "bg-background text-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    เนื้อหาภาษาไทย *
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentTab("en")}
                    className={`px-3 py-1 rounded-md transition-all ${
                      contentTab === "en"
                        ? "bg-background text-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    English Content *
                  </button>
                </div>
              </div>

              {contentTab === "th" ? (
                <LiyonField label={t("news.contentTh")}>
                  <TinyEditor
                    value={formContentTh}
                    onChange={setFormContentTh}
                    placeholder="พิมพ์เนื้อหาข่าวภาษาไทยฉบับสมบูรณ์ (สามารถจัดหัวข้อ ตัวหนา ตัวเอียง รายการ ลิงก์ ฯลฯ)..."
                    minHeight="200px"
                  />
                </LiyonField>
              ) : (
                <LiyonField label={t("news.contentEn")}>
                  <TinyEditor
                    value={formContentEn}
                    onChange={setFormContentEn}
                    placeholder="Full English news content (headings, bold, italic, lists, links, blockquote)..."
                    minHeight="200px"
                  />
                </LiyonField>
              )}
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <LiyonSwitch checked={formIsPinned} onCheckedChange={setFormIsPinned} />
                <span>{t("news.isPinned")}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <LiyonSwitch checked={formIsFeatured} onCheckedChange={setFormIsFeatured} />
                <span>{t("news.isFeatured")}</span>
              </label>
            </div>
          </div>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <button
            type="button"
            className="btn sec"
            onClick={() => setModalOpen(false)}
            disabled={isPending}
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            className="btn pri"
            onClick={handleSave}
            disabled={isPending}
          >
            {t("common.save")}
          </button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* Delete Confirmation Dialog */}
      <LiyonDialog
        open={!!deleteConfirmItem}
        onOpenChange={(open) => !open && setDeleteConfirmItem(null)}
        danger
      >
        <LiyonDialogHeader
          title={t("news.delete")}
          description={t("news.deleteConfirm")}
        />
        <LiyonDialogBody>
          <p className="text-sm font-medium">
            {deleteConfirmItem && (locale === "en" ? deleteConfirmItem.titleEn : deleteConfirmItem.titleTh)}
          </p>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <button
            type="button"
            className="btn sec"
            onClick={() => setDeleteConfirmItem(null)}
            disabled={isPending}
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            className="btn danger"
            onClick={() => deleteConfirmItem && handleDelete(deleteConfirmItem)}
            disabled={isPending}
          >
            {t("news.delete")}
          </button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}
