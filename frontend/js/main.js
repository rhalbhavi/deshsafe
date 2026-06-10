// Update the greeting date dynamically
function updateDate() {
    const now=new Date();
    const options={weekday:'long', year:'numeric', month:'long', day:'numeric'};
    const dateString = now.toLocaleDateString('en-IN', options);
    document.getElementById('greeting-date').innerHTML = 
        dateString + ' · Stay safe today — 2 active alerts in your area';
}

if(document.getElementById('greeting-date')) {
    updateDate();
}

// Simulate real-time data updates (for demo purposes)
function animateCounter(id, target, suffix) {
    let current = 0;
    const element = document.getElementById(id);
    const timer = setInterval(function() {
        current++;
        element.innerHTML = current + suffix;
        if(current === target) {
            clearInterval(timer);
        }
    }, 30);
}

// Scroll animation for feature cards
const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
if(entry.isIntersecting) {
    entry.target.classList.add('visible');
} else {
    entry.target.classList.remove('visible');
}
    });
}, { threshold: 0.1});

document.querySelectorAll('.feature-card').forEach(function(card) {
    observer.observe(card);
});

//steps
const steps = document.querySelectorAll('.step-item');
function updateProgress() {
    const total = steps.length;
    const completed = document.querySelectorAll('.step-item.completed').length;
    const percent = Math.round((completed / total) * 100);
    const fill = document.getElementById('progress-fill');
    const label = document.getElementById('progress-percent');
    
    if(fill && label) {
        fill.style.width = percent + '%';
        label.innerHTML = percent + '%';
    }
}
steps.forEach(function(step) {
    step.addEventListener('click', function() {
        step.classList.toggle('completed');
        updateProgress();
    });
});

/// ── Dark Mode ──
(function () {
    var STORAGE_KEY = 'deshsafe-theme';

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEY, theme);
    }

    function getPreferred() {
        var saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    // Apply immediately (before paint) to avoid flash
    applyTheme(getPreferred());

    window.toggleDarkMode = function () {
        var current = document.documentElement.getAttribute('data-theme');
        applyTheme(current === 'dark' ? 'light' : 'dark');
    };
})();

