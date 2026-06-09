// DeshSafe — report.js

let selectedType = 'Heatwave';
let selectedSeverity = 'medium';

// Set current time as the default for the Time of Incident input
document.addEventListener('DOMContentLoaded', () => {
    const timeInput = document.getElementById('incident-time');
    if (timeInput) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeInput.value = `${hours}:${minutes}`;
    }
});

function openSOS() {
    const overlay = document.getElementById('sos-overlay');
    if (overlay) {
        overlay.classList.add('open');
    }
}

function closeSOS(event) {
    const overlay = document.getElementById('sos-overlay');
    if (overlay) {
        // Close if called directly (e.g. Cancel button) or if clicking the backdrop itself
        if (event && event.target !== overlay) {
            return;
        }
        overlay.classList.remove('open');
    }
}

function selectType(element) {
    document.querySelectorAll('.type-card').forEach(card => {
        card.classList.remove('selected');
    });
    element.classList.add('selected');
    
    const nameEl = element.querySelector('.type-name');
    if (nameEl) {
        selectedType = nameEl.textContent.trim();
    }
}

function selectSeverity(level, element) {
    document.querySelectorAll('.severity-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    element.classList.add('selected');
    selectedSeverity = level;
}

function previewPhoto(event) {
    const input = event.target;
    const previewWrap = document.getElementById('preview-wrap');
    const previewImg = document.getElementById('preview-img');
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            if (previewImg) previewImg.src = e.target.result;
            if (previewWrap) previewWrap.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function submitReport() {
    const title = document.getElementById('incident-title')?.value.trim();
    const desc = document.getElementById('incident-desc')?.value.trim();
    const location = document.getElementById('incident-location')?.value.trim();
    const time = document.getElementById('incident-time')?.value;

    if (!title || !desc || !location || !time) {
        alert('Please fill in all the required fields (Title, Description, Location, and Time).');
        return;
    }

    // Generate a random incident ID
    const randomId = 'DS-' + Math.floor(1000 + Math.random() * 9000);
    const reportIdEl = document.getElementById('report-id');
    if (reportIdEl) {
        reportIdEl.textContent = `Report ID: #${randomId}`;
    }

    // Hide the form container
    const formContainer = document.getElementById('report-form');
    if (formContainer) {
        formContainer.style.display = 'none';
    }

    // Show success screen
    const successScreen = document.getElementById('success-screen');
    if (successScreen) {
        successScreen.classList.add('show');
    }

    // Optional: Log submitted report details locally
    console.log('Incident Report Submitted:', {
        id: randomId,
        type: selectedType,
        severity: selectedSeverity,
        title,
        desc,
        location,
        time
    });
}
