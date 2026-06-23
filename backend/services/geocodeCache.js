const { getDB, isCacheEnabled } = require('../db');

const COLLECTION = 'geocode_cache';

function normalizeAddress(address) {
    return address.trim().toLowerCase().replace(/\s+/g, ' ');
}

function reverseCacheKey(lat, lng) {
    return `${Number(lat).toFixed(4)},${Number(lng).toFixed(4)}`;
}

async function getCached(type, key) {
    if (!isCacheEnabled()) return null;
    const doc = await getDB().collection(COLLECTION).findOne({ type, key });
    if (!doc) return null;
    await getDB().collection(COLLECTION).updateOne(
        { _id: doc._id },
        { $inc: { hits: 1 }, $set: { updatedAt: new Date() } }
    );
    return { ...doc.result, cached: true };
}

async function setCached(type, key, result) {
    if (!isCacheEnabled()) return;
    const now = new Date();
    await getDB().collection(COLLECTION).updateOne(
        { type, key },
        {
            $set: { type, key, result, updatedAt: now },
            $setOnInsert: { createdAt: now, hits: 0 }
        },
        { upsert: true }
    );
}

module.exports = { normalizeAddress, reverseCacheKey, getCached, setCached };
