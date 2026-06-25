// Ephemeral / non-persistent in-memory data store (cleared on page reload)
const state = {
    marks: {
        "English Home Language": 72
    }
};

// Map percentage to explicit South African APS criteria matrix
function calculateAPS(percentage) {
    const mark = parseInt(percentage, 10);
    if (isNaN(mark)) return 0;
    if (mark >= 80) return 7;
    if (mark >= 60) return 6;
    if (mark >= 50) return 4;
    if (mark >= 40) return 3;
    if (mark >= 30) return 2;
    return 1;
}

// Dynamically refresh APS totals based on all populated subjects
function updateAPSDisplay() {
    let totalAPS = 0;
    Object.values(state.marks).forEach(mark => {
        totalAPS += calculateAPS(mark);
    });
    const displayEl = document.getElementById('apsTotalDisplay');
    if (displayEl) {
        displayEl.textContent = totalAPS;
    }
}

// Initialize JOptionPane style modal selection dropdown (0-100)
function populateModalSelect() {
    const selectEl = document.getElementById('modalPercentageSelect');
    if (!selectEl) return;
    selectEl.innerHTML = '';
    for (let i = 0; i <= 100; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = `${i}%`;
        selectEl.appendChild(opt);
    }
}

// Bind modal display logic to UI pencil icons
function attachPencilListeners() {
    const editIcons = document.querySelectorAll('.edit-icon');
    const modal = document.getElementById('markModal');
    const confirmBtn = document.getElementById('modalConfirmBtn');
    const cancelBtn = document.getElementById('modalCancelBtn');
    
    let activeSubject = null;

    editIcons.forEach(icon => {
        icon.addEventListener('click', (e) => {
            activeSubject = e.target.getAttribute('data-subject');
            populateModalSelect();
            
            // Pre-select existing value if present in state store
            if (state.marks[activeSubject] !== undefined) {
                document.getElementById('modalPercentageSelect').value = state.marks[activeSubject];
            }
            modal.style.display = 'flex';
        });
    });

    if (confirmBtn) {
        confirmBtn.onclick = () => {
            const selectedVal = document.getElementById('modalPercentageSelect').value;
            if (activeSubject) {
                state.marks[activeSubject] = parseInt(selectedVal, 10);
                const markInput = document.getElementById(`mark-${activeSubject}`);
                if (markInput) markInput.value = `${selectedVal}%`;
                updateAPSDisplay();
            }
            modal.style.display = 'none';
        };
    }

    if (cancelBtn) {
        cancelBtn.onclick = () => {
            modal.style.display = 'none';
        };
    }
}

// Search dropdown filter and auto-append row behaviors
function attachSubjectSearch() {
    const searchInput = document.getElementById('subjectSearchInput');
    const dropdown = document.getElementById('subjectDropdown');
    const rows = dropdown ? dropdown.querySelectorAll('.dropdown-row') : [];

    if (searchInput) {
        searchInput.addEventListener('focus', () => {
            if (dropdown) dropdown.style.display = 'block';
        });
        searchInput.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase();
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(val) ? 'block' : 'none';
            });
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (dropdown && !e.target.closest('.search-container')) {
            dropdown.style.display = 'none';
        }
    });

    rows.forEach(row => {
        row.addEventListener('click', (e) => {
            const subjectName = e.target.getAttribute('data-subj');
            appendSubjectRow(subjectName);
            if (dropdown) dropdown.style.display = 'none';
            if (searchInput)searchInput.value = '';
        });
    });
}

// Add row directly to main UI table view
function appendSubjectRow(subjectName) {
    if (state.marks[subjectName] !== undefined) return; // Ignore existing entries
    
    const tableBody = document.getElementById('subjectsTableBody');
    if (!tableBody) return;

    const tr = document.createElement('tr');
    tr.setAttribute('data-subject', subjectName);

    tr.innerHTML = `
        <td>${subjectName}</td>
        <td>
            <div class="subject-input-cell">
                <i class="fas fa-pencil-alt edit-icon" data-subject="${subjectName}"></i>
                <input type="text" class="mark-input" id="mark-${subjectName}" readonly>
            </div>
        </td>
    `;
    
    tableBody.appendChild(tr);
    
    // Bind click handlers dynamically to the newly appended pencil element
    const newIcon = tr.querySelector('.edit-icon');
    const modal = document.getElementById('markModal');
    
    newIcon.addEventListener('click', (e) => {
        const activeSub = e.target.getAttribute('data-subject');
        populateModalSelect();
        if (state.marks[activeSub] !== undefined) {
            document.getElementById('modalPercentageSelect').value = state.marks[activeSub];
        }
        
        // Modal confirm reassignment hook closure
        document.getElementById('modalConfirmBtn').onclick = () => {
            const selectedVal = document.getElementById('modalPercentageSelect').value;
            state.marks[activeSub] = parseInt(selectedVal, 10);
            const markInput = document.getElementById(`mark-${activeSub}`);
            if (markInput) markInput.value = `${selectedVal}%`;
            updateAPSDisplay();
            modal.style.display = 'none';
        };
        
        modal.style.display = 'flex';
    });
}

// Orchestrate startup sequence
document.addEventListener('DOMContentLoaded', () => {
    // Prime pre-existing values if available
    const initialInput = document.getElementById('mark-English Home Language');
    if (initialInput) initialInput.value = `${state.marks["English Home Language"]}%`;
    
    updateAPSDisplay();
    attachPencilListeners();
    attachSubjectSearch();
});
