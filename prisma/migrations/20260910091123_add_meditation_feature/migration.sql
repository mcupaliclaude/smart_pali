-- CreateEnum
CREATE TYPE "MeditationFormat" AS ENUM ('RESIDENTIAL', 'ONE_DAY');

-- CreateEnum
CREATE TYPE "MeditationLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "MeditationCourseStatus" AS ENUM ('DRAFT', 'OPEN', 'CLOSED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "MeditationRegistrationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'WAITLIST', 'CANCELLED');

-- CreateTable
CREATE TABLE "meditation_courses" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "title_th" VARCHAR(255) NOT NULL,
    "title_en" VARCHAR(255) NOT NULL,
    "format" "MeditationFormat" NOT NULL DEFAULT 'RESIDENTIAL',
    "level" "MeditationLevel" NOT NULL DEFAULT 'BEGINNER',
    "start_date" TIMESTAMPTZ NOT NULL,
    "end_date" TIMESTAMPTZ NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "max_participants" INTEGER NOT NULL DEFAULT 50,
    "instructors" JSONB DEFAULT '[]',
    "description_th" TEXT NOT NULL,
    "description_en" TEXT NOT NULL,
    "schedule" JSONB DEFAULT '[]',
    "guidelines" JSONB DEFAULT '[]',
    "fee_note" VARCHAR(255),
    "image_url" VARCHAR(500),
    "status" "MeditationCourseStatus" NOT NULL DEFAULT 'OPEN',
    "seq" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "meditation_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meditation_registrations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "registration_no" VARCHAR(50) NOT NULL,
    "full_name_th" VARCHAR(255) NOT NULL,
    "full_name_en" VARCHAR(255),
    "national_id" VARCHAR(50),
    "gender" VARCHAR(20) NOT NULL DEFAULT 'OTHER',
    "age" INTEGER,
    "phone" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "occupation" VARCHAR(150),
    "address" TEXT,
    "emergency_contact_name" VARCHAR(255) NOT NULL,
    "emergency_contact_phone" VARCHAR(50) NOT NULL,
    "medical_conditions" TEXT,
    "dietary_requirements" VARCHAR(150),
    "experience" TEXT,
    "room_assigned" VARCHAR(100),
    "status" "MeditationRegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_by_id" UUID,
    "reviewed_at" TIMESTAMPTZ,
    "review_note" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "meditation_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "meditation_courses_tenant_id_status_idx" ON "meditation_courses"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "meditation_courses_tenant_id_start_date_idx" ON "meditation_courses"("tenant_id", "start_date");

-- CreateIndex
CREATE UNIQUE INDEX "meditation_courses_tenant_id_code_key" ON "meditation_courses"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "meditation_registrations_tenant_id_course_id_idx" ON "meditation_registrations"("tenant_id", "course_id");

-- CreateIndex
CREATE INDEX "meditation_registrations_tenant_id_status_idx" ON "meditation_registrations"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "meditation_registrations_tenant_id_registration_no_key" ON "meditation_registrations"("tenant_id", "registration_no");

-- AddForeignKey
ALTER TABLE "meditation_courses" ADD CONSTRAINT "meditation_courses_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meditation_registrations" ADD CONSTRAINT "meditation_registrations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meditation_registrations" ADD CONSTRAINT "meditation_registrations_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "meditation_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meditation_registrations" ADD CONSTRAINT "meditation_registrations_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
