import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  getDocFromServer,
  query,
  limit
} from 'firebase/firestore';
import { UserProfile, DebtItem, ShaClaim } from '../types';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// CRITICAL: Must use firestoreDatabaseId from firebase-applet-config.json
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId) 
  : getFirestore(app);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('[Firestore Error]', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Validate connection to Firestore on initialization
 */
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firebase] Client is offline or database initializing.');
    }
    return false;
  }
}

// Initial connection test
testConnection().catch(() => {});

/**
 * Authenticate using Google Sign-In popup
 */
export async function signInWithGooglePopup(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    const isUnauthorizedDomain = 
      error?.code === 'auth/unauthorized-domain' || 
      (typeof error?.message === 'string' && error.message.includes('auth/unauthorized-domain'));

    if (isUnauthorizedDomain) {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'current domain';
      console.warn(
        `[Firebase Auth] Domain "${currentHost}" is not yet in the Authorized Domains list for Firebase project "${firebaseConfig.projectId}". ` +
        `To enable direct Google Sign-In, add this domain in Firebase Console > Authentication > Settings > Authorized domains.`
      );
    } else if (error?.code !== 'auth/popup-closed-by-user') {
      console.error('[Firebase Auth] Google Sign-In Error:', error);
    }
    throw error;
  }
}

/**
 * Sign out of Firebase Auth
 */
export async function signOutFirebase(): Promise<void> {
  try {
    await fbSignOut(auth);
  } catch (error) {
    console.error('[Firebase Auth] Sign Out Error:', error);
  }
}

/**
 * Fetch a UserProfile from Firestore
 */
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const path = `users/${userId}`;
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Persist or update a UserProfile in Firestore
 */
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const path = `users/${profile.id}`;
  const cleanFac = profile.facilityCode ? profile.facilityCode.replace(/[^a-zA-Z0-9_-]/g, '_') : '';
  try {
    await setDoc(doc(db, 'users', profile.id), {
      ...profile,
      facilityId: cleanFac,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Save debt item to facility tenant partition in Firestore
 */
export async function saveDebtToFirestore(facilityCode: string, debt: DebtItem): Promise<void> {
  const cleanFac = facilityCode.replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `facilities/${cleanFac}/debts/${debt.id}`;
  try {
    await setDoc(doc(db, 'facilities', cleanFac, 'debts', debt.id), debt, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Fetch debts for a facility tenant from Firestore
 */
export async function fetchDebtsFromFirestore(facilityCode: string): Promise<DebtItem[]> {
  const cleanFac = facilityCode.replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `facilities/${cleanFac}/debts`;
  try {
    const q = query(collection(db, 'facilities', cleanFac, 'debts'), limit(100));
    const snap = await getDocs(q);
    const items: DebtItem[] = [];
    snap.forEach(docSnap => {
      items.push(docSnap.data() as DebtItem);
    });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Save SHA claim to facility tenant partition in Firestore
 */
export async function saveClaimToFirestore(facilityCode: string, claim: ShaClaim): Promise<void> {
  const cleanFac = facilityCode.replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `facilities/${cleanFac}/claims/${claim.id}`;
  try {
    await setDoc(doc(db, 'facilities', cleanFac, 'claims', claim.id), claim, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Fetch SHA claims for a facility tenant from Firestore
 */
export async function fetchClaimsFromFirestore(facilityCode: string): Promise<ShaClaim[]> {
  const cleanFac = facilityCode.replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `facilities/${cleanFac}/claims`;
  try {
    const q = query(collection(db, 'facilities', cleanFac, 'claims'), limit(100));
    const snap = await getDocs(q);
    const items: ShaClaim[] = [];
    snap.forEach(docSnap => {
      items.push(docSnap.data() as ShaClaim);
    });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}
