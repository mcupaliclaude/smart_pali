import { requirePermission, hasPermission } from "@/features/identity/server";
import { NEWS_P, listAdminNews, listNewsCategories } from "@/features/news/server";
import { NewsClient } from "./_components/news-client";

export default async function NewsAdminPage() {
  const ctx = await requirePermission(NEWS_P.newsRead);
  const [initialArticles, categories] = await Promise.all([
    listAdminNews(ctx.tenantId),
    listNewsCategories(ctx.tenantId),
  ]);

  return (
    <NewsClient
      initialArticles={initialArticles}
      categories={categories}
      canManage={hasPermission(ctx, NEWS_P.newsManage)}
      canPublish={hasPermission(ctx, NEWS_P.newsPublish)}
      canCreate={hasPermission(ctx, NEWS_P.newsCreate)}
    />
  );
}
