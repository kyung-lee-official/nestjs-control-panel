/*
  Warnings:

  - You are about to drop the column `sourceLength` on the `FacebookGroupRecord` table. All the data in the column will be lost.
  - Added the required column `sourceLength` to the `FacebookGroupCrawlTask` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FacebookGroupCrawlTask" ADD COLUMN     "sourceLength" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "FacebookGroupRecord" DROP COLUMN "sourceLength";