// Helper function to get initials from a name (shared globally)
function getInitials(name) {
    if (!name) return 'DS';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ── Consolidated Data Integration Layer (Single Source of Truth) ──
window.DeshSafe = {
    // Retrieves profile data from localStorage or falls back to default Anushka Pandey profile
    getProfile() {
        const saved = localStorage.getItem('deshsafe_profile');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Error parsing profile data from localStorage:', e);
            }
        }
        // Fallback default values matching the Anushka profile
        return {
            name: 'Anushka Pandey',
            age: '21',
            phone: '7428525668',
            familySize: '4 members',
            location: 'New Delhi, India',
            healthTags: ['Asthma'],
            preferences: { heatwave: true, flood: true, aqi: true, earthquake: false }
        };
    },

    // Saves profile data, dispatches updates, and triggers UI sync
    saveProfile(profileData) {
        localStorage.setItem('deshsafe_profile', JSON.stringify(profileData));
        window.dispatchEvent(new CustomEvent('deshsafe-profile-update', { detail: profileData }));
        this.syncUI();
    },

    // Retrieves submitted user reports
    getReports() {
        try {
            return JSON.parse(localStorage.getItem('deshsafe_reports') || '[]');
        } catch (e) {
            console.error('Error parsing reports from localStorage:', e);
            return [];
        }
    },

    // Adds a user report and dispatches update events
    saveReport(report) {
        const reports = this.getReports();
        reports.push(report);
        localStorage.setItem('deshsafe_reports', JSON.stringify(reports));
        window.dispatchEvent(new CustomEvent('deshsafe-reports-update', { detail: reports }));
    },

    // Fetches live alerts and weather data from alerts.json with static fallback
    async fetchAlertsAndWeather() {
        try {
            const res = await fetch('data/alerts.json');
            if (res.ok) {
                return await res.json();
            }
        } catch (e) {
            console.warn('Could not fetch alerts.json, using fallback data:', e);
        }
        // Static mock data fallback (consistent with alerts.json structure)
        return {
            meta: { location: 'New Delhi, India', last_updated: new Date().toISOString() },
            active_alerts: [
                {
                    id: 'alert-001',
                    type: 'heatwave',
                    title: 'Severe Heatwave — Delhi NCR region',
                    description: 'Temperature above 42°C expected until Friday. High risk for elderly, children, and outdoor workers. Avoid going outside between 11am–5pm.',
                    severity: 'high',
                    location: 'Delhi NCR',
                    tags: ['Drink water hourly', 'Stay indoors 11am–5pm', 'Watch for heatstroke']
                },
                {
                    id: 'alert-002',
                    type: 'air_quality',
                    title: 'Poor Air Quality — AQI 168',
                    description: 'Unhealthy for sensitive groups. Wear a mask if going outside. Keep windows closed during afternoon hours.',
                    severity: 'moderate',
                    location: 'Delhi NCR',
                    tags: ['Wear N95 mask', 'Close windows 12–4pm']
                }
            ],
            weather: {
                temperature_c: 42,
                feels_like_c: 47,
                humidity_percent: 28,
                aqi: 168,
                wind_kmh: 12,
                uv_index: 11,
                condition: 'Severe Heatwave',
                sunrise: '05:44',
                sunset: '19:12'
            },
            community_reports: [
                {
                    id: 'rep-001',
                    type: 'flood',
                    title: 'Waterlogging — Minto Road underpass',
                    location: 'Central Delhi',
                    reported_at: '2026-05-16T08:35:00+05:30',
                    severity: 'high',
                    status: 'confirmed',
                    verified: true
                },
                {
                    id: 'rep-002',
                    type: 'other',
                    title: 'Power outage — Sector 15 Rohini',
                    location: 'North Delhi',
                    reported_at: '2026-05-16T08:00:00+05:30',
                    severity: 'moderate',
                    status: 'verifying',
                    verified: false
                },
                {
                    id: 'rep-003',
                    type: 'other',
                    title: 'Tree fallen on road — Golf Links',
                    location: 'South Delhi',
                    reported_at: '2026-05-16T06:00:00+05:30',
                    severity: 'low',
                    status: 'resolved',
                    verified: true
                }
            ]
        };
    },

    // Synchronizes the user profile elements globally across all pages
    syncUI() {
        const profile = this.getProfile();
        const initials = getInitials(profile.name);

        // 1. Sync avatar initials globally
        document.querySelectorAll('.nav-avatar, .avatar-ring').forEach(avatar => {
            avatar.textContent = initials;
        });

        // 2. Sync location indicator in navbar
        const locationStr = profile.location || 'New Delhi, India';
        document.querySelectorAll('.nav-location').forEach(navLoc => {
            navLoc.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${locationStr}`;
        });

        // 3. Sync profile page identity name
        const identityName = document.querySelector('.identity-name');
        if (identityName) {
            identityName.textContent = profile.name || 'Anonymous';
        }

        // 4. Sync dashboard greeting title
        const greetingTitle = document.querySelector('.greeting-title');
        if (greetingTitle) {
            const hr = new Date().getHours();
            let timeOfDay = 'day';
            if (hr < 12) timeOfDay = 'morning';
            else if (hr < 17) timeOfDay = 'afternoon';
            else timeOfDay = 'evening';
            const firstName = profile.name ? profile.name.trim().split(/\s+/)[0] : 'Anonymous';
            greetingTitle.innerHTML = `Good ${timeOfDay}, ${firstName} 👋`;
        }

        // 5. Sync Action Plan personalization cards (action.html)
        const profileCard = document.querySelector('.profile-card');
        if (profileCard) {
            const items = profileCard.querySelectorAll('.profile-item');
            if (items.length >= 4) {
                items[0].innerHTML = `<i class="fa-solid fa-user"></i> <span>${profile.name || 'Anonymous'}, Age ${profile.age || '—'}</span>`;
                const healthStr = profile.healthTags && profile.healthTags.length > 0 ? profile.healthTags.join(', ') : 'No conditions';
                items[1].innerHTML = `<i class="fa-solid fa-lungs"></i> <span>${healthStr} condition</span>`;
                const familyText = typeof profile.familySize === 'string' && profile.familySize.includes('member') 
                    ? profile.familySize 
                    : `Family of ${profile.familySize || '—'} members`;
                items[2].innerHTML = `<i class="fa-solid fa-people-roof"></i> <span>${familyText}</span>`;
                items[3].innerHTML = `<i class="fa-solid fa-location-dot"></i> <span>${locationStr}</span>`;
            }

            const stepsSub = document.querySelector('.steps-sub');
            if (stepsSub) {
                const healthPart = profile.healthTags && profile.healthTags.length > 0 ? `, ${profile.healthTags.join(', ')} condition` : '';
                const familyText = typeof profile.familySize === 'string' && profile.familySize.includes('member') 
                    ? profile.familySize 
                    : `Family of ${profile.familySize || '—'}`;
                stepsSub.textContent = `Based on your profile — Age ${profile.age || '—'}${healthPart}, ${familyText}`;
            }
        }

        // 6. Dynamic personalization of dashboard safety risk details
        const safetyCard = document.querySelector('.safety-card');
        if (safetyCard) {
            const safetyItems = safetyCard.querySelectorAll('.safety-item');
            if (safetyItems.length > 0) {
                const hasAsthma = profile.healthTags?.some(t => t.toLowerCase().includes('asthma'));
                safetyItems[0].innerHTML = hasAsthma 
                    ? `<span class="safety-dot dot-red"></span><p>Heat risk — HIGH for asthma patients</p>`
                    : `<span class="safety-dot dot-amber"></span><p>Heat risk — Moderate for general public</p>`;
            }
        }
    },

    // Fetches live data and populates dashboard alerts, weather, and history dynamically
    async initializeDashboard() {
        const profile = this.getProfile();
        const data = await this.fetchAlertsAndWeather();
        const weather = data.weather;

        if (weather) {
            // Drive dynamic counter animations
            if (typeof animateCounter === 'function') {
                animateCounter('stat-temp', weather.temperature_c || 42, '°C');
                animateCounter('stat-aqi', weather.aqi || 168, '');
                animateCounter('stat-humidity', weather.humidity_percent || 28, '%');
            }

            // Populate weather card widget
            const weatherCard = document.querySelector('.weather-card');
            if (weatherCard) {
                const locEl = weatherCard.querySelector('.weather-location');
                const tempEl = weatherCard.querySelector('.weather-temp');
                const descEl = weatherCard.querySelector('.weather-desc');
                const statVals = weatherCard.querySelectorAll('.weather-stat-val');

                if (locEl) locEl.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${profile.location || data.meta.location || 'New Delhi, India'}`;
                if (tempEl) tempEl.textContent = `${weather.temperature_c}°C`;
                if (descEl) descEl.textContent = `${weather.condition} · Feels like ${weather.feels_like_c}°C`;

                if (statVals.length >= 3) {
                    statVals[0].textContent = `${weather.wind_kmh} km/h`;
                    statVals[1].textContent = `${weather.uv_index}`;
                    statVals[2].textContent = `${weather.sunrise}am`;
                }
            }
        }

        // Render Active Alerts dynamically
        const alertsSection = document.querySelector('.alerts-section');
        if (alertsSection) {
            const header = alertsSection.querySelector('.section-header');
            alertsSection.innerHTML = '';
            if (header) {
                alertsSection.appendChild(header);
            }

            const activeAlerts = data.active_alerts || [];
            if (activeAlerts.length === 0) {
                const emptyMsg = document.createElement('p');
                emptyMsg.style.cssText = 'padding: 20px; color: var(--text-muted); text-align: center; font-style: italic;';
                emptyMsg.textContent = 'No active alerts in your area.';
                alertsSection.appendChild(emptyMsg);
            } else {
                activeAlerts.forEach(alert => {
                    const cardHTML = renderAlertCard(alert);
                    const wrapper = document.createElement('div');
                    wrapper.innerHTML = cardHTML.trim();
                    alertsSection.appendChild(wrapper.firstChild);
                });
            }
        }

        // Render merged Report History (Community reports + User reports)
        const historyCard = document.querySelector('.history-card');
        if (historyCard) {
            const header = historyCard.querySelector('.section-header');
            historyCard.innerHTML = '';
            if (header) {
                historyCard.appendChild(header);
            }

            const communityReports = data.community_reports || [];
            const userReports = this.getReports();

            // Format user-submitted reports for the unified view
            const formattedUserReports = userReports.map(rep => ({
                id: rep.id,
                type: rep.type.toLowerCase(),
                title: rep.title,
                location: rep.location,
                reported_at: rep.submittedAt || new Date().toISOString(),
                severity: rep.severity,
                status: 'submitted',
                verified: false,
                isUserReport: true
            }));

            const allReports = [...formattedUserReports, ...communityReports];
            allReports.sort((a, b) => new Date(b.reported_at) - new Date(a.reported_at));

            if (allReports.length === 0) {
                const emptyMsg = document.createElement('p');
                emptyMsg.style.cssText = 'padding: 15px 0; color: var(--text-muted); text-align: center; font-style: italic; font-size: 13px;';
                emptyMsg.textContent = 'No recent incident reports.';
                historyCard.appendChild(emptyMsg);
            } else {
                allReports.forEach(report => {
                    const itemHTML = renderHistoryItem(report);
                    const wrapper = document.createElement('div');
                    wrapper.innerHTML = itemHTML.trim();
                    historyCard.appendChild(wrapper.firstChild);
                });
            }
        }
    }
};

