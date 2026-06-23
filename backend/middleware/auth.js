const { getAuth } = require('../services/firebaseAdmin');

async function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
        const decoded = await getAuth().verifyIdToken(idToken);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

async function verifyAdmin(req, res, next) {
    await verifyToken(req, res, async () => {
        if (!req.user?.admin) {
            return res.status(403).json({ error: 'Admin access required' });
        }
        next();
    });
}

module.exports = { verifyToken, verifyAdmin };