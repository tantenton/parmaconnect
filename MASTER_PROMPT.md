# MASTER AUTONOMOUS BUILD PROMPT — PARMACONNECT

You are the autonomous lead software engineer, system architect, security engineer, QA engineer, DevOps engineer, product owner, and technical writer responsible for building a production-oriented open-source residential community management platform named:

# ParmaConnect

Reference installation:

* Community name: Cluster Parma
* Parent residential area: Mutiara Columbus
* Primary language: Indonesian
* Product model: Open-source, self-hostable, configurable for other residential clusters
* Primary deployment environment: VPS
* Primary operator: Hermes running autonomously
* Expected runtime: Continue working for as long as the environment allows
* Human operator may be asleep and unavailable
* Do not pause merely to ask for approval on ordinary implementation decisions

Your task is to transform the current repository into a working, secure, maintainable, documented, and extensible application.

This is not a prototype-only task.

Do not stop after:

* Creating a landing page
* Creating database models without functional UI
* Creating UI without backend functionality
* Creating fake buttons
* Creating placeholder forms
* Producing only documentation
* Producing only a plan
* Passing build while runtime functionality is broken
* Completing one small feature and waiting for further instructions

Continue implementing the roadmap incrementally until you reach a genuine external blocker or exhaust all useful work that can safely be completed.

---

# 1. PRIMARY PRODUCT VISION

ParmaConnect is an open-source platform for managing residential clusters, housing communities, gated communities, neighborhoods, and similar local communities.

The foundation is:

```text
Community
→ Blocks and residential units
→ Households
→ Residents
→ Resident documents
→ Vehicles
→ Announcements
→ Resident reports
→ Operational tasks
→ Community events
→ Billing and payments
→ Security operations
→ Future smart CCTV integrations
```

Cluster Parma is the first installation, not the only possible installation.

Therefore:

* Do not hardcode “Cluster Parma” throughout the application.
* Use configurable community branding.
* Use configurable terminology.
* Make features modular.
* Isolate data per installation.
* Keep all private resident data outside the public repository.
* Design migrations and upgrades for future installations.
* Keep open-source distribution in mind from the beginning.

---

# 2. AUTONOMOUS OPERATING RULES

Work autonomously.

Do not ask the human operator ordinary questions that can be solved with reasonable engineering judgment.

When information is missing:

1. Inspect the repository.
2. Inspect existing configuration and documentation.
3. Infer the safest reasonable default.
4. Document the assumption.
5. Implement the feature in a reversible and configurable manner.

Only stop for a blocking question when all of the following are true:

* The missing information cannot be inferred safely.
* No placeholder, adapter, mock provider, or environment variable can unblock development.
* Proceeding would risk data loss, financial damage, or a serious security flaw.
* No other independent milestone can be completed first.

If a credential is missing:

* Implement the integration interface.
* Implement a mock or sandbox provider.
* Add environment validation.
* Add documentation.
* Continue with other tasks.
* Do not wait idle for the credential.

Never claim that a feature works unless it has been functionally verified.

---

# 3. FIRST ACTIONS

Before modifying code:

1. Inspect the entire repository.
2. Identify:

   * Framework
   * Package manager
   * Workspace structure
   * Current dependencies
   * Existing database configuration
   * Existing authentication
   * Existing code quality tools
   * Existing tests
   * Existing deployment configuration
   * Existing Git branch and remote
3. Read:

   * README
   * package manifests
   * environment examples
   * database schema
   * migration history
   * CI configuration
   * Docker configuration
   * all existing planning documents
4. Run:

   * Git status
   * package installation if needed
   * typecheck
   * lint
   * tests
   * build
5. Record the baseline condition.
6. Do not destroy working functionality.
7. Do not rewrite the whole project unless the existing architecture is objectively unusable.

If the repository is empty or unsuitable, initialize the architecture described below.

---

# 4. RECOMMENDED TECHNOLOGY STACK

Use the existing stack if it is already sound.

Otherwise use:

## Application

* Next.js current stable release
* TypeScript with strict mode
* App Router
* React Server Components where appropriate
* Server Actions or typed route handlers
* Tailwind CSS
* Accessible reusable UI components

## Monorepo

Prefer:

* pnpm workspaces
* Turborepo if beneficial

Suggested structure:

```text
parmaconnect/
├── apps/
│   ├── web/
│   └── docs/
├── packages/
│   ├── ui/
│   ├── config/
│   ├── database/
│   ├── auth/
│   ├── security/
│   ├── validation/
│   ├── notifications/
│   ├── observability/
│   └── shared/
├── modules/
│   ├── communities/
│   ├── residences/
│   ├── households/
│   ├── residents/
│   ├── documents/
│   ├── announcements/
│   ├── reports/
│   ├── events/
│   ├── contacts/
│   ├── vehicles/
│   ├── billing/
│   ├── payments/
│   ├── visitors/
│   └── security-events/
├── tooling/
│   ├── create-parmaconnect/
│   ├── scripts/
│   └── security-checks/
├── docker/
├── docs/
├── examples/
└── .github/
```

Do not force this exact structure if the existing repository already has a clean modular architecture.

## Database

Preferred:

* PostgreSQL
* Prisma ORM

If the project already uses Supabase:

* Use Supabase PostgreSQL
* Use private storage
* Use Row Level Security where appropriate
* Keep service-role credentials server-only

## Authentication

Use a secure supported authentication solution.

Required capabilities:

* Email and password or secure magic link
* Password reset
* Session management
* Role-based access
* MFA support for privileged administrators
* Account disabling
* Session revocation

## Validation

* Zod or equivalent
* Server-side validation is mandatory
* Client-side validation is only an additional convenience

## Testing

Use:

* Unit tests
* Integration tests
* Authorization tests
* End-to-end browser tests
* Database migration tests
* Security regression tests

Preferred browser automation:

* Playwright

## Deployment

Support:

* VPS
* Docker Compose
* Reverse proxy
* HTTPS-ready configuration

Optionally support:

* Vercel
* Managed PostgreSQL
* Supabase

The VPS and Docker workflow is the priority.

---

# 5. OPEN-SOURCE PRODUCT REQUIREMENTS

Build ParmaConnect as a reusable product.

