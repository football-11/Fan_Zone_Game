import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { ContentItem } from './types/game';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export async function signInOwnerWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutOwner() {
  await signOut(auth);
}

// Mirror content items to Firestore when the owner is authenticated via Firebase
export async function syncContentItemToFirestore(item: ContentItem) {
  if (!auth.currentUser || !auth.currentUser.emailVerified) return;
  const safeId = item.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  const path = `contentItems/${safeId}`;
  try {
    await setDoc(doc(db, 'contentItems', safeId), {
      id: safeId,
      category: item.category,
      prompt: (item.prompt || item.title || 'Clue').slice(0, 500),
      answer: (item.answer || 'Answer').slice(0, 300),
      mediaUrl: (item.mediaUrl || '').slice(0, 1000),
      ownerId: auth.currentUser.uid.slice(0, 128),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    // Only throw if missing or insufficient permissions per skill contract
    if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }
}

export async function removeContentItemFromFirestore(itemId: string) {
  if (!auth.currentUser || !auth.currentUser.emailVerified) return;
  const safeId = itemId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  const path = `contentItems/${safeId}`;
  try {
    await deleteDoc(doc(db, 'contentItems', safeId));
  } catch (error) {
    if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
}
