import { db, auth } from "./Firebase-config.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

// Global data states
let currentSubjectEditing = null;
let userSubjectsProfile = {};

// Hardcoded core subject availability matrix
const availableSubjectsRepository = [
    "Business Studies",
    "Physical Sciences",
    "History",
    "Computer Applications Technology"
];

// Initialize DOM Node Selectors
const tableBody = document.querySelector(".subjects-table tbody");
const searchInput = document.querySelector(".search-bar");
const searchDropdown = document.querySelector(".search-dropdown");
const modalPicker = document.getElementById("custom-modal-picker");
const modalScrollContainer = document.getElementById("modal-scrollbar-target");
const closeModalBtn = document.getElementById("close-modal-picker");
const apsDisplayValue = document.querySelector(".radial-inner-value");
const checkResultsBtn = document.getElementById("check-results-btn");

// Handle Check Results Button Navigation Rule
if (checkResultsBtn) {
    checkResultsBtn.addEventListener("click", () => {
        window.location.href = "results.html";
    });
}

// Ensure Authentication State Verification prior to Database sync
onAuthStateChanged(auth, async (user) => {
    if (user) {
        await loadUserDataFromCloud(user.uid);
    } else {
        console.error("No active user session detected. Please sign in to synchronize data storage.");
    }
});

// Load state data sequence from cloud infrastructure storage
async function loadUserDataFromCloud(uid) {
    try {
        const userDocRef = doc(db, "user_marks", uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
            userSubjectsProfile = docSnap.data().subjects || {};
        } else {
            // Fallback default mock parsing if no data exists
            userSubjectsProfile = {
                "English Home Language": 72,
                "Mathematics": 0,
                "Life Orientation": 0,
                "Accounting": 0
            };
        }
        renderSubjectsTableInterface();
        calculateSystemAPSPoints();
    } catch (error) {
        console.error("Firestore loading failure context: ", error);
    }
}

// Save active operational map array matrix schema state directly to Firestore
async function saveUserDataToCloud() {
    if (!auth.currentUser) return;
    try {
        const userDocRef = doc(db, "user_marks", auth.currentUser.uid);
        await setDoc(userDocRef, { subjects: userSubjectsProfile }, { merge: true });
    } catch (error) {
        console.error("Firestore persistence writing state exception: ", error);
    }
}

// Generate the UI Rows
function renderSubjectsTableInterface() {
    tableBody.innerHTML = "";
    Object.keys(userSubjectsProfile).forEach(subjectName => {
        const markVal = userSubjectsProfile[subjectName];
        const displayMark = markVal > 0 ? `${markVal}%` : "";

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${subjectName}</td>
            <td>
                <div class="subject-input-cell">
                    <i class="fas fa-pencil-alt edit-icon" data-subject="${subjectName}"></i>
                    <input type="text" class="mark-input" value="${displayMark}" readonly>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Wire up event listeners to target the icons
    document.querySelectorAll(".edit-icon").forEach(icon => {
        icon.addEventListener("click", (e) => {
            currentSubjectEditing = e.target.getAttribute("data-subject");
            openCustomVerticalPickerModal();
        });
    });
}

// Build and present the picker selection window
function openCustomVerticalPickerModal() {
    modalScrollContainer.innerHTML = "";
    // Loop backwards from 100 down to 0
    for (let i = 100; i >= 0; i--) {
        const optionRow = document.createElement("div");
        optionRow.innerText = `${i}%`;
        optionRow.style.padding = "10px";
        optionRow.style.textAlign = "center";
        optionRow.style.cursor = "pointer";
        optionRow.style.borderBottom = "1px solid #f1f5f9";
        optionRow.style.fontSize = "0.95rem";

        optionRow.addEventListener("mouseover", () => optionRow.style.backgroundColor = "#f1f5f9");
        optionRow.addEventListener("mouseout", () => optionRow.style.backgroundColor = "transparent");
        
        optionRow.addEventListener("click", async () => {
            userSubjectsProfile[currentSubjectEditing] = i;
            modalPicker.style.display = "none";
            renderSubjectsTableInterface();
            calculateSystemAPSPoints();
            await saveUserDataToCloud();
        });

        modalScrollContainer.appendChild(optionRow);
    }
    modalPicker.style.display = "flex";
}

// Close the active structural modal block window layout element
if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
        modalPicker.style.display = "none";
    });
}

// Execute APS score algorithm map matrix evaluation
function calculateSystemAPSPoints() {
    let aggregateAPSPointsTotal = 0;

    Object.keys(userSubjectsProfile).forEach(subjectName => {
        // Exclude Life Orientation from standard calculation frameworks if present
        if (subjectName.toLowerCase() === "life orientation") return;

        const percentageScore = userSubjectsProfile[subjectName];
        let rowScoreContribution = 0;

        if (percentageScore >= 80 && percentageScore <= 100) rowScoreContribution = 7;
        else if (percentageScore >= 60 && percentageScore <= 79) rowScoreContribution = 6;
        else if (percentageScore >= 50 && percentageScore <= 59) rowScoreContribution = 4;
        else if (percentageScore >= 40 && percentageScore <= 49) rowScoreContribution = 3;
        else if (percentageScore >= 30 && percentageScore <= 39) rowScoreContribution = 2;
        else if (percentageScore >= 0 && percentageScore <= 29) rowScoreContribution = 1;

        aggregateAPSPointsTotal += rowScoreContribution;
    });

    apsDisplayValue.innerText = aggregateAPSPointsTotal;
}

// Render autocomplete suggestions filter array options
function displayFilteredAutocompleteDropdown(filterText) {
    searchDropdown.innerHTML = "";
    const cleanFilter = filterText.toLowerCase().trim();
    
    const matchedItems = availableSubjectsRepository.filter(subject => 
        subject.toLowerCase().includes(cleanFilter)
    );

    if (matchedItems.length === 0) {
        searchDropdown.innerHTML = `<div class="dropdown-row" style="color: var(--text-muted);">No matching subjects found</div>`;
        return;
    }

    matchedItems.forEach(subjectName => {
        const itemRow = document.createElement("div");
        itemRow.className = "dropdown-row";
        itemRow.innerText = subjectName;
        
        itemRow.addEventListener("click", async () => {
            if (!userSubjectsProfile.hasOwnProperty(subjectName)) {
                userSubjectsProfile[subjectName] = 0; // Initialize empty mark
                renderSubjectsTableInterface();
                await saveUserDataToCloud();
            }
            searchInput.value = "";
            searchDropdown.innerHTML = "";
            populateStaticInitialSuggestions();
        });
        
        searchDropdown.appendChild(itemRow);
    });
}

// Populate the default list on initialization
function populateStaticInitialSuggestions() {
    searchDropdown.innerHTML = "";
    availableSubjectsRepository.forEach(subjectName => {
        const itemRow = document.createElement("div");
        itemRow.className = "dropdown-row";
        itemRow.innerText = subjectName;

        itemRow.addEventListener("click", async () => {
            if (!userSubjectsProfile.hasOwnProperty(subjectName)) {
                userSubjectsProfile[subjectName] = 0;
                renderSubjectsTableInterface();
                await saveUserDataToCloud();
            }
        });
        searchDropdown.appendChild(itemRow);
    });
}

// Wire up search bar listeners
if (searchInput) {
    searchInput.addEventListener("input", (e) => {
        displayFilteredAutocompleteDropdown(e.target.value);
    });
}

// Initial script execution pass loading array
populateStaticInitialSuggestions();
