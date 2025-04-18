/*
  Warnings:

  - You are about to drop the column `nameZhCn` on the `RetailSalesData` table. All the data in the column will be lost.
  - You are about to drop the column `skuId` on the `RetailSalesData` table. All the data in the column will be lost.
  - You are about to drop the `RetailSalesDataSku` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `productId` to the `RetailSalesData` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RetailSalesData" DROP CONSTRAINT "RetailSalesData_skuId_fkey";

-- DropIndex
DROP INDEX "RetailSalesData_skuId_nameZhCn_idx";

-- AlterTable
ALTER TABLE "RetailSalesData" DROP COLUMN "nameZhCn",
DROP COLUMN "skuId",
ADD COLUMN     "productId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "RetailSalesDataSku";

-- CreateTable
CREATE TABLE "RetailSalesDataProduct" (
    "id" SERIAL NOT NULL,
    "sku" TEXT NOT NULL,
    "nameZhCn" TEXT NOT NULL,

    CONSTRAINT "RetailSalesDataProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RetailSalesDataProduct_sku_key" ON "RetailSalesDataProduct"("sku");

-- CreateIndex
CREATE INDEX "RetailSalesData_productId_idx" ON "RetailSalesData"("productId");

-- AddForeignKey
ALTER TABLE "RetailSalesData" ADD CONSTRAINT "RetailSalesData_productId_fkey" FOREIGN KEY ("productId") REFERENCES "RetailSalesDataProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
