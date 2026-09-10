-- CreateEnum
CREATE TYPE "CurriculumLevel" AS ENUM ('BACHELOR', 'MASTER', 'DOCTORATE', 'CERTIFICATE');

-- CreateEnum
CREATE TYPE "CurriculumStatus" AS ENUM ('DRAFT', 'ACTIVE', 'REVISED', 'PHASED_OUT');

-- CreateTable
CREATE TABLE "curriculum_programs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name_th" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255) NOT NULL,
    "degree_th" VARCHAR(255) NOT NULL,
    "degree_en" VARCHAR(255) NOT NULL,
    "level" "CurriculumLevel" NOT NULL DEFAULT 'BACHELOR',
    "department_id" UUID NOT NULL,
    "coordinator_id" UUID,
    "total_credits" INTEGER NOT NULL DEFAULT 0,
    "duration_years" INTEGER NOT NULL DEFAULT 4,
    "tuition_fee_note_th" VARCHAR(255),
    "tuition_fee_note_en" VARCHAR(255),
    "description_th" TEXT NOT NULL,
    "description_en" TEXT NOT NULL,
    "career_prospects" JSONB DEFAULT '[]',
    "admission_requirements" JSONB DEFAULT '[]',
    "brochure_url" VARCHAR(500),
    "seq" INTEGER NOT NULL DEFAULT 1,
    "status" "CurriculumStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "curriculum_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curriculum_courses" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "program_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name_th" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255) NOT NULL,
    "credits" INTEGER NOT NULL DEFAULT 3,
    "lecture_hours" INTEGER NOT NULL DEFAULT 3,
    "lab_hours" INTEGER NOT NULL DEFAULT 0,
    "self_study_hours" INTEGER NOT NULL DEFAULT 6,
    "course_category" VARCHAR(50) NOT NULL DEFAULT 'MAJOR',
    "description_th" TEXT,
    "description_en" TEXT,
    "year_level" INTEGER NOT NULL DEFAULT 1,
    "semester" INTEGER NOT NULL DEFAULT 1,
    "seq" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "curriculum_courses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "curriculum_programs_tenant_id_level_idx" ON "curriculum_programs"("tenant_id", "level");

-- CreateIndex
CREATE INDEX "curriculum_programs_tenant_id_department_id_idx" ON "curriculum_programs"("tenant_id", "department_id");

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_programs_tenant_id_code_key" ON "curriculum_programs"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "curriculum_courses_tenant_id_program_id_idx" ON "curriculum_courses"("tenant_id", "program_id");

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_courses_program_id_code_key" ON "curriculum_courses"("program_id", "code");

-- AddForeignKey
ALTER TABLE "curriculum_programs" ADD CONSTRAINT "curriculum_programs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_programs" ADD CONSTRAINT "curriculum_programs_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "staff_departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_programs" ADD CONSTRAINT "curriculum_programs_coordinator_id_fkey" FOREIGN KEY ("coordinator_id") REFERENCES "staff_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_courses" ADD CONSTRAINT "curriculum_courses_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_courses" ADD CONSTRAINT "curriculum_courses_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "curriculum_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
