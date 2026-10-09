/**
 * Security Rules Dirty Dozen Verification Specification
 * Validates that all 12 adversarial payloads defined in security_spec.md
 * are rejected by firestore.rules with PERMISSION_DENIED.
 */

export interface DirtyDozenTestCase {
  id: number;
  name: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  path: string;
  auth: {
    uid: string;
    email?: string;
    email_verified?: boolean;
  } | null;
  payload?: Record<string, unknown>;
  expectedOutcome: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TEST_CASES: DirtyDozenTestCase[] = [
  {
    id: 1,
    name: 'Unauthenticated Write',
    operation: 'create',
    path: '/contentItems/item_1',
    auth: null,
    payload: {
      id: 'item_1',
      category: 'quiz',
      prompt: 'Valid prompt',
      answer: 'Valid answer',
      ownerId: 'u1',
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Unverified Email Spoof',
    operation: 'create',
    path: '/contentItems/item_1',
    auth: { uid: 'u1', email: 'footballtotel11@gmail.com', email_verified: false },
    payload: {
      id: 'item_1',
      category: 'quiz',
      prompt: 'Valid prompt',
      answer: 'Valid answer',
      ownerId: 'u1',
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Identity Spoofing on Create',
    operation: 'create',
    path: '/contentItems/item_1',
    auth: { uid: 'u1', email: 'user1@example.com', email_verified: true },
    payload: {
      id: 'item_1',
      category: 'quiz',
      prompt: 'Valid prompt',
      answer: 'Valid answer',
      ownerId: 'u2',
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Shadow Field Injection on Create',
    operation: 'create',
    path: '/contentItems/item_1',
    auth: { uid: 'u1', email: 'user1@example.com', email_verified: true },
    payload: {
      id: 'item_1',
      category: 'quiz',
      prompt: 'Valid prompt',
      answer: 'Valid answer',
      ownerId: 'u1',
      isAdmin: true,
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Shadow Field Injection on Update',
    operation: 'update',
    path: '/contentItems/item_1',
    auth: { uid: 'u1', email: 'user1@example.com', email_verified: true },
    payload: {
      id: 'item_1',
      category: 'quiz',
      prompt: 'Updated prompt',
      answer: 'Updated answer',
      ownerId: 'u1',
      hacked: 'yes',
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'ID Poisoning with Special Characters',
    operation: 'create',
    path: '/contentItems/invalid$id!spaces',
    auth: { uid: 'u1', email: 'user1@example.com', email_verified: true },
    payload: {
      id: 'invalid$id!spaces',
      category: 'quiz',
      prompt: 'Valid prompt',
      answer: 'Valid answer',
      ownerId: 'u1',
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Oversized Prompt String (>500 chars)',
    operation: 'create',
    path: '/contentItems/item_1',
    auth: { uid: 'u1', email: 'user1@example.com', email_verified: true },
    payload: {
      id: 'item_1',
      category: 'quiz',
      prompt: 'A'.repeat(505),
      answer: 'Valid answer',
      ownerId: 'u1',
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Oversized Answer String (>300 chars)',
    operation: 'create',
    path: '/contentItems/item_1',
    auth: { uid: 'u1', email: 'user1@example.com', email_verified: true },
    payload: {
      id: 'item_1',
      category: 'quiz',
      prompt: 'Valid prompt',
      answer: 'B'.repeat(305),
      ownerId: 'u1',
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Invalid Category Enum Value',
    operation: 'create',
    path: '/contentItems/item_1',
    auth: { uid: 'u1', email: 'user1@example.com', email_verified: true },
    payload: {
      id: 'item_1',
      category: 'basketball',
      prompt: 'Valid prompt',
      answer: 'Valid answer',
      ownerId: 'u1',
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Immutable OwnerId Mutation on Update',
    operation: 'update',
    path: '/contentItems/item_1',
    auth: { uid: 'u1', email: 'user1@example.com', email_verified: true },
    payload: {
      id: 'item_1',
      category: 'quiz',
      prompt: 'Valid prompt',
      answer: 'Valid answer',
      ownerId: 'u2',
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Forged Client Timestamp on Create',
    operation: 'create',
    path: '/contentItems/item_1',
    auth: { uid: 'u1', email: 'user1@example.com', email_verified: true },
    payload: {
      id: 'item_1',
      category: 'quiz',
      prompt: 'Valid prompt',
      answer: 'Valid answer',
      ownerId: 'u1',
      createdAt: '2020-01-01T00:00:00Z',
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Cross-Tenant Read of Non-Owned ContentItem',
    operation: 'get',
    path: '/contentItems/item_owned_by_u2',
    auth: { uid: 'u1', email: 'user1@example.com', email_verified: true },
    expectedOutcome: 'PERMISSION_DENIED',
  },
];