## Required branding configuration

Create a typed community configuration system containing at least:

```text
Application name
Community name
Community short name
Parent area
Logo
Favicon
Primary locale
Time zone
Currency
Address terminology
Block terminology
Residential unit terminology
Contact details
Enabled modules
Document retention defaults
Billing defaults
```

Default installation:

```text
Application name: ParmaConnect
Community name: Cluster Parma
Parent area: Mutiara Columbus
Primary locale: id-ID
Time zone: Asia/Jakarta
Currency: IDR
```

No sensitive production setting may be committed.

## Required module configuration

Support feature flags for:

```text
Residents
Households
Document archive
Announcements
Reports
Events
Contacts
Vehicles
Billing
Payments
Visitors
Security events
CCTV integrations
```

Security controls must not be casually disabled.

The following should remain required or fail closed:

```text
Authorization
Audit logging for sensitive actions
Private document storage
Server-side validation
Secure session handling
```

## Distribution goal

Prepare for eventual usage such as:

```bash
npx create-parmaconnect@latest
```

Do not attempt to publish npm packages unless registry credentials and explicit publishing configuration are already available.

However, create a clean foundation for:

```text
create-parmaconnect
@parmaconnect/ui
@parmaconnect/config
@parmaconnect/security
```

Add documentation explaining the intended installer flow.

---

# 6. SECURITY NON-NEGOTIABLES

This application will eventually store highly sensitive resident information, including family cards and identity information.

Security is an acceptance gate, not an optional improvement.

## Production data prohibition

During development:

* Never use real family cards.
* Never use real resident NIK values.
* Never use real phone numbers unless explicitly provided for testing.
* Never use real identity documents.
* Never commit production dumps.
* Never commit uploaded documents.
* Never commit secrets.

Use synthetic seed data only.

## Authentication rules

Implement:

* Secure password handling
* Secure session cookies
* HTTP-only cookies
* SameSite configuration
* Secure flag in production
* Rate limiting
* Login attempt throttling
* Account disabling
* Password reset security
* Session invalidation
* Shorter privileged sessions where practical

Admin MFA can be implemented as a supported capability and documented if full provider integration is not yet available.

## Authorization rules

Authorization must exist at multiple layers:

* Route or server action
* Service layer
* Database query filtering
* Storage access

Do not rely on hidden UI elements.

Required roles initially:

```text
SUPER_ADMIN
ADMIN
DOCUMENT_ADMIN
FINANCE_ADMIN
SECURITY_OFFICER
STAFF
RESIDENT
```

Permissions must be granular.

Examples:

* A resident can only see their own household.
* A resident cannot see another household’s documents.
* A security officer can see operational resident and vehicle data but not family card files or full NIK.
* A finance admin can see billing data but not private family documents.
* A document admin can review resident documents.
* Only highly privileged roles can export sensitive records.
* Every sensitive access is logged.

## Sensitive field handling

Mask values by default.

Examples:

```text
NIK: 3273••••••••1234
Family card number: 3273••••••••5678
```

Avoid returning full sensitive values to the client unless explicitly necessary and authorized.

Never write sensitive values into:

* Application logs
* Browser logs
* Error monitoring
* Analytics
* Audit metadata not intended for sensitive values
* Test snapshots
* Seed files

## Document storage

Documents must:

* Be stored privately
* Never use public permanent URLs
* Use randomized storage keys
* Have validated file type
* Have validated file size
* Check MIME type and file signature where practical
* Generate short-lived signed access URLs
* Record document access
* Support document versioning
* Support verification status
* Avoid exposing internal storage paths

Statuses:

```text
DRAFT
SUBMITTED
UNDER_REVIEW
NEEDS_REVISION
VERIFIED
REJECTED
ARCHIVED
EXPIRED
```

Implement mock scanning or a pluggable scanning interface if antivirus infrastructure is unavailable.

## Audit logs

Audit at least:

* Login events
* Failed privileged login events
* Role changes
* Resident verification
* Household changes
* Document view
* Document download
* Document verification
* Sensitive export
* Billing changes
* Payment changes
* Refunds
* Financial adjustments
* Admin account changes
* Security configuration changes

Audit records should be append-only from normal application workflows.

## Security headers

Implement:

* Content Security Policy
* HSTS in production
* X-Content-Type-Options
* Referrer-Policy
* Frame restrictions
* Permissions-Policy where appropriate

## Secrets

All secrets must come from environment variables or secret stores.

Provide:

* `.env.example`
* Environment validation
* Clear separation of development, test, staging, and production
* No default production passwords

## Security tests

Create automated tests proving:

* Resident A cannot access resident B.
* Security officers cannot access family card documents.
* Finance admins cannot access family card documents.
* Anonymous users cannot access private data.
* Signed file URLs expire.
* Disabled accounts cannot authenticate.
* Sensitive routes reject insufficient roles.
* Client-provided roles are ignored.
* ID tampering does not bypass access control.

---

# 7. CORE DATA MODEL

Design the schema carefully.

At minimum include the following domain concepts.

## Community

Fields may include:

```text
id
slug
name
shortName
parentArea
address
timezone
locale
currency
status
brandingConfiguration
moduleConfiguration
createdAt
updatedAt
```

Even if initial deployments use one community per installation, design the schema so community ownership is explicit.

## Residential Block

```text
id
communityId
code
name
description
sortOrder
status
```

## Residential Unit

```text
id
communityId
blockId
unitNumber
displayName
occupancyStatus
ownershipStatus
notes
createdAt
updatedAt
```

Occupancy statuses:

```text
OWNER_OCCUPIED
TENANT_OCCUPIED
VACANT
RENOVATION
UNCONFIRMED
```

## Household

```text
id
communityId
residentialUnitId
householdNumber
headResidentId
occupancyType
startDate
endDate
status
primaryContactResidentId
emergencyContact
verificationStatus
createdAt
updatedAt
```

## Resident

```text
id
communityId
householdId
userId
fullName
familyRelationship
gender
birthPlace
birthDate
phone
email
residentStatus
moveInDate
moveOutDate
isPrimaryContact
createdAt
updatedAt
```

Only collect data that has a justified operational purpose.

Avoid unnecessary sensitive fields.

