-- CreateTable
CREATE TABLE "public"."Gallery" (
    "id" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleBn" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "descriptionBn" TEXT,
    "imageUrl" TEXT NOT NULL,
    "imageKey" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "Gallery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Gallery_category_idx" ON "public"."Gallery"("category");

-- CreateIndex
CREATE INDEX "Gallery_featured_idx" ON "public"."Gallery"("featured");

-- CreateIndex
CREATE INDEX "Gallery_isActive_idx" ON "public"."Gallery"("isActive");

-- CreateIndex
CREATE INDEX "Gallery_publishedAt_idx" ON "public"."Gallery"("publishedAt");

-- CreateIndex
CREATE INDEX "Gallery_order_idx" ON "public"."Gallery"("order");
