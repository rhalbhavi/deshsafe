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
if(document.getElementById('stat-temp')) {
    animateCounter('stat-temp', 42, '°C');
    animateCounter('stat-aqi', 168, '');
    animateCounter('stat-humidity', 28, '%');
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

// Global profile sync on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedData = localStorage.getItem('deshsafe_profile');
    if (!savedData) return;

    try {
        const data = JSON.parse(savedData);

        // Update nav-avatar initials everywhere
        if (data.name) {
            const initials = getInitials(data.name);
            document.querySelectorAll('.nav-avatar').forEach(avatar => {
                avatar.textContent = initials;
            });

            // Update greeting title on dashboard
            const greetingTitle = document.querySelector('.greeting-title');
            if (greetingTitle) {
                const hr = new Date().getHours();
                let timeOfDay = 'day';
                if (hr < 12) timeOfDay = 'morning';
                else if (hr < 17) timeOfDay = 'afternoon';
                else timeOfDay = 'evening';
                greetingTitle.innerHTML = `Good ${timeOfDay}, ${data.name.split(' ')[0]} 👋`;
            }
        }

        // Update location indicator in navbar
        if (data.location) {
            const navLocation = document.querySelector('.nav-location');
            if (navLocation) {
                navLocation.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${data.location}`;
            }
        }

        // Dynamic Action Plan personalization (action.html)
        const profileCard = document.querySelector('.profile-card');
        if (profileCard) {
            // Update personalized details panel
            const items = profileCard.querySelectorAll('.profile-item');
            if (items.length >= 4) {
                // 1. Name & Age
                items[0].innerHTML = `<i class="fa-solid fa-user"></i> <span>${data.name || 'Anonymous'}, Age ${data.age || '—'}</span>`;
                // 2. Conditions
                const healthStr = data.healthTags && data.healthTags.length > 0 ? data.healthTags.join(', ') : 'No conditions';
                items[1].innerHTML = `<i class="fa-solid fa-lungs"></i> <span>${healthStr} condition</span>`;
                // 3. Family Size
                items[2].innerHTML = `<i class="fa-solid fa-people-roof"></i> <span>Family of ${data.familySize || '—'} members</span>`;
                // 4. Location
                items[3].innerHTML = `<i class="fa-solid fa-location-dot"></i> <span>${data.location || 'Unknown'}</span>`;
            }

            // Update progress header steps subtitle
            const stepsSub = document.querySelector('.steps-sub');
            if (stepsSub) {
                const healthPart = data.healthTags && data.healthTags.length > 0 ? `, ${data.healthTags.join(', ')} condition` : '';
                stepsSub.textContent = `Based on your profile — Age ${data.age || '—'}${healthPart}, Family of ${data.familySize || '—'}`;
            }
        }

    } catch (e) {
        console.error('Error synchronizing profile data globally:', e);
    }
});