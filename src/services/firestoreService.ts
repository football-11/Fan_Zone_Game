import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  Unsubscribe,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { ContentCategory, ContentItem } from '../types/game';

// Verbatim constants synced with firebase-blueprint.json and firestore.rules
export const ID_PATTERN_REGEX = /^[a-zA-Z0-9_\-]+$/;
export const MAX_ID_LENGTH = 128;
export const MAX_CATEGORY_LENGTH = 32;
export const MAX_PROMPT_LENGTH = 500;
export const MAX_ANSWER_LENGTH = 300;
export const MAX_MEDIA_URL_LENGTH = 1000;

const ALLOWED_CATEGORIES = new Set<ContentCategory>([
  'jersey',
  'photo',
  'stadium',
  'logo',
  'quiz',
  'number',
  'audio',
]);

export function sanitizeFirestoreId(rawId: string): string {
  const cleaned = rawId.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, MAX_ID_LENGTH);
  return cleaned || `item_${Date.now()}`;
}

export function validateContentItemPayload(item: {
  id: string;
  category: ContentCategory;
  prompt: string;
  answer: string;
  mediaUrl?: string;
  ownerId: string;
}) {
  if (!ID_PATTERN_REGEX.test(item.id) || item.id.length > MAX_ID_LENGTH) {
    throw new Error('Invalid ContentItem ID format or length');
  }
  if (!ALLOWED_CATEGORIES.has(item.category) || item.category.length > MAX_CATEGORY_LENGTH) {
    throw new Error('Invalid ContentItem category');
  }
  if (!item.prompt || item.prompt.length < 1 || item.prompt.length > MAX_PROMPT_LENGTH) {
    throw new Error('ContentItem prompt must be between 1 and 500 characters');
  }
  if (!item.answer || item.answer.length < 1 || item.answer.length > MAX_ANSWER_LENGTH) {
    throw new Error('ContentItem answer must be between 1 and 300 characters');
  }
  if (item.mediaUrl !== undefined && item.mediaUrl.length > MAX_MEDIA_URL_LENGTH) {
    throw new Error('ContentItem mediaUrl exceeds maximum length of 1000 characters');
  }
  if (!ID_PATTERN_REGEX.test(item.ownerId) || item.ownerId.length > MAX_ID_LENGTH) {
    throw new Error('Invalid ownerId format or length');
  }
}

/**
 * Validates connection to the Firestore database on boot.
 */
export async function validateFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
    return false;
  }
}

/**
 * Creates or overwrites a ContentItem document in Firestore (/contentItems/{itemId}).
 */
export async function createContentItemInFirestore(item: ContentItem): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser || !currentUser.emailVerified) return;

  const safeId = sanitizeFirestoreId(item.id);
  const ownerId = sanitizeFirestoreId(currentUser.uid);
  const promptText = (item.prompt || item.title || 'Clue').trim().slice(0, MAX_PROMPT_LENGTH);
  const answerText = (item.answer || 'Answer').trim().slice(0, MAX_ANSWER_LENGTH);
  const mediaUrlText = item.mediaUrl ? item.mediaUrl.trim().slice(0, MAX_MEDIA_URL_LENGTH) : '';

  validateContentItemPayload({
    id: safeId,
    category: item.category,
    prompt: promptText,
    answer: answerText,
    mediaUrl: mediaUrlText,
    ownerId,
  });

  const path = `contentItems/${safeId}`;
  try {
    await setDoc(doc(db, 'contentItems', safeId), {
      id: safeId,
      category: item.category,
      prompt: promptText,
      answer: answerText,
      mediaUrl: mediaUrlText,
      ownerId,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Updates an existing ContentItem document in Firestore (/contentItems/{itemId}).
 */
export async function updateContentItemInFirestore(
  itemId: string,
  updates: Partial<Pick<ContentItem, 'category' | 'prompt' | 'answer' | 'mediaUrl'>>
): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser || !currentUser.emailVerified) return;

  const safeId = sanitizeFirestoreId(itemId);
  const path = `contentItems/${safeId}`;
  const payload: Record<string, unknown> = {};

  if (updates.category !== undefined) {
    payload.category = updates.category;
  }
  if (updates.prompt !== undefined) {
    payload.prompt = updates.prompt.trim().slice(0, MAX_PROMPT_LENGTH);
  }
  if (updates.answer !== undefined) {
    payload.answer = updates.answer.trim().slice(0, MAX_ANSWER_LENGTH);
  }
  if (updates.mediaUrl !== undefined) {
    payload.mediaUrl = updates.mediaUrl ? updates.mediaUrl.trim().slice(0, MAX_MEDIA_URL_LENGTH) : '';
  }

  try {
    await updateDoc(doc(db, 'contentItems', safeId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Retrieves a single ContentItem document from Firestore (/contentItems/{itemId}).
 */
export async function getContentItemFromFirestore(itemId: string): Promise<ContentItem | null> {
  const currentUser = auth.currentUser;
  if (!currentUser || !currentUser.emailVerified) return null;

  const safeId = sanitizeFirestoreId(itemId);
  const path = `contentItems/${safeId}`;
  try {
    const snap = await getDoc(doc(db, 'contentItems', safeId));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      id: data.id,
      category: data.category as ContentCategory,
      title: data.prompt,
      prompt: data.prompt,
      answer: data.answer,
      mediaUrl: data.mediaUrl || undefined,
      createdAt:
        data.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

/**
 * Lists all ContentItem documents owned by the currently authenticated user.
 */
export async function listOwnerContentItemsFromFirestore(): Promise<ContentItem[]> {
  const currentUser = auth.currentUser;
  if (!currentUser || !currentUser.emailVerified) return [];

  const path = 'contentItems';
  try {
    const q = query(
      collection(db, 'contentItems'),
      where('ownerId', '==', currentUser.uid)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: data.id,
        category: data.category as ContentCategory,
        title: data.prompt,
        prompt: data.prompt,
        answer: data.answer,
        mediaUrl: data.mediaUrl || undefined,
        createdAt:
          data.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

/**
 * Subscribes in real time to ContentItem documents owned by the authenticated user.
 */
export function subscribeToOwnerContentItems(
  onItems: (items: ContentItem[]) => void
): Unsubscribe | null {
  const currentUser = auth.currentUser;
  if (!currentUser || !currentUser.emailVerified) return null;

  const path = 'contentItems';
  const q = query(
    collection(db, 'contentItems'),
    where('ownerId', '==', currentUser.uid)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: ContentItem[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: data.id,
          category: data.category as ContentCategory,
          title: data.prompt,
          prompt: data.prompt,
          answer: data.answer,
          mediaUrl: data.mediaUrl || undefined,
          createdAt:
            data.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
        };
      });
      onItems(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

/**
 * Deletes a ContentItem document from Firestore (/contentItems/{itemId}).
 */
export async function deleteContentItemFromFirestore(itemId: string): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser || !currentUser.emailVerified) return;

  const safeId = sanitizeFirestoreId(itemId);
  const path = `contentItems/${safeId}`;
  try {
    await deleteDoc(doc(db, 'contentItems', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
