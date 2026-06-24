const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

let isMock = false;

if (getApps().length === 0) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
        : null;

    try {
        const options = {
            projectId: process.env.FIREBASE_PROJECT_ID || 'deshsafe-a6899'
        };
        if (serviceAccount) {
            options.credential = cert(serviceAccount);
            initializeApp(options);
        } else {
            console.warn('[FirebaseAdmin] No service account JSON provided. Running auth in mock/bypass mode for development.');
            isMock = true;
        }
    } catch (e) {
        console.warn('[FirebaseAdmin] Initialization failed. Running in mock/bypass mode.', e.message);
        isMock = true;
    }
}

function getMockAuth() {
    return {
        verifyIdToken: async (token) => {
            // Mock decoder: if token is "mock-token-..." or anything, return a mock user
            if (token && token.startsWith('mock-')) {
                return { uid: 'mock-user-123', email: 'mock@example.com', name: 'Mock User' };
            }
            // Otherwise try decoding basic json or return mock
            try {
                const parts = token.split('.');
                if (parts.length === 3) {
                    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
                    if (payload && payload.uid) return payload;
                }
            } catch (e) {}
            return { uid: 'mock-user-123', email: 'mock@example.com', name: 'Mock User' };
        }
    };
}

module.exports = {
    getAuth: () => isMock ? getMockAuth() : getAuth()
};