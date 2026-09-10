-- CreateEnum
CREATE TYPE "StaffStatus" AS ENUM ('ACTIVE', 'LEAVE', 'RETIRED');

-- CreateEnum
CREATE TYPE "StaffType" AS ENUM ('ACADEMIC', 'SUPPORT');

-- CreateTable
CREATE TABLE "staff_departments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name_th" VARCHAR(100) NOT NULL,
    "name_en" VARCHAR(100) NOT NULL,
    "seq" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "staff_departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_profiles" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID,
    "prefix_th" VARCHAR(50) NOT NULL,
    "prefix_en" VARCHAR(50) NOT NULL,
    "first_name_th" VARCHAR(100) NOT NULL,
    "last_name_th" VARCHAR(100) NOT NULL,
    "first_name_en" VARCHAR(100) NOT NULL,
    "last_name_en" VARCHAR(100) NOT NULL,
    "staff_type" "StaffType" NOT NULL DEFAULT 'ACADEMIC',
    "academic_rank" VARCHAR(50),
    "administrative_position_th" VARCHAR(150),
    "administrative_position_en" VARCHAR(150),
    "department_id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "room_no" VARCHAR(50),
    "education" JSONB,
    "researchInterests" JSONB,
    "avatar_url" VARCHAR(500),
    "seq" INTEGER NOT NULL DEFAULT 0,
    "status" "StaffStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "staff_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "staff_departments_tenant_id_idx" ON "staff_departments"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "staff_departments_tenant_id_code_key" ON "staff_departments"("tenant_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "staff_profiles_user_id_key" ON "staff_profiles"("user_id");

-- CreateIndex
CREATE INDEX "staff_profiles_tenant_id_department_id_idx" ON "staff_profiles"("tenant_id", "department_id");

-- CreateIndex
CREATE INDEX "staff_profiles_tenant_id_status_idx" ON "staff_profiles"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "staff_profiles_tenant_id_email_key" ON "staff_profiles"("tenant_id", "email");

-- AddForeignKey
ALTER TABLE "staff_departments" ADD CONSTRAINT "staff_departments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "staff_departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
