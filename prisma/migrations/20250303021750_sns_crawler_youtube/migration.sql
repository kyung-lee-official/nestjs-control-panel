/*
  Warnings:

  - Added the required column `failed` to the `YouTubeDataTaskKeyword` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "YouTubeDataTaskKeyword" ADD COLUMN     "failed" BOOLEAN NOT NULL;
