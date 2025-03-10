/*
  Warnings:

  - You are about to drop the column `dislikeCount` on the `YouTubeDataApiVideo` table. All the data in the column will be lost.
  - Added the required column `durationAsSeconds` to the `YouTubeDataApiVideo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "YouTubeDataApiVideo" DROP COLUMN "dislikeCount",
ADD COLUMN     "durationAsSeconds" INTEGER NOT NULL;
