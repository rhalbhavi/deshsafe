// ═══════════════════════════════════════════
//  DeshSafe — firebase.js
//  Central Firebase initialization & helpers
// ═══════════════════════════════════════════

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    addDoc,
    collection,
    query,
    where,
    orderBy,
    getDocs,
    onSnapshot,
    serverTimestamp,
    writeBatch
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// ── Firebase Config ──
const firebaseConfig = {
    apiKey:            "AIzaSyBFxZCUhI_BTrgmSHaIlG9DsxdaSGrMqvw",
    authDomain:        "deshsafe-a6899.firebaseapp.com",
    projectId:         "deshsafe-a6899",
    storageBucket:     "deshsafe-a6899.firebasestorage.app",
    messagingSenderId: "303695719806",
    appId:             "1:303695719806:web:4f1c60ba3c9b514f95972f"
};

// ── Init ──
const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// ══════════════════════════════════════════
//  AUTH HELPERS
// ══════════════════════════════════════════

/**
 * Sign up with email and password.
 * Also creates a user document in Firestore with default profile.
 */
async function signUpWithEmail(email, password, displayName) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    await _createUserDoc(cred.user, { name: displayName });
    await _migrateLocalStorage(cred.user.uid);
    return cred.user;
}

/**
 * Sign in with email and password.
 */
async function signInWithEmail(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await _migrateLocalStorage(cred.user.uid);
    return cred.user;
}

/**
 * Sign in with Google popup.
 * Creates user doc on first login.
 */
async function signInWithGoogle() {
    const cred = await signInWithPopup(auth, googleProvider);
    const userDocRef = doc(db, 'users', cred.user.uid);
    const userSnap   = await getDoc(userDocRef);
    if (!userSnap.exists()) {
        // First-time Google login — create profile doc
        await _createUserDoc(cred.user, { name: cred.user.displayName || '' });
    }
    await _migrateLocalStorage(cred.user.uid);
    return cred.user;
}

/**
 * Sign out the current user.
 */
async function logOut() {
    await signOut(auth);
}

/**
 * Listen to auth state changes. Calls callback with user or null.
 * Returns the unsubscribe function.
 */
function onAuthChange(callback) {
    return onAuthStateChanged(auth, callback);
}

// ── Internal: Create default user doc in Firestore ──
async function _createUserDoc(firebaseUser, overrides = {}) {
    const ref = doc(db, 'users', firebaseUser.uid);
    await setDoc(ref, {
        name:        overrides.name || firebaseUser.displayName || 'Anonymous',
        email:       firebaseUser.email || '',
        age:         '',
        phone:       '',
        familySize:  '4 members',
        location:    'India',
        healthTags:  [],
        preferences: { heatwave: true, flood: true, aqi: true, earthquake: false },
        createdAt:   serverTimestamp()
    }, { merge: true });
}

// ══════════════════════════════════════════
//  FIRESTORE: USER PROFILE
// ══════════════════════════════════════════

/**
 * Get the current user's profile from Firestore.
 * Falls back to a default profile if not found.
 */
async function getProfile(uid) {
    if (!uid) return _defaultProfile();
    try {
        const snap = await getDoc(doc(db, 'users', uid));
        if (snap.exists()) return snap.data();
    } catch (e) {
        console.error('Error fetching profile from Firestore:', e);
    }
    return _defaultProfile();
}

/**
 * Save the current user's profile to Firestore.
 */
async function saveProfile(uid, profileData) {
    if (!uid) throw new Error('User not authenticated');
    await setDoc(doc(db, 'users', uid), profileData, { merge: true });
}

function _defaultProfile() {
    return {
        name:        'Anonymous',
        age:         '',
        phone:       '',
        familySize:  '4 members',
        location:    'India',
        healthTags:  [],
        preferences: { heatwave: true, flood: true, aqi: true, earthquake: false }
    };
}

// ══════════════════════════════════════════
//  FIRESTORE: INCIDENTS / REPORTS
// ══════════════════════════════════════════

/**
 * Save a new incident report to Firestore.
 * Attaches the authenticated user's uid.
 */
async function saveReport(uid, report) {
    if (!uid) throw new Error('User not authenticated');
    await addDoc(collection(db, 'incidents'), {
        ...report,
        reportedBy: uid,
        status:     'submitted',
        timestamp:  serverTimestamp()
    });
}

/**
 * Get all incident reports by the current user (ordered newest first).
 */
async function getUserReports(uid) {
    if (!uid) return [];
    const q    = query(
        collection(db, 'incidents'),
        where('reportedBy', '==', uid),
        orderBy('timestamp', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Get all community incident reports (public).
 */
async function getCommunityReports() {
    const q    = query(collection(db, 'incidents'), orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ══════════════════════════════════════════
//  FIRESTORE: ALERTS (Real-time)
// ══════════════════════════════════════════

/**
 * Listen to active alerts in real-time.
 * Calls callback with the alerts array whenever data changes.
 * Returns the unsubscribe function.
 */
function onAlertsSnapshot(callback) {
    return onSnapshot(collection(db, 'alerts'), (snap) => {
        const alerts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(alerts);
    });
}

// ══════════════════════════════════════════
//  LOCALSTORAGE MIGRATION
// ══════════════════════════════════════════

/**
 * One-time migration: uploads any existing localStorage data to Firestore.
 * Clears localStorage after successful sync.
 */
async function _migrateLocalStorage(uid) {
    if (!uid) return;
    const migrationKey = `deshsafe_migrated_${uid}`;
    if (localStorage.getItem(migrationKey)) return; // Already migrated

    const batch = writeBatch(db);
    let hasMigrations = false;

    // Migrate profile
    const rawProfile = localStorage.getItem('deshsafe_profile');
    if (rawProfile) {
        try {
            const profileData = JSON.parse(rawProfile);
            const userRef = doc(db, 'users', uid);
            batch.set(userRef, { ...profileData, migratedAt: serverTimestamp() }, { merge: true });
            hasMigrations = true;
        } catch (e) {
            console.warn('Could not migrate local profile:', e);
        }
    }

    // Migrate reports
    const rawReports = localStorage.getItem('deshsafe_reports');
    if (rawReports) {
        try {
            const reports = JSON.parse(rawReports);
            for (const report of reports) {
                const newRef = doc(collection(db, 'incidents'));
                batch.set(newRef, {
                    ...report,
                    reportedBy:  uid,
                    status:      report.status || 'submitted',
                    timestamp:   serverTimestamp(),
                    migratedAt:  serverTimestamp()
                });
                hasMigrations = true;
            }
        } catch (e) {
            console.warn('Could not migrate local reports:', e);
        }
    }

    if (hasMigrations) {
        await batch.commit();
        console.info('✅ DeshSafe: Local data migrated to Firestore.');
    }

    // Mark as migrated and clean up localStorage
    localStorage.setItem(migrationKey, 'true');
    localStorage.removeItem('deshsafe_profile');
    localStorage.removeItem('deshsafe_reports');
}

// ══════════════════════════════════════════
//  EXPORTS — used by all other JS files
// ══════════════════════════════════════════

export {
    auth,
    db,
    // Auth
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    logOut,
    onAuthChange,
    // Profile
    getProfile,
    saveProfile,
    // Reports
    saveReport,
    getUserReports,
    getCommunityReports,
    // Alerts
    onAlertsSnapshot
};