## Resident Sensitive Identity

Store highly sensitive identity details separately.

Possible fields:

```text
residentId
encryptedNik
maskedNik
encryptedFamilyCardNumber
maskedFamilyCardNumber
updatedAt
```

Use application-level encryption if implemented safely.

Do not invent weak custom cryptography.

If robust key management is not available, design the interface and document the production requirement while preventing accidental plaintext leakage.

## Resident Document

```text
id
communityId
householdId
residentId
documentType
storageKey
originalFilename
mimeType
sizeBytes
checksum
version
status
submittedBy
verifiedBy
verifiedAt
reviewNotes
createdAt
updatedAt
archivedAt
```

Document types:

```text
FAMILY_CARD
IDENTITY_CARD
LEASE_AGREEMENT
RESIDENT_CONSENT
VEHICLE_DOCUMENT
OTHER
```

## Household Occupancy History

Track:

* Move-in
* Move-out
* Ownership change
* Tenant change
* Household activation
* Household deactivation

Never overwrite important history without an audit trail.

## Announcement

Support:

```text
GENERAL
SECURITY
CLEANLINESS
MAINTENANCE
EVENT
EMERGENCY
```

Include:

* Draft and published status
* Priority
* Start and expiry
* Attachments
* Read tracking
* Audience targeting

## Resident Report

Include:

```text
title
description
category
location
priority
status
reporter
assignedStaff
timestamps
attachments
resolution
timeline
```

Statuses:

```text
NEW
VERIFIED
ASSIGNED
IN_PROGRESS
RESOLVED
CLOSED
REJECTED
DUPLICATE
```

## Event

Include:

* Title
* Description
* Location
* Start and end time
* Attendance
* Capacity if applicable
* Status
* Organizer

## Important Contact

Include:

* Category
* Name
* Phone
* WhatsApp
* Availability
* Visibility
* Sort order

## Vehicle

Include:

```text
communityId
householdId
residentId
licensePlate
vehicleType
brand
model
color
stickerNumber
status
validFrom
validUntil
```

## Billing

Prepare the model even if advanced payments are not implemented immediately.

Include:

```text
FeeType
BillingRule
BillingPeriod
Invoice
InvoiceItem
Payment
PaymentAllocation
PaymentAttempt
PaymentEvent
Settlement
Refund
FinancialAdjustment
Receipt
WebhookEvent
```

Invoice statuses:

```text
DRAFT
ISSUED
UNPAID
PARTIALLY_PAID
PAID
OVERDUE
CANCELLED
WAIVED
```

Payments must be allocated oldest invoice first by default, but keep the allocation system configurable and explicit.

## Notification

Support:

```text
IN_APP
EMAIL
WHATSAPP
PUSH
```

Store:

* Recipient
* Template
* Status
* Attempt count
* Delivery reference
* Failure reason
* Scheduled time
* Sent time
* Related entity
* Consent and preference checks

---

# 8. USER EXPERIENCE REQUIREMENTS

The UI must be:

* Mobile-first
* Usable by non-technical residents
* Accessible
* Clear
* Calm
* Not overloaded with charts
* Suitable for older users
* Indonesian by default
* Prepared for localization

Every feature must have:

* Loading state
* Empty state
* Error state
* Success feedback
* Validation feedback
* Permission-denied state
* Mobile layout
* Desktop layout

Do not leave dead buttons.

Do not create fake charts.

Do not create clickable components without functionality.

---

# 9. REQUIRED APPLICATION AREAS

## Public

* Landing page
* Login
* Registration
* Password reset
* Privacy notice
* Terms or community rules entry point
* Open-source project information where appropriate

## Resident portal

* Dashboard
* Household profile
* Family members
* Resident documents
* Document submission status
* Announcements
* Reports
* Events
* Important contacts
* Vehicles
* Billing summary
* Notification preferences
* Profile and security settings

## Admin portal

* Operational dashboard
* Community configuration
* Blocks
* Residential units
* Households
* Residents
* Resident verification
* Document verification
* Announcements
* Reports
* Staff assignments
* Events
* Important contacts
* Vehicles
* Billing
* Payment records
* Notification delivery
* Audit logs
* User and role administration
* System health
* Backup documentation and status integration points

## Staff portal

* Assigned reports
* Task timeline
* Progress update
* Upload completion evidence
* Task history

## Security portal

Prepare a limited view for:

* Active households
* Registered vehicles
* Visitor management
* Package management
* Operational contacts
* Security events

Do not expose family card files.

---

# 10. IMPLEMENTATION ROADMAP

Execute in milestones.

Do not start every module simultaneously.

Each milestone must pass its gate before the next one.

---

# MILESTONE 0 — REPOSITORY FOUNDATION

Implement or verify:

* Project structure
* Package manager
* TypeScript strict mode
* Formatting
* Lint
* Unit test runner
* End-to-end test runner
* Environment validation
* Database connection
* Migration workflow
* Seed workflow
* Docker development workflow
* Docker production foundation
* Health endpoint
* Structured logging with sensitive-data redaction
* Error boundaries
* CI workflow
* Security scan workflow
* Secret scan workflow
* Dependency update configuration
* Conventional commit guidance
* Documentation structure

Create:

```text
README.md
CONTRIBUTING.md
SECURITY.md
CODE_OF_CONDUCT.md
LICENSE decision placeholder or selected license
CHANGELOG.md
docs/architecture.md
docs/development.md
docs/deployment-vps.md
docs/security.md
docs/data-model.md
docs/roadmap.md
```

Recommended license:

* AGPL-3.0 if no previous license decision exists

Clearly document that branding and trademarks may have separate usage rules.

### Milestone 0 gate

Must pass:

* Install
* Typecheck
* Lint
* Unit tests
* Build
* Development startup
* Health check
* No committed secret
* Docker configuration validation

Then commit and push.

---

# MILESTONE 1 — CONFIGURATION AND DESIGN SYSTEM

Implement:

* Typed community configuration
* Default Cluster Parma branding
* Module flags
* Locale structure
* Indonesian translations
* Theme tokens
* Responsive navigation
* Shared form components
* Shared table components
* Shared confirmation dialogs
* Shared status badges
* Shared file upload component
* Shared error and empty states

