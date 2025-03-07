/*
  Warnings:

  - The `id` column on the `YouTubeDataApiSearch` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropIndex
DROP INDEX "YouTubeDataApiSearch_id_key";

-- AlterTable
ALTER TABLE "YouTubeDataApiSearch" DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "YouTubeDataApiSearch_pkey" PRIMARY KEY ("id");
