import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Eye, Share2 } from "lucide-react";
import { getLocale } from "@/shared/lib/i18n/server";
import { formatDate } from "@/shared/lib/format";
import { getNewsBySlug } from "@/features/news/server";
import { prisma } from "@/shared/lib/infra/prisma";

interface NewsDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const locale = await getLocale();
  const { slug } = await params;

  // Get demo tenant ID
  const demoTenant = await prisma.tenant.findUnique({
    where: { code: "DEMO" },
    select: { id: true },
  });
  const tenantId = demoTenant?.id ?? "";

  const article = await getNewsBySlug(tenantId, slug, true);
  if (!article) notFound();

  const title = locale === "en" ? article.titleEn : article.titleTh;
  const categoryName = locale === "en" ? article.categoryNameEn : article.categoryNameTh;
  const excerpt = locale === "en" ? article.excerptEn : article.excerptTh;
  const content = locale === "en" ? article.contentEn : article.contentTh;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back button */}
      <Link
        href="/portal/news"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {locale === "en" ? "Back to All News" : "กลับหน้ารวมข่าวสาร"}
      </Link>

      {/* Header Info */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-md">
            {categoryName}
          </span>
          <span className="text-muted-foreground">•</span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {article.publishedAt ? formatDate(new Date(article.publishedAt), locale) : "—"}
          </span>
          <span className="text-muted-foreground">•</span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Eye className="h-3.5 w-3.5" />
            {article.viewCount} {locale === "en" ? "views" : "ครั้ง"}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-snug">
          {title}
        </h1>

        {excerpt && (
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed border-l-4 border-primary/40 pl-4 py-1 italic bg-muted/30 rounded-r-md">
            {excerpt}
          </p>
        )}
      </div>

      {/* Cover Image */}
      {article.coverImageUrl && (
        <div className="rounded-2xl overflow-hidden border border-border bg-muted aspect-16/9 relative shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.coverImageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Main Body Content */}
      {/<[a-z][\s\S]*>/i.test(content) ? (
        <article
          className="prose prose-slate dark:prose-invert max-w-none text-base leading-relaxed py-4 border-b border-border [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/50 [&_blockquote]:pl-4 [&_blockquote]:italic [&_a]:text-primary [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : (
        <article className="prose prose-slate dark:prose-invert max-w-none text-base leading-relaxed whitespace-pre-line py-4 border-b border-border">
          {content}
        </article>
      )}

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        <Link
          href="/portal/news"
          className="btn sec inline-flex items-center gap-2 text-xs"
        >
          <ArrowLeft className="h-4 w-4" />
          {locale === "en" ? "Back to News Center" : "กลับศูนย์ข่าวสาร"}
        </Link>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Share2 className="h-4 w-4" />
          <span>{locale === "en" ? "Share this news" : "แชร์ข่าวนี้"}</span>
        </div>
      </div>
    </div>
  );
}
