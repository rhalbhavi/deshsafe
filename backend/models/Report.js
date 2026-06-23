const VALID_TYPES = ['flood','earthquake','fire','accident','cyclone','landslide','drought','other'];
const VALID_SEVERITY = ['low','medium','high','critical'];
const VALID_STATUS = ['pending','verified','rejected','resolved'];

function createReport({ userId, type, severity, description, location, photoUrl }) {
    const now = new Date();
    return {
        userId,
        type,
        severity,
        description,
        location: {
            lat: location.lat,
            lng: location.lng,
            address: location.address || null,
            district: location.district || null,
            state: location.state || null,
        },
        photoUrl: photoUrl || null,
        status: 'pending',
        verifiedBy: null,
        createdAt: now,
        updatedAt: now,
    };
}

function validateReport(body) {
    const errors = [];
    if (!body.type || !VALID_TYPES.includes(body.type))
        errors.push(`"type" must be one of: ${VALID_TYPES.join(', ')}`);
    if (!body.severity || !VALID_SEVERITY.includes(body.severity))
        errors.push(`"severity" must be one of: ${VALID_SEVERITY.join(', ')}`);
    if (!body.description || body.description.trim().length < 10)
        errors.push('"description" must be at least 10 characters');
    if (!body.location || typeof body.location.lat !== 'number' || typeof body.location.lng !== 'number')
        errors.push('"location" must include numeric "lat" and "lng"');
    return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

module.exports = { createReport, validateReport, VALID_TYPES, VALID_SEVERITY, VALID_STATUS };
