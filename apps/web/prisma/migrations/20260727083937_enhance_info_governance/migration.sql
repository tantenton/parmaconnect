-- CreateEnum
CREATE TYPE "InfoPageStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "GovernanceType" AS ENUM ('MINUTES', 'DECISION', 'POLICY');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED');

-- DropIndex
DROP INDEX "GovernanceDocument_communityId_idx";

-- AlterTable
ALTER TABLE "GovernanceDocument" ADD COLUMN     "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "publishedById" TEXT,
ADD COLUMN     "supersededById" TEXT,
ADD COLUMN     "type" "GovernanceType" NOT NULL DEFAULT 'MINUTES';

-- AlterTable
ALTER TABLE "InformationPage" ADD COLUMN     "category" TEXT,
ADD COLUMN     "effectiveDate" TIMESTAMP(3),
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "publishedById" TEXT,
ADD COLUMN     "status" "InfoPageStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateIndex
CREATE INDEX "GovernanceDocument_communityId_type_idx" ON "GovernanceDocument"("communityId", "type");

-- CreateIndex
CREATE INDEX "GovernanceDocument_communityId_effectiveDate_idx" ON "GovernanceDocument"("communityId", "effectiveDate");

-- CreateIndex
CREATE INDEX "InformationPage_communityId_status_idx" ON "InformationPage"("communityId", "status");

-- AddForeignKey
ALTER TABLE "InformationPage" ADD CONSTRAINT "InformationPage_publishedById_fkey" FOREIGN KEY ("publishedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovernanceDocument" ADD CONSTRAINT "GovernanceDocument_publishedById_fkey" FOREIGN KEY ("publishedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovernanceDocument" ADD CONSTRAINT "GovernanceDocument_supersededById_fkey" FOREIGN KEY ("supersededById") REFERENCES "GovernanceDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;
