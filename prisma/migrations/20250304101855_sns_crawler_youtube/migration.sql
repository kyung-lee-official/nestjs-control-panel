/*
  Warnings:

  - You are about to drop the column `youTubeDataTaskKeywordId` on the `YouTubeDataApiChannel` table. All the data in the column will be lost.
  - You are about to drop the column `youTubeDataTaskKeywordId` on the `YouTubeDataApiVideo` table. All the data in the column will be lost.
  - Added the required column `youTubeDataTaskId` to the `YouTubeDataApiChannel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `youTubeDataTaskId` to the `YouTubeDataApiVideo` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "YouTubeDataApiChannel" DROP CONSTRAINT "YouTubeDataApiChannel_youTubeDataTaskKeywordId_fkey";

-- DropForeignKey
ALTER TABLE "YouTubeDataApiVideo" DROP CONSTRAINT "YouTubeDataApiVideo_youTubeDataTaskKeywordId_fkey";

-- AlterTable
ALTER TABLE "YouTubeDataApiChannel" DROP COLUMN "youTubeDataTaskKeywordId",
ADD COLUMN     "youTubeDataTaskId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "YouTubeDataApiVideo" DROP COLUMN "youTubeDataTaskKeywordId",
ADD COLUMN     "youTubeDataTaskId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "YouTubeDataApiChannel" ADD CONSTRAINT "YouTubeDataApiChannel_youTubeDataTaskId_fkey" FOREIGN KEY ("youTubeDataTaskId") REFERENCES "YouTubeDataTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YouTubeDataApiVideo" ADD CONSTRAINT "YouTubeDataApiVideo_youTubeDataTaskId_fkey" FOREIGN KEY ("youTubeDataTaskId") REFERENCES "YouTubeDataTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
