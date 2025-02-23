-- DropIndex
DROP INDEX "FacebookGroupRecord_groupAddress_key";

-- AlterTable
ALTER TABLE "FacebookGroupRecord" ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "FacebookGroupRecord_pkey" PRIMARY KEY ("id");