// ── Dynamic Render Helpers ──
function renderAlertCard(alert) {
    const iconMap = {
        heatwave: 'fa-temperature-high',
        air_quality: 'fa-wind',
        flood: 'fa-cloud-showers-heavy',
        earthquake: 'fa-house-crack'
    };
    const icon = iconMap[alert.type] || 'fa-triangle-exclamation';

    let cardClass = 'alert-warning';
    let badgeClass = 'level-moderate';
    if (alert.severity === 'high') {
        cardClass = 'alert-danger';
        badgeClass = 'level-high';
    } else if (alert.severity === 'low') {
        cardClass = 'alert-info';
        badgeClass = 'level-low';
    }

    const tagsHTML = (alert.tags || []).map(tag => `<span class="tag ${alert.severity === 'moderate' ? 'tag-warning' : ''}">${tag}</span>`).join('');

    return `
        <div class="alert-card ${cardClass}">
            <div class="alert-top">
                <div class="alert-type">
                    <i class="fa-solid ${icon}"></i>
                    ${alert.type.replace('_', ' ').toUpperCase()} Alert
                </div>
                <span class="alert-level ${badgeClass}">${alert.severity.toUpperCase()}</span>
            </div>
            <div class="alert-body">
                <h3 class="alert-title">${alert.title}</h3>
                <p class="alert-desc">${alert.description}</p>
                <div class="alert-tags">
                    ${tagsHTML}
                </div>
                <a href="${alert.action_plan_url || 'action.html'}" class="alert-action-btn">View My Action Plan →</a>
            </div>
        </div>
    `;
}

