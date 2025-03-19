/*
  Warnings:

  - Added the required column `excelRow` to the `FacebookGroupRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `excelRow` to the `FacebookGroupSource` table without a default value. This is not possible if the table is not empty.
  - Added the required column `excelRow` to the `YouTubeDataSearchKeyword` table without a default value. This is not possible if the table is not empty.
  - Added the required column `excelRow` to the `YouTubeDataTaskKeyword` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FacebookGroupRecord" ADD COLUMN     "excelRow" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "FacebookGroupSource" ADD COLUMN     "excelRow" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "YouTubeDataSearchKeyword" ADD COLUMN     "excelRow" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "YouTubeDataTaskKeyword" ADD COLUMN     "excelRow" INTEGER NOT NULL;
