/*
  Warnings:

  - You are about to drop the column `categoryId` on the `RetailSalesData` table. All the data in the column will be lost.
  - You are about to drop the column `clientId` on the `RetailSalesData` table. All the data in the column will be lost.
  - You are about to drop the column `departmentId` on the `RetailSalesData` table. All the data in the column will be lost.
  - You are about to drop the column `platformAddressId` on the `RetailSalesData` table. All the data in the column will be lost.
  - You are about to drop the column `receiptTypeId` on the `RetailSalesData` table. All the data in the column will be lost.
  - You are about to drop the column `sourceAttributeId` on the `RetailSalesData` table. All the data in the column will be lost.
  - You are about to drop the column `storehouseId` on the `RetailSalesData` table. All the data in the column will be lost.
  - You are about to drop the `RetailSalesDataCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RetailSalesDataClient` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RetailSalesDataDepartment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RetailSalesDataPlatformAddress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RetailSalesDataReceiptType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RetailSalesDataSourceAttribute` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RetailSalesDataStorehouse` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `category` to the `RetailSalesData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `client` to the `RetailSalesData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `department` to the `RetailSalesData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiptType` to the `RetailSalesData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sourceAttribute` to the `RetailSalesData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storehouse` to the `RetailSalesData` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RetailSalesData" DROP CONSTRAINT "RetailSalesData_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "RetailSalesData" DROP CONSTRAINT "RetailSalesData_clientId_fkey";

-- DropForeignKey
ALTER TABLE "RetailSalesData" DROP CONSTRAINT "RetailSalesData_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "RetailSalesData" DROP CONSTRAINT "RetailSalesData_platformAddressId_fkey";

-- DropForeignKey
ALTER TABLE "RetailSalesData" DROP CONSTRAINT "RetailSalesData_receiptTypeId_fkey";

-- DropForeignKey
ALTER TABLE "RetailSalesData" DROP CONSTRAINT "RetailSalesData_sourceAttributeId_fkey";

-- DropForeignKey
ALTER TABLE "RetailSalesData" DROP CONSTRAINT "RetailSalesData_storehouseId_fkey";

-- DropIndex
DROP INDEX "RetailSalesData_categoryId_idx";

-- DropIndex
DROP INDEX "RetailSalesData_clientId_idx";

-- DropIndex
DROP INDEX "RetailSalesData_departmentId_idx";

-- DropIndex
DROP INDEX "RetailSalesData_platformAddressId_idx";

-- DropIndex
DROP INDEX "RetailSalesData_receiptTypeId_idx";

-- DropIndex
DROP INDEX "RetailSalesData_sourceAttributeId_idx";

-- DropIndex
DROP INDEX "RetailSalesData_storehouseId_idx";

-- AlterTable
ALTER TABLE "RetailSalesData" DROP COLUMN "categoryId",
DROP COLUMN "clientId",
DROP COLUMN "departmentId",
DROP COLUMN "platformAddressId",
DROP COLUMN "receiptTypeId",
DROP COLUMN "sourceAttributeId",
DROP COLUMN "storehouseId",
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "client" TEXT NOT NULL,
ADD COLUMN     "department" TEXT NOT NULL,
ADD COLUMN     "platformAddress" TEXT,
ADD COLUMN     "receiptType" TEXT NOT NULL,
ADD COLUMN     "sourceAttribute" TEXT NOT NULL,
ADD COLUMN     "storehouse" TEXT NOT NULL;

-- DropTable
DROP TABLE "RetailSalesDataCategory";

-- DropTable
DROP TABLE "RetailSalesDataClient";

-- DropTable
DROP TABLE "RetailSalesDataDepartment";

-- DropTable
DROP TABLE "RetailSalesDataPlatformAddress";

-- DropTable
DROP TABLE "RetailSalesDataReceiptType";

-- DropTable
DROP TABLE "RetailSalesDataSourceAttribute";

-- DropTable
DROP TABLE "RetailSalesDataStorehouse";

-- CreateIndex
CREATE INDEX "RetailSalesData_receiptType_idx" ON "RetailSalesData"("receiptType");

-- CreateIndex
CREATE INDEX "RetailSalesData_client_idx" ON "RetailSalesData"("client");

-- CreateIndex
CREATE INDEX "RetailSalesData_department_idx" ON "RetailSalesData"("department");

-- CreateIndex
CREATE INDEX "RetailSalesData_platformAddress_idx" ON "RetailSalesData"("platformAddress");

-- CreateIndex
CREATE INDEX "RetailSalesData_storehouse_idx" ON "RetailSalesData"("storehouse");

-- CreateIndex
CREATE INDEX "RetailSalesData_category_idx" ON "RetailSalesData"("category");

-- CreateIndex
CREATE INDEX "RetailSalesData_sourceAttribute_idx" ON "RetailSalesData"("sourceAttribute");
