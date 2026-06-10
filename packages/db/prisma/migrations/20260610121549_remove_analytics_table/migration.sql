/*
  Warnings:

  - You are about to drop the column `analyticsId` on the `Url` table. All the data in the column will be lost.
  - You are about to drop the column `analyticsId` on the `Visitor` table. All the data in the column will be lost.
  - You are about to drop the `Analytics` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[urlId]` on the table `Visitor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `urlId` to the `Visitor` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Url" DROP CONSTRAINT "Url_analyticsId_fkey";

-- DropForeignKey
ALTER TABLE "Visitor" DROP CONSTRAINT "Visitor_analyticsId_fkey";

-- DropIndex
DROP INDEX "Url_analyticsId_key";

-- DropIndex
DROP INDEX "Visitor_analyticsId_key";

-- AlterTable
ALTER TABLE "Url" DROP COLUMN "analyticsId";

-- AlterTable
ALTER TABLE "Visitor" DROP COLUMN "analyticsId",
ADD COLUMN     "urlId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Analytics";

-- CreateIndex
CREATE UNIQUE INDEX "Visitor_urlId_key" ON "Visitor"("urlId");

-- AddForeignKey
ALTER TABLE "Visitor" ADD CONSTRAINT "Visitor_urlId_fkey" FOREIGN KEY ("urlId") REFERENCES "Url"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
