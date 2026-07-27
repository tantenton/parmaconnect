import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/auth/audit";

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function sanitizeContent(content: string): string {
  return content.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<iframe[\s\S]*?<\/iframe>/gi, "");
}

export async function createInfoPage(communityId: string, adminId: string, data: {
  title: string; content: string; category?: string; slug?: string; visibility?: string; effectiveDate?: Date;
}) {
  const slug = data.slug || slugify(data.title);
  const page = await db.informationPage.create({
    data: {
      communityId,
      slug,
      title: data.title,
      content: sanitizeContent(data.content),
      category: data.category ?? null,
      status: "DRAFT",
      visibility: (data.visibility ?? "PUBLIC") as never,
      effectiveDate: data.effectiveDate ?? null,
    },
  });
  await createAuditLog({ communityId, userId: adminId, action: "REGISTER", entityType: "INFO_PAGE", entityId: page.id, details: { title: data.title } });
  return page;
}

export async function publishInfoPage(communityId: string, pageId: string, adminId: string) {
  const page = await db.informationPage.findFirst({ where: { id: pageId, communityId } });
  if (!page) throw new Error("Halaman tidak ditemukan");
  const updated = await db.informationPage.update({
    where: { id: pageId },
    data: { status: "PUBLISHED", publishedAt: new Date(), publishedById: adminId },
  });
  await createAuditLog({ communityId, userId: adminId, action: "REGISTER", entityType: "INFO_PAGE", entityId: pageId, details: { action: "publish" } });
  return updated;
}

export async function archiveInfoPage(communityId: string, pageId: string, adminId: string) {
  const updated = await db.informationPage.update({
    where: { id: pageId },
    data: { status: "ARCHIVED" },
  });
  await createAuditLog({ communityId, userId: adminId, action: "REGISTER", entityType: "INFO_PAGE", entityId: pageId, details: { action: "archive" } });
  return updated;
}

export async function listInfoPages(communityId: string, role: string, search?: string) {
  const where: Record<string, unknown> = { communityId };
  if (role === "RESIDENT") where.status = "PUBLISHED";
  if (search) where.OR = [
    { title: { contains: search, mode: "insensitive" } },
    { content: { contains: search, mode: "insensitive" } },
  ];
  return db.informationPage.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { publishedBy: { select: { id: true, name: true } } },
  });
}

export async function getInfoPage(communityId: string, slug: string, role: string) {
  const where: Record<string, unknown> = { communityId, slug };
  if (role === "RESIDENT") where.status = "PUBLISHED";
  return db.informationPage.findFirst({
    where,
    include: { publishedBy: { select: { id: true, name: true } } },
  });
}

export { slugify, sanitizeContent };
