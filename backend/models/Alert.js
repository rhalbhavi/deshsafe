const VALID_SEVERITY = ['info','warning','danger','critical'];

function createAlert({ adminId, title, message, severity, affectedStates, expiresAt }) {
    const now = new Date();
    return {
        adminId,
        title,
        message,
        severity,
        affectedStates,
        active: true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdAt: now,
        updatedAt: now,
    };
}

function validateAlert(body) {
    const errors = [];
    if (!body.title || body.title.trim().length < 3)
        errors.push('"title" must be at least 3 characters');
    if (!body.message || body.message.trim().length < 10)
        errors.push('"message" must be at least 10 characters');
    if (!body.severity || !VALID_SEVERITY.includes(body.severity))
        errors.push(`"severity" must be one of: ${VALID_SEVERITY.join(', ')}`);
    if (!Array.isArray(body.affectedStates) || body.affectedStates.length === 0)
        errors.push('"affectedStates" must be a non-empty array of state names');
    return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

module.exports = { createAlert, validateAlert, VALID_SEVERITY };
