const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

if (getApps().length === 0) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
        : null;

    initializeApp({
        credential: serviceAccount
            ? cert(serviceAccount)
            : undefined,
        projectId: process.env.FIREBASE_PROJECT_ID,
    });
}

module.exports = { getAuth };