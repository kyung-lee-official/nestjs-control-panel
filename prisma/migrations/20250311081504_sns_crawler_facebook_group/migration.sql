/*
  Warnings:

  - You are about to drop the column `failed` on the `FacebookGroupRecord` table. All the data in the column will be lost.
  - Added the required column `status` to the `FacebookGroupRecord` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FacebookGroupRecordStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- AlterTable
ALTER TABLE "FacebookGroupRecord" DROP COLUMN "failed",
ADD COLUMN     "status" "FacebookGroupRecordStatus" NOT NULL;
