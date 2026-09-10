-- CreateEnum
CREATE TYPE "AlumniDegreeLevel" AS ENUM ('BACHELOR', 'MASTER', 'DOCTORAL', 'DIPLOMA');

-- CreateEnum
CREATE TYPE "AlumniStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateTable
CREATE TABLE "alumni_members" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "student_id" VARCHAR(50),
    "full_name_th" VARCHAR(255) NOT NULL,
    "full_name_en" VARCHAR(255),
    "graduation_year_be" INTEGER NOT NULL,
    "degree_level" "AlumniDegreeLevel" NOT NULL DEFAULT 'BACHELOR',
    "major_th" VARCHAR(255) NOT NULL,
    "major_en" VARCHAR(255),
    "current_workplace" VARCHAR(255),
    "job_title" VARCHAR(255),
    "phone" VARCHAR(50),
    "email" VARCHAR(255),
    "linkedin_url" VARCHAR(500),
    "avatar_url" VARCHAR(500),
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "is_spotlight" BOOLEAN NOT NULL DEFAULT false,
    "spotlight_quote_th" TEXT,
    "spotlight_quote_en" TEXT,
    "status" "AlumniStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "alumni_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alumni_stories" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "title_th" VARCHAR(255) NOT NULL,
    "title_en" VARCHAR(255) NOT NULL,
    "alumni_name" VARCHAR(255) NOT NULL,
    "graduation_year_be" INTEGER NOT NULL,
    "degree_level" "AlumniDegreeLevel" NOT NULL DEFAULT 'BACHELOR',
    "summary_th" TEXT NOT NULL,
    "summary_en" TEXT NOT NULL,
    "content_th" TEXT NOT NULL,
    "content_en" TEXT NOT NULL,
    "image_url" VARCHAR(500),
    "published" BOOLEAN NOT NULL DEFAULT true,
    "seq" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "alumni_stories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "alumni_members_tenant_id_status_idx" ON "alumni_members"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "alumni_members_tenant_id_graduation_year_be_idx" ON "alumni_members"("tenant_id", "graduation_year_be");

-- CreateIndex
CREATE INDEX "alumni_members_tenant_id_is_spotlight_idx" ON "alumni_members"("tenant_id", "is_spotlight");

-- CreateIndex
CREATE INDEX "alumni_stories_tenant_id_published_idx" ON "alumni_stories"("tenant_id", "published");

-- AddForeignKey
ALTER TABLE "alumni_members" ADD CONSTRAINT "alumni_members_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alumni_stories" ADD CONSTRAINT "alumni_stories_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
