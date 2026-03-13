import { db } from './firebase-config.js';
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

let selectedTicketId = null;

// 1. Real-time listener for tickets
const q = query(collection(db, "supportTickets"), orderBy("createdAt", "desc"));

onSnapshot(q, (snapshot) => {
    const tbody = document.getElementById("ticketBody");
    tbody.innerHTML = "";
    snapshot.forEach((doc) => {
        const data = doc.data();
        const row = `<tr onclick="selectTicket('${doc.id}')" style="cursor:pointer;">
            <td>${data.studentNumber}</td>
            <td>${data.studentNumber}</td>
            <td>${data.category}</td>
            <td><span class="status-pill">${data.status}</span></td>
            <td>${data.createdAt.toDate().toLocaleDateString()}</td>
        </tr>`;
        tbody.innerHTML += row;
    });
});

// 2. Select ticket to show details
window.selectTicket = (id) => {
    selectedTicketId = id;
    document.getElementById("detailsPanel").style.display = 'block';
    // Logic here to fetch specific doc data and populate the panel
};

// 3. Update status in real-time (syncs with student portal)
window.updateStatus = async (newStatus) => {
    if (!selectedTicketId) return;
    await updateDoc(doc(db, "supportTickets", selectedTicketId), { status: newStatus });
    alert("Ticket updated!");
};

window.saveNote = async () => {
    const note = document.getElementById('internalNote').value;
    await updateDoc(doc(db, "supportTickets", selectedTicketId), { internalNote: note });
};
