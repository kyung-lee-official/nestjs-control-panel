/*
  Warnings:

  - You are about to drop the `YouTubeToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `YouTubeVideoInfoSearchKeyword` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "YouTubeToken";

-- DropTable
DROP TABLE "YouTubeVideoInfoSearchKeyword";

-- CreateTable
CREATE TABLE "YouTubeDataToken" (
    "token" TEXT NOT NULL,
    "quotaRunOutAt" TIMESTAMP(3)
);

-- CreateTable
CREATE TABLE "YouTubeDataSearchKeyword" (
    "id" SERIAL NOT NULL,
    "keyword" TEXT NOT NULL,

    CONSTRAINT "YouTubeDataSearchKeyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YouTubeDataTask" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YouTubeDataTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YouTubeDataTaskKeyword" (
    "id" SERIAL NOT NULL,
    "keyword" TEXT NOT NULL,
    "pending" BOOLEAN NOT NULL,
    "taskId" INTEGER NOT NULL,

    CONSTRAINT "YouTubeDataTaskKeyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YouTubeDataApiSearch" (
    "id" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "channelId" TEXT NOT NULL,
    "youTubeVideoInfoTaskKeywordId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "YouTubeDataApiChannel" (
    "id" SERIAL NOT NULL,
    "channelId" TEXT NOT NULL,
    "channelTitle" TEXT NOT NULL,
    "viewCount" INTEGER NOT NULL,
    "subscriberCount" INTEGER NOT NULL,
    "videoCount" INTEGER NOT NULL,
    "youTubeDataTaskKeywordId" INTEGER,

    CONSTRAINT "YouTubeDataApiChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YouTubeDataApiVideo" (
    "id" SERIAL NOT NULL,
    "videoId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "viewCount" INTEGER NOT NULL,
    "likeCount" INTEGER NOT NULL,
    "dislikeCount" INTEGER NOT NULL,
    "favoriteCount" INTEGER NOT NULL,
    "commentCount" INTEGER NOT NULL,
    "youTubeDataTaskKeywordId" INTEGER,

    CONSTRAINT "YouTubeDataApiVideo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "YouTubeDataToken_token_key" ON "YouTubeDataToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "YouTubeDataSearchKeyword_keyword_key" ON "YouTubeDataSearchKeyword"("keyword");

-- CreateIndex
CREATE UNIQUE INDEX "YouTubeDataApiSearch_id_key" ON "YouTubeDataApiSearch"("id");

-- AddForeignKey
ALTER TABLE "YouTubeDataTaskKeyword" ADD CONSTRAINT "YouTubeDataTaskKeyword_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "YouTubeDataTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YouTubeDataApiSearch" ADD CONSTRAINT "YouTubeDataApiSearch_youTubeVideoInfoTaskKeywordId_fkey" FOREIGN KEY ("youTubeVideoInfoTaskKeywordId") REFERENCES "YouTubeDataTaskKeyword"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YouTubeDataApiChannel" ADD CONSTRAINT "YouTubeDataApiChannel_youTubeDataTaskKeywordId_fkey" FOREIGN KEY ("youTubeDataTaskKeywordId") REFERENCES "YouTubeDataTaskKeyword"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YouTubeDataApiVideo" ADD CONSTRAINT "YouTubeDataApiVideo_youTubeDataTaskKeywordId_fkey" FOREIGN KEY ("youTubeDataTaskKeywordId") REFERENCES "YouTubeDataTaskKeyword"("id") ON DELETE SET NULL ON UPDATE CASCADE;
