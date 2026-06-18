// ═══════════════════════════════════════════
//  DeshSafe — storage.js
//  Local fallback persistence for incident reports.
//  Used when Firestore is unreachable (offline) so a submission
//  isn't lost; report.js/map.js/main.js merge this in alongside
//  the Firestore-backed data. Bump the suffix to _v2 instead of
//  mutating this shape if it ever needs to change.
// ═══════════════════════════════════════════

const REPORTS_STORAGE_KEY = 'deshsafe_reports_v1';

function getStoredReports() {
    try {
        const raw = localStorage.getItem(REPORTS_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.warn('Could not read stored reports:', e);
        return [];
    }
}

function saveReport(report) {
    try {
        const reports = getStoredReports();
        const saved = {
            ...report,
            id: report.id || ('local-' + Date.now() + '-' + Math.floor(Math.random() * 10000)),
            submittedAt: report.submittedAt || new Date().toISOString(),
            source: 'local'
        };
        reports.push(saved);
        localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
        return saved;
    } catch (e) {
        console.warn('Could not save report locally:', e);
        return null;
    }
}

function deleteReport(reportId) {
    try {
        const reports = getStoredReports().filter(r => r.id !== reportId);
        localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
        return true;
    } catch (e) {
        console.warn('Could not delete stored report:', e);
        return false;
    }
}

function clearAllReports() {
    try {
        localStorage.removeItem(REPORTS_STORAGE_KEY);
        return true;
    } catch (e) {
        console.warn('Could not clear stored reports:', e);
        return false;
    }
}

// Merges the static seed dataset with locally-cached reports (offline fallback
// submissions). Firestore-backed reports are merged separately by main.js/map.js.
async function getAllReports() {
    let seed = [];
    try {
        const res = await fetch('data/alerts.json');
        if (res.ok) {
            const data = await res.json();
            seed = data.community_reports || [];
        }
    } catch (e) {
        console.warn('Could not fetch alerts.json:', e);
    }
    return [...seed, ...getStoredReports()];
}
