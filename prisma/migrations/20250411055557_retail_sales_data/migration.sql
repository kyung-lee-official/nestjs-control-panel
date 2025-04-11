-- CreateTable
CREATE TABLE "SalesData" (
    "id" BIGSERIAL NOT NULL,
    "batchId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "receiptType" TEXT NOT NULL,
    "client" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "nameZhCn" TEXT NOT NULL,
    "salesVolume" DOUBLE PRECISION NOT NULL,
    "platformAddress" TEXT,
    "platformOrderId" TEXT NOT NULL,
    "storehouse" TEXT NOT NULL,
    "category" TEXT,
    "taxInclusivePriceCny" DOUBLE PRECISION,
    "priceCny" DOUBLE PRECISION,
    "unitPriceCny" DOUBLE PRECISION,

    CONSTRAINT "SalesData_pkey" PRIMARY KEY ("id")
);
