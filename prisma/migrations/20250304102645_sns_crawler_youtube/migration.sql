/*
  Warnings:

  - You are about to drop the column `youTubeVideoInfoTaskKeywordId` on the `YouTubeDataApiSearch` table. All the data in the column will be lost.
  - Added the required column `keyword` to the `YouTubeDataApiSearch` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "YouTubeDataApiSearch" DROP CONSTRAINT "YouTubeDataApiSearch_youTubeVideoInfoTaskKeywordId_fkey";

-- AlterTable
ALTER TABLE "YouTubeDataApiSearch" DROP COLUMN "youTubeVideoInfoTaskKeywordId",
ADD COLUMN     "keyword" TEXT NOT NULL,
ADD COLUMN     "youTubeDataTaskId" INTEGER;

-- AddForeignKey
ALTER TABLE "YouTubeDataApiSearch" ADD CONSTRAINT "YouTubeDataApiSearch_youTubeDataTaskId_fkey" FOREIGN KEY ("youTubeDataTaskId") REFERENCES "YouTubeDataTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;
