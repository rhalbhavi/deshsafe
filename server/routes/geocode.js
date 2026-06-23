const express = require('express');
const { geocodeAddress, reverseGeocode } = require('../services/googleGeocode');

const router = express.Router();

function parseCoord(value, name) {
    const num = Number(value);
    if (!Number.isFinite(num)) {
        const err = new Error(`Invalid ${name}: must be a number`);
        err.status = 400;
        throw err;
    }
    return num;
}

router.get('/geocode', async (req, res, next) => {
    try {
        const address = req.query.address?.trim();
        if (!address) {
            return res.status(400).json({ error: 'Query parameter "address" is required' });
        }

        const result = await geocodeAddress(address);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

router.get('/reverse-geocode', async (req, res, next) => {
    try {
        const { lat, lng } = req.query;
        if (lat == null || lng == null) {
            return res.status(400).json({ error: 'Query parameters "lat" and "lng" are required' });
        }

        const latitude = parseCoord(lat, 'lat');
        const longitude = parseCoord(lng, 'lng');

        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            return res.status(400).json({ error: 'Coordinates out of valid range' });
        }

        const result = await reverseGeocode(latitude, longitude);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
