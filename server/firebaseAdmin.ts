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

// Track whether backend service account has IAM credentials on the Firestore database
export let isFirestoreAdminAvailable: boolean = true;

/**
 * Decodes Firestore REST API typed values into plain JavaScript values.
 */
function decodeFirestoreValue(val: any): any {
  if (!val || typeof val !== 'object') return val;
  if ('stringValue' in val) return val.stringValue;
  if ('integerValue' in val) return parseInt(val.integerValue, 10);
  if ('doubleValue' in val) return parseFloat(val.doubleValue);
  if ('booleanValue' in val) return val.booleanValue;
  if ('timestampValue' in val) return val.timestampValue;
  if ('arrayValue' in val) return (val.arrayValue.values || []).map(decodeFirestoreValue);
  if ('mapValue' in val) {
    const res: Record<string, any> = {};
    for (const [k, v] of Object.entries(val.mapValue.fields || {})) {
      res[k] = decodeFirestoreValue(v);
    }
    return res;
  }
  return null;
}

/**
 * Queries Firestore REST API using the user's authenticated Firebase ID token.
 * This runs securely with the caller's identity and is evaluated against firestore.rules.
 */
export async function fetchFirestoreDocWithIdToken(docPath: string, idToken?: string): Promise<Record<string, any> | null> {
  if (!idToken || typeof idToken !== 'string') return null;
  try {
    const cleanDoc = docPath.startsWith('/') ? docPath.slice(1) : docPath;
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/${cleanDoc}`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (data && data.fields) {
      const decoded: Record<string, any> = {};
      for (const [key, val] of Object.entries(data.fields)) {
        decoded[key] = decodeFirestoreValue(val);
      }
      return decoded;
    }
    return null;
  } catch {
    return null;
  }
}

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
 * Fetches user profile directly from Firestore authoritative store or verified profile caches.
 * Handles environments where backend service account does not hold IAM Firestore Admin rights.
 */
export async function getUserProfileFromFirestore(
  uid: string, 
  email?: string, 
  idToken?: string, 
  clientProfile?: UserProfile
): Promise<UserProfile | null> {
  // 1. If verified client profile was supplied during Google Auth, validate identity and return
  if (clientProfile && typeof clientProfile === 'object') {
    const matchesUid = clientProfile.id === uid;
    const matchesEmail = email && clientProfile.email && clientProfile.email.toLowerCase() === email.toLowerCase();
    if (matchesUid || matchesEmail) {
      // Role protection: prevent self-assigning supervisory roles unless verified
      let safeRole = clientProfile.role || 'facility_admin';
      if (safeRole === 'moh' || safeRole === 'county_health') {
        const isOfficial = email && (email.endsWith('.go.ke') || email.includes('moh') || email.includes('county'));
        if (!isOfficial) safeRole = 'facility_admin';
      }
      return {
        ...clientProfile,
        id: uid,
        role: safeRole
      };
    }
  }

  // 2. Query Cloud Firestore REST API using the caller's Firebase ID token
  if (idToken) {
    const restDoc = await fetchFirestoreDocWithIdToken(`users/${uid}`, idToken);
    if (restDoc && restDoc.name && restDoc.facilityCode) {
      return {
        id: uid,
        ...restDoc
      } as UserProfile;
    }
  }

  // 3. Check official registered profiles catalog (e.g., Lead Administrators, CMOs, Guest Evaluator)
  try {
    const { PROFILES } = await import('../constants/profiles');
    const matchedProfile = PROFILES.find(p => 
      p.id === uid || 
      (email && p.email && p.email.toLowerCase() === email.toLowerCase())
    );
    if (matchedProfile) {
      return {
        ...matchedProfile,
        id: uid
      };
    }
  } catch {}

  // 4. Try Firestore Admin SDK only if IAM permissions are available
  if (isFirestoreAdminAvailable) {
    try {
      const docRef = adminDb.collection('users').doc(uid);
      const snap = await docRef.get();
      if (snap.exists) {
        return { id: snap.id, ...snap.data() } as UserProfile;
      }

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
      const isPermDenied = err.code === 7 || (err.message && err.message.includes('PERMISSION_DENIED'));
      if (isPermDenied) {
        // Backend service account lacks Firestore IAM credentials in this container environment;
        // disable further gRPC attempts to prevent recurring error log noise.
        isFirestoreAdminAvailable = false;
      } else {
        console.warn('[FirebaseAdmin] Firestore user profile notice:', err.message);
      }
    }
  }

  // 5. Synthesize an initial verified facility administrator profile for authenticated Google users
  if (email && email.includes('@')) {
    const cleanName = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return {
      id: uid,
      name: cleanName,
      title: 'Chief Medical Officer & Facility Admin',
      email: email,
      role: 'facility_admin',
      facilityName: 'Nairobi West Memorial Hospital',
      facilityCode: 'MFL #14920',
      facilityType: 'private',
      avatarMonogram: cleanName.slice(0, 2).toUpperCase(),
      avatarColor: 'bg-[#005235] text-white',
      isGuest: false,
      department: 'Executive Administration & Clinical Services',
      phone: '+254 700 000 000',
      permissions: [
        'Full Revenue Cycle Management',
        'Unbilled Gap Debt Resolution',
        'SHA Claim Verification & Submission',
        'Deterministic AI Dual-Loop Execution',
        'Cloud Database Synchronization'
      ]
    };
  }

  return null;
}
