const { MongoClient } = require('mongodb');

let client;
let db;
let cacheEnabled = false;

async function connectDB() {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/deshsafe';

    if (db) return db;

    client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });

    try {
        await client.connect();
        db = client.db();

        const cache = db.collection('geocode_cache');
        await cache.createIndex({ key: 1, type: 1 }, { unique: true });
        await cache.createIndex({ updatedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

        cacheEnabled = true;
        console.log('MongoDB connected — geocode cache enabled');
    } catch (err) {
        console.warn('MongoDB unavailable — geocode cache disabled:', err.message);
        cacheEnabled = false;
    }

    return db;
}

function isCacheEnabled() {
    return cacheEnabled && !!db;
}

function getDB() {
    if (!db) {
        throw new Error('Database not connected.');
    }
    return db;
}

async function closeDB() {
    if (client) {
        await client.close();
        client = undefined;
        db = undefined;
        cacheEnabled = false;
    }
}

module.exports = { connectDB, getDB, closeDB, isCacheEnabled };
