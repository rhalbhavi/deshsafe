// ═══════════════════════════════════════════
//  DeshSafe — report.js
// ═══════════════════════════════════════════

let selectedType = 'Heatwave';
let selectedSeverity = 'medium';
let photoBase64 = null;

// Autofill current time on load
document.addEventListener('DOMContentLoaded', () => {
    const timeInput = document.getElementById('incident-time');
    if (timeInput) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeInput.value = `${hours}:${minutes}`;
    }
});

// ── SOS Modal ──
function openSOS() {
    const overlay = document.getElementById('sos-overlay');
    if (overlay) overlay.classList.add('open');
    // Update email link with current time
    const emailBtn = document.getElementById('sos-email-btn');
    if (emailBtn) {
        const now = new Date().toLocaleString('en-IN');
        emailBtn.href = emailBtn.href.replace(/Time: .*$/, 'Time: ' + encodeURIComponent(now));
    }
}

function closeSOS(event) {
    const overlay = document.getElementById('sos-overlay');
    if (overlay) {
        if (event && event.target !== overlay) return;
        overlay.classList.remove('open');
    }
}

// ── Incident Type Selection ──
function selectType(element) {
    document.querySelectorAll('.type-card').forEach(card => card.classList.remove('selected'));
    element.classList.add('selected');
    const nameEl = element.querySelector('.type-name');
    if (nameEl) selectedType = nameEl.textContent.trim();
}

// ── Severity Selection ──
function selectSeverity(level, element) {
    document.querySelectorAll('.severity-btn').forEach(btn => btn.classList.remove('selected'));
    element.classList.add('selected');
    selectedSeverity = level;
}

// ── Photo Preview ──
function previewPhoto(event) {
    const input = event.target;
    const previewWrap = document.getElementById('preview-wrap');
    const previewImg = document.getElementById('preview-img');

    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            photoBase64 = e.target.result;
            if (previewImg) previewImg.src = photoBase64;
            if (previewWrap) previewWrap.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// ── Geolocation ──
function detectLocation() {
    const status = document.getElementById('gps-status');
    const locationInput = document.getElementById('incident-location');
    const latInput = document.getElementById('report-lat');
    const lngInput = document.getElementById('report-lng');

    if (!navigator.geolocation) {
        if (status) {
            status.textContent = 'Geolocation is not supported by your browser. Please enter your location manually.';
            status.classList.remove('location-success');
            status.classList.add('location-error');
        }
        if (locationInput) locationInput.focus();
        return;
    }

    if (status) {
        status.textContent = 'Detecting your location...';
        status.classList.remove('location-success', 'location-error');
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            if (latInput) latInput.value = latitude;
            if (lngInput) lngInput.value = longitude;

            const accuracyText = `±${Math.round(accuracy)}m accuracy`;
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                );
                const data = await res.json();
                const address = data.display_name || `${latitude}, ${longitude}`;
                locationInput.value = address;
                if (status) status.textContent = `✅ Location captured (${accuracyText})`;
                // Clear error style since value is entered
                clearFieldError(locationInput);
            } catch {
                locationInput.value = `${latitude}, ${longitude}`;
                if (status) status.textContent = `✅ Coordinates captured (${accuracyText}, reverse geocode failed)`;
                clearFieldError(locationInput);
            }
            if (status) {
                status.classList.remove('location-error');
                status.classList.add('location-success');
            }
        },
        (err) => {
            // err.code: 1 = PERMISSION_DENIED, 2 = POSITION_UNAVAILABLE, 3 = TIMEOUT
            if (status) {
                status.textContent = `❌ Could not get location automatically (${err.message}). Please enter it manually below.`;
                status.classList.remove('location-success');
                status.classList.add('location-error');
            }
            if (locationInput) locationInput.focus();
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
}

// ── Validation Helpers ──

/**
 * Show an inline error message below a field and highlight its border.
 * @param {HTMLElement} field - The input/textarea element
 * @param {string} message - The error message to display
 */
function showFieldError(field, message) {
    if (!field) return;
    // Add error border
    field.classList.add('field-error');

    // Avoid duplicate error messages
    const parent = field.closest('.form-group');
    if (parent && !parent.querySelector('.field-error-msg')) {
        const errorEl = document.createElement('span');
        errorEl.className = 'field-error-msg';
        errorEl.textContent = message;
        parent.appendChild(errorEl);
    }
}

/**
 * Clear the error state from a field.
 * @param {HTMLElement} field - The input/textarea element
 */
