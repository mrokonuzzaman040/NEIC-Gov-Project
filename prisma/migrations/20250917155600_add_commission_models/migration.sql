-- CreateEnum
CREATE TYPE "public"."OfficialCategory" AS ENUM ('SECRETARIAT', 'TECHNICAL', 'ADMINISTRATIVE', 'SUPPORT');

-- CreateTable
CREATE TABLE "public"."CommissionMember" (
    "id" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameBn" TEXT NOT NULL,
    "designationEn" TEXT NOT NULL,
    "designationBn" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL,
    "descriptionBn" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "image" TEXT,
    "serialNo" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "CommissionMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommissionOfficial" (
    "id" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameBn" TEXT NOT NULL,
    "positionEn" TEXT NOT NULL,
    "positionBn" TEXT NOT NULL,
    "departmentEn" TEXT NOT NULL,
    "departmentBn" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "descriptionBn" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "experienceEn" TEXT,
    "experienceBn" TEXT,
    "qualificationEn" TEXT,
    "qualificationBn" TEXT,
    "image" TEXT,
    "category" "public"."OfficialCategory" NOT NULL DEFAULT 'SECRETARIAT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "CommissionOfficial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommissionTerm" (
    "id" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleBn" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL,
    "descriptionBn" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "CommissionTerm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Gazette" (
    "id" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleBn" TEXT NOT NULL,
    "gazetteNumber" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" "public"."Priority" NOT NULL DEFAULT 'MEDIUM',
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "downloadUrl" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "Gazette_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CommissionMember_serialNo_key" ON "public"."CommissionMember"("serialNo");

-- CreateIndex
CREATE INDEX "CommissionMember_serialNo_idx" ON "public"."CommissionMember"("serialNo");

-- CreateIndex
CREATE INDEX "CommissionMember_isActive_idx" ON "public"."CommissionMember"("isActive");

-- CreateIndex
CREATE INDEX "CommissionOfficial_category_idx" ON "public"."CommissionOfficial"("category");

-- CreateIndex
CREATE INDEX "CommissionOfficial_isActive_idx" ON "public"."CommissionOfficial"("isActive");

-- CreateIndex
CREATE INDEX "CommissionOfficial_order_idx" ON "public"."CommissionOfficial"("order");

-- CreateIndex
CREATE INDEX "CommissionTerm_category_idx" ON "public"."CommissionTerm"("category");

-- CreateIndex
CREATE INDEX "CommissionTerm_section_idx" ON "public"."CommissionTerm"("section");

-- CreateIndex
CREATE INDEX "CommissionTerm_order_idx" ON "public"."CommissionTerm"("order");

-- CreateIndex
CREATE INDEX "CommissionTerm_isActive_idx" ON "public"."CommissionTerm"("isActive");

-- CreateIndex
CREATE INDEX "CommissionTerm_effectiveFrom_idx" ON "public"."CommissionTerm"("effectiveFrom");

-- CreateIndex
CREATE UNIQUE INDEX "Gazette_gazetteNumber_key" ON "public"."Gazette"("gazetteNumber");

-- CreateIndex
CREATE INDEX "Gazette_gazetteNumber_idx" ON "public"."Gazette"("gazetteNumber");

-- CreateIndex
CREATE INDEX "Gazette_category_idx" ON "public"."Gazette"("category");

-- CreateIndex
CREATE INDEX "Gazette_priority_idx" ON "public"."Gazette"("priority");

-- CreateIndex
CREATE INDEX "Gazette_publishedAt_idx" ON "public"."Gazette"("publishedAt");

-- CreateIndex
CREATE INDEX "Gazette_isActive_idx" ON "public"."Gazette"("isActive");
