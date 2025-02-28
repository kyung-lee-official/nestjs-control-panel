-- CreateTable
CREATE TABLE "YouTubeToken" (
    "token" TEXT NOT NULL,
    "quotaRunOutAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "YouTubeToken_token_key" ON "YouTubeToken"("token");
