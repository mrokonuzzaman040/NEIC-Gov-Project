-- CreateEnum
CREATE TYPE "public"."NoticeType" AS ENUM ('ANNOUNCEMENT', 'WARNING', 'INFORMATION', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "public"."ContactType" AS ENUM ('OFFICE', 'DEPARTMENT', 'PERSON', 'HOTLINE');

-- CreateTable
CREATE TABLE "public"."BlogPost" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleBn" TEXT NOT NULL,
    "excerptEn" TEXT NOT NULL,
    "excerptBn" TEXT NOT NULL,
    "contentEn" TEXT NOT NULL,
    "contentBn" TEXT NOT NULL,
    "authorEn" TEXT NOT NULL,
    "authorBn" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "tags" TEXT[],
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "readTime" INTEGER NOT NULL DEFAULT 5,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FAQ" (
    "id" TEXT NOT NULL,
    "questionEn" TEXT NOT NULL,
    "questionBn" TEXT NOT NULL,
    "answerEn" TEXT NOT NULL,
    "answerBn" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "FAQ_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notice" (
    "id" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleBn" TEXT NOT NULL,
    "contentEn" TEXT NOT NULL,
    "contentBn" TEXT NOT NULL,
    "type" "public"."NoticeType" NOT NULL DEFAULT 'INFORMATION',
    "priority" "public"."Priority" NOT NULL DEFAULT 'MEDIUM',
    "category" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "attachments" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "Notice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ContactInfo" (
    "id" TEXT NOT NULL,
    "type" "public"."ContactType" NOT NULL DEFAULT 'OFFICE',
    "nameEn" TEXT NOT NULL,
    "nameBn" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "descriptionBn" TEXT,
    "addressEn" TEXT,
    "addressBn" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "hoursEn" TEXT,
    "hoursBn" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "ContactInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "public"."BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_category_idx" ON "public"."BlogPost"("category");

-- CreateIndex
CREATE INDEX "BlogPost_featured_idx" ON "public"."BlogPost"("featured");

-- CreateIndex
CREATE INDEX "BlogPost_isActive_idx" ON "public"."BlogPost"("isActive");

-- CreateIndex
CREATE INDEX "BlogPost_publishedAt_idx" ON "public"."BlogPost"("publishedAt");

-- CreateIndex
CREATE INDEX "BlogPost_slug_idx" ON "public"."BlogPost"("slug");

-- CreateIndex
CREATE INDEX "FAQ_category_idx" ON "public"."FAQ"("category");

-- CreateIndex
CREATE INDEX "FAQ_isActive_idx" ON "public"."FAQ"("isActive");

-- CreateIndex
CREATE INDEX "FAQ_order_idx" ON "public"."FAQ"("order");

-- CreateIndex
CREATE INDEX "Notice_type_idx" ON "public"."Notice"("type");

-- CreateIndex
CREATE INDEX "Notice_priority_idx" ON "public"."Notice"("priority");

-- CreateIndex
CREATE INDEX "Notice_category_idx" ON "public"."Notice"("category");

-- CreateIndex
CREATE INDEX "Notice_isActive_idx" ON "public"."Notice"("isActive");

-- CreateIndex
CREATE INDEX "Notice_isPinned_idx" ON "public"."Notice"("isPinned");

-- CreateIndex
CREATE INDEX "Notice_publishedAt_idx" ON "public"."Notice"("publishedAt");

-- CreateIndex
CREATE INDEX "ContactInfo_type_idx" ON "public"."ContactInfo"("type");

-- CreateIndex
CREATE INDEX "ContactInfo_isActive_idx" ON "public"."ContactInfo"("isActive");

-- CreateIndex
CREATE INDEX "ContactInfo_order_idx" ON "public"."ContactInfo"("order");
