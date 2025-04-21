-- AlterTable
ALTER TABLE "RetailSalesData" ADD COLUMN     "sourceAttributeId" INTEGER;

-- CreateTable
CREATE TABLE "SourceAttribute" (
    "id" SERIAL NOT NULL,
    "sourceAttribute" TEXT NOT NULL,

    CONSTRAINT "SourceAttribute_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SourceAttribute_sourceAttribute_key" ON "SourceAttribute"("sourceAttribute");

-- CreateIndex
CREATE INDEX "RetailSalesData_sourceAttributeId_idx" ON "RetailSalesData"("sourceAttributeId");

-- AddForeignKey
ALTER TABLE "RetailSalesData" ADD CONSTRAINT "RetailSalesData_sourceAttributeId_fkey" FOREIGN KEY ("sourceAttributeId") REFERENCES "SourceAttribute"("id") ON DELETE SET NULL ON UPDATE CASCADE;
