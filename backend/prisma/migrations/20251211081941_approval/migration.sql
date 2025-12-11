-- CreateEnum
CREATE TYPE "approvalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "approvalsList" (
    "id" SERIAL NOT NULL,
    "userid" INTEGER NOT NULL,
    "command" TEXT NOT NULL,
    "status" "approvalStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "approvalsList_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "approvalsList" ADD CONSTRAINT "approvalsList_userid_fkey" FOREIGN KEY ("userid") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
