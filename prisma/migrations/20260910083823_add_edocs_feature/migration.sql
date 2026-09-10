-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('MEMO', 'PROJECT_PROPOSAL', 'PURCHASE_REQ', 'OFFICIAL_LETTER');

-- CreateEnum
CREATE TYPE "DocumentPriority" AS ENUM ('NORMAL', 'URGENT', 'VERY_URGENT');

-- CreateEnum
CREATE TYPE "ApprovalDecision" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "edocuments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "doc_no" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "doc_type" "DocumentType" NOT NULL DEFAULT 'MEMO',
    "priority" "DocumentPriority" NOT NULL DEFAULT 'NORMAL',
    "content" TEXT NOT NULL,
    "submitter_id" UUID NOT NULL,
    "department_id" UUID NOT NULL,
    "attachment_url" VARCHAR(500),
    "status" "DocumentStatus" NOT NULL DEFAULT 'SUBMITTED',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "edocuments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "edocument_approval_steps" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "approver_id" UUID NOT NULL,
    "approver_role" VARCHAR(100) NOT NULL,
    "step_order" INTEGER NOT NULL DEFAULT 1,
    "decision" "ApprovalDecision" NOT NULL DEFAULT 'PENDING',
    "comment" TEXT,
    "decided_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "edocument_approval_steps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "edocuments_tenant_id_status_idx" ON "edocuments"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "edocuments_tenant_id_submitter_id_idx" ON "edocuments"("tenant_id", "submitter_id");

-- CreateIndex
CREATE INDEX "edocuments_tenant_id_department_id_idx" ON "edocuments"("tenant_id", "department_id");

-- CreateIndex
CREATE UNIQUE INDEX "edocuments_tenant_id_doc_no_key" ON "edocuments"("tenant_id", "doc_no");

-- CreateIndex
CREATE INDEX "edocument_approval_steps_tenant_id_document_id_idx" ON "edocument_approval_steps"("tenant_id", "document_id");

-- CreateIndex
CREATE INDEX "edocument_approval_steps_tenant_id_approver_id_decision_idx" ON "edocument_approval_steps"("tenant_id", "approver_id", "decision");

-- AddForeignKey
ALTER TABLE "edocuments" ADD CONSTRAINT "edocuments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "edocuments" ADD CONSTRAINT "edocuments_submitter_id_fkey" FOREIGN KEY ("submitter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "edocuments" ADD CONSTRAINT "edocuments_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "staff_departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "edocument_approval_steps" ADD CONSTRAINT "edocument_approval_steps_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "edocument_approval_steps" ADD CONSTRAINT "edocument_approval_steps_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "edocuments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "edocument_approval_steps" ADD CONSTRAINT "edocument_approval_steps_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
