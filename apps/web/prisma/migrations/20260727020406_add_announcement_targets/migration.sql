-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN     "attachmentMeta" JSONB,
ADD COLUMN     "targetBlockIds" JSONB;
