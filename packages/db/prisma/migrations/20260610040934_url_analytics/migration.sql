/*
  Warnings:

  - A unique constraint covering the columns `[analyticsId]` on the table `Url` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `analyticsId` to the `Url` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Url" ADD COLUMN     "analyticsId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Analytics" (
    "id" TEXT NOT NULL,
    "visitCount" INTEGER NOT NULL,
    "visitorId" TEXT NOT NULL,

    CONSTRAINT "Analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visitor" (
    "id" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "analyticsId" TEXT NOT NULL,

    CONSTRAINT "Visitor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Analytics_visitorId_key" ON "Analytics"("visitorId");

-- CreateIndex
CREATE UNIQUE INDEX "Visitor_analyticsId_key" ON "Visitor"("analyticsId");

-- CreateIndex
CREATE UNIQUE INDEX "Url_analyticsId_key" ON "Url"("analyticsId");

-- AddForeignKey
ALTER TABLE "Url" ADD CONSTRAINT "Url_analyticsId_fkey" FOREIGN KEY ("analyticsId") REFERENCES "Analytics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visitor" ADD CONSTRAINT "Visitor_analyticsId_fkey" FOREIGN KEY ("analyticsId") REFERENCES "Analytics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
