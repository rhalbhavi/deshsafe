const express = require('express');
const { ObjectId } = require('mongodb');
const { getDB } = require('../db');
const { createAlert, validateAlert } = require('../models/Alert');
const { verifyAdmin } = require('../middleware/auth');

const router = express.Router();
const COLLECTION = 'alerts';

// PUBLIC: active alerts
router.get('/', async (req, res, next) => {
    try {
        const { state, severity } = req.query;
        const filter = { active: true,
            $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }]
        };
        if (state) filter.affectedStates = { $regex: new RegExp(state, 'i') };
        if (severity) filter.severity = severity;
        const alerts = await getDB().collection(COLLECTION)
            .find(filter).sort({ createdAt: -1 }).toArray();
        res.json({ total: alerts.length, alerts });
    } catch (err) { next(err); }
});

// PUBLIC: single alert
router.get('/:id', async (req, res, next) => {
    try {
        const alert = await getDB().collection(COLLECTION)
            .findOne({ _id: new ObjectId(req.params.id) });
        if (!alert) return res.status(404).json({ error: 'Alert not found' });
        res.json(alert);
    } catch (err) {
        if (err.message.includes('ObjectId')) return res.status(400).json({ error: 'Invalid alert ID' });
        next(err);
    }
});

// ADMIN: create alert
router.post('/', verifyAdmin, async (req, res, next) => {
    try {
        const validation = validateAlert(req.body);
        if (!validation.valid) return res.status(400).json({ errors: validation.errors });
        const doc = createAlert({ ...req.body, adminId: req.user.uid });
        const result = await getDB().collection(COLLECTION).insertOne(doc);
        res.status(201).json({ _id: result.insertedId, ...doc });
    } catch (err) { next(err); }
});

// ADMIN: update alert
router.patch('/:id', verifyAdmin, async (req, res, next) => {
    try {
        const allowed = ['title','message','severity','affectedStates','active','expiresAt'];
        const updates = { updatedAt: new Date() };
        for (const key of allowed) {
            if (req.body[key] !== undefined) updates[key] = req.body[key];
        }
        const result = await getDB().collection(COLLECTION).findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },
            { $set: updates },
            { returnDocument: 'after' }
        );
        if (!result) return res.status(404).json({ error: 'Alert not found' });
        res.json(result);
    } catch (err) {
        if (err.message.includes('ObjectId')) return res.status(400).json({ error: 'Invalid alert ID' });
        next(err);
    }
});

// ADMIN: delete alert
router.delete('/:id', verifyAdmin, async (req, res, next) => {
    try {
        const result = await getDB().collection(COLLECTION)
            .deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 0) return res.status(404).json({ error: 'Alert not found' });
        res.json({ message: 'Alert deleted successfully' });
    } catch (err) {
        if (err.message.includes('ObjectId')) return res.status(400).json({ error: 'Invalid alert ID' });
        next(err);
    }
});

module.exports = router;
