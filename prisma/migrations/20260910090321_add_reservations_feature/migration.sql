-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('FACILITY', 'VEHICLE');

-- CreateEnum
CREATE TYPE "ResourceStatus" AS ENUM ('AVAILABLE', 'MAINTENANCE', 'UNAVAILABLE');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "reservable_resources" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "type" "ResourceType" NOT NULL DEFAULT 'FACILITY',
    "name_th" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "location" VARCHAR(255) NOT NULL,
    "amenities" JSONB DEFAULT '[]',
    "image_url" VARCHAR(500),
    "status" "ResourceStatus" NOT NULL DEFAULT 'AVAILABLE',
    "requires_approval" BOOLEAN NOT NULL DEFAULT true,
    "seq" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "reservable_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_reservations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "resource_id" UUID NOT NULL,
    "reservation_no" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "applicant_name" VARCHAR(255) NOT NULL,
    "applicant_email" VARCHAR(255) NOT NULL,
    "applicant_phone" VARCHAR(50) NOT NULL,
    "department_name" VARCHAR(255) NOT NULL,
    "user_id" UUID,
    "start_time" TIMESTAMPTZ NOT NULL,
    "end_time" TIMESTAMPTZ NOT NULL,
    "attendee_count" INTEGER NOT NULL DEFAULT 1,
    "purpose" TEXT NOT NULL,
    "need_driver" BOOLEAN NOT NULL DEFAULT false,
    "driver_name" VARCHAR(255),
    "special_requests" TEXT,
    "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_by_id" UUID,
    "reviewed_at" TIMESTAMPTZ,
    "review_note" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "resource_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reservable_resources_tenant_id_type_status_idx" ON "reservable_resources"("tenant_id", "type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "reservable_resources_tenant_id_code_key" ON "reservable_resources"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "resource_reservations_tenant_id_resource_id_start_time_end__idx" ON "resource_reservations"("tenant_id", "resource_id", "start_time", "end_time");

-- CreateIndex
CREATE INDEX "resource_reservations_tenant_id_status_idx" ON "resource_reservations"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "resource_reservations_tenant_id_reservation_no_key" ON "resource_reservations"("tenant_id", "reservation_no");

-- AddForeignKey
ALTER TABLE "reservable_resources" ADD CONSTRAINT "reservable_resources_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_reservations" ADD CONSTRAINT "resource_reservations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_reservations" ADD CONSTRAINT "resource_reservations_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "reservable_resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_reservations" ADD CONSTRAINT "resource_reservations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_reservations" ADD CONSTRAINT "resource_reservations_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