function clearFieldError(field) {
    if (!field) return;
    field.classList.remove('field-error');
    const parent = field.closest('.form-group');
    if (parent) {
        const errorMsg = parent.querySelector('.field-error-msg');
        if (errorMsg) {
            errorMsg.remove();
        }
    }
}

// Clear error styling on input so the user gets immediate feedback
['incident-title', 'incident-desc', 'incident-location', 'incident-time'].forEach(id => {
    const field = document.getElementById(id);
    if (field) {
        field.addEventListener('input', () => {
            if (field.value.trim()) {
                clearFieldError(field);
            }
        });
    }
});

// ── Submit Report ──
async function submitReport() {
    const titleEl    = document.getElementById('incident-title');
    const descEl     = document.getElementById('incident-desc');
    const locationEl = document.getElementById('incident-location');
    const timeEl     = document.getElementById('incident-time');

    const title    = titleEl?.value.trim();
    const desc     = descEl?.value.trim();
    const location = locationEl?.value.trim();
    const time     = timeEl?.value;

    // Clear all previous errors first
    [titleEl, descEl, locationEl, timeEl].forEach(f => {
        clearFieldError(f);
    });

    let isValid = true;

    if (!title) {
        showFieldError(titleEl, 'Please enter a brief title');
        isValid = false;
    }
    if (!desc) {
        showFieldError(descEl, 'Please describe the incident');
        isValid = false;
    }
    if (!location) {
        showFieldError(locationEl, 'Please enter the location');
        isValid = false;
    }
    if (!time) {
        showFieldError(timeEl, 'Please select the time of incident');
        isValid = false;
    }

    if (!isValid) {
        // Scroll to the first error field
        const firstError = document.querySelector('.field-error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstError.focus();
        }
        return;
    }

    // All fields valid — prepare report object
    const randomId = 'DS-' + Math.floor(1000 + Math.random() * 9000);

    const report = {
        id:          randomId,
        type:        selectedType,
        severity:    selectedSeverity,
        title,
        description: desc,
        location,
        time,
        lat: parseFloat(document.getElementById('report-lat')?.value) || null,
        lng: parseFloat(document.getElementById('report-lng')?.value) || null,
        photo: photoBase64 || null,
        submittedAt: new Date().toISOString()
    };

    // Show loading state on submit button
    const submitBtn = document.querySelector('[onclick="submitReport()"]');
    if (submitBtn) {
        submitBtn.disabled    = true;
        submitBtn.textContent = 'Submitting...';
    }

    let offlineNotice = null;

    try {
        // Save via central manager (writes to Firestore)
        await window.DeshSafe.saveReport(report);
    } catch (err) {
        console.error('Failed to submit report to Firestore, falling back to local storage:', err);

        // Firestore unreachable (offline, quota, etc.) — fall back to local storage
        // so the report isn't lost; map.js/main.js merge this in until it can sync.
        const savedLocally = saveReport(report);

        if (!savedLocally) {
            const form = document.getElementById('report-form');
            if (form && !form.querySelector('.submit-error')) {
                const errorEl = document.createElement('p');
                errorEl.className = 'submit-error';
                errorEl.style.cssText = 'color:var(--red);text-align:center;font-size:13.5px;margin-top:12px;font-weight:600;';
                errorEl.textContent = '⚠️ Could not save your report. Your browser storage may be full or disabled.';
                form.appendChild(errorEl);
            }
            if (submitBtn) {
                submitBtn.disabled    = false;
                submitBtn.textContent = 'Submit Report';
            }
            return;
        }

        offlineNotice = 'Saved offline — it will sync once you\'re back online.';
    }

    // Update report ID display
    const reportIdEl = document.getElementById('report-id');
    if (reportIdEl) reportIdEl.textContent = `Report ID: #${randomId}`;

    // Hide form, show success
    const formContainer = document.getElementById('report-form');
    if (formContainer) formContainer.style.display = 'none';

    const successScreen = document.getElementById('success-screen');
    if (successScreen) {
        successScreen.classList.add('show');
        if (offlineNotice) {
            let noticeEl = successScreen.querySelector('.offline-notice');
            if (!noticeEl) {
                noticeEl = document.createElement('p');
                noticeEl.className = 'offline-notice';
                noticeEl.style.cssText = 'color:var(--text-muted);text-align:center;font-size:13px;margin-top:8px;';
                successScreen.appendChild(noticeEl);
            }
            noticeEl.textContent = offlineNotice;
        }
        successScreen.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}
