/*
  Warnings:

  - You are about to drop the column `category` on the `RetailSalesData` table. All the data in the column will be lost.
  - You are about to drop the column `client` on the `RetailSalesData` table. All the data in the column will be lost.
  - You are about to drop the column `department` on the `RetailSalesData` table. All the data in the column will be lost.
  - You are about to drop the column `platformAddress` on the `RetailSalesData` table. All the data in the column will be lost.
  - You are about to drop the column `receiptType` on the `RetailSalesData` table. All the data in the column will be lost.
  - You are about to drop the column `sku` on the `RetailSalesData` table. All the data in the column will be lost.
  - You are about to drop the column `storehouse` on the `RetailSalesData` table. All the data in the column will be lost.
  - Added the required column `clientId` to the `RetailSalesData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departmentId` to the `RetailSalesData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiptTypeId` to the `RetailSalesData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `skuId` to the `RetailSalesData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storehouseId` to the `RetailSalesData` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RetailSalesData" DROP COLUMN "category",
DROP COLUMN "client",
DROP COLUMN "department",
DROP COLUMN "platformAddress",
DROP COLUMN "receiptType",
DROP COLUMN "sku",
DROP COLUMN "storehouse",
ADD COLUMN     "categoryId" INTEGER,
ADD COLUMN     "clientId" INTEGER NOT NULL,
ADD COLUMN     "departmentId" INTEGER NOT NULL,
ADD COLUMN     "platformAddressId" INTEGER,
ADD COLUMN     "receiptTypeId" INTEGER NOT NULL,
ADD COLUMN     "skuId" INTEGER NOT NULL,
ADD COLUMN     "storehouseId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "RetailSalesDataReceiptType" (
    "id" SERIAL NOT NULL,
    "receiptType" TEXT NOT NULL,

    CONSTRAINT "RetailSalesDataReceiptType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetailSalesDataClient" (
    "id" SERIAL NOT NULL,
    "client" TEXT NOT NULL,

    CONSTRAINT "RetailSalesDataClient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetailSalesDataDepartment" (
    "id" SERIAL NOT NULL,
    "department" TEXT NOT NULL,

    CONSTRAINT "RetailSalesDataDepartment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetailSalesDataSku" (
    "id" SERIAL NOT NULL,
    "sku" TEXT NOT NULL,

    CONSTRAINT "RetailSalesDataSku_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetailSalesDataPlatformAddress" (
    "id" SERIAL NOT NULL,
    "platformAddress" TEXT NOT NULL,

    CONSTRAINT "RetailSalesDataPlatformAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetailSalesDataStorehouse" (
    "id" SERIAL NOT NULL,
    "storehouse" TEXT NOT NULL,

    CONSTRAINT "RetailSalesDataStorehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetailSalesDataCategory" (
    "id" SERIAL NOT NULL,
    "category" TEXT NOT NULL,

    CONSTRAINT "RetailSalesDataCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RetailSalesDataReceiptType_receiptType_key" ON "RetailSalesDataReceiptType"("receiptType");

-- CreateIndex
CREATE UNIQUE INDEX "RetailSalesDataClient_client_key" ON "RetailSalesDataClient"("client");

-- CreateIndex
CREATE UNIQUE INDEX "RetailSalesDataDepartment_department_key" ON "RetailSalesDataDepartment"("department");

-- CreateIndex
CREATE UNIQUE INDEX "RetailSalesDataSku_sku_key" ON "RetailSalesDataSku"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "RetailSalesDataPlatformAddress_platformAddress_key" ON "RetailSalesDataPlatformAddress"("platformAddress");

-- CreateIndex
CREATE UNIQUE INDEX "RetailSalesDataStorehouse_storehouse_key" ON "RetailSalesDataStorehouse"("storehouse");

-- CreateIndex
CREATE UNIQUE INDEX "RetailSalesDataCategory_category_key" ON "RetailSalesDataCategory"("category");

-- CreateIndex
CREATE INDEX "RetailSalesData_batchId_idx" ON "RetailSalesData"("batchId");

-- CreateIndex
CREATE INDEX "RetailSalesData_date_idx" ON "RetailSalesData"("date");

-- CreateIndex
CREATE INDEX "RetailSalesData_receiptTypeId_idx" ON "RetailSalesData"("receiptTypeId");

-- CreateIndex
CREATE INDEX "RetailSalesData_clientId_idx" ON "RetailSalesData"("clientId");

-- CreateIndex
CREATE INDEX "RetailSalesData_departmentId_idx" ON "RetailSalesData"("departmentId");

-- CreateIndex
CREATE INDEX "RetailSalesData_skuId_nameZhCn_idx" ON "RetailSalesData"("skuId", "nameZhCn");

-- CreateIndex
CREATE INDEX "RetailSalesData_salesVolume_idx" ON "RetailSalesData"("salesVolume");

-- CreateIndex
CREATE INDEX "RetailSalesData_platformAddressId_idx" ON "RetailSalesData"("platformAddressId");

-- CreateIndex
CREATE INDEX "RetailSalesData_platformOrderId_idx" ON "RetailSalesData"("platformOrderId");

-- CreateIndex
CREATE INDEX "RetailSalesData_storehouseId_idx" ON "RetailSalesData"("storehouseId");

-- CreateIndex
CREATE INDEX "RetailSalesData_categoryId_idx" ON "RetailSalesData"("categoryId");

-- CreateIndex
CREATE INDEX "RetailSalesData_taxInclusivePriceCny_idx" ON "RetailSalesData"("taxInclusivePriceCny");

-- CreateIndex
CREATE INDEX "RetailSalesData_priceCny_idx" ON "RetailSalesData"("priceCny");

-- CreateIndex
CREATE INDEX "RetailSalesData_unitPriceCny_idx" ON "RetailSalesData"("unitPriceCny");

-- AddForeignKey
ALTER TABLE "RetailSalesData" ADD CONSTRAINT "RetailSalesData_receiptTypeId_fkey" FOREIGN KEY ("receiptTypeId") REFERENCES "RetailSalesDataReceiptType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetailSalesData" ADD CONSTRAINT "RetailSalesData_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "RetailSalesDataClient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetailSalesData" ADD CONSTRAINT "RetailSalesData_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "RetailSalesDataDepartment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetailSalesData" ADD CONSTRAINT "RetailSalesData_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "RetailSalesDataSku"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetailSalesData" ADD CONSTRAINT "RetailSalesData_platformAddressId_fkey" FOREIGN KEY ("platformAddressId") REFERENCES "RetailSalesDataPlatformAddress"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetailSalesData" ADD CONSTRAINT "RetailSalesData_storehouseId_fkey" FOREIGN KEY ("storehouseId") REFERENCES "RetailSalesDataStorehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetailSalesData" ADD CONSTRAINT "RetailSalesData_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "RetailSalesDataCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
