-- AlterTable
ALTER TABLE "YouTubeDataTask" ADD COLUMN     "targetResultCount" INTEGER,
ADD COLUMN     "timeRangeEnd" TIMESTAMP(3),
ADD COLUMN     "timeRangeStart" TIMESTAMP(3);
