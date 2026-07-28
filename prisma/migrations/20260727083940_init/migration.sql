-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loginId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'LEADER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "gender" TEXT,
    "photoUrl" TEXT,
    "phone" TEXT,
    "birthday" DATETIME,
    "memo" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "groupId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Member_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Feature" (
    "slug" TEXT NOT NULL PRIMARY KEY,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "config" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "ActivityRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "featureSlug" TEXT NOT NULL,
    "title" TEXT,
    "roomCode" TEXT,
    "status" TEXT NOT NULL DEFAULT 'READY',
    "config" JSONB NOT NULL,
    "result" JSONB NOT NULL,
    "createdById" TEXT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" DATETIME,
    CONSTRAINT "ActivityRun_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "runId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "score" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Team_runId_fkey" FOREIGN KEY ("runId") REFERENCES "ActivityRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RunParticipant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "runId" TEXT NOT NULL,
    "memberId" TEXT,
    "guestName" TEXT,
    "orderNo" INTEGER,
    "resultLabel" TEXT,
    "teamId" TEXT,
    "score" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "RunParticipant_runId_fkey" FOREIGN KEY ("runId") REFERENCES "ActivityRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RunParticipant_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RunParticipant_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuizCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "QuizQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "categoryId" TEXT,
    "type" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "choices" JSONB NOT NULL,
    "answer" TEXT NOT NULL,
    "explanation" TEXT,
    "reference" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "QuizQuestion_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "QuizCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuizAnswer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "runId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "participantId" TEXT,
    "given" TEXT,
    "isCorrect" BOOLEAN NOT NULL,
    "elapsedMs" INTEGER,
    "answeredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuizAnswer_runId_fkey" FOREIGN KEY ("runId") REFERENCES "ActivityRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "QuizAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuizQuestion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_loginId_key" ON "User"("loginId");

-- CreateIndex
CREATE UNIQUE INDEX "Group_name_key" ON "Group"("name");

-- CreateIndex
CREATE INDEX "Member_isActive_name_idx" ON "Member"("isActive", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityRun_roomCode_key" ON "ActivityRun"("roomCode");

-- CreateIndex
CREATE INDEX "ActivityRun_featureSlug_startedAt_idx" ON "ActivityRun"("featureSlug", "startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "RunParticipant_runId_memberId_key" ON "RunParticipant"("runId", "memberId");

-- CreateIndex
CREATE UNIQUE INDEX "QuizCategory_name_key" ON "QuizCategory"("name");
