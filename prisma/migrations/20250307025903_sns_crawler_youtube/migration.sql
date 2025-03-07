/*
  Warnings:

  - You are about to drop the column `failed` on the `YouTubeDataTaskKeyword` table. All the data in the column will be lost.
  - You are about to drop the column `pending` on the `YouTubeDataTaskKeyword` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "YouTubeDataTaskKeywordStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- AlterTable
ALTER TABLE "YouTubeDataTaskKeyword" DROP COLUMN "failed",
DROP COLUMN "pending",
ADD COLUMN     "status" "YouTubeDataTaskKeywordStatus" NOT NULL DEFAULT 'PENDING';
