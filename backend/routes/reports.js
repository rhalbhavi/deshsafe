const express = require('express');
const { ObjectId } = require('mongodb');
const { getDB } = require('../db');
const { createReport, validateReport } = require('../models/Report');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();
const COLLECTION = 'reports';

// PUBLIC: list verified reports
router.get('/', async (req, res, next) => {
    try {
        const db = getDB();
        const { type, severity, state, status, limit = 20, skip = 0 } = req.query;
        const filter = {};
        if (type) filter.type = type;
        if (severity) filter.severity = severity;
        if (state) filter['location.state'] = { $regex: new RegExp(state, 'i') };
        filter.status = status && ['verified','resolved'].includes(status)
            ? status : { $in: ['verified','resolved'] };
        const reports = await db.collection(COLLECTION)
            .find(filter).sort({ createdAt: -1 })
            .skip(Number(skip)).limit(Math.min(Number(limit), 100)).toArray();
        const total = await db.collection(COLLECTION).countDocuments(filter);
        res.json({ total, reports });
    } catch (err) { next(err); }
});

// PUBLIC: get single report
router.get('/:id', async (req, res, next) => {
    try {
        const report = await getDB().collection(COLLECTION)
            .findOne({ _id: new ObjectId(req.params.id) });
        if (!report) return res.status(404).json({ error: 'Report not found' });
        res.json(report);
    } catch (err) {
        if (err.message.includes('ObjectId')) return res.status(400).json({ error: 'Invalid report ID' });
        next(err);
    }
});

// AUTH: submit report
router.post('/', verifyToken, async (req, res, next) => {
    try {
        const validation = validateReport(req.body);
        if (!validation.valid) return res.status(400).json({ errors: validation.errors });
        const doc = createReport({ ...req.body, userId: req.user.uid });
        const result = await getDB().collection(COLLECTION).insertOne(doc);
        res.status(201).json({ _id: result.insertedId, ...doc });
    } catch (err) { next(err); }
});

// AUTH: my submissions
router.get('/my/submissions', verifyToken, async (req, res, next) => {
    try {
        const reports = await getDB().collection(COLLECTION)
            .find({ userId: req.user.uid }).sort({ createdAt: -1 }).toArray();
        res.json({ total: reports.length, reports });
    } catch (err) { next(err); }
});

// ADMIN: all reports
router.get('/admin/all', verifyAdmin, async (req, res, next) => {
    try {
        const { status, limit = 50, skip = 0 } = req.query;
        const filter = {};
        if (status) filter.status = status;
        const reports = await getDB().collection(COLLECTION)
            .find(filter).sort({ createdAt: -1 })
            .skip(Number(skip)).limit(Math.min(Number(limit), 200)).toArray();
        const total = await getDB().collection(COLLECTION).countDocuments(filter);
        res.json({ total, reports });
    } catch (err) { next(err); }
});

// ADMIN: update status
router.patch('/:id/status', verifyAdmin, async (req, res, next) => {
    try {
        const { status } = req.body;
        const VALID = ['pending','verified','rejected','resolved'];
        if (!VALID.includes(status)) return res.status(400).json({ error: `status must be one of: ${VALID.join(', ')}` });
        const result = await getDB().collection(COLLECTION).findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },
            { $set: { status, verifiedBy: req.user.uid, updatedAt: new Date() } },
            { returnDocument: 'after' }
        );
        if (!result) return res.status(404).json({ error: 'Report not found' });
        res.json(result);
    } catch (err) {
        if (err.message.includes('ObjectId')) return res.status(400).json({ error: 'Invalid report ID' });
        next(err);
    }
});

// ADMIN: delete report
router.delete('/:id', verifyAdmin, async (req, res, next) => {
    try {
        const result = await getDB().collection(COLLECTION)
            .deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 0) return res.status(404).json({ error: 'Report not found' });
        res.json({ message: 'Report deleted successfully' });
    } catch (err) {
        if (err.message.includes('ObjectId')) return res.status(400).json({ error: 'Invalid report ID' });
        next(err);
    }
});

module.exports = router;
