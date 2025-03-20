/*
  Warnings:

  - Added the required column `memberRoleId` to the `StatSection` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StatSection" ADD COLUMN     "memberRoleId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "StatSection" ADD CONSTRAINT "StatSection_memberRoleId_fkey" FOREIGN KEY ("memberRoleId") REFERENCES "MemberRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
