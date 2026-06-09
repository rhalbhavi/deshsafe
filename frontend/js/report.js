// ═══════════════════════════════════════════
//  DeshSafe — report.js
// ═══════════════════════════════════════════

// ── Incident Type Selection ──
function selectType(card) {
    document.querySelectorAll('.type-card').forEach(function(c) {
        c.classList.remove('selected');
    });
    card.classList.add('selected');
}

// ── Severity Selection ──
function selectSeverity(level, btn) {
    document.querySelectorAll('.severity-btn').forEach(function(b) {
        b.classList.remove('selected');
    });
    btn.classList.add('selected');
}

// ── Photo Preview ──
function previewPhoto(event) {
    var file = event.target.files[0];
    if (file) {
        var reader = new FileReader();
        reader.onload = function(e) {
            var img = document.getElementById('preview-img');
            img.src = e.target.result;
            document.getElementById('preview-wrap').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

// ── SOS Modal ──
function openSOS() {
    document.getElementById('sos-overlay').classList.add('open');
    // Update email link with current time
    var emailBtn = document.getElementById('sos-email-btn');
    if (emailBtn) {
        var now = new Date().toLocaleString('en-IN');
        emailBtn.href = emailBtn.href.replace(/Time: .*$/, 'Time: ' + encodeURIComponent(now));
    }
}

function closeSOS(event) {
    // If called from overlay click, only close if clicking the overlay itself
    if (event && event.target !== document.getElementById('sos-overlay')) {
        return;
    }
    document.getElementById('sos-overlay').classList.remove('open');
}

// ── Validation Helpers ──

/**
 * Show an inline error message below a field and highlight its border.
 * @param {HTMLElement} field - The input/textarea element
 * @param {string} message - The error message to display
 */
function showFieldError(field, message) {
    // Add error border
    field.classList.add('field-error');

    // Avoid duplicate error messages
    var parent = field.closest('.form-group');
    if (parent && !parent.querySelector('.field-error-msg')) {
        var errorEl = document.createElement('span');
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
    field.classList.remove('field-error');
    var parent = field.closest('.form-group');
    if (parent) {
        var errorMsg = parent.querySelector('.field-error-msg');
        if (errorMsg) {
            errorMsg.remove();
        }
    }
}

// Clear error styling on input so the user gets immediate feedback
['incident-title', 'incident-desc', 'incident-location', 'incident-time'].forEach(function(id) {
    var field = document.getElementById(id);
    if (field) {
        field.addEventListener('input', function() {
            if (field.value.trim()) {
                clearFieldError(field);
            }
        });
    }
});

// ── Submit Report ──
function submitReport() {
    var title    = document.getElementById('incident-title');
    var desc     = document.getElementById('incident-desc');
    var location = document.getElementById('incident-location');
    var time     = document.getElementById('incident-time');

    // Clear all previous errors first
    [title, desc, location, time].forEach(function(f) {
        clearFieldError(f);
    });

    var isValid = true;

    if (!title.value.trim()) {
        showFieldError(title, 'Please enter a brief title');
        isValid = false;
    }
    if (!desc.value.trim()) {
        showFieldError(desc, 'Please describe the incident');
        isValid = false;
    }
    if (!location.value.trim()) {
        showFieldError(location, 'Please enter the location');
        isValid = false;
    }
    if (!time.value) {
        showFieldError(time, 'Please select the time of incident');
        isValid = false;
    }

    if (!isValid) {
        // Scroll to the first error field
        var firstError = document.querySelector('.field-error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstError.focus();
        }
        return;
    }

    // All fields valid — show success screen
    var reportId = 'DS-' + String(Math.floor(1000 + Math.random() * 9000));
    document.getElementById('report-id').textContent = 'Report ID: #' + reportId;
    document.getElementById('report-form').style.display = 'none';
    document.getElementById('success-screen').classList.add('show');

    // Scroll to success screen
    document.getElementById('success-screen').scrollIntoView({ behavior: 'smooth', block: 'center' });
}
