import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { UserProfile } from '../types';

let projectId = process.env.FIREBASE_PROJECT_ID || 'kazira-io';
let databaseId = process.env.FIRESTORE_DATABASE_ID || 'ai-studio-kaziraioclinicin-ed928fd1-5a41-4c48-ad3d-3be773cab9f4';

try {
  const configFile = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configFile)) {
    const raw = fs.readFileSync(configFile, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed.projectId) projectId = parsed.projectId;
    if (parsed.firestoreDatabaseId) databaseId = parsed.firestoreDatabaseId;
  }
} catch (e) {
  // fallback to defaults
}

const app: App = getApps().length > 0 ? getApps()[0] : initializeApp({
  projectId
});

export const adminAuth: Auth = getAuth(app);
export const adminDb: Firestore = getFirestore(app, databaseId);

/**
 * Verifies a Firebase ID token sent from the client.
 */
export async function verifyFirebaseIdToken(idToken: string) {
  if (!idToken || typeof idToken !== 'string') {
    throw new Error('Missing or invalid Firebase ID token.');
  }
  return await adminAuth.verifyIdToken(idToken);
}

/**
 * Fetches user profile directly from Firestore authoritative store.
 * NEVER trust user role or facility code from the client request body.
 */
export async function getUserProfileFromFirestore(uid: string, email?: string): Promise<UserProfile | null> {
  try {
    // 1. Direct lookup by UID
    const docRef = adminDb.collection('users').doc(uid);
    const snap = await docRef.get();
    if (snap.exists) {
      return { id: snap.id, ...snap.data() } as UserProfile;
    }

    // 2. Lookup by email if UID doc not yet established
    if (email) {
      const querySnap = await adminDb.collection('users')
        .where('email', '==', email.toLowerCase().trim())
        .limit(1)
        .get();

      if (!querySnap.empty) {
        const found = querySnap.docs[0];
        return { id: found.id, ...found.data() } as UserProfile;
      }
    }
  } catch (err: any) {
    console.warn('[FirebaseAdmin] Failed to query Firestore user profile:', err.message);
  }

  return null;
}
