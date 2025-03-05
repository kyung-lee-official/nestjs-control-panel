/*
  Warnings:

  - Made the column `youTubeDataTaskId` on table `YouTubeDataApiSearch` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "YouTubeDataApiSearch" DROP CONSTRAINT "YouTubeDataApiSearch_youTubeDataTaskId_fkey";

-- AlterTable
ALTER TABLE "YouTubeDataApiSearch" ALTER COLUMN "youTubeDataTaskId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "YouTubeDataApiSearch" ADD CONSTRAINT "YouTubeDataApiSearch_youTubeDataTaskId_fkey" FOREIGN KEY ("youTubeDataTaskId") REFERENCES "YouTubeDataTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
