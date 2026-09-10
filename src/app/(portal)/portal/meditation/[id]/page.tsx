import { notFound } from "next/navigation";
import { getLocale } from "@/shared/lib/i18n/server";
import { prisma } from "@/shared/lib/infra/prisma";
import { getPublicCourseById } from "@/features/meditation/server";
import { CourseDetailClient } from "./_components/course-detail-client";

interface MeditationDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function MeditationDetailPage({
  params,
}: MeditationDetailPageProps) {
  const locale = await getLocale();
  const { id } = await params;

  const defaultTenant = await prisma.tenant.findFirst({
    where: { isActive: true },
    select: { id: true },
  });
  const tenantId = defaultTenant?.id ?? "";

  const course = await getPublicCourseById(tenantId, id);
  if (!course) {
    notFound();
  }

  return <CourseDetailClient course={course} locale={locale} />;
}
