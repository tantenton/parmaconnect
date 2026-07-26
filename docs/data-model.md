# Data Model

ParmaConnect uses PostgreSQL with Prisma ORM.

## Community (Tenant)

Each installation has one Community as the tenant root. All data is scoped to a communityId.

## Core Entities

```
Community
  └── ResidentialBlock (has many)
        └── ResidentialUnit (has many)
              └── Household (has many)
                    ├── Resident (has many)
                    ├── ResidentDocument (has many)
                    └── Vehicle (has many)
```

## Auth / Users

```
User
  ├── Resident (1:1, optional)
  ├── Session (1:many)
  └── various staff action relations (Announcement, Report, etc.)
```

## Operational

```
Report
  └── ReportTimeline

Announcement
  └── AnnouncementRead

Event
  └── EventAttendee
```

## Financial

```
FeeType
  └── BillingRule
        ├── BillingPeriod
        └── Invoice
              ├── InvoiceItem
              └── PaymentAllocation

Payment (many:1 Household)
  └── PaymentAllocation (many:1 Invoice)
```

## Notifications

```
Notification (polymorphic via relatedEntityId/Type)
```

## Audit

```
AuditLog (append-only, all sensitive actions)
```

## Security (CCTV-ready)

```
Camera
  └── SecurityEvent
```

## Key Design Decisions

1. **Community scoping**: All entities have communityId. Cross-community access is architecturally impossible.
2. **Sensitive identity separation**: ResidentSensitiveIdentity is a separate model. Not returned by ordinary queries.
3. **Document storage**: storageKey is unique and randomized. Documents accessed via signed URLs.
4. **No document merging**: Each invoice per household per period per rule is unique.
5. **Oldest-first payment allocation**: Configurable but defaults to FIFO invoice allocation.
6. **Audit append-only**: AuditLog entries are created by app workflows, never deleted.
7. **Verification workflow**: Households and residents have explicit verification statuses.