import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/auth/audit";

function normalizePhone(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "62" + digits.slice(1);
  else if (digits.startsWith("8")) digits = "62" + digits;
  else if (!digits.startsWith("62") && digits.length > 5) digits = "62" + digits;
  return digits;
}

export function getVisibleCategories(visibility: string, role: string): boolean {
  if (role === "SUPER_ADMIN" || role === "ADMIN") return true;
  if (role === "STAFF") return ["PUBLIC", "RESIDENTS_ONLY", "STAFF_ONLY"].includes(visibility);
  if (role === "RESIDENT") return visibility === "PUBLIC";
  return visibility === "PUBLIC";
}

export async function createContact(communityId: string, adminId: string, data: {
  category: string; name: string; phone?: string; whatsapp?: string;
  availability?: string; visibility?: string; sortOrder?: number;
}) {
  const contact = await db.importantContact.create({
    data: {
      communityId,
      category: data.category as never,
      name: data.name,
      phone: data.phone ? normalizePhone(data.phone) : null,
      whatsapp: data.whatsapp ? normalizePhone(data.whatsapp) : null,
      availability: data.availability ?? null,
      visibility: (data.visibility ?? "PUBLIC") as never,
      sortOrder: data.sortOrder ?? 0,
    },
  });
  await createAuditLog({ communityId, userId: adminId, action: "REGISTER", entityType: "CONTACT", entityId: contact.id, details: { name: data.name } });
  return contact;
}

export async function updateContact(communityId: string, contactId: string, adminId: string, data: Record<string, unknown>) {
  if (data.phone) data.phone = normalizePhone(data.phone as string);
  if (data.whatsapp) data.whatsapp = normalizePhone(data.whatsapp as string);
  const updated = await db.importantContact.update({ where: { id: contactId }, data });
  await createAuditLog({ communityId, userId: adminId, action: "REGISTER", entityType: "CONTACT", entityId: contactId, details: { action: "update" } });
  return updated;
}

export async function deleteContact(communityId: string, contactId: string, adminId: string) {
  await db.importantContact.delete({ where: { id: contactId } });
  await createAuditLog({ communityId, userId: adminId, action: "REGISTER", entityType: "CONTACT", entityId: contactId, details: { action: "delete" } });
}

export async function listContacts(communityId: string, role: string) {
  const where: Record<string, unknown> = { communityId };
  if (role === "RESIDENT") where.visibility = "PUBLIC";
  else if (role === "STAFF") where.visibility = { in: ["PUBLIC", "RESIDENTS_ONLY", "STAFF_ONLY"] };
  return db.importantContact.findMany({ where, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
}

export { normalizePhone };
