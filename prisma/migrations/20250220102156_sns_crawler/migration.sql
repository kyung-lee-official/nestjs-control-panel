-- CreateTable
CREATE TABLE "FacebookGroupSource" (
    "groupAddress" TEXT NOT NULL,
    "groupName" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "FacebookGroupRecord" (
    "groupAddress" TEXT NOT NULL,
    "groupName" TEXT NOT NULL,
    "memberCount" INTEGER NOT NULL,
    "monthlyPostCount" INTEGER NOT NULL,
    "facebookGroupCrawlTaskId" TEXT
);

-- CreateTable
CREATE TABLE "FacebookGroupCrawlTask" (
    "id" TEXT NOT NULL,
    "isAborted" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FacebookGroupCrawlTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FacebookGroupSource_groupAddress_key" ON "FacebookGroupSource"("groupAddress");

-- CreateIndex
CREATE UNIQUE INDEX "FacebookGroupRecord_groupAddress_key" ON "FacebookGroupRecord"("groupAddress");

-- AddForeignKey
ALTER TABLE "FacebookGroupRecord" ADD CONSTRAINT "FacebookGroupRecord_facebookGroupCrawlTaskId_fkey" FOREIGN KEY ("facebookGroupCrawlTaskId") REFERENCES "FacebookGroupCrawlTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;
