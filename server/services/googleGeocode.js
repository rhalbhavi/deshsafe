const {
    normalizeAddress,
    reverseCacheKey,
    getCached,
    setCached
} = require('./geocodeCache');

const GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

function getApiKey() {
    const key = process.env.GOOGLE_MAPS_API_KEY;
    if (!key || key === 'your_google_maps_api_key_here') {
        throw new Error('GOOGLE_MAPS_API_KEY is not configured');
    }
    return key;
}

function component(components, type) {
    return components.find(c => c.types.includes(type))?.long_name || null;
}

function parseAddressComponents(components) {
    return {
        district: component(components, 'administrative_area_level_2')
            || component(components, 'locality')
            || component(components, 'sublocality_level_1'),
        state: component(components, 'administrative_area_level_1'),
        country: component(components, 'country'),
        postalCode: component(components, 'postal_code')
    };
}

function buildResult(googleResult, lat, lng) {
    const { district, state, country, postalCode } = parseAddressComponents(
        googleResult.address_components || []
    );

    return {
        lat: lat ?? googleResult.geometry?.location?.lat,
        lng: lng ?? googleResult.geometry?.location?.lng,
        formattedAddress: googleResult.formatted_address,
        address: googleResult.formatted_address,
        district,
        state,
        country,
        postalCode,
        placeId: googleResult.place_id || null
    };
}

async function callGoogle(params) {
    const url = new URL(GEOCODE_URL);
    url.searchParams.set('key', getApiKey());
    for (const [k, v] of Object.entries(params)) {
        url.searchParams.set(k, v);
    }

    const res = await fetch(url);
    const data = await res.json();

    if (data.status === 'ZERO_RESULTS') {
        const err = new Error('No results found for this location');
        err.status = 404;
        throw err;
    }

    if (data.status !== 'OK') {
        const err = new Error(data.error_message || `Geocoding failed: ${data.status}`);
        err.status = data.status === 'REQUEST_DENIED' ? 503 : 502;
        throw err;
    }

    return data.results[0];
}

async function geocodeAddress(address) {
    const key = normalizeAddress(address);
    const cached = await getCached('forward', key);
    if (cached) return cached;

    const result = await callGoogle({ address });
    const parsed = buildResult(result);
    parsed.cached = false;

    await setCached('forward', key, parsed);
    return parsed;
}

async function reverseGeocode(lat, lng) {
    const key = reverseCacheKey(lat, lng);
    const cached = await getCached('reverse', key);
    if (cached) return cached;

    const result = await callGoogle({ latlng: `${lat},${lng}` });
    const parsed = buildResult(result, Number(lat), Number(lng));
    parsed.cached = false;

    await setCached('reverse', key, parsed);
    return parsed;
}

module.exports = { geocodeAddress, reverseGeocode };
