-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('GET_MEMBER_SERVER_SETTING', 'UPDATE_MEMBER_SERVER_SETTING', 'CREATE_MEMBER', 'UPDATE_MEMBER', 'UPDATE_MEMBER_ME', 'TRANSFER_MEMBER_ADMIN', 'GET_MEMBERS', 'GET_MEMBER_ME', 'DELETE_MEMBER', 'CREATE_MEMBER_ROLE', 'UPDATE_MEMBER_ROLE', 'GET_MEMBER_ROLES', 'DELETE_MEMBER_ROLE', 'CREATE_MEMBER_GROUP', 'UPDATE_MEMBER_GROUP', 'TRANSFER_MEMBER_GROUP_OWNER', 'GET_MEMBER_GROUPS', 'DELETE_MEMBER_GROUP', 'GET_PERMISSIONS', 'FIND_CHITUBOX_MANUAL_FEEDBACKS');

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isVerified" BOOLEAN,
    "isFrozen" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemberGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberRole" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "permissions" "Permission"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemberRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberServerSetting" (
    "id" SERIAL NOT NULL,
    "allowPublicSignUp" BOOLEAN NOT NULL,
    "allowGoogleSignIn" BOOLEAN NOT NULL,

    CONSTRAINT "MemberServerSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChituboxManualFeedback" (
    "id" BIGSERIAL NOT NULL,
    "pageId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChituboxManualFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MemberToMemberRole" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_MemberToMemberGroup" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");

-- CreateIndex
CREATE UNIQUE INDEX "MemberGroup_name_key" ON "MemberGroup"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MemberRole_name_key" ON "MemberRole"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_MemberToMemberRole_AB_unique" ON "_MemberToMemberRole"("A", "B");

-- CreateIndex
CREATE INDEX "_MemberToMemberRole_B_index" ON "_MemberToMemberRole"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_MemberToMemberGroup_AB_unique" ON "_MemberToMemberGroup"("A", "B");

-- CreateIndex
CREATE INDEX "_MemberToMemberGroup_B_index" ON "_MemberToMemberGroup"("B");

-- AddForeignKey
ALTER TABLE "MemberGroup" ADD CONSTRAINT "MemberGroup_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MemberToMemberRole" ADD CONSTRAINT "_MemberToMemberRole_A_fkey" FOREIGN KEY ("A") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MemberToMemberRole" ADD CONSTRAINT "_MemberToMemberRole_B_fkey" FOREIGN KEY ("B") REFERENCES "MemberRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MemberToMemberGroup" ADD CONSTRAINT "_MemberToMemberGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MemberToMemberGroup" ADD CONSTRAINT "_MemberToMemberGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "MemberGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
