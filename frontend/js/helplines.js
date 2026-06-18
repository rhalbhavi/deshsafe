// ═══════════════════════════════════════════
//  DeshSafe — helplines.js
//  State → district cascading selector for emergency helpline numbers.
//  Only national.policeEmergency/fireServices/ambulance are confirmed-official;
//  every other number in data/helplines.json is null until verified against
//  ndma.gov.in / the relevant State Disaster Management Authority's own site —
//  see _meta in that file. Never fill a null in with a guessed number.
// ═══════════════════════════════════════════

async function loadHelplineData() {
    try {
        const res = await fetch('data/helplines.json');
        if (res.ok) {
            return await res.json();
        }
    } catch (e) {
        console.warn('Could not fetch helplines.json:', e);
    }
    return { national: {}, states: [] };
}

function populateStateDropdown(data) {
    const stateSelect = document.getElementById('helpline-state');
    if (!stateSelect) return;

    stateSelect.innerHTML = '<option value="">Select a state…</option>';
    (data.states || []).forEach(state => {
        const option = document.createElement('option');
        option.value = state.name;
        option.textContent = state.name;
        stateSelect.appendChild(option);
    });
}

function populateDistrictDropdown(data, stateName) {
    const districtSelect = document.getElementById('helpline-district');
    if (!districtSelect) return;

    districtSelect.innerHTML = '<option value="">Select a district…</option>';
    districtSelect.disabled = !stateName;

    const state = (data.states || []).find(s => s.name === stateName);
    (state?.districts || []).forEach(district => {
        const option = document.createElement('option');
        option.value = district.name;
        option.textContent = district.name;
        districtSelect.appendChild(option);
    });
}

// Renders a phone number as a tap-to-call link, or a "not yet available" note if unverified/null
function renderHelplineRow(label, number) {
    if (!number) {
        return `
            <div class="helpline-row helpline-row-pending">
                <span class="helpline-label">${label}</span>
                <span class="helpline-pending-note">Not yet verified — check back soon</span>
            </div>
        `;
    }
    return `
        <div class="helpline-row">
            <span class="helpline-label">${label}</span>
            <a class="helpline-call-link" href="tel:${number}">
                <i class="fa-solid fa-phone"></i> ${number}
            </a>
        </div>
    `;
}

function displayHelplines(data, stateName, districtName) {
    const resultsEl = document.getElementById('helpline-results');
    if (!resultsEl) return;

    const national = data.national || {};
    const state = (data.states || []).find(s => s.name === stateName);
    const district = state?.districts?.find(d => d.name === districtName);

    let html = '<h3>National</h3>';
    html += renderHelplineRow('Police (All Emergencies)', national.policeEmergency);
    html += renderHelplineRow('Fire Services', national.fireServices);
    html += renderHelplineRow('Ambulance', national.ambulance);
    html += renderHelplineRow('NDMA Helpline', national.ndmaHelpline);
    html += renderHelplineRow('Disaster Management Helpline', national.disasterManagementHelpline);

    if (state) {
        html += `<h3>${state.name} State Control Room</h3>`;
        html += renderHelplineRow(`${state.name} Control Room`, state.stateControlRoom);
    }

    if (district) {
        html += `<h3>${district.name} District Control Room</h3>`;
        html += renderHelplineRow(`${district.name} Control Room`, district.districtControlRoom);
    }

    resultsEl.innerHTML = html;
    resultsEl.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', async () => {
    const stateSelect = document.getElementById('helpline-state');
    const districtSelect = document.getElementById('helpline-district');
    if (!stateSelect || !districtSelect) return;

    const data = await loadHelplineData();
    populateStateDropdown(data);
    displayHelplines(data, '', ''); // show national numbers immediately

    stateSelect.addEventListener('change', () => {
        populateDistrictDropdown(data, stateSelect.value);
        displayHelplines(data, stateSelect.value, '');
    });

    districtSelect.addEventListener('change', () => {
        displayHelplines(data, stateSelect.value, districtSelect.value);
    });
});
