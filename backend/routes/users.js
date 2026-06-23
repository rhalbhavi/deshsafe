const express = require('express');
const { getDB } = require('../db');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();
const COLLECTION = 'users';

// AUTH: get my profile (auto-creates on first login)
router.get('/me', verifyToken, async (req, res, next) => {
    try {
        const db = getDB();
        const uid = req.user.uid;
        let user = await db.collection(COLLECTION).findOne({ uid });
        if (!user) {
            const now = new Date();
            user = {
                uid,
                email: req.user.email || null,
                name: req.user.name || null,
                photoUrl: req.user.picture || null,
                role: 'citizen',
                reportsCount: 0,
                createdAt: now,
                updatedAt: now,
            };
            await db.collection(COLLECTION).insertOne(user);
        }
        res.json(user);
    } catch (err) { next(err); }
});

// AUTH: update my profile
router.patch('/me', verifyToken, async (req, res, next) => {
    try {
        const allowed = ['name','photoUrl'];
        const updates = { updatedAt: new Date() };
        for (const key of allowed) {
            if (req.body[key] !== undefined) updates[key] = req.body[key];
        }
        const result = await getDB().collection(COLLECTION).findOneAndUpdate(
            { uid: req.user.uid },
            { $set: updates },
            { returnDocument: 'after', upsert: true }
        );
        res.json(result);
    } catch (err) { next(err); }
});

// AUTH: my reports
router.get('/me/reports', verifyToken, async (req, res, next) => {
    try {
        const reports = await getDB().collection('reports')
            .find({ userId: req.user.uid }).sort({ createdAt: -1 }).toArray();
        res.json({ total: reports.length, reports });
    } catch (err) { next(err); }
});

// ADMIN: list all users
router.get('/', verifyAdmin, async (req, res, next) => {
    try {
        const users = await getDB().collection(COLLECTION)
            .find({}).sort({ createdAt: -1 }).toArray();
        res.json({ total: users.length, users });
    } catch (err) { next(err); }
});

// ADMIN: change user role
router.patch('/:uid/role', verifyAdmin, async (req, res, next) => {
    try {
        const VALID_ROLES = ['citizen','volunteer','admin'];
        const { role } = req.body;
        if (!VALID_ROLES.includes(role))
            return res.status(400).json({ error: `role must be one of: ${VALID_ROLES.join(', ')}` });
        const result = await getDB().collection(COLLECTION).findOneAndUpdate(
            { uid: req.params.uid },
            { $set: { role, updatedAt: new Date() } },
            { returnDocument: 'after' }
        );
        if (!result) return res.status(404).json({ error: 'User not found' });
        res.json(result);
    } catch (err) { next(err); }
});

module.exports = router;
