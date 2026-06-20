// ═══════════════════════════════════════════
//  DeshSafe — map.js
// ═══════════════════════════════════════════

const DEFAULT_CENTER = [28.6139, 77.2090]; // New Delhi

const severityColors = {
    low: 'green',
    medium: 'orange',
    moderate: 'orange',
    high: 'red',
    critical: 'darkred'
};

// Colour-coded divIcon for an incident marker, based on its severity level
function getMarkerIcon(severity) {
    const color = severityColors[severity] || 'gray';
    return L.divIcon({
        className: `marker-${severity || 'unknown'}`,
        html: `<div style="
            background: ${color};
            width: 16px;
            height: 16px;
            border-radius: 50%;
            border: 2px solid #fff;
            box-shadow: 0 0 4px rgba(0,0,0,0.45);
        "></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });
}

function addIncidentMarker(map, incident) {
    if (incident.lat == null || incident.lng == null) return;

    const marker = L.marker([incident.lat, incident.lng], {
        icon: getMarkerIcon(incident.severity)
    }).addTo(map);

    const severity = (incident.severity || 'unknown').toLowerCase();

    marker.bindPopup(`
        <strong>${incident.title}</strong>
        <span class="severity-badge ${severity}">${severity.toUpperCase()}</span>
        ${incident.description ? `<p>${incident.description}</p>` : ''}
        <small><i class="fa-solid fa-location-dot"></i> ${incident.location || 'Unknown location'}</small>
    `);
}

document.addEventListener('DOMContentLoaded', async () => {
    const mapEl = document.getElementById('incident-map');
    if (!mapEl || typeof L === 'undefined') return;

    const map = L.map('incident-map').setView(DEFAULT_CENTER, 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);

    try {
        const data = await window.DeshSafe.fetchAlertsAndWeather();

        // Active alerts (heatwave, air quality, etc.)
        (data.active_alerts || []).forEach(alert => addIncidentMarker(map, {
            title: alert.title,
            description: alert.description,
            location: alert.location,
            severity: alert.severity,
            lat: alert.lat,
            lng: alert.lng
        }));

        // Community-submitted reports from sample data
        (data.community_reports || []).forEach(report => addIncidentMarker(map, {
            title: report.title,
            location: report.location,
            severity: report.severity,
            lat: report.lat,
            lng: report.lng
        }));

        // Reports submitted from this device via the report form
        const userReports = await window.DeshSafe.getReports();
        userReports.forEach(report => addIncidentMarker(map, {
            title: `${report.title} (${report.type})`,
            description: report.description,
            location: report.location,
            severity: report.severity,
            lat: report.lat,
            lng: report.lng
        }));
    } catch (err) {
        console.error('Failed to load incident data:', err);
        showMapErrorBanner();
    }
});

// User-facing fallback if alerts/reports fail to load entirely
function showMapErrorBanner() {
    const container = document.querySelector('.map-page-container');
    if (!container) return;
    const banner = document.createElement('div');
    banner.className = 'map-error-banner';
    banner.textContent = 'Unable to load live incident data. Please refresh the page or try again later.';
    container.prepend(banner);
}
