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

    if (!navigator.geolocation) {
        if (status) status.textContent = 'Geolocation is not supported by your browser.';
        return;
    }

    if (status) status.textContent = 'Detecting your location...';

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                );
                const data = await res.json();
                const address = data.display_name || `${latitude}, ${longitude}`;
                locationInput.value = address;
                if (status) status.textContent = '✅ Location detected.';
                // Clear error style since value is entered
                clearFieldError(locationInput);
            } catch {
                locationInput.value = `${latitude}, ${longitude}`;
                if (status) status.textContent = '✅ Coordinates captured (reverse geocode failed).';
                clearFieldError(locationInput);
            }
        },
        (err) => {
            if (status) status.textContent = `❌ Could not get location: ${err.message}`;
        }
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
function submitReport() {
    const titleEl = document.getElementById('incident-title');
    const descEl = document.getElementById('incident-desc');
    const locationEl = document.getElementById('incident-location');
    const timeEl = document.getElementById('incident-time');

    const title = titleEl?.value.trim();
    const desc = descEl?.value.trim();
    const location = locationEl?.value.trim();
    const time = timeEl?.value;

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
        id: randomId,
        type: selectedType,
        severity: selectedSeverity,
        title,
        description: desc,
        location,
        time,
        photo: photoBase64 || null,
        submittedAt: new Date().toISOString()
    };

    // Save via central manager
    window.DeshSafe.saveReport(report);

    // Update report ID display
    const reportIdEl = document.getElementById('report-id');
    if (reportIdEl) reportIdEl.textContent = `Report ID: #${randomId}`;

    // Hide form, show success
    const formContainer = document.getElementById('report-form');
    if (formContainer) formContainer.style.display = 'none';

    const successScreen = document.getElementById('success-screen');
    if (successScreen) successScreen.classList.add('show');

    // Scroll to success screen
    if (successScreen) {
        successScreen.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}