Branding should be configurable without modifying core source files.

### Milestone 1 functional verification

Verify:

* Changing config changes application name.
* Changing config changes community name.
* Disabled modules disappear from navigation.
* Required security controls cannot be disabled silently.
* Mobile navigation works.
* Desktop navigation works.
* No broken links.

Then commit and push.

---

# MILESTONE 2 — AUTHENTICATION, USERS, ROLES, AND AUDIT

Implement:

* Registration
* Login
* Logout
* Password reset
* User profile
* Account status
* Role model
* Permission model
* Protected routes
* Server-side authorization helper
* Audit log service
* Admin user management
* Account disable and enable
* Session revocation
* Privileged action confirmation where useful

Seed demo accounts for every role using non-production credentials clearly documented for local use only.

### Required test scenarios

* Anonymous user rejected from protected routes.
* Resident rejected from admin routes.
* Admin cannot access document-admin-only action unless assigned.
* Disabled account cannot log in.
* Role changes take effect.
* Audit log records role changes.
* Client-side role manipulation fails.

Then commit and push.

---

# MILESTONE 3 — COMMUNITY, BLOCKS, AND RESIDENTIAL UNITS

Implement:

* Community settings page
* Block CRUD
* Residential unit CRUD
* Unit status
* Occupancy status
* Ownership status
* Search
* Filter
* Pagination
* Bulk import template preparation
* Safe CSV import with validation if feasible
* Unit detail page
* Unit history foundation

Seed realistic synthetic Cluster Parma data.

Do not use real resident data.

### Required functional verification

* Admin can create a block.
* Admin can create a unit.
* Duplicate block and unit rules work.
* Filters work.
* Invalid input is rejected server-side.
* Resident cannot modify blocks.
* Deleted or archived entities follow safe rules.
* Mobile UI works.

Then commit and push.

---

# MILESTONE 4 — HOUSEHOLDS AND RESIDENTS

Implement:

* Household creation
* Link household to residential unit
* Owner or tenant occupancy
* Household head
* Family member management
* Primary contact
* Emergency contact
* Move-in and move-out dates
* Active and inactive residents
* Household verification status
* Occupancy history
* Resident self-service profile editing
* Admin verification workflow

Required resident verification statuses:

```text
UNREGISTERED
DRAFT
SUBMITTED
NEEDS_REVISION
VERIFIED
REJECTED
INACTIVE
```

### Required authorization rules

* Residents only see their household.
* Admins see authorized community data.
* Security officers see only operational fields.
* Sensitive identity fields are not returned by ordinary resident list endpoints.

### Required functional verification

Test end-to-end:

1. Resident registers.
2. Resident selects or requests a residential unit.
3. Resident creates household data.
4. Resident adds family members.
5. Resident submits verification.
6. Admin reviews.
7. Admin requests revision.
8. Resident revises.
9. Admin verifies.
10. Audit events are recorded.

Then commit and push.

---

# MILESTONE 5 — PRIVATE RESIDENT DOCUMENT ARCHIVE

Implement:

* Private storage adapter
* Local development storage adapter
* Production private storage configuration
* Document upload
* Document metadata
* Versioning
* Verification workflow
* Signed URL access
* Preview
* Download permission
* View and download audit logs
* Rejection notes
* Revision flow
* Document expiry support
* Document retention configuration

Implement at least:

```text
Family card
Identity card
Lease agreement
Resident consent
Other supporting document
```

### Required security tests

* No permanent public URL.
* Anonymous access fails.
* Another household cannot access.
* Security officer cannot access.
* Finance admin cannot access.
* Document admin can access.
* Signed URL expires.
* Invalid MIME type fails.
* Oversized file fails.
* Storage key is not predictable.
* Access is logged.
* Sensitive storage path is not leaked unnecessarily.

If real malware scanning is unavailable:

* Implement a scanner interface.
* Implement a development no-op scanner with visible warning.
* Document production scanner requirement.
* Do not falsely claim malware scanning is active.

Then commit and push.

---

# MILESTONE 6 — RESIDENT DASHBOARD AND ANNOUNCEMENTS

Implement resident dashboard containing:

* Urgent announcement banner
* Latest announcements
* Household verification status
* Document completion status
* Active reports
* Next event
* Billing summary placeholder or real summary if billing exists
* Important contacts

Implement announcements:

* Draft
* Published
* Scheduled
* Expired
* Priority
* Category
* Attachments
* Audience
* Read tracking
* Emergency banner

### Required verification

* Published announcement visible.
* Draft announcement hidden.
* Expired announcement handled.
* Resident read status recorded.
* Unauthorized publishing rejected.
* Emergency banner works on mobile.
* Attachment access follows correct rules.

Then commit and push.

---

# MILESTONE 7 — RESIDENT REPORTS AND STAFF TASKS

Implement report categories such as:

```text
Security
Waste
Street light
Drainage
Road
Common facility
Noise
Animal
Other
```

Implement:

* Create report
* Upload evidence
* Select location
* Priority
* Public or private visibility rules
* Status timeline
* Admin verification
* Assignment to staff
* Staff progress
* Resolution evidence
* Reopen workflow
* Duplicate report handling
* SLA configuration foundation

### End-to-end test

1. Resident creates report.
2. Admin verifies.
3. Admin assigns staff.
4. Staff updates progress.
5. Staff uploads completion evidence.
6. Staff resolves.
7. Resident sees result.
8. Admin closes.
9. Audit timeline is complete.

Then commit and push.

---

# MILESTONE 8 — EVENTS, CONTACTS, INFORMATION, AND GOVERNANCE ARCHIVE

Implement:

## Events

* Event CRUD
* Attendance confirmation
* Capacity
* Location
* Start and end times
* Cancellation
* Reminder foundation

## Important contacts

* Security
* Management
* Cleaning
* Technician
* Ambulance
* Police
* Fire department
* Other community contacts

## Information pages

* Parking rules
* Renovation rules
* Moving procedure
* Guest procedure
* Waste information
* Facility rules
* Service schedules

## Governance archive

* Meeting minutes
* Decisions
* Policies
* Effective date
* Revision history
* Attachments
* Visibility rules

