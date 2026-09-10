import Link from "next/link";
import { Search, Pin, Eye, Calendar, ArrowRight, Newspaper } from "lucide-react";
import { getLocale } from "@/shared/lib/i18n/server";
import { formatDate } from "@/shared/lib/format";
import { listPublishedNews, listNewsCategories } from "@/features/news/server";
import { prisma } from "@/shared/lib/infra/prisma";

interface NewsPortalPageProps {
  searchParams: Promise<{ category?: string; q?: string }>;
}

export default async function NewsPortalPage({ searchParams }: NewsPortalPageProps) {
  const locale = await getLocale();
  const params = await searchParams;
  const currentCategory = params.category;
  const searchQuery = params.q;

  // Get demo tenant ID
  const demoTenant = await prisma.tenant.findUnique({
    where: { code: "DEMO" },
    select: { id: true },
  });
  const tenantId = demoTenant?.id ?? "";

  const [articles, categories] = await Promise.all([
    listPublishedNews(tenantId, {
      categoryCode: currentCategory,
      search: searchQuery,
      limit: 30,
    }),
    listNewsCategories(tenantId),
  ]);

  const featuredArticle = articles.find((a) => a.isFeatured) || articles[0];
  const listArticles = articles.filter((a) => a.id !== featuredArticle?.id);

  return (
    <div className="space-y-10">
      {/* Hero Banner / Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
          <Newspaper className="h-3.5 w-3.5" />
          {locale === "en" ? "Faculty News & Updates" : "ข่าวสารและประชาสัมพันธ์"}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          {locale === "en" ? "Latest Announcements" : "ข่าวสารและกิจกรรมล่าสุด"}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          {locale === "en"
            ? "Stay informed with the latest updates, academic achievements, events, and opportunities."
            : "ติดตามความเคลื่อนไหว กิจกรรมวิชาการ การประกาศรับสมัคร และข่าวสารสำคัญของคณะ"}
        </p>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          <Link
            href="/portal/news"
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              !currentCategory
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {locale === "en" ? "All Categories" : "ทุกหมวดหมู่"}
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/portal/news?category=${c.code}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                currentCategory === c.code
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {locale === "en" ? c.nameEn : c.nameTh}
            </Link>
          ))}
        </div>

        {/* Search Bar */}
        <form method="GET" action="/portal/news" className="w-full md:w-72 flex items-center relative">
          {currentCategory && <input type="hidden" name="category" value={currentCategory} />}
          <Search className="h-4 w-4 absolute left-3 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            name="q"
            defaultValue={searchQuery ?? ""}
            placeholder={locale === "en" ? "Search news..." : "ค้นหาข่าว..."}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </form>
      </div>

      {/* Featured Headline Article (if exists and no specific search) */}
      {featuredArticle && !searchQuery && (
        <div className="relative rounded-2xl overflow-hidden border border-border/60 bg-card shadow-sm hover:shadow-md transition-shadow group">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            <div className="lg:col-span-7 relative min-h-[260px] lg:min-h-[380px] bg-muted overflow-hidden">
              {featuredArticle.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={featuredArticle.coverImageUrl}
                  alt={locale === "en" ? featuredArticle.titleEn : featuredArticle.titleTh}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                  <Newspaper className="h-20 w-20" />
                </div>
              )}
              {featuredArticle.isPinned && (
                <div className="absolute top-4 left-4 inline-flex items-center gap-1 text-xs font-semibold bg-amber-500 text-white px-2.5 py-1 rounded-md shadow-xs">
                  <Pin className="h-3 w-3" />
                  {locale === "en" ? "Pinned Highlight" : "ข่าวปักหมุด"}
                </div>
              )}
            </div>

            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-primary">
                    {locale === "en" ? featuredArticle.categoryNameEn : featuredArticle.categoryNameTh}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {featuredArticle.publishedAt ? formatDate(new Date(featuredArticle.publishedAt), locale) : "—"}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold leading-snug group-hover:text-primary transition-colors">
                  <Link href={`/portal/news/${featuredArticle.slug}`}>
                    {locale === "en" ? featuredArticle.titleEn : featuredArticle.titleTh}
                  </Link>
                </h2>

                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                  {locale === "en"
                    ? featuredArticle.excerptEn || featuredArticle.contentEn
                    : featuredArticle.excerptTh || featuredArticle.contentTh}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-border/50 flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" />
                  {featuredArticle.viewCount} {locale === "en" ? "views" : "ครั้ง"}
                </span>
                <Link
                  href={`/portal/news/${featuredArticle.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:underline"
                >
                  {locale === "en" ? "Read full story" : "อ่านรายละเอียด"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Other News */}
      {listArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listArticles.map((article) => (
            <article
              key={article.id}
              className="group flex flex-col rounded-xl overflow-hidden border border-border/60 bg-card hover:border-primary/40 hover:shadow-md transition-all"
            >
              <div className="relative aspect-16/9 bg-muted overflow-hidden">
                {article.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={article.coverImageUrl}
                    alt={locale === "en" ? article.titleEn : article.titleTh}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                    <Newspaper className="h-12 w-12" />
                  </div>
                )}
                {article.isPinned && (
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1 text-xs font-semibold bg-amber-500 text-white px-2 py-0.5 rounded shadow-xs">
                    <Pin className="h-3 w-3" />
                    {locale === "en" ? "Pinned" : "ปักหมุด"}
                  </span>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-semibold text-primary">
                      {locale === "en" ? article.categoryNameEn : article.categoryNameTh}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {article.publishedAt ? formatDate(new Date(article.publishedAt), locale) : "—"}
                    </span>
                  </div>

                  <h3 className="font-bold text-base line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                    <Link href={`/portal/news/${article.slug}`}>
                      {locale === "en" ? article.titleEn : article.titleTh}
                    </Link>
                  </h3>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {locale === "en"
                      ? article.excerptEn || article.contentEn
                      : article.excerptTh || article.contentTh}
                  </p>
                </div>

                <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {article.viewCount}
                  </span>
                  <Link
                    href={`/portal/news/${article.slug}`}
                    className="font-medium text-primary hover:underline inline-flex items-center gap-0.5"
                  >
                    {locale === "en" ? "Read more" : "อ่านต่อ"}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        !featuredArticle && (
          <div className="text-center py-16 border border-dashed border-border rounded-xl">
            <Newspaper className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="text-base font-semibold">{locale === "en" ? "No News Found" : "ไม่พบข้อมูลข่าวสาร"}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {locale === "en"
                ? "Try adjusting your search query or category filter."
                : "ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่น"}
            </p>
          </div>
        )
      )}
    </div>
  );
}
