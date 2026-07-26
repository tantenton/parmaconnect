/**
 * ParmaConnect Development Seed Script
 * Uses ONLY synthetic/fictional data. No real resident data.
 */
import "dotenv/config";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter: new PrismaPg(pool) });

const COMMUNITY_ID = "seed-community-parma";

async function main() {
  console.log("Seeding Cluster Parma synthetic data...");

  // Community
  const community = await db.community.upsert({
    where: { slug: "cluster-parma" },
    update: {},
    create: {
      id: COMMUNITY_ID,
      slug: "cluster-parma",
      name: "Cluster Parma",
      shortName: "Parma",
      parentArea: "Mutiara Columbus",
      address: "Jl. Cluster Parma, Mutiara Columbus, Jawa Barat",
      timezone: "Asia/Jakarta",
      locale: "id-ID",
      currency: "IDR",
      status: "ACTIVE",
      branding: JSON.stringify({ primaryColor: "#2563eb", accentColor: "#f59e0b" }),
      moduleConfig: JSON.stringify({
        residents: true,
        households: true,
        documentArchive: true,
        announcements: true,
        reports: true,
        events: true,
        contacts: true,
        vehicles: true,
        billing: true,
        payments: true,
        visitors: true,
        securityEvents: false,
        cctvIntegrations: false,
      }),
    },
  });
  console.log(`  Community: ${community.name}`);

  // Blocks
  const blockA = await db.residentialBlock.upsert({
    where: { communityId_code: { communityId: COMMUNITY_ID, code: "A" } },
    update: {},
    create: { communityId: COMMUNITY_ID, code: "A", name: "Blok A", description: "Blok pertama Cluster Parma" },
  });
  const blockB = await db.residentialBlock.upsert({
    where: { communityId_code: { communityId: COMMUNITY_ID, code: "B" } },
    update: {},
    create: { communityId: COMMUNITY_ID, code: "B", name: "Blok B", description: "Blok kedua Cluster Parma" },
  });
  const blockC = await db.residentialBlock.upsert({
    where: { communityId_code: { communityId: COMMUNITY_ID, code: "C" } },
    update: {},
    create: { communityId: COMMUNITY_ID, code: "C", name: "Blok C", description: "Blok ketiga Cluster Parma" },
  });
  console.log(`  Blocks: ${blockA.code}, ${blockB.code}, ${blockC.code}`);

  // Units
  const units: Awaited<ReturnType<typeof db.residentialUnit.create>>[] = [];
  for (const block of [blockA, blockB, blockC]) {
    for (let n = 1; n <= 10; n++) {
      const unitNumber = `${block.code}${String(n).padStart(2, "0")}`;
      const occupancy =
        n <= 7 ? "OWNER_OCCUPIED" : n <= 9 ? "TENANT_OCCUPIED" : "VACANT";
      const ownership =
        n <= 7 ? "OWNER_OCCUPIED" : n <= 9 ? "TENANT_OCCUPIED" : "VACANT";
      const u = await db.residentialUnit.upsert({
        where: { communityId_unitNumber: { communityId: COMMUNITY_ID, unitNumber } },
        update: {},
        create: {
          communityId: COMMUNITY_ID,
          blockId: block.id,
          unitNumber,
          displayName: `Unit ${unitNumber}`,
          occupancyStatus: occupancy,
          ownershipStatus: ownership,
        },
      });
      units.push(u);
    }
  }
  console.log(`  Units: ${units.length} unit`);

  // Users & Residents
  const passwordHash = await bcrypt.hash("DevPassword123!", 12);
  const residentUnits = units.filter((_, i) => i < 15);

  const users: Awaited<ReturnType<typeof db.user.create>>[] = [];

  // Admin user
  const adminUser = await db.user.upsert({
    where: { communityId_email: { communityId: COMMUNITY_ID, email: "admin@clusterparma.local" } },
    update: {},
    create: {
      communityId: COMMUNITY_ID,
      email: "admin@clusterparma.local",
      passwordHash,
      name: "Administrator Parma",
      role: "ADMIN",
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  });
  users.push(adminUser);

  // Demo residents (password: DemoPassword123!)
  for (let i = 1; i <= 15; i++) {
    const u = await db.user.upsert({
      where: { communityId_email: { communityId: COMMUNITY_ID, email: `resident${i}@clusterparma.local` } },
      update: {},
      create: {
        communityId: COMMUNITY_ID,
        email: `resident${i}@clusterparma.local`,
        passwordHash,
        name: `Warga Parma ${i}`,
        role: "RESIDENT",
        status: "ACTIVE",
      },
    });
    users.push(u);
  }
  console.log(`  Users: ${users.length} (1 admin + 15 residents)`);

  // Households
  const households: Awaited<ReturnType<typeof db.household.create>>[] = [];
  for (let i = 0; i < Math.min(15, residentUnits.length); i++) {
    const unit = residentUnits[i];
    const isOwner = i < 10;
    const h = await db.household.upsert({
      where: { communityId_householdNumber: { communityId: COMMUNITY_ID, householdNumber: `HH${String(i + 1).padStart(3, "0")}` } },
      update: {},
      create: {
        communityId: COMMUNITY_ID,
        residentialUnitId: unit.id,
        householdNumber: `HH${String(i + 1).padStart(3, "0")}`,
        occupancyType: isOwner ? "OWNER_OCCUPIED" : "TENANT_OCCUPIED",
        status: "ACTIVE",
        verificationStatus: i < 12 ? "VERIFIED" : i < 14 ? "SUBMITTED" : "DRAFT",
        primaryContactResidentId: undefined,
        emergencyContactName: `Kontak Darurat ${i + 1}`,
        emergencyContactPhone: `+6281234567${String(i).padStart(3, "0")}`,
      },
    });
    households.push(h);
  }
  console.log(`  Households: ${households.length}`);

  // Residents
  const residents: Awaited<ReturnType<typeof db.resident.create>>[] = [];
  for (let i = 0; i < households.length; i++) {
    const hh = households[i];
    const user = users[i + 1];
    const r = await db.resident.upsert({
      where: { id: `seed-resident-${i}` },
      update: {},
      create: {
        id: `seed-resident-${i}`,
        communityId: COMMUNITY_ID,
        householdId: hh.id,
        userId: user?.id,
        fullName: user?.name ?? `Warga Parma ${i + 1}`,
        familyRelationship: i === 0 ? "KEPALA_KELUARGA" : i < 3 ? "ISTRI" : "ANAK",
        gender: i % 2 === 0 ? "MALE" : "FEMALE",
        phone: `+628****4567${String(i).padStart(3, "0")}`,
        email: user?.email,
        residentStatus: "ACTIVE",
        isPrimaryContact: i === 0,
        moveInDate: new Date("2022-01-01"),
      },
    });
    residents.push(r);

    // Link household head
    if (i === 0) {
      await db.household.update({
        where: { id: hh.id },
        data: { headResidentId: r.id, primaryContactResidentId: r.id },
      });
    }
  }
  console.log(`  Residents: ${residents.length}`);

  // Announcements
  await db.announcement.createMany({
    data: [
      {
        communityId: COMMUNITY_ID,
        title: "Selamat Datang di ParmaConnect",
        content: "Platform manajemen komunitas Cluster Parma kini tersedia untuk seluruh warga.",
        category: "GENERAL",
        priority: "HIGH",
        status: "PUBLISHED",
        audience: "ALL",
        createdById: adminUser.id,
        startsAt: new Date("2026-01-01"),
        publishedAt: new Date("2026-01-01"),
      },
      {
        communityId: COMMUNITY_ID,
        title: "Jadwal Pemadaman Listrik Rutin",
        content: "Pemadaman listrik terjadwal untuk perawatan perangkat umum pada hari Sabtu pukul 09.00-12.00.",
        category: "MAINTENANCE",
        priority: "NORMAL",
        status: "PUBLISHED",
        audience: "ALL",
        createdById: adminUser.id,
        startsAt: new Date("2026-07-01"),
        expiresAt: new Date("2026-07-31"),
        publishedAt: new Date("2026-07-01"),
      },
      {
        communityId: COMMUNITY_ID,
        title: "Draf: Kebijakan Parkir Baru",
        content: "Draf kebijakan parkir sedang dalam review.",
        category: "GENERAL",
        priority: "NORMAL",
        status: "DRAFT",
        audience: "ADMINS",
        createdById: adminUser.id,
        startsAt: new Date("2026-08-01"),
      },
    ],
    skipDuplicates: true,
  });
  console.log("  Announcements: 3 (2 published, 1 draft)");

  // Events
  await db.event.createMany({
    data: [
      {
        communityId: COMMUNITY_ID,
        title: "Kerjabebas Cluster Parma",
        description: "Kerjabebas membersihkan area cluster setiap bulan pertama.",
        location: "Aula Cluster Parma",
        startsAt: new Date("2026-08-02T08:00:00"),
        endsAt: new Date("2026-08-02T12:00:00"),
        capacity: 100,
        status: "ACTIVE",
        organizerId: adminUser.id,
      },
    ],
    skipDuplicates: true,
  });
  console.log("  Events: 1");

  // Important Contacts
  await db.importantContact.createMany({
    data: [
      { communityId: COMMUNITY_ID, category: "SECURITY", name: "Pos Keamanan Cluster Parma", phone: "+628123456000", whatsapp: "+628123456000", availability: "24 jam", visibility: "PUBLIC", sortOrder: 1 },
      { communityId: COMMUNITY_ID, category: "MANAGEMENT", name: "Kantor Pengelola Cluster Parma", phone: "+628123456001", whatsapp: "+628123456001", availability: "Senin-Jumat 08:00-17:00", visibility: "PUBLIC", sortOrder: 2 },
      { communityId: COMMUNITY_ID, category: "AMBULANCE", name: "Layanan Darurat Medis", phone: "119", availability: "24 jam", visibility: "PUBLIC", sortOrder: 10 },
      { communityId: COMMUNITY_ID, category: "POLICE", name: "Kepolisian Sektor Terdekat", phone: "110", availability: "24 jam", visibility: "PUBLIC", sortOrder: 11 },
    ],
    skipDuplicates: true,
  });
  console.log("  Important Contacts: 4");

  // Vehicles (sample)
  for (let i = 0; i < Math.min(5, households.length); i++) {
    await db.vehicle.upsert({
      where: { id: `seed-vehicle-${i}` },
      update: {},
      create: {
        id: `seed-vehicle-${i}`,
        communityId: COMMUNITY_ID,
        householdId: households[i].id,
        residentId: residents[i]?.id,
        licensePlate: `B ${1000 + i} XYZ`,
        vehicleType: i % 2 === 0 ? "MOTORCYCLE" : "CAR",
        brand: i % 2 === 0 ? "Honda" : "Toyota",
        model: i % 2 === 0 ? "Beat" : "Avanza",
        color: i % 2 === 0 ? "Hitam" : "Putih",
        stickerNumber: `STK${String(i + 1).padStart(4, "0")}`,
        status: "ACTIVE",
        validFrom: new Date("2025-01-01"),
        validUntil: new Date("2027-01-01"),
      },
    });
  }
  console.log("  Vehicles: 5");

  // Billing default config
  await db.billingDefaultConfig.upsert({
    where: { communityId: COMMUNITY_ID },
    update: {},
    create: {
      communityId: COMMUNITY_ID,
      defaultCurrency: "IDR",
      defaultDueDay: 10,
      defaultGenerationDay: 1,
      carryForward: true,
      penaltyEnabled: false,
    },
  });

  // Fee type
  const feeType = await db.feeType.upsert({
    where: { communityId_code: { communityId: COMMUNITY_ID, code: "MONTHLY_FEE" } },
    update: {},
    create: {
      communityId: COMMUNITY_ID,
      code: "MONTHLY_FEE",
      name: "Iuran Bulanan Wajib",
      description: "Iuran bulanan wajib untuk pemeliharaan fasilitas Cluster Parma",
      isMandatory: true,
    },
  });

  // Billing rule
  const billingRule = await db.billingRule.upsert({
    where: { id: "seed-billing-rule-monthly" },
    update: {},
    create: {
      id: "seed-billing-rule-monthly",
      communityId: COMMUNITY_ID,
      feeTypeId: feeType.id,
      name: "Iuran Bulanan Default",
      amount: 150000,
      currency: "IDR",
      generationDay: 1,
      dueDay: 10,
      carryForward: true,
      isActive: true,
    },
  });
  console.log("  Billing: fee type + rule configured");

  // Invoices (July 2026, some paid, some overdue)
  for (let i = 0; i < Math.min(10, households.length); i++) {
    const isPaid = i < 6;
    const isPartiallyPaid = i >= 6 && i < 8;
    const status = isPaid ? "PAID" : isPartiallyPaid ? "PARTIALLY_PAID" : i < 9 ? "UNPAID" : "OVERDUE";
    const paidAt = isPaid ? new Date("2026-07-08") : isPartiallyPaid ? new Date("2026-07-08") : null;

    await db.invoice.upsert({
      where: { id: `seed-invoice-jul-${i}` },
      update: {},
      create: {
        id: `seed-invoice-jul-${i}`,
        communityId: COMMUNITY_ID,
        householdId: households[i].id,
        billingRuleId: billingRule.id,
        invoiceNumber: `INV-2026-07-${String(i + 1).padStart(4, "0")}`,
        status,
        issueDate: new Date("2026-07-01"),
        dueDate: new Date("2026-07-10"),
        subtotal: 150000,
        totalAmount: 150000,
        paidAmount: isPaid ? 150000 : isPartiallyPaid ? 75000 : 0,
        currency: "IDR",
        paidAt,
      },
    });

    // Invoice item
    await db.invoiceItem.upsert({
      where: { id: `seed-item-jul-${i}` },
      update: {},
      create: {
        id: `seed-item-jul-${i}`,
        invoiceId: `seed-invoice-jul-${i}`,
        description: "Iuran Bulanan Wajib - Juli 2026",
        amount: 150000,
        quantity: 1,
      },
    });
  }

  // August invoice (new month, all unpaid — carry forward scenario)
  for (let i = 0; i < Math.min(10, households.length); i++) {
    await db.invoice.upsert({
      where: { id: `seed-invoice-aug-${i}` },
      update: {},
      create: {
        id: `seed-invoice-aug-${i}`,
        communityId: COMMUNITY_ID,
        householdId: households[i].id,
        billingRuleId: billingRule.id,
        invoiceNumber: `INV-2026-08-${String(i + 1).padStart(4, "0")}`,
        status: "UNPAID",
        issueDate: new Date("2026-08-01"),
        dueDate: new Date("2026-08-10"),
        subtotal: 150000,
        totalAmount: 150000,
        paidAmount: 0,
        currency: "IDR",
      },
    });

    await db.invoiceItem.upsert({
      where: { id: `seed-item-aug-${i}` },
      update: {},
      create: {
        id: `seed-item-aug-${i}`,
        invoiceId: `seed-invoice-aug-${i}`,
        description: "Iuran Bulanan Wajib - Agustus 2026",
        amount: 150000,
        quantity: 1,
      },
    });
  }
  console.log("  Invoices: 20 (July + August, with various payment states)");

  // Reports
  await db.report.createMany({
    data: [
      {
        communityId: COMMUNITY_ID,
        title: "Lampu Jalan Mati di Blok A",
        description: "Lampu jalan di depan unit A01 sudah mati selama 3 hari.",
        category: "STREET_LIGHT",
        location: "Blok A - Depan A01",
        priority: "MEDIUM",
        status: "IN_PROGRESS",
        reporterId: users[1].id,
        assignedStaffId: users[1].id,
      },
      {
        communityId: COMMUNITY_ID,
        title: "Sampah Menumpuk di TPA",
        description: "Tempat sampah di area Blok B penuh dan berbau.",
        category: "WASTE",
        location: "Blok B - Area TPA",
        priority: "LOW",
        status: "NEW",
        reporterId: users[2].id,
      },
      {
        communityId: COMMUNITY_ID,
        title: "Kerusakan Pagar Komunal",
        description: "Pagar komunal di sisi utara rusak dan perlu diperbaiki.",
        category: "COMMON_FACILITY",
        location: "Sisi Utara Cluster",
        priority: "HIGH",
        status: "RESOLVED",
        reporterId: users[3].id,
        assignedStaffId: users[1].id,
        resolution: "Pagar telah diperbaiki oleh tim teknis.",
        resolvedAt: new Date("2026-07-20"),
      },
    ],
    skipDuplicates: true,
  });
  console.log("  Reports: 3 (various statuses)");

  // Visitors
  for (let i = 0; i < 3; i++) {
    await db.visitor.create({
      data: {
        communityId: COMMUNITY_ID,
        householdId: households[i]?.id,
        name: `Tamu Visita ${i + 1}`,
        licensePlate: i === 0 ? "B 9999 ZZZ" : null,
        destinationUnitId: residentUnits[i]?.id,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 8 * 60 * 60 * 1000),
        visitCode: `VISIT${String(i + 1).padStart(4, "0")}`,
        status: "PENDING",
      },
    });
  }
  console.log("  Visitors: 3");

  console.log("\nSeed complete. Demo credentials:");
  console.log("  Admin:    admin@clusterparma.local / DevPassword123!");
  console.log("  Resident: resident1@clusterparma.local / DevPassword123!");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect().then(() => pool.end()));