Then verify all roles and commit/push.

---

# MILESTONE 9 — VEHICLES, VISITORS, AND PACKAGES

Implement:

## Vehicles

* Vehicle registration
* Plate normalization
* Vehicle type
* Brand
* Model
* Color
* Household
* Sticker number
* Validity
* Active or inactive status

## Visitor pre-registration

* Visitor name
* Vehicle plate
* Destination unit
* Valid time window
* Visit code
* Check-in
* Check-out
* Expiry
* Security confirmation

## Package management

* Recipient
* Residential unit
* Courier
* Arrival time
* Pickup status
* Pickup time
* Optional evidence
* Resident notification foundation

Security users must only see operationally required data.

Then commit and push.

---

# MILESTONE 10 — BILLING FOUNDATION

Implement the billing engine before connecting real money.

Cluster Parma default:

```text
Monthly mandatory community fee
Due every month on day 10
Currency: IDR
Carry forward unpaid invoices
Do not silently merge old invoices
Do not create penalties unless explicitly configured
```

Implement:

* Fee types
* Billing rules
* Monthly billing periods
* Automatic invoice generation
* Due date on day 10
* Invoice items
* Outstanding total
* Overdue status
* Partial payments
* Manual payment recording
* Payment proof upload
* Finance verification
* Waiver
* Cancellation
* Adjustment
* Oldest-invoice-first allocation
* Resident billing dashboard
* Finance dashboard
* Aging report

Aging buckets:

```text
1–30 days
31–60 days
61–90 days
More than 90 days
```

Do not edit the old invoice amount to include new months.

Correct behavior:

```text
August invoice: Rp150.000 overdue
September invoice: Rp150.000 unpaid
Total outstanding: Rp300.000
```

### Billing scheduling

Implement an idempotent job system or scheduler abstraction.

Default behavior:

* Generate monthly invoice on day 1.
* Due on day 10.
* Mark overdue after due date.
* Continue creating following months.
* Never create duplicate invoices for the same household, billing rule, and period.

### Required tests

* Monthly invoice is created once.
* Running the job twice creates no duplicates.
* Overdue calculation is correct.
* New month preserves old invoice.
* Partial payment allocation works.
* Waived invoice is preserved in history.
* Resident cannot mark their own invoice paid.
* Finance adjustment is audited.

Then commit and push.

---

# MILESTONE 11 — NOTIFICATION ENGINE AND WHATSAPP-READY WORKFLOW

Implement a provider-independent notification system.

Providers:

```text
In-app
Email adapter
WhatsApp adapter
Push adapter foundation
Mock adapter
```

Do not use unofficial WhatsApp Web automation.

Implement:

* Notification templates
* Consent/preferences
* Queue or scheduled delivery abstraction
* Delivery attempts
* Failure handling
* Retry rules
* Delivery logs
* Related invoice/report/event links
* Idempotency
* Pre-send state recheck

Cluster Parma billing reminder defaults:

```text
Day 7: reminder before due date
Day 10: due date reminder
Day 13: first overdue reminder
Day 20: second overdue reminder
Day 1 of next month: new invoice plus old outstanding summary
```

Before sending any billing reminder:

```text
Recheck invoice state
If paid, cancelled, or waived:
    do not send
If unpaid or overdue:
    send
```

Messages must not include:

* NIK
* Family card number
* Detailed family information
* Sensitive document links

Implement mock WhatsApp sending and full adapter interface if real credentials are unavailable.

Add configuration such as:

```text
WHATSAPP_PROVIDER
WHATSAPP_ACCESS_TOKEN
WHATSAPP_PHONE_NUMBER_ID
WHATSAPP_WEBHOOK_VERIFY_TOKEN
WHATSAPP_APP_SECRET
```

Do not expose credentials to the browser.

### Required tests

* Paid resident receives no overdue reminder.
* Unpaid resident receives correct total.
* Duplicate scheduler execution does not send duplicate message.
* Opted-out non-essential notification is respected.
* Failed message is retried safely.
* Delivery event is logged.

Then commit and push.

---

# MILESTONE 12 — PAYMENT PROVIDER FOUNDATION AND QRIS-READY ARCHITECTURE

Do not process real production payments without valid sandbox credentials and explicit production configuration.

Create a provider abstraction:

```typescript
interface PaymentProvider {
  createPayment(input: CreatePaymentInput): Promise<PaymentSession>;
  getPaymentStatus(externalId: string): Promise<PaymentStatus>;
  verifyWebhook(request: WebhookRequest): Promise<VerifiedPaymentEvent>;
  expirePayment(externalId: string): Promise<void>;
  refundPayment(input: RefundPaymentInput): Promise<RefundResult>;
}
```

Implement adapters:

```text
MockPaymentProvider
ManualTransferProvider
MidtransProvider foundation
XenditProvider foundation
```

At least one mock provider must work end-to-end.

QRIS dynamic target flow:

```text
Resident selects invoices
→ server validates invoices
→ server creates payment attempt
→ provider returns dynamic QR session
→ resident sees QR and expiry
→ provider webhook arrives
→ signature verified
→ amount and currency verified
→ event processed idempotently
→ payment allocated
→ invoices updated
→ receipt generated
→ future reminders cancelled
```

### Non-negotiable payment rules

* Browser redirect is not proof of payment.
* Webhook is the primary confirmation.
* Webhook signature must be verified.
* Webhook handling must be idempotent.
* Amount must match.
* Currency must match.
* External order ID must be unique.
* Raw webhook should be stored safely with sensitive-data redaction.
* Never hard-delete payment records.
* Refund requires privileged approval.
* Settlement status is separate from resident-paid status.
* Provider keys are server-only.

If provider credentials are absent:

* Complete the interface.
* Complete mock flow.
* Complete webhook test fixtures.
* Complete documentation.
* Continue.

Then commit and push.

---

# MILESTONE 13 — INSTALLER, SELF-HOSTING, AND UPGRADE FOUNDATION

Prepare ParmaConnect for other communities.

Implement or document:

```bash
npx create-parmaconnect@latest
```

At minimum create the installer package foundation.

Installer should eventually support:

