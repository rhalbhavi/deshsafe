// DeshSafe — profile.js

document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
});


function loadProfile() {
    const data = window.DeshSafe.getProfile();

    // Populate form inputs
    const nameInput = document.getElementById('profile-name');
    const ageInput = document.getElementById('profile-age');
    const phoneInput = document.getElementById('profile-phone');
    const familyInput = document.getElementById('profile-family');
    const locationInput = document.getElementById('profile-location');

    if (nameInput) nameInput.value = data.name || '';
    if (ageInput) ageInput.value = data.age || '';
    if (phoneInput) phoneInput.value = data.phone || '';
    if (familyInput) familyInput.value = data.familySize || '';
    if (locationInput) locationInput.value = data.location || '';

    // Set health tags active states
    const savedHealthTags = data.healthTags || [];
    document.querySelectorAll('.health-tag').forEach(tag => {
        const condition = tag.textContent.trim();
        if (savedHealthTags.includes(condition)) {
            tag.classList.add('active');
        } else {
            tag.classList.remove('active');
        }
    });

    // Set alert preference checkboxes
    const prefHeatwave = document.getElementById('pref-heatwave');
    const prefFlood = document.getElementById('pref-flood');
    const prefAqi = document.getElementById('pref-aqi');
    const prefEarthquake = document.getElementById('pref-earthquake');

    if (prefHeatwave) prefHeatwave.checked = !!data.preferences?.heatwave;
    if (prefFlood) prefFlood.checked = !!data.preferences?.flood;
    if (prefAqi) prefAqi.checked = !!data.preferences?.aqi;
    if (prefEarthquake) prefEarthquake.checked = !!data.preferences?.earthquake;
}

function saveProfile() {
    const name = document.getElementById('profile-name')?.value.trim() || '';
    const age = document.getElementById('profile-age')?.value.trim() || '';
    const phone = document.getElementById('profile-phone')?.value.trim() || '';
    const familySize = document.getElementById('profile-family')?.value || '';
    const location = document.getElementById('profile-location')?.value.trim() || '';

    // Extract active health tags
    const healthTags = [];
    document.querySelectorAll('.health-tag.active').forEach(tag => {
        healthTags.push(tag.textContent.trim());
    });

    // Extract alert preferences
    const preferences = {
        heatwave: document.getElementById('pref-heatwave')?.checked || false,
        flood: document.getElementById('pref-flood')?.checked || false,
        aqi: document.getElementById('pref-aqi')?.checked || false,
        earthquake: document.getElementById('pref-earthquake')?.checked || false
    };

    const profileData = {
        name,
        age,
        phone,
        familySize,
        location,
        healthTags,
        preferences
    };

    // Save to single source of truth (automatically triggers syncUI)
    window.DeshSafe.saveProfile(profileData);

    // Trigger toast message
    const toast = document.getElementById('toast');
    if (toast) {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}
