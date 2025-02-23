/*
  Warnings:

  - Added the required column `sourceLength` to the `FacebookGroupRecord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FacebookGroupRecord" ADD COLUMN     "sourceLength" INTEGER NOT NULL;