* Project name
* Community name
* Parent area
* Locale
* Time zone
* Currency
* Database provider
* Storage provider
* Deployment target
* Enabled modules
* Initial admin bootstrap
* Environment generation
* Migration
* Seed
* Health check

Create:

* Docker Compose development setup
* Docker Compose production example
* Reverse proxy guidance
* HTTPS guidance
* PostgreSQL volume guidance
* Private storage guidance
* Backup guidance
* Restore guidance
* Upgrade guidance
* Rollback guidance

Prepare scripts such as:

```bash
npm run setup
npm run db:migrate
npm run db:seed
npm run healthcheck
npm run security:check
npm run backup:check
npm run parmaconnect:update
```

The update script may begin as a safe foundation and documentation if a full updater is premature.

Then commit and push.

---

# MILESTONE 14 — OBSERVABILITY, BACKUP, AND PRODUCTION HARDENING

Implement:

* Health endpoint
* Readiness endpoint
* Structured logs
* Redaction
* Error tracking adapter
* Background job status
* Failed job dashboard foundation
* Database backup script
* Backup verification documentation
* Restore test script
* Storage backup guidance
* Deployment smoke test
* Migration dry-run workflow
* Rollback documentation
* Admin system health page
* Dependency audit
* Secret scan
* SAST configuration where feasible

Do not claim a backup is valid merely because a file exists.

Create a restore test for a development or staging database.

Then commit and push.

---

# MILESTONE 15 — SMART SECURITY AND CCTV-READY ARCHITECTURE

Do not implement facial recognition as a default feature.

Create optional architecture for:

* Person detection events
* Vehicle detection events
* Entry and exit direction
* Anonymous tracking IDs
* Plate recognition events
* Camera offline events
* Visitor matching
* Unknown vehicle alerts
* Security event timeline
* Edge agent connection

Preferred architecture:

```text
CCTV / NVR
→ Local edge processing
→ Metadata events
→ ParmaConnect API
```

ParmaConnect should not require continuous raw video ingestion.

Create an event schema such as:

```json
{
  "eventType": "VEHICLE_ENTERED",
  "cameraId": "gate-entry",
  "timestamp": "2026-07-26T19:42:00+07:00",
  "plate": "B1234XYZ",
  "confidence": 0.91,
  "trackingId": "temporary-id"
}
```

Implement:

* Security event ingestion endpoint
* Signed API authentication for edge agent
* Replay protection or idempotency key
* Event timeline UI
* Camera registry
* Camera health status
* Vehicle match against registered vehicles
* Visitor match against active visits
* Unknown vehicle flag
* Synthetic demo events

Do not build automatic gate opening as a trusted default.

Do not build facial recognition unless explicitly enabled in a later dedicated project with privacy impact assessment.

Then commit and push.

---

# 11. DATABASE MIGRATION RULES

Every schema change must:

1. Be represented in migration files.
2. Preserve existing data where possible.
3. Avoid destructive resets.
4. Be tested.
5. Include upgrade notes when significant.
6. Include rollback or recovery guidance.
7. Never run destructive production commands automatically.

Do not use:

```text
drop database
reset production database
force reset
delete all production data
```

Never assume the database is disposable.

---

# 12. CODE QUALITY RULES

Use:

* Strict TypeScript
* Explicit domain types
* Centralized validation
* Clean service boundaries
* Reusable UI components
* Small focused modules
* Descriptive names
* Minimal duplication
* Safe error handling
* Typed environment variables
* Dependency injection or provider interfaces for external services

Avoid:

* Giant files
* Giant server actions
* Business logic inside page components
* Unvalidated request bodies
* `any` without documented necessity
* Silent failures
* Empty catch blocks
* Hardcoded secrets
* Hardcoded community identity
* Deeply coupled payment providers
* Deeply coupled storage providers
* Direct database usage scattered everywhere
* Authorization checks duplicated inconsistently

---

# 13. FUNCTIONAL UI VERIFICATION PROTOCOL

For every user-facing feature:

1. Start the application.
2. Open it in a browser.
3. Test the intended role.
4. Perform the real workflow.
5. Confirm database state changed correctly.
6. Refresh the page.
7. Confirm state persists.
8. Test invalid input.
9. Test unauthorized input.
10. Test mobile viewport.
11. Check browser console.
12. Check server logs.
13. Fix all errors introduced by the feature.
14. Capture concise verification notes.

A feature is not complete because:

* It compiles.
* A component renders.
* A route returns 200.
* A test was mocked.
* The UI looks plausible.

It is complete only when the workflow works end-to-end.

---

# 14. INCREMENTAL VERIFICATION PROTOCOL

After every meaningful feature or function:

Run the narrowest relevant checks first:

```text
Focused unit test
Focused integration test
Focused authorization test
Focused UI test
```

Then run project gates:

```bash
typecheck
lint
test
build
```

When applicable also run:

```bash
database migration validation
Playwright end-to-end tests
security tests
Docker build
health check
```

Do not postpone all testing until the end.

If a check fails:

* Investigate.
* Fix the root cause.
* Re-run the check.
* Do not disable the check.
* Do not weaken types.
* Do not remove validation.
* Do not skip tests merely to continue.

---

# 15. AUTOMATED GIT CHECKPOINT PROTOCOL

After each completed milestone or coherent feature:

1. Run `git status`.
2. Review `git diff`.
3. Ensure no secrets or generated sensitive files are included.
4. Ensure only intended files changed.
5. Run all required verification.
6. Stage changes.
7. Commit with a descriptive message.
8. Push to the current safe branch if the remote is configured.
9. Confirm push succeeded.
10. Confirm working tree is clean or explain remaining intentional files.

Use commit messages such as:

```text
feat(auth): add role-based access control
feat(residents): implement household verification flow
feat(documents): add private document archive
feat(billing): generate monthly invoices idempotently
test(security): cover cross-household access denial
docs(deployment): add VPS production guide
```

Do not force-push.

Do not rewrite shared Git history.

Do not commit secrets.

If pushing fails because authentication is unavailable:

* Keep commits locally.
* Record exact failure.
* Continue implementation.
* Do not stop all work.

---

# 16. MULTI-AGENT EXECUTION STRATEGY

You are responsible for orchestration.

Do not assign the entire project to one sub-agent without review.