function renderHistoryItem(report) {
    const iconMap = {
        heatwave: 'fa-temperature-high',
        air_quality: 'fa-wind',
        flood: 'fa-cloud-rain',
        earthquake: 'fa-house-crack'
    };
    const icon = iconMap[report.type] || 'fa-triangle-exclamation';

    let iconColorClass = 'icon-blue';
    if (report.severity === 'high' || report.severity === 'danger') {
        iconColorClass = 'icon-red';
    } else if (report.severity === 'moderate' || report.severity === 'medium' || report.severity === 'warning') {
        iconColorClass = 'icon-amber';
    }

    let badgeClass = 'badge-amber';
    let statusText = report.status || 'Active';
    if (statusText === 'resolved') {
        badgeClass = 'badge-blue';
        statusText = 'Resolved';
    } else if (statusText === 'confirmed') {
        badgeClass = 'badge-red';
        statusText = 'Confirmed';
    } else if (statusText === 'submitted') {
        badgeClass = 'badge-red';
        statusText = 'Submitted';
    } else if (statusText === 'verifying') {
        badgeClass = 'badge-amber';
        statusText = 'Verifying';
    }

    const typeLabel = report.type.replace('_', ' ');
    const timeFormatted = formatReportTime(report.reported_at);

    return `
        <div class="history-item">
            <div class="history-icon ${iconColorClass}"><i class="fa-solid ${icon}"></i></div>
            <div class="history-info">
                <p class="history-name">${report.title} (${typeLabel})</p>
                <p class="history-time">${timeFormatted} · ${report.location}</p>
            </div>
            <span class="history-badge ${badgeClass}">${statusText}</span>
        </div>
    `;
}

function formatReportTime(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();

    if (isNaN(date.getTime())) return dateStr;

    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 60) {
        return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
        const isSameDay = date.getDate() === now.getDate();
        if (isSameDay) {
            return `Today, ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
        }
    }

    const isYesterday = new Date(now - 86400000).getDate() === date.getDate();
    if (isYesterday) {
        return `Yesterday, ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    }

    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) + `, ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
}

// Global initialization logic on page load
document.addEventListener('DOMContentLoaded', () => {
    // 1. Sync global UI elements using profile data
    window.DeshSafe.syncUI();

    // 2. Initialize dashboard dynamics if present
    if (document.getElementById('stat-temp') || document.querySelector('.alerts-section')) {
        window.DeshSafe.initializeDashboard();
    }
});