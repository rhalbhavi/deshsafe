// DeshSafe — profile.js

document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
});


function loadProfile() {
    const savedData = localStorage.getItem('deshsafe_profile');
    if (!savedData) return;

    try {
        const data = JSON.parse(savedData);

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

        // Update identity card and avatar initials
        const identityName = document.querySelector('.identity-name');
        if (identityName) identityName.textContent = data.name || 'Anonymous';

        const initials = getInitials(data.name);
        const avatarRing = document.querySelector('.avatar-ring');
        const navAvatar = document.querySelector('.nav-avatar');
        if (avatarRing) avatarRing.textContent = initials;
        if (navAvatar) navAvatar.textContent = initials;

        // Update location indicator in navbar
        const navLocation = document.querySelector('.nav-location');
        if (navLocation) {
            navLocation.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${data.location || 'Unknown'}`;
        }

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

    } catch (e) {
        console.error('Error parsing profile data from localStorage:', e);
    }
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

    localStorage.setItem('deshsafe_profile', JSON.stringify(profileData));

    // Update UI elements dynamically
    const identityName = document.querySelector('.identity-name');
    if (identityName) identityName.textContent = name || 'Anonymous';

    const initials = getInitials(name);
    const avatarRing = document.querySelector('.avatar-ring');
    const navAvatar = document.querySelector('.nav-avatar');
    if (avatarRing) avatarRing.textContent = initials;
    if (navAvatar) navAvatar.textContent = initials;

    const navLocation = document.querySelector('.nav-location');
    if (navLocation) {
        navLocation.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${location || 'Unknown'}`;
    }

    // Trigger toast message
    const toast = document.getElementById('toast');
    if (toast) {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}