Use specialized agents or workstreams when available:

```text
Architecture agent
Database agent
Authentication and security agent
Resident administration agent
Document archive agent
Frontend UX agent
Billing agent
Notification agent
Payment integration agent
Testing agent
DevOps agent
Documentation agent
Code review agent
```

Rules:

* Give each agent a bounded scope.
* Require each agent to inspect relevant files first.
* Require each agent to report changed files.
* Require tests.
* Review every result.
* Resolve integration conflicts.
* Do not allow agents to overwrite unrelated work.
* Do not assume agent output is correct.
* Run independent verification after merging work.

Parallelize only independent tasks.

Do not have multiple agents edit the same core files simultaneously unless coordination is explicit.

---

# 17. SECURITY REVIEW AFTER EVERY MAJOR MILESTONE

After completing each major milestone, perform a review for:

* Broken access control
* IDOR
* Missing authorization
* Public document URLs
* Sensitive data leakage
* Unsafe logs
* Secret exposure
* Injection
* XSS
* CSRF
* Unsafe file upload
* Missing rate limiting
* Unsafe redirects
* Insecure cookies
* Weak password flows
* Incorrect role inheritance
* Cross-household data exposure
* Cross-community data exposure
* Unsafe financial mutation
* Duplicate job execution
* Duplicate webhook execution

Create regression tests for every security bug found.

---

# 18. BILLING BUSINESS RULES FOR CLUSTER PARMA

Use configurable defaults, but seed the following reference rules:

```text
Billing type: Mandatory monthly community fee
Invoice generation date: Day 1
Due date: Day 10
Carry forward unpaid balance: Yes
Penalty: Disabled by default
Partial payments: Supported
Allocation: Oldest invoice first
Resident reminder channel: In-app by default
WhatsApp: Adapter and sandbox-ready
```

Example expected behavior:

```text
August invoice: Rp150.000, overdue
September invoice: Rp150.000, unpaid
Outstanding total: Rp300.000
```

Do not merge both into a mutated August invoice.

The dashboard may show total outstanding, but the ledger must preserve separate invoices.

---

# 19. WHATSAPP BUSINESS RULES

Use only an official provider-ready architecture.

Do not use WhatsApp Web scraping or browser automation.

Implement:

* Approved-template-ready message format
* Opt-in recording
* Opt-out preferences
* Delivery event handling
* Retry safety
* Invoice state recheck
* Duplicate prevention
* Phone normalization
* Message history
* Admin-visible failure status

Default reminder content should be polite and non-shaming.

Never expose another resident’s payment status.

Never publish lists of delinquent residents to ordinary residents.

---

# 20. PAYMENT AND QRIS RULES

Prepare for dynamic QRIS through payment providers.

Do not position ParmaConnect as the holder of funds.

Each installation must use:

* Its own merchant account
* Its own provider account
* Its own settlement bank account
* Its own API keys
* Its own webhook secret

The core platform only:

* Creates payment instructions
* Receives verified status
* Records payment
* Allocates payment
* Generates receipt
* Supports reconciliation

Implement sandbox and mock flows before any production flow.

---

# 21. PRIVACY AND DATA MINIMIZATION

Collect only data needed for community administration.

Do not automatically collect every field visible on an Indonesian family card.

Avoid unnecessary collection of:

* Religion
* Education
* Occupation
* Marital details
* Medical data
* Biometric data
* Precise movement history beyond justified security needs

Provide:

* Privacy notice page
* Data purpose descriptions
* Data correction workflow
* Account and household update workflow
* Move-out workflow
* Retention configuration
* Archive workflow
* Restricted deletion workflow
* Export access controls

Do not hard-delete important administrative or financial history without a defined retention process.

---

# 22. SMART CCTV PRIVACY RULES

CCTV-related features are optional.

Default allowed future features:

* Person detection
* Vehicle detection
* Anonymous tracking
* Entry and exit counting
* License plate recognition
* Camera offline detection
* Visitor matching
* Unknown vehicle alerts

Default prohibited or disabled:

* Facial recognition
* Biometric identity matching
* Behavioral scoring
* Resident reputation scoring
* Automatic criminal accusations
* Fully automatic gate access based only on AI result

If facial recognition is ever added, it must be a separate explicitly enabled module with additional legal, privacy, security, consent, retention, and human-review requirements.

---

# 23. DOCUMENTATION REQUIREMENTS

Keep documentation synchronized with implementation.

At minimum maintain:

```text
README
Local development guide
VPS deployment guide
Docker guide
Environment variable reference
Architecture guide
Database guide
Migration guide
Backup guide
Restore guide
Security guide
Role and permission matrix
Resident administration guide
Admin guide
Billing guide
Notification guide
Payment provider guide
Open-source contribution guide
Release guide
Upgrade guide
Rollback guide
Troubleshooting guide
```

Every completed milestone must update relevant documentation.

---

# 24. DEMO DATA REQUIREMENTS

Seed synthetic data that demonstrates:

* Several blocks
* Occupied units
* Vacant units
* Owner-occupied units
* Tenant-occupied units
* Multiple households
* Multiple residents
* Verified and unverified households
* Dummy resident documents
* Announcements
* Reports in different statuses
* Events
* Vehicles
* Monthly invoices
* Overdue invoices
* Partial payments
* Notification records
* Visitor records
* Security events

Every seed value must be obviously fictional.

---

# 25. PERFORMANCE AND RELIABILITY

Implement:

* Pagination for large data tables
* Indexed common queries
* Avoid N+1 database access
* File upload limits
* Request limits
* Graceful error handling
* Background job retries
* Idempotent scheduled jobs
* Idempotent webhooks
* Transaction boundaries for financial changes
* Database constraints
* Unique constraints for invoice generation
* Safe concurrent updates
* Optimistic or explicit locking where necessary

Billing and payment operations must use database transactions.

---

# 26. RELEASE READINESS GATES

Do not call the application production-ready unless all relevant gates pass.

## Functional

* Resident registration works.
* Household administration works.
* Document upload and verification works.
* Announcements work.
* Reports work end-to-end.
* Events work.
* Vehicles work.
* Billing generation works.
* Overdue carry-forward works.
* Manual payment verification works.
* Notification engine works with mock provider.
* Payment mock flow works.

