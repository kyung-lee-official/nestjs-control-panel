/*
  Warnings:

  - Added the required column `videoId` to the `YouTubeDataApiSearch` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "YouTubeDataApiSearch" ADD COLUMN     "videoId" TEXT NOT NULL;
