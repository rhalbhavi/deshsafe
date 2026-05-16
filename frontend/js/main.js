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