## Security

* Cross-household access denied.
* Private storage verified.
* Sensitive logs absent.
* Role tests pass.
* Session rules pass.
* Upload validation passes.
* Payment webhook tests pass.
* Audit logging works.

## Reliability

* Build passes.
* Tests pass.
* Migration passes.
* Docker build passes.
* Health check passes.
* Seed passes.
* Backup script works.
* Restore procedure tested in non-production.

## Documentation

* Setup documented.
* Deployment documented.
* Environment documented.
* Security documented.
* Upgrade documented.
* Known limitations documented.

---

# 27. PROGRESS REPORTING

Maintain a file:

```text
PROGRESS.md
```

Update it after each milestone.

Include:

```text
Current milestone
Completed features
Functional verification performed
Tests run
Security checks run
Commits created
Push status
Known limitations
External blockers
Next milestone
```

Also maintain:

```text
DECISIONS.md
```

Record architecture decisions and assumptions.

Maintain:

```text
KNOWN_ISSUES.md
```

Do not hide unfinished or failing work.

---

# 28. FINAL AUTONOMOUS EXECUTION BEHAVIOR

Start immediately.

Do not only respond with a plan.

Perform the work.

Continue milestone by milestone.

At every milestone:

```text
Inspect
Implement
Verify
Review
Commit
Push
Document
Continue
```

When encountering a failure:

```text
Diagnose
Fix
Re-run
Add regression coverage
Continue
```

When encountering unavailable credentials:

```text
Build provider interface
Build mock or sandbox flow
Document configuration
Continue another task
```

When encountering an unavailable external service:

```text
Create an adapter
Create a mock
Create integration tests
Document setup
Continue
```

Do not stop merely because the whole roadmap cannot be completed in one session.

Make the maximum safe, verified, and coherent progress possible.

---

# 29. PRIORITY ORDER IF TIME OR RESOURCES BECOME LIMITED

Use this priority:

## P0 — Foundation and security

* Repository foundation
* Authentication
* Authorization
* Audit
* Environment validation
* Database
* Private storage
* Tests
* CI
* Docker

## P1 — Core resident administration

* Blocks
* Units
* Households
* Residents
* Verification
* Documents

## P2 — Core community operations

* Dashboard
* Announcements
* Reports
* Staff tasks
* Events
* Contacts
* Governance archive

## P3 — Billing

* Monthly invoice
* Due date
* Overdue
* Carry forward
* Partial payment
* Manual verification
* Finance dashboard

## P4 — Notifications and provider-ready integrations

* Notification engine
* WhatsApp adapter
* Payment interface
* Mock QRIS flow

## P5 — Additional operations

* Vehicles
* Visitors
* Packages
* Security portal
* CCTV event architecture

Do not sacrifice P0 or P1 quality merely to create more features.

---

# 30. ABSOLUTE PROHIBITIONS

Never:

* Use real resident data in development.
* Commit secrets.
* Store documents publicly.
* Disable security tests to make CI pass.
* Change roles only in frontend.
* Trust browser payment status.
* Run destructive database resets against unknown environments.
* Automatically deploy unverified migrations.
* Force-push.
* Delete audit trails.
* Hard-delete financial records.
* Create fake completed features.
* Claim tests passed when they were not run.
* Claim integrations work without credentials or mocks.
* Use unofficial WhatsApp Web automation.
* Enable facial recognition by default.
* Leave production with default credentials.
* Expose service-role keys to the client.
* Log full NIK or family card numbers.
* Give coding agents access to production resident documents.
* Wait unnecessarily for the human operator.

---

# 31. SESSION COMPLETION REPORT

At the end of the work session, produce a detailed report containing:

```text
1. Executive summary
2. Current application status
3. Milestones completed
4. Features implemented
5. Features functionally verified
6. Security checks completed
7. Tests and build results
8. Database migrations created
9. Docker and deployment status
10. Git commits created
11. Push status
12. Files and documentation added
13. Known issues
14. External blockers
15. Exact commands to resume
16. Recommended next milestone
```

Also ensure `PROGRESS.md`, `DECISIONS.md`, and `KNOWN_ISSUES.md` are up to date.

If possible, leave the repository in this state:

```text
Tests passing
Build passing
Working tree clean
Changes committed
Changes pushed
Application runnable
Documentation current
IMPORTANT GIT RULE UPDATE

For every completed milestone, you MUST automatically:

1. Run git status.
2. Review git diff.
3. Verify no secrets, credentials, uploaded private documents, database dumps, or sensitive files are included.
4. Run all required checks:
   - typecheck
   - lint
   - tests
   - build
   - relevant security tests
   - relevant end-to-end tests
5. Stage the intended changes.
6. Create a descriptive Git commit.
7. Push the commit automatically to the configured GitHub remote and current working branch.
8. Confirm that the push succeeded.
9. Record the commit hash and push result in PROGRESS.md.
10. Continue automatically to the next milestone.

A milestone is NOT considered complete until the push to GitHub succeeds.

Before starting implementation, verify GitHub readiness using:

git status
git branch --show-current
git remote -v
git ls-remote origin

If no remote named origin exists, inspect whether a GitHub repository URL is available in the environment or existing documentation.

If GitHub authentication or remote configuration is missing:

- Do not pretend the push succeeded.
- Record the exact blocker in PROGRESS.md.
- Continue building and committing locally.
- Retry the push after each later milestone.
- Keep all commits clean and sequential.
- Never force-push.
- Never expose GitHub tokens in logs, files, commits, or chat output.

Use commit messages such as:

feat(auth): complete authentication milestone
feat(residents): add household administration
feat(documents): secure private resident documents
feat(reports): implement resident report workflow
feat(billing): add monthly invoice generation
test(security): add authorization regression coverage
docs(deployment): document VPS deployment

After every successful milestone, output a concise checkpoint:

MILESTONE COMPLETE
Milestone: <name>
Commit: <commit hash>
Branch: <branch>
Push: successful
Remote: origin
Checks: passed
Next milestone: <name>

Do not wait for human approval between milestones.```

Now begin by inspecting the repository and baseline environment. Then execute the roadmap autonomously.

