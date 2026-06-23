/**
 * Geocoding service using Nominatim (OpenStreetMap) — completely free.
 * No API key required. Rate limit: 1 request/second (fine for dev + small projects).
 * Docs: https://nominatim.org/release-docs/latest/api/Search/
 */

const { normalizeAddress, reverseCacheKey, getCached, setCached } = require('./geocodeCache');

const BASE = 'https://nominatim.openstreetmap.org';

// Nominatim requires a descriptive User-Agent
const HEADERS = {
    'User-Agent': 'DeshSafe/1.0 (https://github.com/Anushka-045/deshsafe)',
    'Accept-Language': 'en',
};

function extractAddressField(address, ...keys) {
    for (const key of keys) {
        if (address[key]) return address[key];
    }
    return null;
}

function buildResult(data, lat, lng) {
    const addr = data.address || {};
    return {
        lat: lat ?? parseFloat(data.lat),
        lng: lng ?? parseFloat(data.lon),
        formattedAddress: data.display_name || null,
        address: data.display_name || null,
        district: extractAddressField(addr,
            'district', 'county', 'city_district',
            'suburb', 'city', 'town', 'village'
        ),
        state: extractAddressField(addr, 'state', 'region'),
        country: addr.country || null,
        postalCode: addr.postcode || null,
        placeId: data.place_id ? String(data.place_id) : null,
    };
}

async function geocodeAddress(address) {
    const key = normalizeAddress(address);
    const cached = await getCached('forward', key);
    if (cached) return { ...cached, cached: true };

    const url = new URL(`${BASE}/search`);
    url.searchParams.set('q', address);
    url.searchParams.set('format', 'json');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('limit', '1');
    url.searchParams.set('countrycodes', 'in'); // bias to India

    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) {
        const err = new Error(`Nominatim error: ${res.status}`);
        err.status = 502;
        throw err;
    }

    const data = await res.json();
    if (!data || data.length === 0) {
        const err = new Error('No results found for this location');
        err.status = 404;
        throw err;
    }

    const parsed = buildResult(data[0]);
    parsed.cached = false;
    await setCached('forward', key, parsed);
    return parsed;
}

async function reverseGeocode(lat, lng) {
    const key = reverseCacheKey(lat, lng);
    const cached = await getCached('reverse', key);
    if (cached) return { ...cached, cached: true };

    const url = new URL(`${BASE}/reverse`);
    url.searchParams.set('lat', lat);
    url.searchParams.set('lon', lng);
    url.searchParams.set('format', 'json');
    url.searchParams.set('addressdetails', '1');

    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) {
        const err = new Error(`Nominatim error: ${res.status}`);
        err.status = 502;
        throw err;
    }

    const data = await res.json();
    if (!data || data.error) {
        const err = new Error('No results found for these coordinates');
        err.status = 404;
        throw err;
    }

    const parsed = buildResult(data, Number(lat), Number(lng));
    parsed.cached = false;
    await setCached('reverse', key, parsed);
    return parsed;
}

module.exports = { geocodeAddress, reverseGeocode };