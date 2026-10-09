# FanZone Game Security Specification

## 1. Data Invariants
1. Every document in `/contentItems/{itemId}` must belong to the authenticated user (`ownerId == request.auth.uid`) or the verified broadcast owner admin (`footballtotel11@gmail.com` with `email_verified == true`).
2. Document IDs (`itemId`) must match `^[a-zA-Z0-9_\-]+$` and be at most 128 characters.
3. All string fields (`id`, `category`, `prompt`, `answer`, `mediaUrl`, `ownerId`) must be bounded by their maximum lengths defined in `firebase-blueprint.json`.
4. `createdAt` must equal `request.time` on creation and remain immutable on update.
5. `ownerId` and `id` are immutable after creation.

## 2. The "Dirty Dozen" Payloads
1. **Unauthenticated Write**: `auth = null`, attempting to create `/contentItems/item_1`.
2. **Unverified Email Spoof**: `auth = { uid: 'u1', token: { email: 'footballtotel11@gmail.com', email_verified: false } }`, attempting write.
3. **Identity Spoofing on Create**: `auth.uid = 'u1'`, payload sets `ownerId: 'u2'`.
4. **Shadow Field Injection on Create**: Payload includes undeclared field `isAdmin: true`.
5. **Shadow Field Injection on Update**: Update payload modifies undeclared field `hacked: 'yes'`.
6. **ID Poisoning**: Document path `/contentItems/invalid$id!with*spaces` or >128 chars.
7. **Oversized Prompt String (Denial of Wallet)**: `prompt` length > 500 characters.
8. **Oversized Answer String**: `answer` length > 300 characters.
9. **Invalid Category Enum**: `category: 'basketball'` (not in allowed enum).
10. **Immutable Field Mutation**: Update attempts to change `ownerId` or `createdAt`.
11. **Timestamp Forgery**: Create payload uses past or future timestamp instead of `request.time`.
12. **Unauthorized List Scraping**: Listing `/contentItems` without filtering by `resource.data.ownerId == request.auth.uid`.
