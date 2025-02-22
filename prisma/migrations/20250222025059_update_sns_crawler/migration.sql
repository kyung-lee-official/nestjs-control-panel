/*
  Warnings:

  - The primary key for the `FacebookGroupCrawlTask` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `FacebookGroupCrawlTask` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `facebookGroupCrawlTaskId` to the `FacebookGroupRecord` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FacebookGroupRecord" DROP CONSTRAINT "FacebookGroupRecord_facebookGroupCrawlTaskId_fkey";

-- AlterTable
ALTER TABLE "FacebookGroupCrawlTask" DROP CONSTRAINT "FacebookGroupCrawlTask_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "FacebookGroupCrawlTask_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "FacebookGroupRecord" DROP COLUMN "facebookGroupCrawlTaskId",
ADD COLUMN     "facebookGroupCrawlTaskId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "FacebookGroupRecord" ADD CONSTRAINT "FacebookGroupRecord_facebookGroupCrawlTaskId_fkey" FOREIGN KEY ("facebookGroupCrawlTaskId") REFERENCES "FacebookGroupCrawlTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
