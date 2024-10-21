/*
  Warnings:

  - The primary key for the `MemberRole` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `permissions` on the `MemberRole` table. All the data in the column will be lost.
  - You are about to drop the `MemberGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_MemberToMemberGroup` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MemberGroup" DROP CONSTRAINT "MemberGroup_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "_MemberToMemberGroup" DROP CONSTRAINT "_MemberToMemberGroup_A_fkey";

-- DropForeignKey
ALTER TABLE "_MemberToMemberGroup" DROP CONSTRAINT "_MemberToMemberGroup_B_fkey";

-- DropForeignKey
ALTER TABLE "_MemberToMemberRole" DROP CONSTRAINT "_MemberToMemberRole_B_fkey";

-- DropIndex
DROP INDEX "MemberRole_name_key";

-- AlterTable
ALTER TABLE "MemberRole" DROP CONSTRAINT "MemberRole_pkey",
DROP COLUMN "permissions",
ADD COLUMN     "superRoleId" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "MemberRole_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "MemberRole_id_seq";

-- AlterTable
ALTER TABLE "_MemberToMemberRole" ALTER COLUMN "B" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "MemberGroup";

-- DropTable
DROP TABLE "_MemberToMemberGroup";

-- DropEnum
DROP TYPE "Permission";

-- AddForeignKey
ALTER TABLE "MemberRole" ADD CONSTRAINT "MemberRole_superRoleId_fkey" FOREIGN KEY ("superRoleId") REFERENCES "MemberRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MemberToMemberRole" ADD CONSTRAINT "_MemberToMemberRole_B_fkey" FOREIGN KEY ("B") REFERENCES "MemberRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;
