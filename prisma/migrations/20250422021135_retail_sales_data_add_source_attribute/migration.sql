-- AlterTable
ALTER TABLE "RetailSalesData" ADD COLUMN     "sourceAttributeId" INTEGER;

-- CreateTable
CREATE TABLE "RetailSalesDataSourceAttribute" (
    "id" SERIAL NOT NULL,
    "sourceAttribute" TEXT NOT NULL,

    CONSTRAINT "RetailSalesDataSourceAttribute_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RetailSalesDataSourceAttribute_sourceAttribute_key" ON "RetailSalesDataSourceAttribute"("sourceAttribute");

-- CreateIndex
CREATE INDEX "RetailSalesData_sourceAttributeId_idx" ON "RetailSalesData"("sourceAttributeId");

-- AddForeignKey
ALTER TABLE "RetailSalesData" ADD CONSTRAINT "RetailSalesData_sourceAttributeId_fkey" FOREIGN KEY ("sourceAttributeId") REFERENCES "RetailSalesDataSourceAttribute"("id") ON DELETE SET NULL ON UPDATE CASCADE;
