-- CreateTable
CREATE TABLE "RetailSalesDataBatch" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RetailSalesDataBatch_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RetailSalesData" ADD CONSTRAINT "RetailSalesData_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "RetailSalesDataBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
