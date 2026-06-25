import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Initialize Firebase App reference using configuration matching your architecture
const firebaseConfig = {
  apiKey: "AIzaSyCNTq3n-NX7qg1lvmhu9pWbjLMqZVX_OJE",
  authDomain: "qualify-sa.firebaseapp.com",
  projectId: "qualify-sa",
  storageBucket: "qualify-sa.firebasestorage.app",
  messagingSenderId: "1056702711871",
  appId: "1:1056702711871:web:b3284aaa05a53c696e908a",
  measurementId: "G-KE8E5ZY403"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const docRef = doc(db, "user_marks", "current_session_data");

// Keep a local tracking variable of the live database state to prevent massive memory leaks
let currentCachedState = {
    "English Home Language": "",
    "Mathematics": "",
    "Life Orientation": "",
    "Accounting": ""
};

// Available subjects for the search and auto-suggest feature
const availableSubjects = [
    "Business Studies",
    "Physical Sciences",
    "History",
    "Computer Applications Technology",
    "Life Sciences",
    "Geography",
    "Economics",
    "Mathematical Literacy"
];

let activeSubjectRowName = null;

// DOM Element Selectors
const tbody = document.querySelector(".subjects-table tbody");
const searchBar = document.querySelector(".search-bar");
const searchDropdown = document.querySelector(".search-dropdown");
const radialValue = document.querySelector(".radial-inner-value");
const checkResultsBtn = document.getElementById("checkResultsBtn");
const marksPickerOverlay = document.getElementById("marksPickerOverlay");
const marksListContainer = document.getElementById("marksListContainer");
const closePickerBtn = document.getElementById("closePickerBtn");

// Generate Percentage Options inside custom selection module (100% down to 0%)
function initPickerOptions() {
    marksListContainer.innerHTML = "";
    for (let i = 100; i >= 0; i--) {
        const row = document.createElement("div");
        row.style.padding = "12px";
        row.style.textAlign = "center";
        row.style.cursor = "pointer";
        row.style.borderBottom = "1px solid #f1f5f9";
        row.style.fontSize = "1rem";
        row.style.fontWeight = "500";
        row.innerText = i + "%";
        
        row.addEventListener("mouseenter", () => row.style.backgroundColor = "#eff6ff");
        row.addEventListener("mouseleave", () => row.style.backgroundColor = "transparent");
        
        row.addEventListener("click", () => {
            if (activeSubjectRowName) {
                saveMarkToFirebase(activeSubjectRowName, i);
            }
            marksPickerOverlay.style.display = "none";
            activeSubjectRowName = null;
        });
        marksListContainer.appendChild(row);
    }
}

// Open Picker Overlay Modal
function openMarksPicker(subjectName) {
    activeSubjectRowName = subjectName;
    marksPickerOverlay.style.display = "flex";
}

closePickerBtn.addEventListener("click", () => {
    marksPickerOverlay.style.display = "none";
    activeSubjectRowName = null;
});

// Calculate Single Subject APS point score breakdown allocation matrix
function calculateSingleAps(mark) {
    if (mark === null || mark === undefined || mark === "") return 0;
    const val = parseInt(mark);
    if (isNaN(val)) return 0;
    
    if (val >= 80 && val <= 100) return 7;
    if (val >= 60 && val <= 79) return 6;
    if (val >= 50 && val <= 59) return 4;
    if (val >= 40 && val <= 49) return 3;
    if (val >= 30 && val <= 39) return 2;
    if (val >= 0 && val <= 29) return 1;
    return 0;
}

// Render dynamic table changes mapped directly with cloud state values
function renderSubjectsTable(subjectsMap) {
    tbody.innerHTML = "";
    let totalAps = 0;

    Object.keys(subjectsMap).forEach(subjectName => {
        const markValue = subjectsMap[subjectName];
        const displayMark = markValue !== "" ? markValue + "%" : "";
        totalAps += calculateSingleAps(markValue);

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${subjectName}</td>
            <td>
                <div class="subject-input-cell">
                    <i class="fas fa-pencil-alt edit-icon" data-subject="${subjectName}"></i>
                    <input type="text" class="mark-input" value="${displayMark}" readonly style="background: #f8fafc; cursor: pointer;">
                </div>
            </td>
        `;

        // Handle Click interactions to activate JOptionPane dropdown
        tr.querySelector(".edit-icon").addEventListener("click", () => openMarksPicker(subjectName));
        tr.querySelector(".mark-input").addEventListener("click", () => openMarksPicker(subjectName));
        
        tbody.appendChild(tr);
    });

    radialValue.innerText = totalAps;
}

// Send localized updates seamlessly to Firestore Cloud Database using cached state
async function saveMarkToFirebase(subjectName, mark) {
    try {
        const updatedSnapshot = { ...currentCachedState };
        updatedSnapshot[subjectName] = mark;
        await setDoc(docRef, updatedSnapshot);
    } catch (err) {
        console.error("Error writing data matrix: ", err);
    }
}

// Append new item cleanly inside the document layout mapping structure using cached state
async function addNewSubjectToFirebase(subjectName) {
    try {
        if (!(subjectName in currentCachedState)) {
            const updatedSnapshot = { ...currentCachedState };
            updatedSnapshot[subjectName] = ""; 
            await setDoc(docRef, updatedSnapshot);
        }
    } catch (err) {
        console.error("Error adding unique subject node: ", err);
    }
}

// Sync interface cleanly with live document snapshots and maintain local cache safely
onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
        currentCachedState = docSnap.data();
        renderSubjectsTable(currentCachedState);
    } else {
        // Build initial structure matching layout framework
        const initialData = {
            "English Home Language": "",
            "Mathematics": "",
            "Life Orientation": "",
            "Accounting": ""
        };
        currentCachedState = initialData;
        setDoc(docRef, initialData);
    }
});

// Render Suggestion Search Dropdown system layout rows
function renderSearchDropdown(list) {
    searchDropdown.innerHTML = "";
    if (list.length === 0) {
        const row = document.createElement("div");
        row.className = "dropdown-row";
        row.style.color = "#94a3b8";
        row.innerText = "No matching subjects found";
        searchDropdown.appendChild(row);
        return;
    }
    list.forEach(subj => {
        const row = document.createElement("div");
        row.className = "dropdown-row";
        row.innerText = subj;
        row.addEventListener("click", () => {
            addNewSubjectToFirebase(subj);
            searchBar.value = "";
            searchDropdown.style.display = "none";
        });
        searchDropdown.appendChild(row);
    });
}

// Monitor inputs from user actions inside the input filter field
searchBar.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (query === "") {
        renderSearchDropdown(availableSubjects);
        searchDropdown.style.display = "block";
        return;
    }
    const filtered = availableSubjects.filter(s => s.toLowerCase().includes(query));
    renderSearchDropdown(filtered);
    searchDropdown.style.display = "block";
});

// Show initial subjects when input field is clicked
searchBar.addEventListener("focus", () => {
    if (searchBar.value.trim() === "") {
        renderSearchDropdown(availableSubjects);
    }
    searchDropdown.style.display = "block";
});

// Close dropdown on outside focus context execution shifts
document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-container")) {
        searchDropdown.style.display = "none";
    }
});

// Execute immediate processing rerouting destination patterns matching rules
checkResultsBtn.addEventListener("click", () => {
    window.location.href = "results.html";
});

// Run Initializer Tasks
initPickerOptions();


